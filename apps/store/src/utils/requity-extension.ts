// Simple utility for reading wallet from session storage and getting source addresses

// Website mapping data - synchronized with apps/referrals/website-mapping.json
const WEBSITE_MAPPING = {
  "websites": [
    {
      "id": "WEB1",
      "wallets": {
        "sol": "3QzXMwX4b6hwuNMKLjyZJtK4W5JqxoojgSKDX9Gqot3Y",
        "eth": "0x1F7E4F2B7A5B6F5A3C3b4A6F2B8D9A5C8E7F6D4A" // ReviewMaster (shoes)
      },
      "items": ["shoes"],
      "url": "https://website1.orbiter.website/"
    },
    {
      "id": "WEB2", 
      "wallets": {
        "sol": "FEyBMJ3ofTzdUkfofYgYE5ANTNgqr8NsJbJhMZBBw7R4",
        "eth": "0x4E7F63d9152642aF163776638115609441292025" // TechReviewer (bags)
      },
      "items": ["bags", "handbags"],
      "url": "https://website2.orbiter.website/"
    },
    {
      "id": "WEB3",
      "wallets": {
        "sol": "Bv8eMNvt81tLXtqgN3awRtjez2skW338C2fk9np8JmCJ",
        "eth": "0x9C2B8fe536248b9f8f307675271B4a682A7a4D1A" // GadgetGuru (glasses)
      },
      "items": ["glasses", "eyewear"],
      "url": "https://website3.orbiter.website/"
    },
    {
      "id": "WEB4",
      "wallets": {
        "sol": "4Tqqk9BGFhEXZEETHDbM2TSqaQqED3yXH9rwwHTv4Sus",
        "eth": "" // No single ETH wallet for this combo
      },
      "items": ["shoes", "bags", "handbags"],
      "url": "https://website4.orbiter.website/"
    },
    {
      "id": "WEB5",
      "wallets": {
        "sol": "PM6h2Wf7hMTtxDkrwcNk3QPTFDF89xsnQRCKyN9Dg1F",
        "eth": "" // No single ETH wallet for this combo
      },
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
export const getSourceAddresses = (category: 'shoes' | 'bags' | 'glasses'): { sol: string[], eth: string[] } => {
  const categoryMap: Record<string, string[]> = {
    'shoes': ['shoes'],
    'bags': ['bags', 'handbags'], 
    'glasses': ['glasses', 'eyewear']
  };

  const searchTerms = categoryMap[category] || [];
  
  const relevantWebsites = WEBSITE_MAPPING.websites.filter(website => 
    website.items.some(item => 
      searchTerms.some(term => item.toLowerCase().includes(term.toLowerCase()))
    )
  );

  console.log("relevantWebsites", relevantWebsites);

  const solAddresses = relevantWebsites.map(website => website.wallets.sol).filter(Boolean);
  const ethAddresses = relevantWebsites.map(website => website.wallets.eth).filter(Boolean);

  console.log("solAddresses", solAddresses);
  return { sol: solAddresses, eth: ethAddresses };
};

/**
 * Create payment payload for the API
 */
export const createPaymentPayload = (category: 'shoes' | 'bags' | 'glasses') => {
  const userWallet = getUserWallet(); // This is a Solana wallet for demo
  const { sol, eth } = getSourceAddresses(category);
  
  const payload: {
    solRequityId?: string;
    solSourcesAddresses?: string[];
    ethRequityId?: string;
    ethSourcesAddresses?: string[];
  } = {};

  if (userWallet && sol.length > 0) {
    payload.solRequityId = userWallet;
    payload.solSourcesAddresses = sol;
  }

  if (eth.length > 0) {
    // Using a hardcoded demo ETH user wallet for now
    payload.ethRequityId = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'; 
    payload.ethSourcesAddresses = eth;
  }

  // Demo logging for hackathon
  console.log(`💳 Payment payload for ${category}:`, payload);
  console.log(`👤 User SOL wallet: ${payload.solRequityId || 'Not connected'}`);
  console.log(`👤 User ETH wallet: ${payload.ethRequityId || 'Not provided'}`);
  console.log(`🏪 Source SOL addresses (${category}):`, payload.solSourcesAddresses || []);
  console.log(`🏪 Source ETH addresses (${category}):`, payload.ethSourcesAddresses || []);

  return payload;
}; 