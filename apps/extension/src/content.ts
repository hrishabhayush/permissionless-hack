console.log('🔧 Referral Extension Content Script Loaded');
console.log('🔧 Current URL:', window.location.href);
console.log('🔧 Domain:', window.location.hostname);

// Test user data
const contentTestUser = {
  username: 'testuser',
  walletAddress: '0x742d35Cc6635C0532925a3b8D2c2C5c5b2b4b3b3'
};

console.log('🔧 Test user loaded:', contentTestUser);

// Source patterns for categorization
const sourcePatterns = {
  news: /\b(cnn\.com|bbc\.com|reuters\.com|ap\.org|npr\.org|washingtonpost\.com|nytimes\.com|wsj\.com)\b/i,
  fashion: /\b(vogue\.com|elle\.com|harpersbazaar\.com|gq\.com|fashionista\.com|wwd\.com)\b/i,
  sneaker: /\b(sneakernews\.com|hypebeast\.com|nicekicks\.com|solecollector\.com|kicksonfire\.com)\b/i,
  social: /\b(reddit\.com|twitter\.com|instagram\.com|tiktok\.com|youtube\.com|facebook\.com)\b/i,
  vision: /\b(visioncenter\.org|allaboutvision\.com|aao\.org|reviewofoptometry\.com)\b/i
};

function categorizeSource(domain: string): string {
  for (const [category, pattern] of Object.entries(sourcePatterns)) {
    if (pattern.test(domain)) {
      return category;
    }
  }
  return 'other';
}

function extractSources(text: string): string[] {
  console.log('🔧 Extracting sources from text:', text.substring(0, 200) + '...');
  
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
      console.log('🔧 Pattern matches found:', matches);
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
  
  const sourceArray = Array.from(sources);
  console.log('🔧 Extracted sources:', sourceArray);
  return sourceArray;
}

function checkForLinks() {
  console.log('🔧 Checking for links in the page...');
  
  // Check all links on the page
  const allLinks = document.querySelectorAll('a[href]');
  console.log('🔧 Total links found:', allLinks.length);
  
  let chatgptLinks = 0;
  let utmLinks = 0;
  
  allLinks.forEach((link, index) => {
    const href = (link as HTMLAnchorElement).href;
    
    if (href.includes('chatgpt.com')) {
      chatgptLinks++;
      console.log('🔧 ChatGPT link found:', href);
    }
    
    if (href.includes('utm_source=chatgpt.com')) {
      utmLinks++;
      console.log('🚨 UTM ChatGPT link found:', href);
      console.log('🚨 Link element:', link);
      console.log('🚨 Link text:', link.textContent);
      console.log('🚨 Link parent:', link.parentElement);
    }
    
    // Log first few external links for debugging
    if (index < 5 && href.startsWith('http') && !href.includes('chatgpt.com')) {
      console.log(`🔧 External link ${index + 1}:`, href);
    }
  });
  
  console.log('🔧 ChatGPT links:', chatgptLinks);
  console.log('🔧 UTM ChatGPT links:', utmLinks);
  
  return { totalLinks: allLinks.length, chatgptLinks, utmLinks };
}

function processMessage(messageElement: Element) {
  console.log('🔧 Processing message element:', messageElement);
  
  const messageText = messageElement.textContent || '';
  console.log('🔧 Message text length:', messageText.length);
  
  if (messageText.length > 0) {
    const sources = extractSources(messageText);
    
    if (sources.length > 0) {
      console.log('🎯 Sources found in message:', sources);
      
      // Categorize sources
      const categorizedSources = sources.map(source => ({
        domain: source,
        category: categorizeSource(source)
      }));
      
      console.log('📊 Categorized sources:', categorizedSources);
      
      // Check for links in this specific message
      const messageLinks = messageElement.querySelectorAll('a[href]');
      console.log('🔧 Links in this message:', messageLinks.length);
      
      messageLinks.forEach(link => {
        const href = (link as HTMLAnchorElement).href;
        console.log('🔧 Message link:', href);
        
        if (href.includes('utm_source=chatgpt.com')) {
          console.log('🚨 FOUND UTM LINK IN MESSAGE:', href);
        }
      });
    }
  }
  
  // Always check for links regardless of text content
  checkForLinks();
}

// Main observer function
function observeMessages() {
  console.log('🔧 Setting up message observer...');
  
  // Initial check
  checkForLinks();
  
  const observer = new MutationObserver((mutations) => {
    console.log('🔧 DOM mutation detected, mutations count:', mutations.length);
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if this is a message or contains messages
            const messages = element.querySelectorAll('[data-message-author-role="assistant"]');
            console.log('🔧 New assistant messages found:', messages.length);
            
            messages.forEach(processMessage);
            
            // Also check if the added node itself is a message
            if (element.matches('[data-message-author-role="assistant"]')) {
              console.log('🔧 Added node is an assistant message');
              processMessage(element);
            }
            
            // Check for any new links
            const newLinks = element.querySelectorAll('a[href]');
            if (newLinks.length > 0) {
              console.log('🔧 New links added:', newLinks.length);
              newLinks.forEach(link => {
                const href = (link as HTMLAnchorElement).href;
                if (href.includes('utm_source=chatgpt.com')) {
                  console.log('🚨 NEW UTM LINK DETECTED:', href);
                }
              });
            }
          }
        });
      }
    });
    
    // Always do a full check after mutations
    setTimeout(checkForLinks, 100);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('🔧 Observer set up successfully');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeMessages);
} else {
  observeMessages();
}

// Also run checks periodically
setInterval(() => {
  console.log('🔧 Periodic link check...');
  checkForLinks();
}, 5000);

// Check if this page was reached via ChatGPT (has utm_source=chatgpt.com)
function checkForChatGPTReferral() {
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');
  
  console.log('🔧 Checking URL parameters:', {
    fullURL: window.location.href,
    search: window.location.search,
    utmSource: utmSource,
    allParams: Object.fromEntries(urlParams.entries())
  });
  
  if (utmSource === 'chatgpt.com') {
    console.log('🎯 CHATGPT REFERRAL DETECTED!');
    console.log('🎯 This page was reached from ChatGPT');
    
    // Check if we already have our referral parameter
    const existingRef = urlParams.get('ref');
    
    if (!existingRef) {
      console.log('🔧 Adding referral parameter...');
      
      // Add our referral parameter
      const newRef = `${contentTestUser.username}_${Date.now()}`;
      urlParams.set('ref', newRef);
      
      // Create the new URL
      const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
      
      console.log('🔄 URL modification:', {
        original: window.location.href,
        modified: newUrl,
        referralParam: newRef
      });
      
      // Update the URL without reloading the page
      window.history.replaceState({}, '', newUrl);
      
      console.log('✅ URL updated successfully!');
      console.log('✅ New URL:', window.location.href);
      
      // Log attribution data
      console.log('📊 Attribution Data:', {
        user: contentTestUser.username,
        wallet: contentTestUser.walletAddress,
        source: 'chatgpt.com',
        destination: window.location.hostname,
        timestamp: new Date().toISOString(),
        referralId: newRef
      });
      
      // Send attribution data to background script (for future API calls)
      chrome.runtime.sendMessage({
        type: 'ATTRIBUTION_DETECTED',
        data: {
          user: contentTestUser.username,
          wallet: contentTestUser.walletAddress,
          source: 'chatgpt.com',
          destination: window.location.hostname,
          originalUrl: window.location.href.replace(`&ref=${newRef}`, '').replace(`?ref=${newRef}`, ''),
          modifiedUrl: window.location.href,
          referralId: newRef,
          timestamp: new Date().toISOString()
        }
      }).catch(err => console.log('🔧 Background script message failed:', err));
      
    } else {
      console.log('🔧 Referral parameter already exists:', existingRef);
    }
    
    return true;
  } else {
    console.log('🔧 No ChatGPT referral detected');
    if (utmSource) {
      console.log('🔧 Other UTM source found:', utmSource);
    }
    return false;
  }
}

// Function to monitor for dynamic URL changes (for SPAs)
function setupURLMonitoring() {
  let lastUrl = window.location.href;
  
  const checkURLChange = () => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      console.log('🔧 URL changed:', { from: lastUrl, to: currentUrl });
      lastUrl = currentUrl;
      
      // Re-check for ChatGPT referral on URL change
      setTimeout(checkForChatGPTReferral, 100);
    }
  };
  
  // Monitor for URL changes in SPAs
  const observer = new MutationObserver(checkURLChange);
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Also listen for popstate events
  window.addEventListener('popstate', checkURLChange);
  
  console.log('🔧 URL monitoring setup complete');
}

// Function to check if we're on a relevant page (not internal browser pages)
function isRelevantPage(): boolean {
  const url = window.location.href;
  const hostname = window.location.hostname;
  
  // Skip internal browser pages, extensions, and localhost during development
  const skipPatterns = [
    'chrome://',
    'chrome-extension://',
    'moz-extension://',
    'about:',
    'file://',
    'localhost',
    '127.0.0.1'
  ];
  
  const shouldSkip = skipPatterns.some(pattern => url.startsWith(pattern) || hostname.includes('localhost'));
  
  if (shouldSkip) {
    console.log('🔧 Skipping internal/development page');
    return false;
  }
  
  return true;
}

// Main initialization function
function initialize() {
  console.log('🔧 Initializing referral extension...');
  
  if (!isRelevantPage()) {
    return;
  }
  
  console.log('🔧 Running on relevant page:', window.location.hostname);
  
  // Check for ChatGPT referral immediately
  const hasChatGPTReferral = checkForChatGPTReferral();
  
  if (hasChatGPTReferral) {
    console.log('🎯 ChatGPT referral page detected!');
  } else {
    console.log('🔧 Regular page - no ChatGPT referral detected');
  }
}

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Also run on window load to catch any late-loading content
window.addEventListener('load', () => {
  console.log('🔧 Window loaded, re-checking for referrals...');
  setTimeout(checkForChatGPTReferral, 500);
});

console.log('🔧 Content script setup complete'); 