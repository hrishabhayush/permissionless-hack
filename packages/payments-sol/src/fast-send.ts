import { 
  Connection, 
  PublicKey, 
  Transaction,
  Keypair,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import bs58 from 'bs58';
import { CONFIG } from './config';

// Token-2022 Program ID
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

async function fastSend() {
  console.log('⚡ FAST PYUSD Send (Fire & Forget)');
  console.log('================================');
  
  // Try multiple RPC endpoints for better reliability
  const rpcEndpoints = CONFIG.DEVNET_RPC;
  
  for (const rpcUrl of rpcEndpoints) {
    try {
      console.log(`\n🌐 Trying RPC: ${rpcUrl.substring(0, 30)}...`);
      
      const connection = new Connection(rpcUrl, 'processed');
      const privateKeyBytes = bs58.decode(CONFIG.PRIVATE_KEY);
      const payer = Keypair.fromSecretKey(privateKeyBytes);
      const pyusdMint = new PublicKey(CONFIG.PYUSD_DEVNET);
      
      // Quick balance check
      const balance = await connection.getBalance(payer.publicKey);
      console.log(`💰 SOL: ${balance / 1e9}`);
      
      // Get token accounts
      const senderTokenAccount = await getAssociatedTokenAddress(
        pyusdMint,
        payer.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      
      const recipientTokenAccount = await getAssociatedTokenAddress(
        pyusdMint,
        payer.publicKey, // Send to self
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      
      // Create transaction
      const transaction = new Transaction();
      const amount = 0.01; // 1 cent
      const amountInSmallestUnit = Math.floor(amount * 1e6);
      
      transaction.add(
        createTransferCheckedInstruction(
          senderTokenAccount,
          pyusdMint,
          recipientTokenAccount,
          payer.publicKey,
          amountInSmallestUnit,
          6, // PYUSD decimals
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );
      
      // Get blockhash quickly
      const { blockhash } = await connection.getLatestBlockhash('processed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = payer.publicKey;
      
      console.log('🚀 Sending transaction (no confirmation wait)...');
      
      // Sign the transaction
      transaction.sign(payer);
      
      // Send transaction without waiting for confirmation
      const signature = await connection.sendRawTransaction(
        transaction.serialize(),
        {
          skipPreflight: true,
          maxRetries: 0
        }
      );
      
      console.log('✅ Transaction submitted successfully!');
      console.log(`🔗 Signature: ${signature}`);
      console.log(`🌐 Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      console.log('\n💡 Transaction sent! Check the explorer in 10-30 seconds.');
      console.log('   This method doesn\'t wait for confirmation to avoid timeouts.');
      
      return signature;
      
    } catch (error) {
      console.log(`❌ RPC failed: ${(error as any)?.message || error}`);
      continue;
    }
  }
  
  console.log('\n❌ All RPCs failed. Devnet might be having issues.');
}

fastSend().catch(console.error); 