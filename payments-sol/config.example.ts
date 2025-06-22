// Solana Configuration Template
// Copy this to config.ts and fill in your details

export const CONFIG = {
  // Your Solana wallet private key (base58 encoded)
  PRIVATE_KEY: 'your_base58_private_key_here',
  
  // Your wallet public key
  WALLET_ADDRESS: 'your_wallet_address_here',
  
  // Solana RPC URLs
  DEVNET_RPC: 'https://api.devnet.solana.com',
  MAINNET_RPC: 'https://api.mainnet-beta.solana.com',
  
  // PYUSD Token Contract Addresses
  PYUSD_DEVNET: 'CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM',
  PYUSD_MAINNET: '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo',
  
  // Transfer amounts (in PYUSD, will be converted to lamports)
  MICROPAYMENT_AMOUNT: 0.1, // 0.1 PYUSD
  
  // Network to use (devnet or mainnet)
  NETWORK: 'devnet' as 'devnet' | 'mainnet'
}; 