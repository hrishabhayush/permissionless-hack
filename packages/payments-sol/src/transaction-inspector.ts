import { Connection, PublicKey } from '@solana/web3.js';
import { CONFIG } from './config';

async function inspectTransaction() {
  console.log('🔍 Transaction Inspector');
  console.log('=======================');

  const connection = new Connection(CONFIG.DEVNET_RPC, 'confirmed');
  const walletPublicKey = new PublicKey(CONFIG.WALLET_ADDRESS);

  try {
    // Get recent transactions for this wallet
    const signatures = await connection.getSignaturesForAddress(walletPublicKey, { limit: 5 });

    console.log(`📋 Found ${signatures.length} recent transactions:\n`);

    for (let i = 0; i < signatures.length; i++) {
      const sig = signatures[i];
      console.log(`🔗 Transaction ${i + 1}: ${sig.signature}`);
      console.log(`   Status: ${sig.err ? '❌ Failed' : '✅ Success'}`);
      console.log(`   Time: ${new Date(sig.blockTime! * 1000).toISOString()}`);

      if (sig.err) {
        console.log(`   Error: ${JSON.stringify(sig.err)}`);
      }

      // Get detailed transaction info
      try {
        const txDetails = await connection.getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });

        if (txDetails) {
          console.log(`   Fee: ${txDetails.meta?.fee || 0} lamports`);

          // Look for token transfers
          const tokenBalances = txDetails.meta?.preTokenBalances || [];
          const postTokenBalances = txDetails.meta?.postTokenBalances || [];

          console.log(`   Pre-token balances: ${tokenBalances.length}`);
          console.log(`   Post-token balances: ${postTokenBalances.length}`);

          // Check for balance changes
          for (const preBalance of tokenBalances) {
            const postBalance = postTokenBalances.find(
              post => post.accountIndex === preBalance.accountIndex
            );

            if (postBalance && preBalance.uiTokenAmount && postBalance.uiTokenAmount) {
              const change = postBalance.uiTokenAmount.uiAmount! - preBalance.uiTokenAmount.uiAmount!;
              if (change !== 0) {
                console.log(`   💰 Token change: ${change} (Account: ${preBalance.owner})`);
                console.log(`   🏦 Token Account: ${preBalance.accountIndex}`);
              }
            }
          }

          // Check instruction details
          if (txDetails.transaction.message.instructions) {
            console.log(`   📝 Instructions: ${txDetails.transaction.message.instructions.length}`);

            for (const instruction of txDetails.transaction.message.instructions) {
              if ('parsed' in instruction && instruction.parsed) {
                console.log(`   🎯 Type: ${instruction.parsed.type}`);
                if (instruction.parsed.info) {
                  const info = instruction.parsed.info;
                  if (info.amount) {
                    console.log(`   💸 Amount: ${info.amount}`);
                  }
                  if (info.destination) {
                    console.log(`   📬 Destination: ${info.destination}`);
                  }
                  if (info.source) {
                    console.log(`   📤 Source: ${info.source}`);
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.log(`   ⚠️ Could not get transaction details: ${(error as any)?.message}`);
      }

      console.log(`   🌐 Explorer: https://explorer.solana.com/tx/${sig.signature}?cluster=devnet\n`);
    }

    // Check the specific recipient address from your recent send
    const recipientAddress = 'TRmpNVZEhNr5DawcGF4HfY8bppTazRwVj6zzL3ZZjNG';
    console.log(`\n🔍 Checking recipient wallet: ${recipientAddress}`);

    try {
      const recipientPublicKey = new PublicKey(recipientAddress);
      const recipientSignatures = await connection.getSignaturesForAddress(recipientPublicKey, { limit: 3 });

      console.log(`📋 Recipient has ${recipientSignatures.length} recent transactions:`);
      for (const sig of recipientSignatures) {
        console.log(`   🔗 ${sig.signature} - ${sig.err ? '❌ Failed' : '✅ Success'}`);
      }

    } catch (error) {
      console.log(`❌ Error checking recipient: ${(error as any)?.message}`);
    }

  } catch (error) {
    console.error('❌ Error inspecting transactions:', (error as any)?.message || error);
  }
}

inspectTransaction().catch(console.error);