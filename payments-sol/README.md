# Solana PYUSD Micropayment System

A streamlined Token-2022 based micropayment system for PYUSD transfers on Solana.

## 🚀 Features

- ✅ Token-2022 PYUSD transfers with automatic account creation
- ✅ Ultra-low fees (~$0.0005 per transaction)
- ✅ Multiple RPC endpoint support for reliability
- ✅ Fire-and-forget transaction handling to avoid timeouts
- ✅ Comprehensive transaction analysis and debugging
- ✅ Environment-based configuration for security

## 🔧 Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
```bash
# Create your .env file with your wallet details
cp env.template .env

# Provide the values to your SOL wallet address (devnet) and private-key (base-58)

## 🎮 Usage

### Core Operations
```bash
# Run main micropayment system
pnpm start

# Check your PYUSD balance and estimate costs
pnpm run check-balance
pnpm run estimate-cost

# Full demo with balance checks and test payment
pnpm run demo
```

### Sending Payments
```bash
# Send to specific recipient (edit recipient in script)
pnpm run send-to-recipient

# Analyze recent transactions
pnpm run inspect-tx
```

### Testing & Analysis
```bash
# Inspect recent transactions and debug issues
pnpm run inspect-tx
```

## 📊 Transaction Analysis

The system provides detailed transaction analysis showing:
- ✅ Token transfers between accounts
- ✅ Recipient balance changes
- ✅ Transaction fees and status
- ✅ Explorer links for verification

Example output:
```
💰 Token change: -1 (Account: GzVLeQXK4VMJxqNsgkpGiqyVtBWrfm5GjoGtHRuwZ7kp)
💰 Token change: +1 (Account: TRmpNVZEhNr5DawcGF4HfY8bppTazRwVj6zzL3ZZjNG)
🎯 Type: transferChecked
📬 Destination: GopDGCDhW5rXJa1sfnoQEMyL3khdtxCAPY3F2s8uMefV
```

## 🔒 Security

**IMPORTANT:** Your private key is secure!

- ✅ Private keys stored in `.env` file (gitignored)
- ✅ No sensitive data in source code
- ✅ Environment variable validation with helpful error messages
- ✅ Safe to commit to public repositories

## 📊 Cost Analysis

- **Network**: Solana (devnet/mainnet)
- **Transaction Fee**: ~5,000 lamports (~$0.0005 USD)
- **Efficiency**: 0.5% fee for $0.10 payments
- **Speed**: 1-2 second finality

## 🛠 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm start` | Run main Token-2022 micropayment demo |
| `pnpm run check-balance` | Check PYUSD balance and SOL |
| `pnpm run estimate-cost` | Estimate transaction costs |
| `pnpm run demo` | Full workflow demo with balance checks |
| `pnpm run send-to-recipient` | Send PYUSD to specific address |
| `pnpm run inspect-tx` | Analyze recent transactions |

## 📁 Project Structure

```
src/
├── config.ts                  # Environment-based secure configuration
├── micropayment-token2022.ts   # Core Token-2022 payment engine
├── micropayment-demo.ts        # Complete demo workflow
├── send-to-recipient.ts        # Send to specific addresses
└── transaction-inspector.ts    # Transaction analysis and debugging
```

### Core Components

**`config.ts`** - Secure environment-based configuration with validation and type safety

**`micropayment-token2022.ts`** - Main Token-2022 payment engine with balance checking and cost estimation

**`micropayment-demo.ts`** - Complete demo workflow with balance checks and test payments

**`send-to-recipient.ts`** - Send PYUSD to any Solana address with automatic account creation

**`transaction-inspector.ts`** - Analyze recent transactions and verify token transfers

## 🔗 Token Information

### Devnet PYUSD
- **Mint**: `CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM`
- **Program**: Token-2022 (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`)
- **Decimals**: 6

### Mainnet PYUSD
- **Mint**: `6c3ea9036406852006290770BEdFcAbA0e23A0e8`
- **Program**: Token-2022
- **Decimals**: 6

## 🌐 Links

- [Solana Token-2022 Documentation](https://spl.solana.com/token-2022)
- [PYUSD on Solana](https://www.paypal.com/us/digital-wallet/manage-money/crypto/pyusd)
- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)
- [Solana Explorer (Mainnet)](https://explorer.solana.com/)

## 🚨 Troubleshooting

### Common Issues

**"Environment variable PRIVATE_KEY is required"**
- Create a `.env` file based on `env.template`
- Add your wallet's private key in base58 format

**"Transaction failed" or timeouts**
- Run `pnpm run inspect-tx` to analyze what happened
- Devnet can be slow - transactions often succeed despite client timeouts
- Check the explorer links in the output

**"Insufficient funds"**
- Ensure you have SOL for transaction fees (~0.000005 SOL per tx)
- Ensure you have PYUSD tokens to send

### Getting Test Tokens

**Devnet SOL**: https://faucet.solana.com
**Devnet PYUSD**: Contact PayPal or use test faucets

## 📄 License

MIT License - Free to use for any purpose! 