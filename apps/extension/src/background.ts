console.log("Referral extension background script loaded.");

const testUser = {
  username: "testuser",
  walletAddress: "0x1234567890123456789012345678901234567890",
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ user: testUser }, () => {
    console.log("Test user data saved to local storage.");
  });
}); 