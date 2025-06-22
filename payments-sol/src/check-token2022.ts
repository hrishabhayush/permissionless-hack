import { Connection, PublicKey } from '@solana/web3.js';
import { CONFIG } from './config';

// Token-2022 Program ID
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

async function checkToken2022() {
  const rpcUrl = CONFIG.NETWORK === 'devnet' ? CONFIG.DEVNET_RPC : CONFIG.MAINNET_RPC;
  const connection = new Connection(rpcUrl, 'confirmed');
  const walletPublicKey = new PublicKey(CONFIG.WALLET_ADDRESS);
  
  console.log('🔍 Checking Token-2022 accounts...');
  console.log('💰 Wallet:', CONFIG.WALLET_ADDRESS);
  console.log('🔧 Program: Token-2022 (TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb)');
  
  try {
    // Check Token-2022 accounts
    const token2022Accounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
      programId: TOKEN_2022_PROGRAM_ID,
    });
    
    console.log(`📊 Found ${token2022Accounts.value.length} Token-2022 account(s)`);
    
    if (token2022Accounts.value.length > 0) {
      console.log('\n🎉 Found Token-2022 accounts!');
      
      for (const account of token2022Accounts.value) {
        const accountData = account.account.data.parsed.info;
        const mint = accountData.mint;
        const balance = accountData.tokenAmount.uiAmount;
        const decimals = accountData.tokenAmount.decimals;
        
        console.log(`   🪙 Mint: ${mint}`);
        console.log(`   💰 Balance: ${balance} tokens`);
        console.log(`   🔢 Decimals: ${decimals}`);
        console.log(`   🏦 Account: ${account.pubkey.toString()}`);
        
        // Check if this is our expected token
        if (mint === '2KNJ2ptqMrdpo313J8v2v7jdzRJzk7meywMdcMSn1Dmd') {
          console.log('   ✅ This is your faucet token!');
        }
        
        console.log('   ---');
      }
    } else {
      console.log('❌ No Token-2022 accounts found');
    }
    
    // Also get account info for the specific mint
    console.log('\n🔍 Getting mint info for your token...');
    const receivedTokenMint = new PublicKey('2KNJ2ptqMrdpo313J8v2v7jdzRJzk7meywMdcMSn1Dmd');
    
    try {
      const mintInfo = await connection.getParsedAccountInfo(receivedTokenMint);
      if (mintInfo.value?.data && 'parsed' in mintInfo.value.data) {
        const mintData = mintInfo.value.data.parsed.info;
        console.log('✅ Mint found:');
        console.log(`   💰 Supply: ${mintData.supply}`);
        console.log(`   🔢 Decimals: ${mintData.decimals}`);
        console.log(`   👑 Authority: ${mintData.mintAuthority}`);
        console.log(`   🔒 Freeze Authority: ${mintData.freezeAuthority || 'None'}`);
        
        // Check which program owns this mint
        const ownerProgram = mintInfo.value.owner.toString();
        console.log(`   🔧 Program: ${ownerProgram}`);
        
        if (ownerProgram === TOKEN_2022_PROGRAM_ID.toString()) {
          console.log('   ✅ This is a Token-2022 mint!');
        } else if (ownerProgram === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
          console.log('   ℹ️ This is a legacy SPL Token mint');
        } else {
          console.log(`   ❓ Unknown program: ${ownerProgram}`);
        }
      }
    } catch (error) {
      console.log('❌ Could not get mint info:', (error as any)?.message || error);
    }
    
  } catch (error) {
    console.error('❌ Error checking Token-2022:', (error as any)?.message || error);
  }
}

checkToken2022().catch(console.error); 