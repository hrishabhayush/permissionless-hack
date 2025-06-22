#!/usr/bin/env ts-node

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, AccountLayout, getMint } from '@solana/spl-token';
import { CONFIG } from './config';

class WalletInspector {
  private connection: Connection;
  private wallet: PublicKey;

  constructor() {
    const rpcUrl = CONFIG.NETWORK === 'devnet' ? CONFIG.DEVNET_RPC : CONFIG.MAINNET_RPC;
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.wallet = new PublicKey(CONFIG.WALLET_ADDRESS);
    
    console.log(`🔍 Wallet Inspector - Solana ${CONFIG.NETWORK.toUpperCase()}`);
    console.log(`💰 Wallet: ${this.wallet.toString()}`);
    console.log(`🔗 RPC: ${rpcUrl}`);
  }

  /**
   * Get SOL balance
   */
  async getSOLBalance() {
    try {
      const balance = await this.connection.getBalance(this.wallet);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting SOL balance:', error);
      return 0;
    }
  }

  /**
   * Get all token accounts owned by the wallet
   */
  async getAllTokenAccounts() {
    try {
      console.log('\n🔍 Scanning for token accounts...');
      
      const tokenAccounts = await this.connection.getTokenAccountsByOwner(
        this.wallet,
        { programId: TOKEN_PROGRAM_ID }
      );

      console.log(`📊 Found ${tokenAccounts.value.length} token account(s)`);
      
      const tokens = [];
      
      for (let i = 0; i < tokenAccounts.value.length; i++) {
        const accountInfo = tokenAccounts.value[i];
        try {
          // Decode token account data
          const accountData = AccountLayout.decode(accountInfo.account.data);
          const mintAddress = accountData.mint;
          const balance = accountData.amount;
          
          // Get mint info to determine decimals
          const mintInfo = await getMint(this.connection, mintAddress);
          const decimals = mintInfo.decimals;
          const supply = mintInfo.supply;
          
          // Calculate human-readable balance
          const humanBalance = Number(balance) / Math.pow(10, decimals);
          
          // Try to identify known tokens
          const tokenInfo = this.identifyToken(mintAddress.toString());
          
          tokens.push({
            mint: mintAddress.toString(),
            balance: humanBalance,
            rawBalance: balance.toString(),
            decimals,
            supply: supply.toString(),
            tokenAccount: accountInfo.pubkey.toString(),
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            isKnown: tokenInfo.isKnown
          });
          
        } catch (error) {
          console.error(`Error processing token account ${i}:`, error);
        }
      }
      
      return tokens;
    } catch (error) {
      console.error('Error getting token accounts:', error);
      return [];
    }
  }

  /**
   * Identify known tokens
   */
  identifyToken(mintAddress: string) {
         const knownTokens: { [key: string]: { name: string; symbol: string } } = {
       // PYUSD addresses
       [CONFIG.PYUSD_DEVNET]: { name: 'PayPal USD (Testnet)', symbol: 'PYUSD' },
       [CONFIG.PYUSD_MAINNET]: { name: 'PayPal USD', symbol: 'PYUSD' },
       // Your received token
       '2KNJ2ptqMrdpo313J8v2v7jdzRJzk7meywMdcMSn1Dmd': { name: 'Faucet Test Token', symbol: 'FAUCET' },
       // Other common tokens (add as needed)
       'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { name: 'USD Coin', symbol: 'USDC' },
       'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { name: 'Tether USD', symbol: 'USDT' },
       'So11111111111111111111111111111111111111112': { name: 'Wrapped SOL', symbol: 'wSOL' },
     };

    if (knownTokens[mintAddress]) {
      return { ...knownTokens[mintAddress], isKnown: true };
    }
    
    return { 
      name: 'Unknown Token', 
      symbol: `${mintAddress.substring(0, 8)}...`,
      isKnown: false 
    };
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 5) {
    try {
      console.log(`\n📋 Getting last ${limit} transactions...`);
      
      const signatures = await this.connection.getSignaturesForAddress(
        this.wallet,
        { limit }
      );
      
      return signatures.map(sig => ({
        signature: sig.signature,
        slot: sig.slot,
        blockTime: sig.blockTime ? new Date(sig.blockTime * 1000).toISOString() : 'Unknown',
        status: sig.err ? 'Failed' : 'Success'
      }));
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      return [];
    }
  }

  /**
   * Generate wallet report
   */
  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🏦 COMPREHENSIVE WALLET REPORT');
    console.log('='.repeat(60));
    
    // SOL Balance
    console.log('\n💰 SOL BALANCE:');
    const solBalance = await this.getSOLBalance();
    console.log(`   ${solBalance.toFixed(6)} SOL`);
    const solUSD = solBalance * 100; // Rough $100/SOL estimate
    console.log(`   ~$${solUSD.toFixed(2)} USD (estimated)`);
    
    // Token Assets
    console.log('\n🪙 TOKEN ASSETS:');
    const tokens = await this.getAllTokenAccounts();
    
    if (tokens.length === 0) {
      console.log('   No token accounts found');
    } else {
      for (const token of tokens) {
        console.log(`\n   ${token.isKnown ? '✅' : '❓'} ${token.name} (${token.symbol})`);
        console.log(`      Balance: ${token.balance.toFixed(6)} ${token.symbol}`);
        console.log(`      Mint: ${token.mint}`);
        console.log(`      Decimals: ${token.decimals}`);
        if (CONFIG.NETWORK === 'devnet') {
          console.log(`      Explorer: https://explorer.solana.com/address/${token.mint}?cluster=devnet`);
        } else {
          console.log(`      Explorer: https://explorer.solana.com/address/${token.mint}`);
        }
      }
    }
    
    // Recent Transactions
    console.log('\n📋 RECENT TRANSACTIONS:');
    const transactions = await this.getRecentTransactions(5);
    
    if (transactions.length === 0) {
      console.log('   No recent transactions found');
    } else {
      for (const tx of transactions) {
        console.log(`\n   ${tx.status === 'Success' ? '✅' : '❌'} ${tx.signature.substring(0, 12)}...`);
        console.log(`      Time: ${tx.blockTime}`);
        console.log(`      Status: ${tx.status}`);
        const explorerUrl = CONFIG.NETWORK === 'devnet' 
          ? `https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`
          : `https://explorer.solana.com/tx/${tx.signature}`;
        console.log(`      Explorer: ${explorerUrl}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 WALLET SUMMARY:');
    console.log(`   SOL: ${solBalance.toFixed(6)} SOL`);
    console.log(`   Tokens: ${tokens.length} different token(s)`);
    console.log(`   Recent TXs: ${transactions.length} transaction(s)`);
    console.log('='.repeat(60));
    
    return {
      sol: solBalance,
      tokens,
      transactions
    };
  }
}

// Main execution
async function main() {
  const inspector = new WalletInspector();
  await inspector.generateReport();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { WalletInspector }; 