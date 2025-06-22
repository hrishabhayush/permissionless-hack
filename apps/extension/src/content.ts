console.log("Referral extension content script loaded.");

chrome.storage.local.get("user", (data) => {
  if (data.user) {
    console.log("User is 'logged in':", data.user);
  } else {
    console.log("No user data found in storage.");
  }
});

function logChatGptContent() {
  // TODO: Implement the logic to find and log ChatGPT responses.
  // This will likely involve using a MutationObserver to watch for new messages
  // and then selecting the correct elements from the DOM.
  console.log("Scanning for ChatGPT content...");
  
  // Example of what a selector might look like (this will need to be refined)
  const messageElements = document.querySelectorAll('div[data-message-author-role="assistant"]');
  messageElements.forEach((el, index) => {
    // The actual text content might be in a child element.
    const messageText = (el as HTMLElement).innerText;
    console.log(`Found message ${index + 1}:`, messageText);
  });
}

// Run the function once on load
logChatGptContent();

// And set up a MutationObserver to run it whenever the page changes.
const observer = new MutationObserver((mutations) => {
    // A simple approach is to re-run the scan on any change.
    // A more optimized approach would be to check the mutations for added nodes
    // that match the message selector.
    logChatGptContent();
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
}); 