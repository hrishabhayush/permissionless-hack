import { Token2022MicropaymentDemo } from './micropayment-token2022';
import { CONFIG } from './config';

async function quickSend() {
  console.log('⚡ Quick PYUSD Micropayment');
  console.log('=========================');
  
  const demo = new Token2022MicropaymentDemo();
  const amount = 0.01; // 1 cent
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n🚀 Attempt ${attempt}/${maxRetries}: Sending ${amount} PYUSD`);
      
      const signature = await demo.sendMicropayment(CONFIG.WALLET_ADDRESS, amount);
      
      console.log('\n🎉 SUCCESS!');
      console.log(`💰 Sent: ${amount} PYUSD`);
      console.log(`🔗 Tx: ${signature}`);
      console.log(`🌐 Explorer: https://explorer.solana.com/tx/${signature}?cluster=${CONFIG.NETWORK}`);
      
      // Check final balance
      console.log('\n📊 Updated Balance:');
      await demo.checkBalances();
      
      return signature;
      
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, (error as any)?.message || error);
      
      if (attempt < maxRetries) {
        console.log(`🔄 Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log('\n💡 All attempts failed. This can happen on devnet.');
        console.log('   The transaction might still be processed - check the explorer.');
        console.log('   Devnet can be slow and unreliable sometimes.');
      }
    }
  }
}

quickSend().catch(console.error); 