/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!***************************!*\
  !*** ./src/background.ts ***!
  \***************************/

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
        // In a real implementation, this would:
        // 1. Send data to our API
        // 2. Track the attribution in our database
        // 3. Prepare for future payout calculations
        console.log('💰 Attribution data that would be sent to API:', {
            user: message.data.user,
            wallet: message.data.wallet,
            source: message.data.source,
            destination: message.data.destination,
            referralId: message.data.referralId,
            timestamp: message.data.timestamp,
            originalUrl: message.data.originalUrl,
            modifiedUrl: message.data.modifiedUrl
        });
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
    return true; // Keep message channel open for async response
});
// Function to generate referral parameter
function generateReferralParam(userId) {
    // In a real implementation, this would be more sophisticated
    return `ref=${userId}_${Date.now()}`;
}
// Debug: Log all web requests to see what we're intercepting
chrome.webRequest.onBeforeRequest.addListener((details) => {
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
}, {
    urls: ['https://*/*', 'http://*/*'],
    types: ['main_frame', 'sub_frame']
});
// Also intercept before sending headers to see more details
chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
    if (details.url.includes('utm_source=chatgpt.com') ||
        details.url.includes('visioncenter.org')) {
        console.log('📤 Headers for request:', {
            url: details.url,
            headers: details.requestHeaders,
            tabId: details.tabId
        });
    }
    return {};
}, {
    urls: ['https://*/*', 'http://*/*']
}, ['requestHeaders']);
// Listen for completed requests to see the final URLs
chrome.webRequest.onCompleted.addListener((details) => {
    if (details.url.includes('utm_source=chatgpt.com') ||
        details.url.includes('visioncenter.org') ||
        details.url.includes('ref=')) {
        console.log('✅ Request completed:', {
            url: details.url,
            statusCode: details.statusCode,
            tabId: details.tabId
        });
    }
}, {
    urls: ['https://*/*', 'http://*/*']
});
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

/******/ })()
;
//# sourceMappingURL=background.js.map