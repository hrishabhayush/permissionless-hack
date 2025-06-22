import { 
  Connection, 
  PublicKey, 
  Transaction,
  Keypair,
  sendAndConfirmTransaction,
  SystemProgram
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import bs58 from 'bs58';
import { CONFIG } from './config';

// Token-2022 Program ID
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

export class Token2022MicropaymentDemo {
  private connection: Connection;
  private payer: Keypair;
  private pyusdMint: PublicKey;

  constructor() {
    const rpcUrl = CONFIG.NETWORK === 'devnet' ? CONFIG.DEVNET_RPC : CONFIG.MAINNET_RPC;
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    // Decode the private key
    const privateKeyBytes = bs58.decode(CONFIG.PRIVATE_KEY);
    this.payer = Keypair.fromSecretKey(privateKeyBytes);
    
    // Use the correct PYUSD mint based on network
    this.pyusdMint = new PublicKey(
      CONFIG.NETWORK === 'devnet' ? CONFIG.PYUSD_DEVNET : CONFIG.PYUSD_MAINNET
    );
    
    console.log(`🔧 Using Token-2022 Program: ${TOKEN_2022_PROGRAM_ID.toString()}`);
    console.log(`💰 Wallet: ${this.payer.publicKey.toString()}`);
    console.log(`🪙 PYUSD Mint: ${this.pyusdMint.toString()}`);
    console.log(`🌐 Network: ${CONFIG.NETWORK}`);
  }

  async checkBalances() {
    try {
      console.log('\n🔍 Checking Token-2022 PYUSD Balance...');
      
      // Check SOL balance
      const solBalance = await this.connection.getBalance(this.payer.publicKey);
      console.log(`💎 SOL Balance: ${solBalance / 1e9} SOL`);
      
      // Get Token-2022 accounts
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        this.payer.publicKey,
        { programId: TOKEN_2022_PROGRAM_ID }
      );
      
      console.log(`📊 Found ${tokenAccounts.value.length} Token-2022 account(s)`);
      
      let pyusdBalance = 0;
      for (const account of tokenAccounts.value) {
        const accountData = account.account.data.parsed.info;
        const mint = accountData.mint;
        const balance = accountData.tokenAmount.uiAmount;
        
        if (mint === this.pyusdMint.toString()) {
          pyusdBalance = balance;
          console.log(`💰 PYUSD Balance: ${balance} PYUSD`);
          console.log(`🏦 Token Account: ${account.pubkey.toString()}`);
        }
      }
      
      if (pyusdBalance === 0) {
        console.log('❌ No PYUSD found. Please get PYUSD from a faucet first.');
      }
      
      return { sol: solBalance / 1e9, pyusd: pyusdBalance };
      
    } catch (error) {
      console.error('❌ Error checking balances:', (error as any)?.message || error);
      throw error;
    }
  }

  async sendMicropayment(recipientAddress: string, amount: number = CONFIG.MICROPAYMENT_AMOUNT) {
    try {
      console.log('\n🚀 Sending Token-2022 PYUSD Micropayment...');
      console.log(`💸 Amount: ${amount} PYUSD`);
      console.log(`📬 Recipient: ${recipientAddress}`);
      
      const recipient = new PublicKey(recipientAddress);
      
      // Get sender's token account
      const senderTokenAccount = await getAssociatedTokenAddress(
        this.pyusdMint,
        this.payer.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      
      // Get recipient's token account
      const recipientTokenAccount = await getAssociatedTokenAddress(
        this.pyusdMint,
        recipient,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      
      console.log(`🏦 Sender Token Account: ${senderTokenAccount.toString()}`);
      console.log(`🏦 Recipient Token Account: ${recipientTokenAccount.toString()}`);
      
      // Create transaction
      const transaction = new Transaction();
      
      // Check if recipient token account exists
      try {
        await getAccount(this.connection, recipientTokenAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
        console.log('✅ Recipient token account exists');
      } catch (error) {
        console.log('📝 Creating recipient token account...');
        // Add instruction to create recipient token account
        transaction.add(
          createAssociatedTokenAccountInstruction(
            this.payer.publicKey,
            recipientTokenAccount,
            recipient,
            this.pyusdMint,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }
      
      // Convert amount to smallest unit (PYUSD has 6 decimals)
      const amountInSmallestUnit = Math.floor(amount * 1e6);
      
      // Add transfer checked instruction (required for Token-2022)
      transaction.add(
        createTransferCheckedInstruction(
          senderTokenAccount,
          this.pyusdMint,
          recipientTokenAccount,
          this.payer.publicKey,
          amountInSmallestUnit,
          6, // PYUSD has 6 decimals
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );
      
      // Get fresh blockhash with finalized commitment for better reliability
      console.log('⏱️ Getting fresh blockhash...');
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.payer.publicKey;
      
      console.log(`🔗 Block height: ${lastValidBlockHeight}`);
      console.log('📡 Sending transaction with optimized settings...');
      
      // Use faster commitment and shorter timeout
      const signature = await this.connection.sendTransaction(
        transaction,
        [this.payer],
        {
          skipPreflight: false,
          preflightCommitment: 'processed',
          maxRetries: 3
        }
      );
      
      console.log(`🔗 Transaction submitted: ${signature}`);
      console.log('⏳ Confirming transaction...');
      
      // Confirm with processed commitment for speed
      const confirmation = await this.connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight
        },
        'processed'
      );
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }
      
      console.log('✅ Micropayment sent successfully!');
      console.log(`🔗 Transaction: ${signature}`);
      console.log(`🌐 Explorer: https://explorer.solana.com/tx/${signature}?cluster=${CONFIG.NETWORK}`);
      
      return signature;
      
    } catch (error) {
      console.error('❌ Error sending micropayment:', (error as any)?.message || error);
      
      // Provide specific suggestions based on error type
      if ((error as any)?.message?.includes('expired') || (error as any)?.message?.includes('block height')) {
        console.log('\n💡 Block height expired - this is common on devnet');
        console.log('   🔄 The transaction might still succeed, check the explorer');
        console.log('   ⚡ Try again - devnet can be slow sometimes');
      }
      
      throw error;
    }
  }

  async checkTransactionCost() {
    try {
      console.log('\n💰 Estimating Token-2022 Transaction Cost...');
      
      // Create a sample transaction to estimate fees
      const recipient = this.payer.publicKey; // Use self as recipient for estimation
      const transaction = new Transaction();
      
      // Get sender's token account
      const senderTokenAccount = await getAssociatedTokenAddress(
        this.pyusdMint,
        this.payer.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      
      // Get recipient's token account  
      const recipientTokenAccount = await getAssociatedTokenAddress(
        this.pyusdMint,
        recipient,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      
      // Add transfer checked instruction (1 micro-PYUSD = 1 unit)
      transaction.add(
        createTransferCheckedInstruction(
          senderTokenAccount,
          this.pyusdMint,
          recipientTokenAccount,
          this.payer.publicKey,
          1, // 1 unit for estimation
          6, // PYUSD has 6 decimals
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );
      
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.payer.publicKey;
      
      // Get fee for this message
      const fee = await this.connection.getFeeForMessage(transaction.compileMessage());
      const estimatedFee = fee.value || 5000; // Fallback to 5000 lamports
      
      const feeInSOL = estimatedFee / 1e9;
      const feeInUSD = feeInSOL * 100; // Rough SOL price estimate
      
      console.log(`⛽ Estimated fee: ${estimatedFee} lamports (${feeInSOL.toFixed(6)} SOL)`);
      console.log(`💵 Estimated USD cost: ~$${feeInUSD.toFixed(4)}`);
      
      // Calculate percentage of micropayment
      const percentageOfPayment = (feeInUSD / CONFIG.MICROPAYMENT_AMOUNT) * 100;
      console.log(`📊 Fee as % of ${CONFIG.MICROPAYMENT_AMOUNT} PYUSD payment: ${percentageOfPayment.toFixed(2)}%`);
      
      if (percentageOfPayment < 1) {
        console.log('✅ Excellent! Very cost-effective for micropayments');
      } else if (percentageOfPayment < 5) {
        console.log('✅ Good! Reasonable cost for micropayments');
      } else {
        console.log('⚠️ High fee percentage - consider larger payment amounts');
      }
      
      return {
        feeInLamports: estimatedFee,
        feeInSOL,
        feeInUSD,
        percentageOfPayment
      };
      
    } catch (error) {
      console.error('❌ Error estimating cost:', (error as any)?.message || error);
      throw error;
    }
  }
}

// Demo usage
async function runDemo() {
  try {
    const demo = new Token2022MicropaymentDemo();
    
    // Check balances
    await demo.checkBalances();
    
    // Check transaction cost
    await demo.checkTransactionCost();
    
    // Uncomment to send a test micropayment to yourself
    // await demo.sendMicropayment(CONFIG.WALLET_ADDRESS, 0.01);
    
  } catch (error) {
    console.error('Demo failed:', error);
  }
}

if (require.main === module) {
  runDemo();
} 