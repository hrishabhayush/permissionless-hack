import { createHash, randomBytes } from 'crypto';

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

export class WebsiteAttributionAgent {
  private supra: SupraSDK;
  private registeredWebsites: Map<string, WebsiteRegistration> = new Map();
  private conversionEvents: ConversionEvent[] = [];
  private fixedPayoutAmount = 0.1; // 0.1 USD in pyUSD
  
  constructor(supraSdk: SupraSDK) {
    this.supra = supraSdk;
  }

  /**
   * Step 1: Generate unique address for a website
   */
  async createWebsiteAddress(domain: string, ownerSupraAddress: string): Promise<{
    websiteId: string;
    verificationToken: string;
    verificationInstructions: string;
  }> {
    // Create deterministic website ID based on domain
    const websiteId = createHash('sha256')
      .update(`${domain}-${Date.now()}`)
      .digest('hex')
      .substring(0, 16);

    // Generate verification token for domain ownership proof
    const verificationToken = randomBytes(32).toString('hex');
    
    const registration: WebsiteRegistration = {
      domain: domain.toLowerCase(),
      owner: ownerSupraAddress,
      supraPubKey: ownerSupraAddress,
      verificationToken,
      isVerified: false,
      registrationTimestamp: Date.now(),
      totalConversions: 0,
      totalEarnings: 0
    };

    this.registeredWebsites.set(websiteId, registration);

    // Store on Supra VM
    await this.storeWebsiteRegistrationOnChain(websiteId, registration);

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
   * Step 3: Track conversion events
   */
  async trackConversion(
    websiteId: string,
    sourceUrl: string,
    conversionData: {
      orderId: string;
      orderAmount: number;
      userAgent?: string;
      additionalData?: any;
    }
  ): Promise<string> {
    const registration = this.registeredWebsites.get(websiteId);
    if (!registration || !registration.isVerified) {
      throw new Error('Website not verified or not found');
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
    registration.totalEarnings += this.fixedPayoutAmount;

    // Store conversion on-chain
    await this.storeConversionOnChain(conversionEvent);

    // Trigger payout
    await this.processPayoutForConversion(conversionEvent, registration);

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
      // Import your existing payment system
      const { Token2022MicropaymentDemo } = await import('../../../payments-sol');
      const paymentService = new Token2022MicropaymentDemo();

      // Send 0.1 USD worth of pyUSD to website owner
      const txSignature = await paymentService.sendMicropayment(
        website.owner,
        conversion.amount
      );

      console.log(`✅ Paid ${conversion.amount} pyUSD to ${website.domain} (${website.owner})`);
      console.log(`🔗 Transaction: ${txSignature}`);

      return txSignature;
    } catch (error) {
      console.error('Payout failed:', error);
      throw error;
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
      return true;
    } catch (error) {
      console.error('Failed to verify on Supra VM:', error);
      return false;
    }
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

// Usage example
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