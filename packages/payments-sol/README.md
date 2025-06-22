# Solana PYUSD Micropayment System

A Token-2022 based micropayment system for PYUSD transfers on Solana.

## 🚀 Features

- ✅ Token-2022 PYUSD transfers
- ✅ Micropayments with low fees (~$0.0005)
- ✅ Automatic token account creation
- ✅ Multiple RPC endpoint support
- ✅ Fire-and-forget transaction handling

## 🔧 Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
```bash
# Copy the template
cp .env.example .env

# Edit .env with your actual values
nano .env
```

### 3. Required Environment Variables
- `PRIVATE_KEY` - Your Solana wallet private key (base58 encoded)
- `WALLET_ADDRESS` - Your Solana wallet public address
- `NETWORK` - Either "devnet" or "mainnet"

## 🎮 Usage

### Check Balance
```bash
pnpm run check-balance
```

### Send Micropayment
```bash
# Fast send (fire-and-forget)
pnpm run fast-send

# Send to specific recipient (edit recipient in script)
pnpm run send-to-recipient
```

### Demo with Full Workflow
```bash
pnpm run demo
```

## 🔒 Security

**IMPORTANT:** Never commit your `.env` file or expose your private key!

- ✅ Your `.env` file is gitignored
- ✅ Use `.env.example` for sharing configuration structure
- ✅ Keep private keys secure and never share them

## 📊 Transaction Costs

- **Network**: Solana (devnet/mainnet)
- **Fee**: ~5000 lamports (~$0.0005 USD)
- **Efficiency**: 0.5% fee for $0.10 payments

## 🛠 Scripts

- `pnpm start` - Run main micropayment demo
- `pnpm run check-balance` - Check PYUSD balance
- `pnpm run estimate-cost` - Estimate transaction costs
- `pnpm run fast-send` - Quick micropayment
- `pnpm run check-token2022` - Detailed token analysis

## 📁 Project Structure

```
src/
├── config.ts                  # Environment-based configuration
├── micropayment-token2022.ts   # Main Token-2022 payment class
├── check-token2022.ts          # Token balance checker
├── wallet-inspector.ts         # Wallet analysis tools
├── fast-send.ts                # Quick payment utility
├── send-to-recipient.ts        # Send to specific address
└── micropayment-demo.ts        # Full demo script
```

## 🔗 Links

- [Solana Token-2022 Docs](https://spl.solana.com/token-2022)
- [PYUSD on Solana](https://www.paypal.com/us/digital-wallet/manage-money/crypto/pyusd)
- [Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet) 