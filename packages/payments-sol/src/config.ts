// Solana Configuration
// This file contains the actual configuration for the payment system

export const CONFIG = {
  // Your Solana wallet private key (base58 encoded)
  // For testing, you can use a devnet wallet or set via environment variables
  PRIVATE_KEY: process.env.SOLANA_PRIVATE_KEY || 'your_base58_private_key_here',
  
  // Your wallet public key
  WALLET_ADDRESS: process.env.SOLANA_WALLET_ADDRESS || 'your_wallet_address_here',
  
  // Solana RPC URLs
  DEVNET_RPC: 'https://api.devnet.solana.com',
  MAINNET_RPC: 'https://api.mainnet-beta.solana.com',
  
  // PYUSD Token Contract Addresses
  PYUSD_DEVNET: 'CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM',
  PYUSD_MAINNET: '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo',
  
  // Transfer amounts (in PYUSD, will be converted to lamports)
  MICROPAYMENT_AMOUNT: 0.01, // 0.01 PYUSD (smaller amount for testing)
  
  // Network to use (devnet or mainnet)
  NETWORK: (process.env.SOLANA_NETWORK as 'devnet' | 'mainnet') || 'devnet'
}; 