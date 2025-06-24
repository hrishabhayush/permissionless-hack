# Permissionless Hack Project

A comprehensive platform integrating **Solana pyUSD payments**, **Supra blockchain attribution**, and **Chrome extension** technology for decentralized commerce attribution.

Important links used in the demo video.
- **Chrome Extension:** [Download v2.0.0](https://github.com/hrishabhayush/permissionless-hack/releases/download/v2.00.0/requity.zip)
- **Custom ChatGPT:** [Requiry GPT](https://chatgpt.com/g/g-6859f22c8c9c8191b8562345848b3c49-requity)
- **Test Websites:**
  - [Test Site 1](https://website1.orbiter.website/)
  - [Test Site 2](https://website2.orbiter.website/)
  - [Test Site 3](https://website3.orbiter.website/)
  - [Test Site 4](https://website4.orbiter.website/)
  - [Test Site 5](https://website5.orbiter.website/)
- **Test Store:** [StepUp Store](https://stepup.orbiter.website/)
## 🏗️ Project Structure!

![System Overview](https://github.com/hrishabhayush/permissionless-hack/blob/main/photo_2025-06-23_21-48-41.jpg)

## How to test?
Download and install the chrome extension.
Use the provided chatgpt link to ask for shoes, glasses or bags.
It will generate "buy" links out of some sources. It will include all.
Click any of the buy links.
Open the extension, put in a solana wallet (eth not supported yet, but soon)
the link is a test store, add items and buy them it will just work
once the purchase is completed, the user wallet plus the referred sources from the chat that have a metatag with the address
will get the cashback.
you can test the websites 1-5 to see the cashbacks went through.

### 📦 Core Packages

**`packages/payments-sol/`** - **Main Payment Logic** 🚀
- Solana pyUSD transaction processing on Devnet
- Smart contract interactions
- Crypto micropayment automation

**`packages/database/`** - Data Management
- Database schemas and clients
- Attribution tracking
- User and transaction records

**`packages/Supra-agents-hub-main/`** - **Supra Web Attribution Agent** 🤖
- Decentralized website attribution system
- Automatic conversion tracking and payouts
- Domain verification and escrow management

### 🚀 Applications

**`apps/extension/`** - Chrome Extension ✅
- Monitors ChatGPT product recommendations
- Real-time link attribution injection
- Background attribution processing

**`apps/web/`** - User Dashboard
- User registration and wallet management
- Earnings tracking and analytics

**`apps/api/`** - Backend Services
- Attribution API endpoints
- Payment processing coordination

**`apps/store/`** - Demo E-commerce
- Mock storefront for testing
- Purchase flow simulation

**`apps/landing/wallet-frontend/`** - Wallet Interface
- RainbowKit + wagmi integration
- Modern Web3 wallet connection
- **Live:** [requity.vercel.app](https://requity.vercel.app)

## 🏛️ System Architecture

![System Architecture](./system-architecture.png)

The system follows a comprehensive flow:

1. **Sources Crawler** - Asynchronously discovers and maps content creator websites with wallet addresses
2. **Database** - Central storage for source domains, referral links, and user mappings  
3. **Backend** - Maps users and sources to unique referral link codes
4. **Chrome Extension** - Intercepts ChatGPT recommendations and injects attribution links
5. **Main Web Platform** - Handles authentication, extension management, and analytics
6. **Partner Integration** - E-commerce stores notify the system upon purchase completion
7. **Payment Processing** - Automated PYUSD distribution to all parties via Solana

## 🔧 Quick Setup

### Prerequisites
```bash
# Install pnpm globally
npm install -g pnpm
```

### Installation
```bash
# Clone and install dependencies
git clone https://github.com/hrishabhayush/permissionless-hack.git
cd permissionless-hack
pnpm install
```

### Key Components Setup

**1. Chrome Extension:**
```bash
pnpm extension:build
# Load apps/extension/dist in Chrome Developer Mode
```

**2. Supra Attribution Agent:**

For more detailed instructions for this agent look into Website-Attribution-
```bash
cd packages/Supra-agents-hub-main/Agents/WebsiteAttributionAgent
npm install
npx tsx agent.ts
```

**3. Wallet Frontend:**
```bash
cd apps/landing/wallet-frontend
npm run dev
# Open http://localhost:3000
```

**4. Solana Payments:**
```bash
cd packages/payments-sol
# Configure for Solana Devnet
npm run dev
```

## 🎯 Core Features

- **🔗 Attribution Tracking** - Real-time website conversion attribution
- **💰 Crypto Payments** - Automated pyUSD micropayments on Solana
- **🤖 AI Agents** - Supra blockchain-powered attribution agents
- **🌐 Web3 Integration** - Modern wallet connection and management
- **⚡ Chrome Extension** - Seamless ChatGPT integration

## 🛠️ Tech Stack

- **Blockchain:** Solana (pyUSD), Supra Network
- **Frontend:** Next.js, React, TailwindCSS
- **Web3:** RainbowKit, wagmi, viem
- **Backend:** Node.js, TypeScript
- **Extension:** Chrome Extension APIs
- **Database:** Custom schemas for attribution
- **Payments:** Solana Web3.js, pyUSD tokens

## 🚀 Main Work Areas

1. **`packages/payments-sol/`** - Primary transaction logic
2. **`packages/Supra-agents-hub-main/`** - Attribution agent system  
3. **`packages/database/`** - Data persistence layer
4. **`apps/extension/`** - User interaction point

---

*Built for the Permissionless Hackathon - Connecting AI recommendations to fair creator compensation.*