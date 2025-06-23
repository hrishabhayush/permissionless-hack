import { createHash, randomBytes } from 'crypto';
import readline from 'readline';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Temporary Supra SDK interface until official SDK is available
interface SupraSDK {
  submitTransaction(moveCall: any): Promise<any>;
}

interface WebsiteRegistration {
  domain: string;
  owner: string;
  supraPubKey: string;
  verificationToken: string;
  isVerified: boolean;
  registrationTimestamp: number;
  totalConversions: number;
  totalEarnings: number;
}

interface ConversionEvent {
  websiteId: string;
  conversionId: string;
  timestamp: number;
  amount: number; // in USD
  sourceUrl: string;
  destinationUrl: string;
  userAgent?: string;
  referrerData?: any;
}

interface PendingPayout {
  websiteId: string;
  domain: string;
  conversionId: string;
  amount: number;
  timestamp: number;
  sourceUrl: string;
  status: 'pending' | 'claimed' | 'expired';
}

export class WebsiteAttributionAgent {
  private supra: SupraSDK;
  private registeredWebsites: Map<string, WebsiteRegistration> = new Map();
  private conversionEvents: ConversionEvent[] = [];
  private pendingPayouts: PendingPayout[] = [];
  private fixedPayoutAmount = 0.1; // 0.1 USD in pyUSD
  private websitesFilePath: string;
  private pendingPayoutsFilePath: string;
  
  constructor(supraSdk: SupraSDK) {
    this.supra = supraSdk;
    this.websitesFilePath = path.join(__dirname, 'websites.json');
    this.pendingPayoutsFilePath = path.join(__dirname, 'pending-payouts.json');
    this.loadPersistedData();
  }

  /**
   * Load persisted data from files
   */
  private loadPersistedData(): void {
    // Load websites
    if (fs.existsSync(this.websitesFilePath)) {
      try {
        const data = fs.readFileSync(this.websitesFilePath, 'utf-8');
        const websites = JSON.parse(data);
        this.registeredWebsites = new Map(Object.entries(websites));
        console.log(chalk.green(`Loaded ${this.registeredWebsites.size} registered websites from websites.json`));
      } catch (error) {
        console.error(chalk.red("Error reading websites file, starting fresh"), error);
      }
    }

    // Load pending payouts
    if (fs.existsSync(this.pendingPayoutsFilePath)) {
      try {
        const data = fs.readFileSync(this.pendingPayoutsFilePath, 'utf-8');
        this.pendingPayouts = JSON.parse(data);
        console.log(chalk.green(`Loaded ${this.pendingPayouts.length} pending payouts from pending-payouts.json`));
      } catch (error) {
        console.error(chalk.red("Error reading pending payouts file, starting fresh"), error);
      }
    }
  }

  /**
   * Save data to persistent files
   */
  private savePersistedData(): void {
    try {
      // Save websites
      const websitesObj = Object.fromEntries(this.registeredWebsites);
      fs.writeFileSync(this.websitesFilePath, JSON.stringify(websitesObj, null, 2));

      // Save pending payouts
      fs.writeFileSync(this.pendingPayoutsFilePath, JSON.stringify(this.pendingPayouts, null, 2));
    } catch (error) {
      console.error(chalk.red("Error saving persisted data"), error);
    }
  }

  /**
   * Step 1: Generate unique address for a website (with persistence check)
   */
  async createWebsiteAddress(domain: string, ownerSupraAddress: string): Promise<{
    websiteId: string;
    verificationToken: string;
    verificationInstructions: string;
    isExisting?: boolean;
      }> {
    const normalizedDomain = domain.toLowerCase();
    
    // Check if website already exists
    for (const [existingId, existingRegistration] of this.registeredWebsites) {
      if (existingRegistration.domain === normalizedDomain) {
        console.log(chalk.yellow(`Website ${domain} already registered with ID: ${existingId}`));
        return {
          websiteId: existingId,
          verificationToken: existingRegistration.verificationToken,
          verificationInstructions: `
            Website already registered! To verify ownership of ${domain}, please:
            1. Create a file at: https://${domain}/.well-known/supra-verification.txt
            2. Add this content: supra-verification=${existingRegistration.verificationToken}
            3. Call verifyWebsiteOwnership("${existingId}") once the file is live
            
            OR add this meta tag to your homepage:
            <meta name="supra-verification" content="${existingRegistration.verificationToken}" />
          `,
          isExisting: true
        };
      }
    }

    // Create new website registration
    const websiteId = createHash('sha256')
      .update(`${normalizedDomain}-${Date.now()}`)
      .digest('hex')
      .substring(0, 16);

    // Generate verification token for domain ownership proof
    const verificationToken = randomBytes(32).toString('hex');
    
    const registration: WebsiteRegistration = {
      domain: normalizedDomain,
      owner: ownerSupraAddress,
      supraPubKey: ownerSupraAddress,
      verificationToken,
      isVerified: false,
      registrationTimestamp: Date.now(),
      totalConversions: 0,
      totalEarnings: 0
    };

    this.registeredWebsites.set(websiteId, registration);

    // Save to persistent storage
    this.savePersistedData();

    // Store on Supra VM
    await this.storeWebsiteRegistrationOnChain(websiteId, registration);

    console.log(chalk.green(`New website ${domain} registered with ID: ${websiteId}`));

    return {
      websiteId,
      verificationToken,
      verificationInstructions: `
        To verify ownership of ${domain}, please:
        1. Create a file at: https://${domain}/.well-known/supra-verification.txt
        2. Add this content: supra-verification=${verificationToken}
        3. Call verifyWebsiteOwnership("${websiteId}") once the file is live
        
        OR add this meta tag to your homepage:
        <meta name="supra-verification" content="${verificationToken}" />
      `
    };
  }

  /**
   * Step 2: Verify website ownership
   */
  async verifyWebsiteOwnership(websiteId: string): Promise<boolean> {
    const registration = this.registeredWebsites.get(websiteId);
    if (!registration) {
      throw new Error('Website not found');
    }

    const domain = registration.domain;
    const expectedToken = registration.verificationToken;

    try {
      // Method 1: Check .well-known file
      const wellKnownUrl = `https://${domain}/.well-known/supra-verification.txt`;
      const wellKnownResponse = await fetch(wellKnownUrl);
      
      if (wellKnownResponse.ok) {
        const content = await wellKnownResponse.text();
        if (content.includes(`supra-verification=${expectedToken}`)) {
          return await this.markWebsiteAsVerified(websiteId);
        }
      }

      // Method 2: Check meta tag in homepage
      const homepageResponse = await fetch(`https://${domain}`);
      if (homepageResponse.ok) {
        const htmlContent = await homepageResponse.text();
        const metaTagRegex = new RegExp(
          `<meta\\s+name=["']supra-verification["']\\s+content=["']${expectedToken}["']\\s*\\/?>`,
          'i'
        );
        
        if (metaTagRegex.test(htmlContent)) {
          return await this.markWebsiteAsVerified(websiteId);
        }
      }

      return false;
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  }

  /**
   * Step 3: Track conversion events (supports escrow for unregistered/unverified websites)
   */
  async trackConversion(
    websiteIdOrDomain: string,
    sourceUrl: string,
    conversionData: {
      orderId: string;
      orderAmount: number;
      userAgent?: string;
      additionalData?: any;
    }
  ): Promise<string> {
    let websiteId: string;
    let registration: WebsiteRegistration | undefined;

    // Check if input is a website ID (hex string) or domain
    if (/^[a-f0-9]+$/i.test(websiteIdOrDomain) && websiteIdOrDomain.length === 16) {
      // It's a website ID
      websiteId = websiteIdOrDomain;
      registration = this.registeredWebsites.get(websiteId);
    } else {
      // It's a domain - extract domain from URL if needed
      const domain = this.extractDomainFromUrl(websiteIdOrDomain);
      const existing = await this.getWebsiteByDomain(domain);
      
      if (existing) {
        websiteId = existing.websiteId;
        registration = existing.registration;
      } else {
        // Create a temporary registration for unregistered domain
        websiteId = createHash('sha256')
          .update(`${domain}-${Date.now()}`)
          .digest('hex')
          .substring(0, 16);
        
        console.log(chalk.yellow(`📝 Creating temporary registration for unregistered domain: ${domain}`));
        console.log(chalk.yellow(`🆔 Generated Website ID: ${websiteId}`));
      }
    }

    // If no registration exists, create a placeholder (unregistered state)
    if (!registration) {
      const domain = this.extractDomainFromUrl(sourceUrl);
      registration = {
        domain: domain.toLowerCase(),
        owner: '', // Will be set when owner registers
        supraPubKey: '',
        verificationToken: randomBytes(32).toString('hex'),
        isVerified: false,
        registrationTimestamp: Date.now(),
        totalConversions: 0,
        totalEarnings: 0
      };
      
      this.registeredWebsites.set(websiteId, registration);
      console.log(chalk.blue(`🏗️  Created placeholder for ${domain} - owner can claim later by registering`));
    }

    const conversionId = randomBytes(16).toString('hex');
    const conversionEvent: ConversionEvent = {
      websiteId,
      conversionId,
      timestamp: Date.now(),
      amount: this.fixedPayoutAmount,
      sourceUrl,
      destinationUrl: conversionData.orderId,
      userAgent: conversionData.userAgent,
      referrerData: conversionData.additionalData
    };

    this.conversionEvents.push(conversionEvent);

    // Update website stats
    registration.totalConversions++;

    // Store conversion on-chain
    await this.storeConversionOnChain(conversionEvent);

    if (registration.isVerified) {
      // Website is verified - process immediate payout
      await this.processPayoutForConversion(conversionEvent, registration);
      registration.totalEarnings += this.fixedPayoutAmount;
      console.log(chalk.green(`✅ Immediate payout processed for verified website ${registration.domain}`));
    } else {
      // Website not verified - add to escrow/pending payouts
      const pendingPayout: PendingPayout = {
        websiteId,
        domain: registration.domain,
        conversionId,
        amount: this.fixedPayoutAmount,
        timestamp: Date.now(),
        sourceUrl,
        status: 'pending'
      };
      
      this.pendingPayouts.push(pendingPayout);
      console.log(chalk.yellow(`⏳ Conversion tracked for unverified website ${registration.domain}`));
      console.log(chalk.yellow(`💰 ${this.fixedPayoutAmount} pyUSD will be held in escrow until verification`));
      console.log(chalk.yellow(`🔒 To claim funds, verify website ownership first`));
    }

    // Save updated data
    this.savePersistedData();

    return conversionId;
  }

  /**
   * Step 4: Process pyUSD payout
   */
  async processPayoutForConversion(
    conversion: ConversionEvent,
    website: WebsiteRegistration
  ): Promise<string> {
    try {
      // Try to import and use the real payment system - will fail if not available
      throw new Error('Payment system not configured');
    } catch (error: any) {
      // If payment system isn't configured (missing env vars), use mock payout
      if (error?.message && error.message.includes('Environment variable PRIVATE_KEY is required')) {
        console.log(chalk.yellow(`⚠️  Payment system not configured - using mock payout`));
        console.log(chalk.yellow(`💡 To enable real payouts, set up the payment system with proper environment variables`));
        
        // Generate mock transaction hash
        const mockTxSignature = `mock_tx_${randomBytes(16).toString('hex')}`;
        console.log(`🔗 Mock Transaction: ${mockTxSignature}`);
        console.log(`💰 Mock payout of ${conversion.amount} pyUSD to ${website.domain} (${website.owner})`);
        
        return mockTxSignature;
      } else {
        console.error(chalk.red('Payout failed:'), error?.message || error);
        throw error;
      }
    }
  }

  /**
   * Store data on Supra VM
   */
  private async storeWebsiteRegistrationOnChain(
    websiteId: string,
    registration: WebsiteRegistration
  ): Promise<void> {
    // Using Supra VM Move contracts
    try {
      const moveCall = {
        function: "website_attribution::register_website",
        type_arguments: [],
        arguments: [
          websiteId,
          registration.domain,
          registration.owner,
          registration.verificationToken,
          registration.registrationTimestamp.toString()
        ]
      };

      const result = await this.supra.submitTransaction(moveCall);
      console.log('✅ Website registered on Supra VM:', result);
    } catch (error) {
      console.error('Failed to store on Supra VM:', error);
    }
  }

  private async storeConversionOnChain(conversion: ConversionEvent): Promise<void> {
    try {
      const moveCall = {
        function: "website_attribution::track_conversion",
        type_arguments: [],
        arguments: [
          conversion.websiteId,
          conversion.conversionId,
          conversion.amount.toString(),
          conversion.sourceUrl,
          conversion.timestamp.toString()
        ]
      };

      const result = await this.supra.submitTransaction(moveCall);
      console.log('✅ Conversion tracked on Supra VM:', result);
    } catch (error) {
      console.error('Failed to store conversion on Supra VM:', error);
    }
  }

  private async markWebsiteAsVerified(websiteId: string): Promise<boolean> {
    const registration = this.registeredWebsites.get(websiteId);
    if (!registration) return false;

    registration.isVerified = true;
    
    // Update on Supra VM
    try {
      const moveCall = {
        function: "website_attribution::verify_website",
        type_arguments: [],
        arguments: [websiteId]
      };

      await this.supra.submitTransaction(moveCall);
      console.log(`✅ Website ${registration.domain} verified on Supra VM`);
      
      // Process all pending payouts for this website
      await this.processPendingPayouts(websiteId);
      
      // Save updated data
      this.savePersistedData();
      
      return true;
    } catch (error) {
      console.error('Failed to verify on Supra VM:', error);
      return false;
    }
  }

  /**
   * Process all pending payouts for a verified website
   */
  private async processPendingPayouts(websiteId: string): Promise<void> {
    const registration = this.registeredWebsites.get(websiteId);
    if (!registration) return;

    const pendingForWebsite = this.pendingPayouts.filter(
      payout => payout.websiteId === websiteId && payout.status === 'pending'
    );

    if (pendingForWebsite.length === 0) {
      console.log(chalk.blue(`No pending payouts found for ${registration.domain}`));
      return;
    }

    console.log(chalk.cyan(`\n🔄 Processing ${pendingForWebsite.length} pending payouts for ${registration.domain}...`));

    let totalProcessed = 0;
    for (const pendingPayout of pendingForWebsite) {
      try {
        // Create a mock conversion event for the payout process
        const conversionEvent: ConversionEvent = {
          websiteId: pendingPayout.websiteId,
          conversionId: pendingPayout.conversionId,
          timestamp: pendingPayout.timestamp,
          amount: pendingPayout.amount,
          sourceUrl: pendingPayout.sourceUrl,
          destinationUrl: 'escrow-claim',
          userAgent: 'escrow-system',
          referrerData: { fromEscrow: true }
        };

        await this.processPayoutForConversion(conversionEvent, registration);
        
        // Mark as claimed
        pendingPayout.status = 'claimed';
        registration.totalEarnings += pendingPayout.amount;
        totalProcessed++;
        
        console.log(chalk.green(`  ✅ Processed payout: ${pendingPayout.amount} pyUSD (Conversion: ${pendingPayout.conversionId})`));
      } catch (error: any) {
        console.error(chalk.red(`  ❌ Failed to process payout for conversion ${pendingPayout.conversionId}:`), error?.message);
      }
    }

    console.log(chalk.cyan(`\n🎉 Successfully processed ${totalProcessed}/${pendingForWebsite.length} pending payouts!`));
    console.log(chalk.white(`💰 Total claimed: ${totalProcessed * this.fixedPayoutAmount} pyUSD`));
  }

  /**
   * Analytics and reporting
   */
  async getWebsiteStats(websiteId: string): Promise<WebsiteRegistration | null> {
    return this.registeredWebsites.get(websiteId) || null;
  }

  async getAllConversions(websiteId?: string): Promise<ConversionEvent[]> {
    if (websiteId) {
      return this.conversionEvents.filter(event => event.websiteId === websiteId);
    }
    return this.conversionEvents;
  }

  /**
   * Get pending payouts (escrow funds waiting for verification)
   */
  async getPendingPayouts(websiteId?: string): Promise<PendingPayout[]> {
    if (websiteId) {
      return this.pendingPayouts.filter(payout => payout.websiteId === websiteId);
    }
    return this.pendingPayouts;
  }

  /**
   * Get website by domain (for easier lookup)
   */
  async getWebsiteByDomain(domain: string): Promise<{ websiteId: string; registration: WebsiteRegistration } | null> {
    const normalizedDomain = domain.toLowerCase();
    for (const [websiteId, registration] of this.registeredWebsites) {
      if (registration.domain === normalizedDomain) {
        return { websiteId, registration };
      }
    }
    return null;
  }

  /**
   * Extract domain from URL or return as-is if already a domain
   */
  private extractDomainFromUrl(urlOrDomain: string): string {
    try {
      // If it looks like a URL, extract the domain
      if (urlOrDomain.includes('://')) {
        const url = new URL(urlOrDomain);
        return url.hostname;
      }
      // If it looks like a domain (contains dots but no protocol), return as-is
      if (urlOrDomain.includes('.') && !urlOrDomain.includes('/')) {
        return urlOrDomain;
      }
      // Otherwise, assume it's already a domain
      return urlOrDomain;
    } catch (error) {
      // If URL parsing fails, treat as domain
      return urlOrDomain.replace(/^https?:\/\//, '').split('/')[0];
    }
  }

  /**
   * Future: Dynamic pricing based on semantic similarity
   */
  async calculateDynamicPayout(
    websiteContent: string,
    targetProduct: string
  ): Promise<number> {
    // This would integrate with semantic similarity models
    // For now, return fixed amount
    return this.fixedPayoutAmount;
  }
}

/**
 * Parse user commands for the CLI interface
 */
function parseCommand(input: string): { command: string; domain?: string; websiteId?: string } {
  const lower = input.toLowerCase().trim();
  
  if (lower.includes("register") && lower.includes("website")) {
    // Extract domain from command like "register my website example.com"
    const match = lower.match(/register.*website\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (match) {
      return { command: "register", domain: match[1] };
    }
    return { command: "register" };
  } else if (lower.includes("verify") && lower.includes("ownership")) {
    // Extract website ID from command like "verify ownership of website abc123"
    const match = lower.match(/website\s+([a-f0-9]+)/);
    if (match) {
      return { command: "verify", websiteId: match[1] };
    }
    return { command: "verify" };
  } else if (lower.includes("track") && lower.includes("conversion")) {
    // Extract website ID or domain from command like "track conversion for website abc123" or "track conversion for example.com"
    const websiteMatch = lower.match(/website\s+([a-f0-9]+)/);
    const domainMatch = lower.match(/for\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    
    if (websiteMatch) {
      return { command: "track", websiteId: websiteMatch[1] };
    } else if (domainMatch) {
      return { command: "track", domain: domainMatch[1] };
    }
    return { command: "track" };
  } else if (lower.includes("stats") || lower.includes("statistics")) {
    // Extract website ID from command like "show stats for website abc123"
    const match = lower.match(/website\s+([a-f0-9]+)/);
    if (match) {
      return { command: "stats", websiteId: match[1] };
    }
    return { command: "stats" };
  } else if (lower.includes("conversions") || lower.includes("history")) {
    return { command: "conversions" };
  } else if (lower.includes("pending") || lower.includes("escrow")) {
    const match = lower.match(/website\s+([a-f0-9]+)/);
    if (match) {
      return { command: "pending", websiteId: match[1] };
    }
    return { command: "pending" };
  } else if (lower.trim() === "help") {
    return { command: "help" };
  } else if (lower.trim() === "exit" || lower.trim() === "quit") {
    return { command: "exit" };
  }

  return { command: lower.trim() };
}

/**
 * Main CLI interface
 */
async function main() {
  console.log(chalk.cyan.bold("\n*** Welcome to Website Attribution Agent ***\n"));

  // Mock Supra SDK for now - in production, this would connect to actual Supra network
  console.log(chalk.blue("Initializing Supra Client..."));
  const supra: SupraSDK = {
    submitTransaction: async (moveCall: any) => {
      console.log(chalk.gray('Mock Supra transaction:', JSON.stringify(moveCall, null, 2)));
      return { success: true, txHash: `0x${randomBytes(32).toString('hex')}` };
    }
  };

  const attributionAgent = new WebsiteAttributionAgent(supra);
  
  // Mock address for demo - in production, this would be a real Supra address
  const myAddress = `0x${randomBytes(20).toString('hex')}`;
  console.log(chalk.green("Connected to network with chain ID:"), "6");
  console.log(chalk.green("Your Supra Account Address:"), myAddress);

  // Setup CLI interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.magenta("Website Attribution Agent> ")
  });

  console.log(chalk.yellow("\nAvailable commands:"));
  console.log(" - 'register my website example.com'           : Register a new website for attribution tracking");
  console.log(" - 'verify ownership of website <WEBSITE_ID>'  : Verify domain ownership");
  console.log(" - 'track conversion for website <WEBSITE_ID>' : Record a conversion event by website ID");
  console.log(" - 'track conversion for example.com'          : Record a conversion event by domain (auto-creates if needed)");
  console.log(" - 'show stats for website <WEBSITE_ID>'       : Display website analytics");
  console.log(" - 'show all conversions'                      : View conversion history");
  console.log(" - 'show pending payouts'                      : View escrow funds awaiting verification");
  console.log(" - 'help'                                      : Show this help message");
  console.log(" - 'exit'                                      : Quit the agent\n");

  rl.prompt();

  rl.on('line', async (input: string) => {
    const { command, domain, websiteId } = parseCommand(input);
    
    switch (command) {
      case "register": {
        if (!domain) {
          console.log(chalk.red("Please specify a domain. Example: 'register my website example.com'"));
          break;
        }
        try {
          console.log(chalk.blue(`Registering website: ${domain}...`));
          const registration = await attributionAgent.createWebsiteAddress(domain, myAddress);
          console.log(chalk.cyan("\n--- Website Registration ---"));
          console.log(chalk.white("Domain        :"), domain);
          console.log(chalk.white("Website ID    :"), registration.websiteId);
          console.log(chalk.white("Owner Address :"), myAddress);
          console.log(chalk.yellow("\nVerification Instructions:"));
          console.log(registration.verificationInstructions);
          console.log(chalk.cyan("-------------------------------\n"));
        } catch (error) {
          console.error(chalk.red("Error registering website:"), error);
        }
        break;
      }
      case "verify": {
        if (!websiteId) {
          console.log(chalk.red("Please specify a website ID. Example: 'verify ownership of website abc123'"));
          break;
        }
        try {
          console.log(chalk.blue(`Verifying ownership for website ID: ${websiteId}...`));
          const isVerified = await attributionAgent.verifyWebsiteOwnership(websiteId);
          if (isVerified) {
            console.log(chalk.green(`✅ Website ${websiteId} has been verified successfully!`));
          } else {
            console.log(chalk.red(`❌ Website ${websiteId} verification failed. Please check the verification instructions.`));
          }
        } catch (error) {
          console.error(chalk.red("Error verifying website:"), error);
        }
        break;
      }
      case "track": {
        const targetId = websiteId || domain;
        if (!targetId) {
          console.log(chalk.red("Please specify a website ID or domain. Examples:"));
          console.log(chalk.red("  'track conversion for website abc123'"));
          console.log(chalk.red("  'track conversion for example.com'"));
          break;
        }
        try {
          if (websiteId) {
            console.log(chalk.blue(`Tracking conversion for website ID: ${websiteId}...`));
          } else {
            console.log(chalk.blue(`Tracking conversion for domain: ${domain}...`));
          }
          
          const conversionId = await attributionAgent.trackConversion(
            targetId,
            domain ? `https://${domain}/product-page` : 'https://example.com/product-page',
            {
              orderId: `ORDER_${Date.now()}`,
              orderAmount: 100,
              userAgent: 'CLI-Agent/1.0',
              additionalData: { source: 'cli' }
            }
          );
          console.log(chalk.green(`✅ Conversion tracked successfully!`));
          console.log(chalk.white("Conversion ID :"), conversionId);
          console.log(chalk.white("Payout Amount :"), "0.1 pyUSD");
        } catch (error: any) {
          console.error(chalk.red("Error tracking conversion:"), error?.message || error);
        }
        break;
      }
      case "stats": {
        if (!websiteId) {
          console.log(chalk.red("Please specify a website ID. Example: 'show stats for website abc123'"));
          break;
        }
        try {
          const stats = await attributionAgent.getWebsiteStats(websiteId);
          if (stats) {
            console.log(chalk.cyan("\n--- Website Statistics ---"));
            console.log(chalk.white("Domain           :"), stats.domain);
            console.log(chalk.white("Website ID       :"), websiteId);
            console.log(chalk.white("Owner            :"), stats.owner);
            console.log(chalk.white("Verified         :"), stats.isVerified ? "✅ Yes" : "❌ No");
            console.log(chalk.white("Total Conversions:"), stats.totalConversions);
            console.log(chalk.white("Total Earnings   :"), `${stats.totalEarnings} pyUSD`);
            console.log(chalk.white("Registered On    :"), new Date(stats.registrationTimestamp).toLocaleDateString());
            console.log(chalk.cyan("---------------------------\n"));
          } else {
            console.log(chalk.red(`Website ID ${websiteId} not found.`));
          }
        } catch (error) {
          console.error(chalk.red("Error fetching website stats:"), error);
        }
        break;
      }
      case "conversions": {
        try {
          const conversions = await attributionAgent.getAllConversions();
          console.log(chalk.cyan("\n--- All Conversions ---"));
          if (conversions.length === 0) {
            console.log(chalk.yellow("No conversions found."));
          } else {
            conversions.forEach((conversion, index) => {
              console.log(chalk.white(`${index + 1}. Website ID: ${conversion.websiteId}`));
              console.log(chalk.white(`   Conversion ID: ${conversion.conversionId}`));
              console.log(chalk.white(`   Amount: ${conversion.amount} pyUSD`));
              console.log(chalk.white(`   Date: ${new Date(conversion.timestamp).toLocaleString()}`));
              console.log(chalk.white(`   Source: ${conversion.sourceUrl}`));
              console.log("");
            });
          }
          console.log(chalk.cyan("----------------------\n"));
        } catch (error) {
          console.error(chalk.red("Error fetching conversions:"), error);
        }
        break;
      }
      case "pending": {
        try {
          const pendingPayouts = await attributionAgent.getPendingPayouts(websiteId);
          console.log(chalk.cyan("\n--- Pending Payouts (Escrow) ---"));
          if (pendingPayouts.length === 0) {
            console.log(chalk.yellow("No pending payouts found."));
          } else {
            let totalPending = 0;
            pendingPayouts.forEach((payout, index) => {
              if (payout.status === 'pending') {
                console.log(chalk.white(`${index + 1}. Website: ${payout.domain} (ID: ${payout.websiteId})`));
                console.log(chalk.white(`   Conversion ID: ${payout.conversionId}`));
                console.log(chalk.white(`   Amount: ${payout.amount} pyUSD`));
                console.log(chalk.white(`   Date: ${new Date(payout.timestamp).toLocaleString()}`));
                console.log(chalk.white(`   Source: ${payout.sourceUrl}`));
                console.log(chalk.yellow(`   Status: 🔒 Awaiting verification`));
                console.log("");
                totalPending += payout.amount;
              }
            });
            console.log(chalk.cyan(`💰 Total pending: ${totalPending} pyUSD`));
            console.log(chalk.yellow(`💡 Verify website ownership to claim these funds`));
          }
          console.log(chalk.cyan("--------------------------------\n"));
        } catch (error) {
          console.error(chalk.red("Error fetching pending payouts:"), error);
        }
        break;
      }
      case "help": {
        console.log(chalk.yellow("\nCommands:"));
        console.log(" - 'register my website example.com'           : Register a new website for attribution tracking");
        console.log(" - 'verify ownership of website <WEBSITE_ID>'  : Verify domain ownership");
        console.log(" - 'track conversion for website <WEBSITE_ID>' : Record a conversion event by website ID");
        console.log(" - 'track conversion for example.com'          : Record a conversion event by domain (auto-creates if needed)");
        console.log(" - 'show stats for website <WEBSITE_ID>'       : Display website analytics");
        console.log(" - 'show all conversions'                      : View conversion history");
        console.log(" - 'show pending payouts'                      : View escrow funds awaiting verification");
        console.log(" - 'exit'                                      : Quit the agent\n");
        break;
      }
      case "exit": {
        console.log(chalk.blue("Exiting Website Attribution Agent. Goodbye!"));
        rl.close();
        process.exit(0);
      }
      default: {
        console.log(chalk.red("Command not recognized. Type 'help' for available commands."));
        break;
      }
    }
    rl.prompt();
  });

  rl.on('close', () => {
    console.log(chalk.blue("CLI interface closed."));
  });
}

// Usage example function (kept for reference)
export async function initializeAttributionSystem() {
  // Mock Supra SDK for now
  const supra: SupraSDK = {
    submitTransaction: async (moveCall: any) => {
      console.log('Mock Supra transaction:', moveCall);
      return { success: true, txHash: 'mock_hash' };
    }
  };

  const attributionAgent = new WebsiteAttributionAgent(supra);

  // Example workflow:
  // 1. Website owner registers their domain
  const registration = await attributionAgent.createWebsiteAddress(
    'example.com',
    'your-supra-address-here'
  );
  console.log('Registration:', registration);

  // 2. Website owner verifies ownership
  const isVerified = await attributionAgent.verifyWebsiteOwnership(
    registration.websiteId
  );
  console.log('Verified:', isVerified);

  // 3. Track conversions (called when a sale happens from that website)
  if (isVerified) {
    const conversionId = await attributionAgent.trackConversion(
      registration.websiteId,
      'https://example.com/product-page',
      {
        orderId: 'ORDER_123',
        orderAmount: 100,
        userAgent: 'Mozilla/5.0...'
      }
    );
    console.log('Conversion tracked:', conversionId);
  }

  return attributionAgent;
}

// Start the CLI if this file is run directly
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red("Initialization error:"), error);
  });
}