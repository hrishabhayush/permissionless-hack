import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export type NetworkType = 'devnet' | 'mainnet';

// Helper function to get environment variable with optional fallback
function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${name} is required. Please copy env.template to .env and fill in your values.`);
  }
  return value;
}

export const CONFIG = {
  // Wallet configuration - REQUIRED from environment variables
  PRIVATE_KEY: getEnvVar('PRIVATE_KEY'),
  WALLET_ADDRESS: getEnvVar('WALLET_ADDRESS'),
  
  // RPC endpoints
  DEVNET_RPC: getEnvVar('DEVNET_RPC', 'https://api.devnet.solana.com'),
  MAINNET_RPC: getEnvVar('MAINNET_RPC', 'https://api.mainnet-beta.solana.com'),
  
  // PYUSD token addresses
  PYUSD_DEVNET: getEnvVar('PYUSD_DEVNET', 'CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM'),
  PYUSD_MAINNET: getEnvVar('PYUSD_MAINNET', '6c3ea9036406852006290770BEdFcAbA0e23A0e8'),
  
  // Transaction settings
  MICROPAYMENT_AMOUNT: parseFloat(getEnvVar('MICROPAYMENT_AMOUNT', '0.1')),
  NETWORK: getEnvVar('NETWORK', 'devnet') as NetworkType,
};