import { Token2022MicropaymentDemo } from './micropayment-token2022';
import { CONFIG } from './config';

async function runMicropaymentDemo() {
  console.log('🚀 Token-2022 PYUSD Micropayment Demo');
  console.log('=====================================');

  const demo = new Token2022MicropaymentDemo();

  try {
    // Check initial balance
    console.log('\n📊 Initial Balance Check:');
    const initialBalance = await demo.checkBalances();

    if (initialBalance.pyusd === 0) {
      console.log('❌ No PYUSD found. Please get PYUSD first.');
      return;
    }

    // Check transaction cost
    console.log('\n💰 Transaction Cost Analysis:');
    await demo.checkTransactionCost();

    // Send a small micropayment to yourself
    const micropaymentAmount = 0.01; // 1 cent worth of PYUSD
    console.log(`\n🎯 Sending ${micropaymentAmount} PYUSD micropayment to yourself...`);

    const signature = await demo.sendMicropayment(CONFIG.WALLET_ADDRESS, micropaymentAmount);

    console.log('\n✅ Micropayment Demo Completed Successfully!');
    console.log(`🔗 Transaction Signature: ${signature}`);

    // Check final balance
    console.log('\n📊 Final Balance Check:');
    await demo.checkBalances();

    console.log('\n🎉 Demo Summary:');
    console.log(`   💸 Sent: ${micropaymentAmount} PYUSD`);
    console.log(`   💰 Available: ${initialBalance.pyusd} PYUSD`);
    console.log(`   ⛽ Est. Fee: ~$0.0005 USD`);
    console.log(`   📊 Fee %: 0.50% of payment`);
    console.log(`   🌐 Network: ${CONFIG.NETWORK}`);

  } catch (error) {
    console.error('❌ Demo failed:', (error as any)?.message || error);

    if ((error as any)?.message?.includes('insufficient funds')) {
      console.log('\n💡 Suggestion: You might need more SOL for transaction fees');
    } else if ((error as any)?.message?.includes('TokenAccountNotFoundError')) {
      console.log('\n💡 Suggestion: Token account might need to be created first');
    }
  }
}

// Run the demo
runMicropaymentDemo();