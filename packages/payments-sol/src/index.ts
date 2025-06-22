// Main export for the payments-sol package
export { Token2022MicropaymentDemo } from './micropayment-token2022';
export { CONFIG } from './config';

// Export types for better TypeScript support
export interface PaymentResult {
  signature: string;
  amount: number;
  recipient: string;
  timestamp: number;
}

export interface BalanceInfo {
  sol: number;
  pyusd: number;
}

export interface TransactionCostInfo {
  feeInLamports: number;
  feeInSOL: number;
  feeInUSD: number;
  percentageOfPayment: number;
} 