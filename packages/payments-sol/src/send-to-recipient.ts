import {
  Connection,
  PublicKey,
  Transaction,
  Keypair,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import bs58 from 'bs58';
import { CONFIG } from './config';

// Token-2022 Program ID
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

async function sendToRecipient() {
  console.log('💸 Sending 1 PYUSD to Recipient');
  console.log('===============================');

  const recipientAddress = 'TRmpNVZEhNr5DawcGF4HfY8bppTazRwVj6zzL3ZZjNG';
  const amount = 0.01; // 1 PYUSD

  console.log(`📬 Recipient: ${recipientAddress}`);
  console.log(`💰 Amount: ${amount} PYUSD`);

  // Try multiple RPC endpoints
  const rpcEndpoints = CONFIG.DEVNET_RPC;

  for (const rpcUrl of rpcEndpoints) {
    try {
      console.log(`\n🌐 Using RPC: ${rpcUrl.substring(0, 30)}...`);

      const connection = new Connection(rpcUrl, 'processed');
      const privateKeyBytes = bs58.decode(CONFIG.PRIVATE_KEY);
      const payer = Keypair.fromSecretKey(privateKeyBytes);
      const pyusdMint = new PublicKey(CONFIG.PYUSD_DEVNET);
      const recipient = new PublicKey(recipientAddress);

      // Check sender balance
      const balance = await connection.getBalance(payer.publicKey);
      console.log(`💎 Your SOL: ${balance / 1e9}`);

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
        recipient,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      console.log(`🏦 Your Token Account: ${senderTokenAccount.toString()}`);
      console.log(`🏦 Recipient Token Account: ${recipientTokenAccount.toString()}`);

      // Create transaction
      const transaction = new Transaction();

      // Check if recipient token account exists
      try {
        await getAccount(connection, recipientTokenAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
        console.log('✅ Recipient token account exists');
      } catch (error) {
        console.log('📝 Creating recipient token account...');
        // Add instruction to create recipient token account
        transaction.add(
          createAssociatedTokenAccountInstruction(
            payer.publicKey,
            recipientTokenAccount,
            recipient,
            pyusdMint,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      // Convert amount to smallest unit (PYUSD has 6 decimals)
      const amountInSmallestUnit = Math.floor(amount * 1e6);
      console.log(`🔢 Amount in smallest units: ${amountInSmallestUnit}`);

      // Add transfer instruction
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

      // Get blockhash
      const { blockhash } = await connection.getLatestBlockhash('processed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = payer.publicKey;

      console.log('🚀 Sending transaction...');

      // Sign and send
      transaction.sign(payer);

      const signature = await connection.sendRawTransaction(
        transaction.serialize(),
        {
          skipPreflight: false,
          maxRetries: 3
        }
      );

      console.log('✅ Transaction submitted successfully!');
      console.log(`🔗 Signature: ${signature}`);
      console.log(`🌐 Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      console.log('\n🎉 SUCCESS!');
      console.log(`💸 Sent ${amount} PYUSD to ${recipientAddress}`);
      console.log('💡 Check the explorer link above to confirm the transaction.');

      return signature;

    } catch (error) {
      console.log(`❌ RPC failed: ${(error as any)?.message || error}`);

      if ((error as any)?.message?.includes('Insufficient funds')) {
        console.log('\n💡 Insufficient funds - you might not have enough PYUSD or SOL');
        break;
      }

      continue;
    }
  }

  console.log('\n❌ All RPCs failed or insufficient funds.');
}

sendToRecipient().catch(console.error);