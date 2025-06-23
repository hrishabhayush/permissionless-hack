import { createHash, randomBytes } from 'crypto';
import readline from 'readline';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { SupraClient, SupraAccount, HexString } from 'supra-l1-sdk';

interface WebsiteRegistration {
  domain: string;
  owner: string;
  supraPubKey: string;
  verificationToken: string;
  isVerified: boolean;
  registrationTimestamp: number;
  totalConversions: number;
  totalEarnings: string; // Store as string to avoid bigint serialization issues
}

interface ConversionEvent {
  websiteId: string;
  conversionId: string;
  timestamp: number;
  amount: string; // Store as string for consistency
  sourceUrl: string;
  destinationUrl: string;
  userAgent?: string;
  referrerData?: any;
}

interface PendingPayout {
  websiteId: string;
  domain: string;
  conversionId: string;
  amount: string;
  timestamp: number;
  sourceUrl: string;
  status: 'pending' | 'claimed' | 'expired';
}

/**
 * Load the account from file "account.json" if exists,
 * otherwise create a new account and persist it.
 */
async function loadOrCreateAccount(): Promise<SupraAccount> {
  const accountFilePath = path.join(__dirname, 'account.json');

  // If file exists, load and restore the account object.
  if (fs.existsSync(accountFilePath)) {
    try {
      const data = fs.readFileSync(accountFilePath, 'utf-8');
      const accountObj = JSON.parse(data);
      const account = SupraAccount.fromSupraAccountObject(accountObj);
      console.log(chalk.green("Loaded existing account from account.json"));
      return account;
    } catch (error) {
      console.error(chalk.red("Error reading account file, creating new account"), error);
    }
  }

  // Create new account, save details to file.
  const account = new SupraAccount();
  const accountObj = account.toPrivateKeyObject();
  fs.writeFileSync(accountFilePath, JSON.stringify(accountObj, null, 2));
  console.log(chalk.yellow("Created new account and saved to account.json"));
  return account;
}

export class WebsiteAttributionAgent {
  private supraClient: SupraClient;
  private account: SupraAccount;
  private registeredWebsites: Map<string, WebsiteRegistration> = new Map();
  private conversionEvents: ConversionEvent[] = [];
  private pendingPayouts: PendingPayout[] = [];
  private fixedPayoutAmount = BigInt(100000); // 0.1 Supra tokens (in micro-units)
  private websitesFilePath: string;
  private pendingPayoutsFilePath: string;
  
  constructor(supraClient: SupraClient, account: SupraAccount) {
    this.supraClient = supraClient;
    this.account = account;
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
      totalEarnings: "0"
    };

    this.registeredWebsites.set(websiteId, registration);

    // Save to persistent storage
    this.savePersistedData();

    console.log(chalk.green(`New website ${domain} registered with ID: ${websiteId}`));
    console.log(chalk.blue(`✅ Website registration recorded (TypeScript SDK only - no Move contract)`));

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
          console.log(chalk.green(`✅ Verification successful via .well-known file`));
          return await this.markWebsiteAsVerified(websiteId);
        }
      }

      // Method 2: Check meta tag on homepage
      const homepageResponse = await fetch(`https://${domain}`);
      if (homepageResponse.ok) {
        const htmlContent = await homepageResponse.text();
        const metaTagPattern = new RegExp(`<meta[^>]*name=["']supra-verification["'][^>]*content=["']${expectedToken}["'][^>]*>`, 'i');
        
        if (metaTagPattern.test(htmlContent)) {
          console.log(chalk.green(`✅ Verification successful via meta tag`));
          return await this.markWebsiteAsVerified(websiteId);
        }
      }

      console.log(chalk.red(`❌ Verification failed: Could not find token at .well-known file or meta tag`));
      return false;

    } catch (error) {
      console.error(chalk.red('Verification failed:'), error);
      return false;
    }
  }

  /**
   * Step 3: Track conversion and add to escrow for unverified sites
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
    let websiteId = websiteIdOrDomain;
    let registration = this.registeredWebsites.get(websiteId);

    // If not found by ID, try to find by domain
    if (!registration) {
      const domain = this.extractDomainFromUrl(websiteIdOrDomain);
      for (const [id, reg] of this.registeredWebsites) {
        if (reg.domain === domain) {
          websiteId = id;
          registration = reg;
          break;
        }
      }
    }

    // Auto-register if domain provided but not found
    if (!registration && !websiteIdOrDomain.startsWith('0x') && websiteIdOrDomain.includes('.')) {
      console.log(chalk.blue(`Auto-registering website: ${websiteIdOrDomain}`));
      const dummyAddress = this.account.address().toString();
      const newRegistration = await this.createWebsiteAddress(websiteIdOrDomain, dummyAddress);
      websiteId = newRegistration.websiteId;
      registration = this.registeredWebsites.get(websiteId);
    }

    if (!registration) {
      throw new Error('Website not found and could not auto-register');
    }

    const conversionId = createHash('sha256')
      .update(`${websiteId}-${conversionData.orderId}-${Date.now()}`)
      .digest('hex')
      .substring(0, 16);

    const payoutAmountStr = this.fixedPayoutAmount.toString();

    const conversion: ConversionEvent = {
      websiteId,
      conversionId,
      timestamp: Date.now(),
      amount: payoutAmountStr,
      sourceUrl,
      destinationUrl: conversionData.additionalData?.destinationUrl || 'conversion-endpoint',
      userAgent: conversionData.userAgent,
      referrerData: conversionData.additionalData
    };

    this.conversionEvents.push(conversion);
    registration.totalConversions++;

    console.log(chalk.green(`🎯 Conversion tracked for ${registration.domain}`));
    console.log(chalk.blue(`✅ Conversion event recorded (TypeScript SDK only)`));

    if (registration.isVerified) {
      // Process payout immediately for verified websites
      console.log(chalk.blue(`Website is verified - processing payout immediately...`));
      try {
        await this.processPayoutForConversion(conversion, registration);
        
        // Safe conversion for totalEarnings update
        let currentEarnings: bigint;
        try {
          const earningsValue = parseFloat(registration.totalEarnings);
          if (earningsValue < 1) {
            // Decimal format - convert to micro-units
            currentEarnings = BigInt(Math.round(earningsValue * 1000000));
          } else {
            // Already in micro-units format
            currentEarnings = BigInt(registration.totalEarnings);
          }
        } catch {
          currentEarnings = BigInt(0);
        }
        
        registration.totalEarnings = (currentEarnings + this.fixedPayoutAmount).toString();
        console.log(chalk.green(`✅ Immediate payout processed for verified website`));
      } catch (error: any) {
        console.error(chalk.red(`Failed to process immediate payout:`), error?.message);
        // Add to pending if immediate payout fails
        this.addToPendingPayouts(conversion, registration);
      }
    } else {
      // Add to escrow for unverified websites
      this.addToPendingPayouts(conversion, registration);
      console.log(chalk.yellow(`💰 Payout added to escrow (website not verified yet)`));
      console.log(chalk.yellow(`💡 Verify website ownership to claim ${Number(this.fixedPayoutAmount) / 1000000} Supra tokens`));
    }

    // Save to persistent storage
    this.savePersistedData();

    return conversionId;
  }

  /**
   * Add conversion to pending payouts (escrow)
   */
  private addToPendingPayouts(conversion: ConversionEvent, website: WebsiteRegistration): void {
    const pendingPayout: PendingPayout = {
      websiteId: conversion.websiteId,
      domain: website.domain,
      conversionId: conversion.conversionId,
      amount: conversion.amount,
      timestamp: conversion.timestamp,
      sourceUrl: conversion.sourceUrl,
      status: 'pending'
    };

    this.pendingPayouts.push(pendingPayout);
  }

  /**
   * Step 4: Process Supra token payout using real transferSupraCoin
   */
  async processPayoutForConversion(
    conversion: ConversionEvent,
    website: WebsiteRegistration
  ): Promise<string> {
    try {
      // Check if we have enough balance for the payout
      const balance = await this.supraClient.getAccountSupraCoinBalance(this.account.address());
      console.log(chalk.blue(`Current balance: ${balance.toString()} micro-Supra`));
      
      if (balance < this.fixedPayoutAmount) {
        throw new Error(`Insufficient balance. Need ${this.fixedPayoutAmount} micro-Supra, have ${balance}`);
      }

      // Validate and create receiver address
      console.log(chalk.blue(`Preparing payout to: ${website.owner}`));
      
      let receiverAddress: HexString;
      try {
        // Ensure the address is properly formatted
        const addressStr = website.owner.startsWith('0x') ? website.owner : `0x${website.owner}`;
        receiverAddress = new HexString(addressStr);
        console.log(chalk.blue(`Validated receiver address: ${receiverAddress.toString()}`));
      } catch (error) {
        throw new Error(`Invalid receiver address format: ${website.owner}. Error: ${error}`);
      }
      
      const payoutAmount = this.fixedPayoutAmount;
      
      console.log(chalk.blue(`Sending ${payoutAmount.toString()} micro-Supra to ${website.domain} (${receiverAddress.toString()})...`));
      
      const txResponse = await this.supraClient.transferSupraCoin(
        this.account,
        receiverAddress,
        payoutAmount,
        {
          enableTransactionWaitAndSimulationArgs: {
            enableWaitForTransaction: true,
            enableTransactionSimulation: false,
          },
        }
      );
      
      console.log(chalk.green(`✅ Payout successful! Transaction hash: ${txResponse.txHash}`));
      console.log(chalk.white(`💰 Sent ${Number(payoutAmount) / 1000000} Supra tokens to ${website.domain}`));
      console.log(chalk.cyan(`🔗 Transaction recorded on Supra blockchain: ${txResponse.txHash}`));
      
      return txResponse.txHash;
    } catch (error: any) {
      console.error(chalk.red('Payout failed:'), error?.message || error);
      throw error;
    }
  }

  private async markWebsiteAsVerified(websiteId: string): Promise<boolean> {
    const registration = this.registeredWebsites.get(websiteId);
    if (!registration) return false;

    registration.isVerified = true;
    
    console.log(`✅ Website ${registration.domain} verified successfully`);
    
    // Process all pending payouts for this website
    await this.processPendingPayouts(websiteId);
    
    // Save updated data
    this.savePersistedData();
    
    return true;
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
        // Create a conversion event for the payout process
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
        
        // Safe conversion for totalEarnings and pendingPayout amount
        let currentEarnings: bigint;
        try {
          const earningsValue = parseFloat(registration.totalEarnings);
          if (earningsValue < 1) {
            currentEarnings = BigInt(Math.round(earningsValue * 1000000));
          } else {
            currentEarnings = BigInt(registration.totalEarnings);
          }
        } catch {
          currentEarnings = BigInt(0);
        }
        
        let payoutAmount: bigint;
        try {
          const payoutValue = parseFloat(pendingPayout.amount);
          if (payoutValue < 1) {
            payoutAmount = BigInt(Math.round(payoutValue * 1000000));
          } else {
            payoutAmount = BigInt(pendingPayout.amount);
          }
        } catch {
          payoutAmount = BigInt(100000);
        }
        
        registration.totalEarnings = (currentEarnings + payoutAmount).toString();
        totalProcessed++;
        
        console.log(chalk.green(`  ✅ Processed payout: ${Number(BigInt(pendingPayout.amount)) / 1000000} Supra (Conversion: ${pendingPayout.conversionId})`));
      } catch (error: any) {
        console.error(chalk.red(`  ❌ Failed to process payout for conversion ${pendingPayout.conversionId}:`), error?.message);
      }
    }

    console.log(chalk.cyan(`\n🎉 Successfully processed ${totalProcessed}/${pendingForWebsite.length} pending payouts!`));
    console.log(chalk.white(`💰 Total claimed: ${Number(BigInt(totalProcessed.toString()) * this.fixedPayoutAmount) / 1000000} Supra tokens`));
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
   * Utility function to extract domain from URL or domain string
   */
  private extractDomainFromUrl(urlOrDomain: string): string {
    try {
      // If it looks like a URL, parse it
      if (urlOrDomain.includes('://')) {
        const url = new URL(urlOrDomain);
        return url.hostname.toLowerCase();
      }
      
      // If it looks like a domain (contains dots), clean it up
      if (urlOrDomain.includes('.')) {
        return urlOrDomain.toLowerCase().replace(/^www\./, '');
      }
      
      // Otherwise, assume it's already a clean domain
      return urlOrDomain.toLowerCase();
    } catch {
      // If URL parsing fails, treat as domain
      return urlOrDomain.toLowerCase();
    }
  }

  /**
   * Future: Calculate dynamic payout based on website content and product relevance
   */
  async calculateDynamicPayout(
    websiteContent: string,
    targetProduct: string
  ): Promise<number> {
    // Placeholder for future ML-based relevance scoring
    return Number(this.fixedPayoutAmount) / 1000000;
  }
}

/**
 * A simple parser that interprets a human language command into a command type.
 */
function parseCommand(input: string): { command: string; domain?: string; websiteId?: string; hash?: string } {
  const lower = input.toLowerCase();
  
  if (lower.includes("register") && lower.includes("website")) {
    // Extract domain from "register my website example.com"
    const domainMatch = lower.match(/(?:website\s+)([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (domainMatch) {
      return { command: "register", domain: domainMatch[1] };
    }
    return { command: "register" };
  } else if (lower.includes("verify") && lower.includes("ownership")) {
    // Extract website ID from "verify ownership of website abc123"
    const idMatch = lower.match(/(?:website\s+)([a-f0-9]{16})/);
    if (idMatch) {
      return { command: "verify", websiteId: idMatch[1] };
    }
    return { command: "verify" };
  } else if (lower.includes("track") && lower.includes("conversion")) {
    // Extract website ID or domain
    const idMatch = lower.match(/(?:website\s+)([a-f0-9]{16})/);
    if (idMatch) {
      return { command: "track", websiteId: idMatch[1] };
    }
    
    const domainMatch = lower.match(/(?:for\s+)([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (domainMatch) {
      return { command: "track", domain: domainMatch[1] };
    }
    return { command: "track" };
  } else if (lower.includes("stats") && lower.includes("website")) {
    const idMatch = lower.match(/(?:website\s+)([a-f0-9]{16})/);
    if (idMatch) {
      return { command: "stats", websiteId: idMatch[1] };
    }
    return { command: "stats" };
  } else if (lower.includes("show") && lower.includes("conversions")) {
    return { command: "conversions" };
  } else if (lower.includes("pending") && lower.includes("payouts")) {
    return { command: "pending" };
  } else if (lower.includes("transaction detail") || lower.includes("txdetail") || (lower.includes("show") && lower.includes("transaction"))) {
    // Extract transaction hash from "show me transaction details for 0x..."
    const match = lower.match(/0x[a-f0-9]{64,}/);
    if (match) {
      return { command: "txdetail", hash: match[0] };
    } else {
      return { command: "txdetail", hash: "" };
    }
  } else if (lower.includes("transaction history") || lower.includes("txhistory") || (lower.includes("my") && lower.includes("transactions"))) {
    return { command: "txhistory" };
  } else if (lower.includes("account resources") || lower.includes("resources") || lower.includes("show resources")) {
    return { command: "resources" };
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

  // Initialize real Supra Client on testnet
  console.log(chalk.blue("Initializing Supra Client..."));
  const supraClient = await SupraClient.init("https://rpc-testnet.supra.com");
  console.log(chalk.green("Connected to Supra testnet with chain ID:"), supraClient.chainId);

  // Load (or create) the account so that the same account persists across runs
  const myAccount = await loadOrCreateAccount();
  const myAddress = myAccount.address();
  console.log(chalk.green("Your Supra Account Address:"), myAddress.toString());

  // Check and display balance
  try {
    const balance = await supraClient.getAccountSupraCoinBalance(myAddress);
    console.log(chalk.green("Current Balance:"), `${Number(balance) / 1000000} Supra tokens`);
    
    if (balance === BigInt(0)) {
      console.log(chalk.yellow("\n💡 Your balance is 0. You can fund your account by saying 'fund my account'\n"));
    }
  } catch (error) {
    console.log(chalk.yellow("Could not fetch balance. Account may need funding."));
  }

  const attributionAgent = new WebsiteAttributionAgent(supraClient, myAccount);

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
  console.log(" - 'fund my account'                           : Request testnet tokens via faucet");
  console.log(" - 'check my balance'                          : Display current account balance");
  console.log(" - 'show me transaction details for <TX_HASH>' : Fetch transaction details");
  console.log(" - 'show my transaction history'               : Retrieve transaction history");
  console.log(" - 'show my account resources'                 : Fetch account resource data");
  console.log(" - 'help'                                      : Show this help message");
  console.log(" - 'exit'                                      : Quit the agent\n");

  rl.prompt();

  rl.on('line', async (input: string) => {
    const { command, domain, websiteId, hash } = parseCommand(input);
    
    switch (command) {
      case "fund my account":
      case "fund account":
      case "fund": {
        try {
          console.log(chalk.blue("Requesting funds via faucet..."));
          const fundResponse = await supraClient.fundAccountWithFaucet(myAddress);
          console.log(chalk.green("Faucet Response:"), fundResponse);

          // Wait 5 seconds before updating the balance
          setTimeout(async () => {
            const updatedBalance = await supraClient.getAccountSupraCoinBalance(myAddress);
            console.log(chalk.green("Updated Account Balance:"), `${Number(updatedBalance) / 1000000} Supra tokens`);
            rl.prompt();
          }, 5000);
          return;
        } catch (error) {
          console.error(chalk.red("Error funding account:"), error);
        }
        break;
      }
      case "check my balance":
      case "balance":
      case "check balance": {
        try {
          const accountInfo = await supraClient.getAccountInfo(myAddress);
          const balance = await supraClient.getAccountSupraCoinBalance(myAddress);
          console.log(chalk.cyan("\n--- Account Info ---"));
          console.log(chalk.white("Address          :"), myAddress.toString());
          console.log(chalk.white("Sequence Number  :"), accountInfo.sequence_number);
          console.log(chalk.white("Authentication Key:"), accountInfo.authentication_key);
          console.log(chalk.white("Balance          :"), balance.toString());
          console.log(chalk.cyan("---------------------\n"));
        } catch (error) {
          console.error(chalk.red("Error fetching balance info:"), error);
        }
        break;
      }
      case "txdetail": {
        if (!hash) {
          console.log(chalk.red("Please include a valid transaction hash (starting with 0x...)"));
          console.log(chalk.yellow("Example: 'show me transaction details for 0x1234abcd...'"));
        } else {
          try {
            const txDetails = await supraClient.getTransactionDetail(myAddress, hash);
            console.log(chalk.cyan("\n--- Transaction Details ---"));
            console.log(chalk.white(JSON.stringify(txDetails, null, 2)));
            console.log(chalk.cyan("---------------------------\n"));
          } catch (error) {
            console.error(chalk.red("Error fetching transaction details:"), error);
          }
        }
        break;
      }
      case "txhistory": {
        try {
          const txHistory = await supraClient.getAccountTransactionsDetail(myAddress);
          console.log(chalk.cyan("\n--- Transaction History ---"));
          if (txHistory && txHistory.length > 0) {
            console.log(chalk.green(`Found ${txHistory.length} transactions:`));
            console.log(chalk.white(JSON.stringify(txHistory, null, 2)));
          } else {
            console.log(chalk.yellow("No transactions found."));
          }
          console.log(chalk.cyan("---------------------------\n"));
        } catch (error) {
          console.error(chalk.red("Error fetching transaction history:"), error);
        }
        break;
      }
      case "resources": {
        try {
          const resources = await supraClient.getAccountResources(myAddress);
          console.log(chalk.cyan("\n--- Account Resources ---"));
          console.log(chalk.white(JSON.stringify(resources, null, 2)));
          console.log(chalk.cyan("-------------------------\n"));
        } catch (error) {
          console.error(chalk.red("Error fetching account resources:"), error);
        }
        break;
      }
      case "register": {
        if (!domain) {
          console.log(chalk.red("Please specify a domain. Example: 'register my website example.com'"));
          break;
        }
        try {
          console.log(chalk.blue(`Registering website: ${domain}...`));
          const registration = await attributionAgent.createWebsiteAddress(domain, myAddress.toString());
          console.log(chalk.cyan("\n--- Website Registration ---"));
          console.log(chalk.white("Domain        :"), domain);
          console.log(chalk.white("Website ID    :"), registration.websiteId);
          console.log(chalk.white("Owner Address :"), myAddress.toString());
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
          console.log(chalk.white("Payout Amount :"), "0.1 Supra tokens");
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
            // Safe conversion for total earnings
            let totalEarningsInMicroUnits: bigint;
            try {
              const earningsValue = parseFloat(stats.totalEarnings);
              if (earningsValue < 1) {
                // Decimal format - convert to micro-units
                totalEarningsInMicroUnits = BigInt(Math.round(earningsValue * 1000000));
              } else {
                // Already in micro-units format
                totalEarningsInMicroUnits = BigInt(stats.totalEarnings);
              }
            } catch {
              totalEarningsInMicroUnits = BigInt(0);
            }
            
            console.log(chalk.white("Total Earnings   :"), `${Number(totalEarningsInMicroUnits) / 1000000} Supra tokens`);
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
              
              // Safe conversion: handle both decimal and micro-unit formats
              let amountInMicroUnits: bigint;
              try {
                const amountValue = parseFloat(conversion.amount);
                if (amountValue < 1) {
                  // Decimal format like "0.1" - convert to micro-units
                  amountInMicroUnits = BigInt(Math.round(amountValue * 1000000));
                } else {
                  // Already in micro-units format like "100000"
                  amountInMicroUnits = BigInt(conversion.amount);
                }
              } catch {
                // Fallback to default amount if parsing fails
                amountInMicroUnits = BigInt(100000);
              }
              
              console.log(chalk.white(`   Amount: ${Number(amountInMicroUnits) / 1000000} Supra tokens`));
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
            let totalPending = BigInt(0);
            pendingPayouts.forEach((payout, index) => {
              if (payout.status === 'pending') {
                console.log(chalk.white(`${index + 1}. Website: ${payout.domain} (ID: ${payout.websiteId})`));
                console.log(chalk.white(`   Conversion ID: ${payout.conversionId}`));
                
                // Safe conversion: handle both decimal and micro-unit formats
                let amountInMicroUnits: bigint;
                try {
                  const amountValue = parseFloat(payout.amount);
                  if (amountValue < 1) {
                    // Decimal format like "0.1" - convert to micro-units
                    amountInMicroUnits = BigInt(Math.round(amountValue * 1000000));
                  } else {
                    // Already in micro-units format like "100000"
                    amountInMicroUnits = BigInt(payout.amount);
                  }
                } catch {
                  // Fallback to default amount if parsing fails
                  amountInMicroUnits = BigInt(100000);
                }
                
                console.log(chalk.white(`   Amount: ${Number(amountInMicroUnits) / 1000000} Supra tokens`));
                console.log(chalk.white(`   Date: ${new Date(payout.timestamp).toLocaleString()}`));
                console.log(chalk.white(`   Source: ${payout.sourceUrl}`));
                console.log(chalk.yellow(`   Status: 🔒 Awaiting verification`));
                console.log("");
                totalPending += amountInMicroUnits;
              }
            });
            console.log(chalk.cyan(`💰 Total pending: ${Number(totalPending) / 1000000} Supra tokens`));
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
        console.log(" - 'fund my account'                           : Request testnet tokens via faucet");
        console.log(" - 'check my balance'                          : Display current account balance");
        console.log(" - 'show me transaction details for <TX_HASH>' : Fetch transaction details");
        console.log(" - 'show my transaction history'               : Retrieve transaction history");
        console.log(" - 'show my account resources'                 : Fetch account resource data");
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
  // Initialize real Supra Client
  const supraClient = await SupraClient.init("https://rpc-testnet.supra.com");
  const account = await loadOrCreateAccount();

  const attributionAgent = new WebsiteAttributionAgent(supraClient, account);

  // Example workflow:
  // 1. Website owner registers their domain
  const registration = await attributionAgent.createWebsiteAddress(
    'example.com',
    account.address().toString()
  );
  console.log('Registration:', registration);

  // 2. Website owner verifies ownership
  const isVerified = await attributionAgent.verifyWebsiteOwnership(
    registration.websiteId
  );
  console.log('Verified:', isVerified);

  // 3. Track conversions (called when a sale happens from that website)
  const conversionId = await attributionAgent.trackConversion(
    registration.websiteId,
    'https://example.com/product-page',
    {
      orderId: 'ORDER123',
      orderAmount: 100,
      userAgent: 'Mozilla/5.0...',
      additionalData: { customerId: 'user123' }
    }
  );
  console.log('Conversion tracked:', conversionId);

  return attributionAgent;
}

main().catch((error) => {
  console.error(chalk.red("Initialization error:"), error);
});