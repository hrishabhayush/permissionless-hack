// wallet-tracker.ts - Solana wallet connection tracking functionality

interface WalletConnection {
  website: string;
  walletAddress: string;
  walletType: 'solana' | 'ethereum';
  timestamp: number;
  connectionMethod: string;
}

interface ChatGPTSession {
  query: string;
  sources: string[];
  timestamp: number;
  website: string;
}

// Global types for Solana wallet
declare global {
  interface Window {
    solana?: {
      isConnected: boolean;
      publicKey?: {
        toString(): string;
      };
      connect(): Promise<any>;
      disconnect(): Promise<void>;
      on?(event: string, callback: Function): void;
      isPhantom?: boolean;
    };
    phantom?: {
      solana?: any;
    };
  }
}

export class WalletTracker {
  private walletConnections: WalletConnection[] = [];
  private chatgptSessions: ChatGPTSession[] = [];
  private solanaWallet: any = null;

  constructor() {
    this.init();
  }

  private init() {
    console.log('💰 Initializing Wallet Tracker...');
    
    // Load existing data from storage
    this.loadStoredData();
    
    // Setup monitoring
    this.setupSolanaWalletMonitoring();
    this.setupWalletUIMonitoring();
    this.setupNetworkMonitoring();
    this.setupChatGPTMonitoring();
  }

  private loadStoredData() {
    chrome.storage.local.get(['walletConnections', 'chatgptSessions'], (result) => {
      this.walletConnections = result.walletConnections || [];
      this.chatgptSessions = result.chatgptSessions || [];
      console.log('💾 Loaded stored data:', {
        walletConnections: this.walletConnections.length,
        chatgptSessions: this.chatgptSessions.length
      });
    });
  }

  private trackWalletConnection(connection: WalletConnection) {
    console.log('💰 Wallet connection detected:', connection);
    
    // Add to local array
    this.walletConnections.push(connection);
    
    // Send to background script
    chrome.runtime.sendMessage({
      type: 'WALLET_CONNECTION',
      data: connection
    });
    
    // Store locally
    chrome.storage.local.set({ 
      walletConnections: this.walletConnections 
    }, () => {
      console.log('💾 Wallet connection stored locally');
    });
  }

  private trackChatGPTSession(session: ChatGPTSession) {
    console.log('🤖 ChatGPT session tracked:', session);
    
    // Add to local array
    this.chatgptSessions.push(session);
    
    // Send to background script
    chrome.runtime.sendMessage({
      type: 'CHATGPT_SESSION',
      data: session
    });
    
    // Store locally
    chrome.storage.local.set({ 
      chatgptSessions: this.chatgptSessions 
    }, () => {
      console.log('💾 ChatGPT session stored locally');
    });
  }

  private setupSolanaWalletMonitoring() {
    console.log('🔧 Setting up Solana wallet monitoring...');
    
    const checkSolanaWallet = () => {
      if (window.solana && !this.solanaWallet) {
        console.log('👻 Solana wallet detected:', window.solana);
        this.solanaWallet = window.solana;
        
        // Monitor connection events
        if (this.solanaWallet.on) {
          this.solanaWallet.on('connect', (publicKey: any) => {
            console.log('🔗 Solana wallet connected:', publicKey.toString());
            
            this.trackWalletConnection({
              website: window.location.hostname,
              walletAddress: publicKey.toString(),
              walletType: 'solana',
              timestamp: Date.now(),
              connectionMethod: 'phantom_connect_event'
            });
          });
          
          this.solanaWallet.on('disconnect', () => {
            console.log('🔌 Solana wallet disconnected');
          });
        }
        
        // Check if already connected
        if (this.solanaWallet.isConnected && this.solanaWallet.publicKey) {
          console.log('🔗 Solana wallet already connected:', this.solanaWallet.publicKey.toString());
          
          this.trackWalletConnection({
            website: window.location.hostname,
            walletAddress: this.solanaWallet.publicKey.toString(),
            walletType: 'solana',
            timestamp: Date.now(),
            connectionMethod: 'phantom_already_connected'
          });
        }
      }
    };
    
    // Check immediately
    checkSolanaWallet();
    
    // Monitor for when Solana wallet becomes available
    const solanaWalletInterval = setInterval(() => {
      if (window.solana && !this.solanaWallet) {
        checkSolanaWallet();
        clearInterval(solanaWalletInterval);
      }
    }, 1000);
    
    // Stop checking after 30 seconds
    setTimeout(() => {
      clearInterval(solanaWalletInterval);
    }, 30000);
  }

  private setupWalletUIMonitoring() {
    console.log('🔧 Setting up wallet UI monitoring...');
    
    // Monitor clicks on potential wallet buttons
    document.addEventListener('click', (event) => {
      const target = event.target as Element;
      
      // Check if clicked element or its parents match wallet button patterns
      let element: Element | null = target;
      let depth = 0;
      
      while (element && depth < 5) {
        const text = element.textContent?.toLowerCase() || '';
        const className = element.className?.toLowerCase() || '';
        const id = element.id?.toLowerCase() || '';
        
        // Check for wallet-related keywords
        if (
          text.includes('connect wallet') ||
          (text.includes('connect') && (text.includes('phantom') || text.includes('solana'))) ||
          (className.includes('connect') && className.includes('wallet')) ||
          className.includes('phantom') ||
          id.includes('connect') ||
          id.includes('wallet')
        ) {
          console.log('🎯 Potential wallet connection click detected:', {
            element: element.tagName,
            text: text.substring(0, 50),
            className: className,
            id: id
          });
          
          // Wait a bit then check for wallet connection
          setTimeout(() => {
            if (window.solana?.isConnected && window.solana?.publicKey) {
              this.trackWalletConnection({
                website: window.location.hostname,
                walletAddress: window.solana.publicKey.toString(),
                walletType: 'solana',
                timestamp: Date.now(),
                connectionMethod: 'ui_click_detected'
              });
            }
          }, 2000);
          
          break;
        }
        
        element = element.parentElement;
        depth++;
      }
    });
  }

  private setupNetworkMonitoring() {
    console.log('🔧 Setting up network monitoring for wallet connections...');
    
    // Override fetch to monitor wallet-related requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0]?.toString() || '';
      
      // Check for Solana RPC calls
      if (url.includes('devnet.solana.com') || 
          url.includes('mainnet-beta.solana.com') ||
          url.includes('solana-api') ||
          url.includes('getAccountInfo') ||
          url.includes('getBalance')) {
        console.log('🌐 Solana RPC request detected:', url);
        
        // Check if wallet is connected after RPC calls
        setTimeout(() => {
          if (window.solana?.isConnected && window.solana?.publicKey) {
            console.log('💰 Wallet connection detected via RPC monitoring');
          }
        }, 1000);
      }
      
      return originalFetch.apply(this, args);
    };
  }

  private setupChatGPTMonitoring() {
    // Only monitor ChatGPT on chatgpt.com
    if (!window.location.hostname.includes('chatgpt.com')) {
      return;
    }

    console.log('🤖 Setting up ChatGPT monitoring...');

    const extractSourcesFromText = (text: string): string[] => {
      // Look for various citation patterns
      const patterns = [
        /\b([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, // Basic domain pattern
        /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:\/[^\s]*)?/g, // URL pattern
        /\(([^)]+\.[a-zA-Z]{2,})\)/g, // Domains in parentheses
        /\[([^\]]+\.[a-zA-Z]{2,})\]/g, // Domains in brackets
      ];
      
      const sources = new Set<string>();
      
      patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach(match => {
            // Clean up the match to get just the domain
            const cleaned = match.replace(/^https?:\/\//, '')
                                 .replace(/^www\./, '')
                                 .replace(/\/.*$/, '')
                                 .replace(/[()[\]]/g, '');
            
            if (cleaned.includes('.') && !cleaned.includes(' ')) {
              sources.add(cleaned.toLowerCase());
            }
          });
        }
      });
      
      return Array.from(sources);
    };

    const processMessage = (messageElement: Element) => {
      const messageText = messageElement.textContent || '';
      
      if (messageText.length > 100) { // Only process substantial messages
        const sources = extractSourcesFromText(messageText);
        
        if (sources.length > 0) {
          console.log('🎯 Sources found in ChatGPT message:', sources);
          
          // Try to find the user query (usually in previous message)
          const allMessages = document.querySelectorAll('[data-message-author-role]');
          let userQuery = '';
          
          // Find the user message that preceded this assistant message
          for (let i = 0; i < allMessages.length; i++) {
            if (allMessages[i] === messageElement && i > 0) {
              const prevMessage = allMessages[i - 1];
              if (prevMessage.getAttribute('data-message-author-role') === 'user') {
                userQuery = prevMessage.textContent || '';
                break;
              }
            }
          }
          
          this.trackChatGPTSession({
            query: userQuery.substring(0, 500), // Limit query length
            sources: sources,
            timestamp: Date.now(),
            website: window.location.hostname
          });
        }
      }
    };

    // Set up observer for new ChatGPT messages
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check for assistant messages
              const messages = element.querySelectorAll('[data-message-author-role="assistant"]');
              messages.forEach(processMessage);
              
              // Also check if the added node itself is a message
              if (element.matches('[data-message-author-role="assistant"]')) {
                processMessage(element);
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Public method to get connection data for a specific website
  public getConnectionForWebsite(website: string): WalletConnection | null {
    return this.walletConnections.find(conn => conn.website === website) || null;
  }

  // Public method to get recent ChatGPT sessions
  public getRecentChatGPTSessions(hours: number = 24): ChatGPTSession[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.chatgptSessions.filter(session => session.timestamp > cutoff);
  }
}

// Export types for use in other files
export type { WalletConnection, ChatGPTSession }; 