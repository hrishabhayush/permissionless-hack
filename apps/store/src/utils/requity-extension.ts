// Simple utility for reading wallet from session storage and getting source addresses

// Website mapping data
const WEBSITE_MAPPING = {
  "websites": [
    {
      "id": "WEB1",
      "wallet": "3QzXMwX4b6hwuNMKLjyZJtK4W5JqxoojgSKDX9Gqot3Y",
      "items": ["shoes"],
      "url": "https://website1.orbiter.website/"
    },
    {
      "id": "WEB2", 
      "wallet": "FEyBMJ3ofTzdUkfofYgYE5ANTNgqr8NsJbJhMZBBw7R4",
      "items": ["bags", "handbags"],
      "url": "https://website2.orbiter.website/"
    },
    {
      "id": "WEB3",
      "wallet": "Bv8eMNvt81tLXtqgN3awRtjez2skW338C2fk9np8JmCJ", 
      "items": ["glasses", "eyewear"],
      "url": "https://website3.orbiter.website/"
    },
    {
      "id": "WEB4",
      "wallet": "4Tqqk9BGFhEXZEETHDbM2TSqaQqED3yXH9rwwHTv4Sus",
      "items": ["shoes", "bags", "handbags"],
      "url": "https://website4.orbiter.website/"
    },
    {
      "id": "WEB5",
      "wallet": "PM6h2Wf7hMTtxDkrwcNk3QPTFDF89xsnQRCKyN9Dg1F",
      "items": ["shoes", "glasses", "eyewear"],
      "url": "https://website5.orbiter.website/"
    }
  ]
};

/**
 * Get user wallet from session storage (prioritizes Solana, falls back to Ethereum)
 */
export const getUserWallet = (): string => {
  try {
    const solanaWallet = sessionStorage.getItem('requity_solana_wallet') || '';
    const ethereumWallet = sessionStorage.getItem('requity_ethereum_wallet') || '';
    return solanaWallet || ethereumWallet || '';
  } catch (error) {
    console.log('Could not retrieve wallet from session storage:', error);
    return '';
  }
};

/**
 * Get source addresses for a specific product category
 */
export const getSourceAddresses = (category: 'shoes' | 'bags' | 'glasses'): string[] => {
  const categoryMap: Record<string, string[]> = {
    'shoes': ['shoes'],
    'bags': ['bags', 'handbags'], 
    'glasses': ['glasses', 'eyewear']
  };

  const searchTerms = categoryMap[category] || [];
  
  return WEBSITE_MAPPING.websites
    .filter(website => 
      website.items.some(item => 
        searchTerms.some(term => item.toLowerCase().includes(term.toLowerCase()))
      )
    )
    .map(website => website.wallet);
};

/**
 * Create payment payload for the API
 */
export const createPaymentPayload = (category: 'shoes' | 'bags' | 'glasses') => {
  const userWallet = getUserWallet();
  const sourceAddresses = getSourceAddresses(category);
  
  const payload = {
    requityId: userWallet || '12345', // fallback to demo ID if no wallet
    sourcesAddresses: sourceAddresses
  };

  // Demo logging for hackathon
  console.log(`💳 Payment payload for ${category}:`, payload);
  console.log(`👤 User wallet: ${userWallet || 'Not connected'}`);
  console.log(`🏪 Source addresses (${category}):`, sourceAddresses);

  return payload;
}; 