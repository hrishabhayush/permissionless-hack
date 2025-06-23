# Requity

A Chrome extension + platform that reconnects ChatGPT product recommendations to their original sources, ensuring content creators get compensated while users earn rewards for their product research.

## Project Overview

**Problem:** When users ask ChatGPT for product recommendations, ChatGPT aggregates information from multiple content creators (tech blogs, review sites) but provides generic product links. This breaks the attribution chain - creators who researched and reviewed products lose revenue when their recommendations lead to purchases.

**Solution:** A Chrome extension + platform that reconnects ChatGPT product recommendations to their original sources, ensuring content creators get compensated while users earn rewards for their product research.

## Core Value Proposition

- **For Users:** Earn PYUSD rewards for your ChatGPT product research
- **For Content Creators:** Get compensated when your reviews influence purchases (zero setup - just add a meta tag)
- **For the Ecosystem:** Fair attribution and revenue sharing using crypto micropayments

## How It Works

1. User signs up and installs Chrome extension
2. When ChatGPT recommends products with sources, extension replaces generic links with attribution-enabled tracking links
3. System discovers content creator wallet addresses from their website meta tags
4. When user makes purchase, commission automatically splits via PYUSD: 60% to sources, 20% to user, 20% to platform
5. Everyone gets paid instantly with near-zero transaction fees

## Repository Structure

This is a **pnpm monorepo** containing all components needed for a complete demo ecosystem:

### Core Applications (`apps/`)

**`extension/`** - Chrome extension that monitors ChatGPT and replaces product links ✅ **COMPLETED**
- Goal: Seamless user experience, instant link replacement, background attribution
- **Status:** Fully functional - detects `utm_source=chatgpt.com` and injects referral parameters

**`web/`** - User registration and dashboard website  
- Goal: User onboarding, wallet management, earnings tracking

**`api/`** - Backend service for link generation and attribution tracking
- Goal: Fast API responses, reliable background processing, payout automation

**`store/`** - Mock e-commerce storefront for demo purposes
- Goal: Simulate partner store, demonstrate purchase flow, trigger payout webhooks

**`demo-sites/`** - Mock content creator websites (TechReviewer, GadgetGuru, ReviewMaster)
- Goal: Realistic demo environment, showcase wallet discovery, provide attribution sources

### Shared Packages (`packages/`)

**`shared/`** - Common types and utilities across all applications
- Goal: Type safety, code reuse, consistent data models

**`database/`** - Database schemas and client
- Goal: Centralized data management, attribution tracking, user/payout records

## Chrome Extension - Technical Implementation ✅

### Current Status: WORKING
The Chrome extension successfully detects ChatGPT referrals and injects attribution parameters.

### How It Works

1. **Universal Detection**: Extension runs on all websites (`<all_urls>`) to detect incoming ChatGPT referrals
2. **UTM Parameter Detection**: Monitors for `utm_source=chatgpt.com` parameter in URLs
3. **Referral Injection**: Automatically adds `ref=testuser_timestamp` parameter to track attribution
4. **Background Processing**: Logs attribution data and stores it locally for future API integration

### Key Features

- **Real-time URL modification** using `window.history.replaceState()`
- **Attribution tracking** with user wallet addresses
- **Background script communication** for centralized data management
- **Comprehensive logging** for debugging and monitoring
- **Cross-site compatibility** works on any website receiving ChatGPT referrals

### Technical Architecture

```
ChatGPT → User clicks link with utm_source=chatgpt.com → 
Destination Site (e.g., visioncenter.org) → 
Extension detects UTM parameter → 
Adds ref=user_timestamp → 
Logs attribution data → 
Sends to background script → 
Stores for future payout processing
```

### Files Structure

```
apps/extension/
├── public/
│   └── manifest.json          # Extension configuration
├── src/
│   ├── background.ts          # Service worker for data processing
│   └── content.ts             # Content script for URL detection
├── dist/                      # Built extension files
└── package.json
```

### Build & Test

```bash
# Build the extension
pnpm extension:build

# Load in Chrome
1. Go to chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select apps/extension/dist folder

# Test
Navigate to: https://www.visioncenter.org/reviews/best-sunglasses/?utm_source=chatgpt.com
Check console for attribution logs
```

### Console Output Example

When working correctly, you'll see:
```
🔧 Referral Extension Content Script Loaded
🔧 Current URL: https://www.visioncenter.org/reviews/best-sunglasses/?utm_source=chatgpt.com
🎯 CHATGPT REFERRAL DETECTED!
🔧 Adding referral parameter...
✅ URL updated successfully!
📊 Attribution Data: {user: "testuser", wallet: "0x742d35...", source: "chatgpt.com"}
```

### Next Steps for Extension

- [ ] Connect to real API instead of local storage
- [ ] Implement user authentication
- [ ] Add popup UI for user dashboard
- [ ] Integrate with PYUSD wallet for payouts
- [ ] Add content creator wallet discovery via meta tags

## Demo Flow (Planned)

1. **Show ecosystem:** Demo content creator sites with wallet addresses in meta tags
2. **User onboarding:** User signs up, provides PYUSD wallet, installs extension
3. **ChatGPT interaction:** Ask about products, extension replaces links in real-time
4. **Purchase simulation:** User clicks through to mock store, completes purchase
5. **Instant payouts:** Watch PYUSD automatically distribute to all parties
6. **Analytics:** Dashboard shows earnings, attribution data, transaction history

## Development Commands

```bash
# Install dependencies
pnpm install

# Build extension
pnpm extension:build

# Package extension for distribution
pnpm extension:package

# Development mode (with watch)
cd apps/extension && pnpm dev

# Type checking
cd apps/extension && pnpm type-check
```

### Extension Packaging

The `pnpm extension:package` command creates a distributable zip file:

1. **Builds** the extension (`pnpm extension:build`)
2. **Copies** `apps/extension/dist/` to a temporary `referral/` folder
3. **Zips** the folder as `referral.zip`
4. **Cleans up** by removing the temporary `referral/` folder
5. **Preserves** the original `dist/` folder for development

**Result:** `referral.zip` ready for Chrome Web Store or manual distribution

**Usage:**
```bash
pnpm extension:package
# Creates referral.zip in project root
```

## Business Model

- Platform commission on transactions (20%)
- Premium user features with higher earnings splits
- Analytics and insights for content creators
- Potential licensing to affiliate networks

## Technical Innovation

- **Crypto micropayments** enable profitable sub-dollar payouts
- **Zero-friction creator onboarding** via website meta tags
- **Real-time attribution** with background wallet discovery
- **Complete ecosystem** demonstration with realistic user journey

## Success Metrics for Hackathon

- [x] Working end-to-end demo from ChatGPT to referral parameter injection
- [x] Real-time link detection and modification
- [x] Complete attribution tracking and logging
- [ ] Realistic content creator ecosystem with wallet discovery
- [ ] Live blockchain transactions during demo
- [ ] User dashboard with earnings tracking

---

**Current Status:** Chrome extension is fully functional and ready for integration with the broader platform ecosystem. Ready to proceed with web app, API, and demo site development.
