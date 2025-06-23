import type { WalletConnection, ChatGPTSession } from './wallet-tracker';

console.log('🚀 Referral Extension Background Script Loaded');

// Test user data (in a real app, this would come from storage/API)
const backgroundTestUser = {
  username: 'testuser',
  walletAddress: '0x742d35Cc6635C0532925a3b8D2c2C5c5b2b4b3b3'
};

console.log('🚀 Test user data loaded:', backgroundTestUser);

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message received from content script:', message);
  
  if (message.type === 'ATTRIBUTION_DETECTED') {
    console.log('🎯 Attribution detected!', message.data);
    
    // Enhanced logging with wallet tracking data
    console.log('💰 Enhanced attribution data that would be sent to API:', {
      user: message.data.user,
      userWalletAddress: message.data.userWalletAddress,
      source: message.data.source,
      destination: message.data.destination,
      referralId: message.data.referralId,
      timestamp: message.data.timestamp,
      originalUrl: message.data.originalUrl,
      modifiedUrl: message.data.modifiedUrl,
      hasWalletConnected: message.data.hasWalletConnected,
      recentChatGPTSources: message.data.recentChatGPTSources?.length || 0
    });
    
    // Log wallet connection status for this site
    if (message.data.hasWalletConnected && message.data.walletConnectionDetails) {
      console.log('🔗 User wallet connected to this site:', {
        userWalletAddress: message.data.walletConnectionDetails.walletAddress,
        walletType: message.data.walletConnectionDetails.walletType,
        connectionMethod: message.data.walletConnectionDetails.connectionMethod,
        connectionTime: message.data.walletConnectionDetails.connectionTime
      });
    } else {
      console.log('❌ User has not connected wallet to this site');
    }
    
    // Log recent ChatGPT sources
    if (message.data.recentChatGPTSources?.length > 0) {
      const uniqueSources = [...new Set(message.data.recentChatGPTSources)];
      console.log('🤖 Recent ChatGPT sources analysis:', {
        totalSources: message.data.recentChatGPTSources.length,
        uniqueSources: uniqueSources.length,
        topSources: uniqueSources.slice(0, 10)
      });
    }
    
    // Store attribution locally for now
    chrome.storage.local.get(['attributions'], (result) => {
      const attributions = result.attributions || [];
      attributions.push(message.data);
      
      chrome.storage.local.set({ attributions }, () => {
        console.log('💾 Attribution stored locally');
        console.log('📊 Total attributions:', attributions.length);
      });
    });
    
    sendResponse({ success: true });
  }
  
  // Handle wallet tracking messages
  if (message.type === 'WALLET_CONNECTION') {
    console.log('🔗 Wallet connection detected:', message.data);
    
    // Store wallet connection locally
    chrome.storage.local.get(['walletConnections'], (result) => {
      const connections = result.walletConnections || [];
      connections.push(message.data);
      
      chrome.storage.local.set({ walletConnections: connections }, () => {
        console.log('💾 Wallet connection stored');
        console.log('📊 Total wallet connections:', connections.length);
      });
    });
    
    sendResponse({ success: true });
  }
  
  if (message.type === 'CHATGPT_SESSION') {
    console.log('🤖 ChatGPT session tracked:', message.data);
    
    // Store ChatGPT session locally
    chrome.storage.local.get(['chatgptSessions'], (result) => {
      const sessions = result.chatgptSessions || [];
      sessions.push(message.data);
      
      chrome.storage.local.set({ chatgptSessions: sessions }, () => {
        console.log('💾 ChatGPT session stored');
        console.log('📊 Total ChatGPT sessions:', sessions.length);
      });
    });
    
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});

// Function to generate referral parameter
function generateReferralParam(userId: string): string {
  // In a real implementation, this would be more sophisticated
  return `ref=${requityId}_${12345}`;
}

// Debug: Log all web requests to see what we're intercepting
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // Only log interesting requests to avoid spam
    if (details.url.includes('utm_source=chatgpt.com') || 
        details.url.includes('visioncenter.org') || 
        details.url.includes('ref=')) {
      console.log('🌐 Interesting web request:', {
        url: details.url,
        method: details.method,
        type: details.type,
        tabId: details.tabId
      });
    }
    
    return {};
  },
  {
    urls: ['https://*/*', 'http://*/*'],
    types: ['main_frame', 'sub_frame']
  }
);

// Also intercept before sending headers to see more details
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (details.url.includes('utm_source=chatgpt.com') || 
        details.url.includes('visioncenter.org')) {
      console.log('📤 Headers for request:', {
        url: details.url,
        headers: details.requestHeaders,
        tabId: details.tabId
      });
    }
    
    return {};
  },
  {
    urls: ['https://*/*', 'http://*/*']
  },
  ['requestHeaders']
);

// Listen for completed requests to see the final URLs
chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url.includes('utm_source=chatgpt.com') || 
        details.url.includes('visioncenter.org') ||
        details.url.includes('ref=')) {
      console.log('✅ Request completed:', {
        url: details.url,
        statusCode: details.statusCode,
        tabId: details.tabId
      });
    }
  },
  {
    urls: ['https://*/*', 'http://*/*']
  }
);

// Listen for tab updates to know when users navigate to attributed pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('utm_source=chatgpt.com')) {
    console.log('🔗 ChatGPT attributed page loaded:', {
      tabId: tabId,
      url: tab.url,
      title: tab.title
    });
  }
});

// Listen for when tabs are activated (user switches to them)
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url?.includes('chatgpt.com')) {
      console.log('👁️ User switched to ChatGPT tab:', {
        tabId: activeInfo.tabId,
        url: tab.url
      });
    }
  });
});

// Test function to verify the extension is working
function testExtension() {
  console.log('🧪 Running extension test...');
  console.log('🧪 Chrome APIs available:', {
    runtime: !!chrome.runtime,
    storage: !!chrome.storage,
    tabs: !!chrome.tabs,
    webRequest: !!chrome.webRequest
  });
}

// Run test on startup
testExtension();

// Store user data for content script access
chrome.storage.local.set({ user: backgroundTestUser }, () => {
  console.log('💾 User data stored in extension storage');
});

console.log('🚀 Background script setup complete'); 