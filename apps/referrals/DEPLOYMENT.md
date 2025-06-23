# Referral Sites Deployment Guide

This project has been configured to deploy 5 separate sites, each focused on a single product category with their own referral wallet addresses.

## Available Sites

### 1. Shoes Reviews Hub (WEB1)
- **Build Command**: `npm run build:web1`
- **Output Directory**: `dist/`
- **Wallet Address**: `solana:3QzXMwX4b6hwuNMKLjyZJtK4W5JqxoojgSKDX9Gqot3Y` (WALLET_1)
- **Focus**: Premium shoe reviews and recommendations

### 2. Handbags Reviews Hub (WEB2)
- **Build Command**: `npm run build:web2`
- **Output Directory**: `dist/`
- **Wallet Address**: `solana:FEyBMJ3ofTzdUkfofYgYE5ANTNgqr8NsJbJhMZBBw7R4` (WALLET_2)
- **Focus**: Handbag style guides and reviews

### 3. Glasses Reviews Hub (WEB3)
- **Build Command**: `npm run build:web3`
- **Output Directory**: `dist/`
- **Wallet Address**: `solana:Bv8eMNvt81tLXtqgN3awRtjez2skW338C2fk9np8JmCJ` (WALLET_3)
- **Focus**: Eyewear reviews and fitting guides

### 4. Shoes & Bags Reviews Hub (WEB4)
- **Build Command**: `npm run build:web4`
- **Output Directory**: `dist/`
- **Wallet Address**: `solana:4Tqqk9BGFhEXZEETHDbM2TSqaQqED3yXH9rwwHTv4Sus` (WALLET_4)
- **Focus**: Coordinated footwear and handbag styling

### 5. Shoes & Glasses Reviews Hub (WEB5)
- **Build Command**: `npm run build:web5`
- **Output Directory**: `dist/`
- **Wallet Address**: `solana:PM6h2Wf7hMTtxDkrwcNk3QPTFDF89xsnQRCKyN9Dg1F` (WALLET_5)
- **Focus**: Footwear and eyewear coordination guides

## How to Deploy

### Local Development

**For the original multi-page app:**
```bash
# Install dependencies
npm install

# Start development server (original app with all categories)
npm run dev
```

**For individual site development:**
```bash
# Develop shoes site only
npm run dev:shoes

# Develop bags site only
npm run dev:bags

# Develop glasses site only
npm run dev:glasses

# Develop shoes & bags site only
npm run dev:shoes-bags

# Develop shoes & glasses site only
npm run dev:shoes-glasses
```

### Building for Production

Build each site individually (each build overwrites the previous one in `dist/`):

```bash
# Build WEB1 (shoes site)
npm run build:web1

# Build WEB2 (bags site)  
npm run build:web2

# Build WEB3 (glasses site)
npm run build:web3

# Build WEB4 (shoes & bags site)
npm run build:web4

# Build WEB5 (shoes & glasses site)
npm run build:web5
```

**Note**: Each build command will overwrite the `dist/` folder with the specific site content. Deploy one at a time after each build.

### Deployment Workflow

1. **Build the site you want to deploy:**
   ```bash
   npm run build:web1  # For shoes site
   ```

2. **Deploy the `dist/` folder** to your hosting platform

3. **Repeat for each site:**
   ```bash
   npm run build:web2  # Build bags site (overwrites dist/)
   # Deploy dist/ to a different hosting platform/domain
   
   npm run build:web3  # Build glasses site (overwrites dist/)
   # Deploy dist/ to another hosting platform/domain
   ```

### Deployment to Static Hosting

Each time you build, the `dist/` folder contains a complete, standalone site ready for deployment:

#### Vercel Deployment
For each site, create a separate Vercel project:

1. **Build the specific site locally**: `npm run build:web1`
2. **Create a new Vercel project**
3. **Upload/deploy the `dist/` folder contents**
4. **Repeat for other sites** with their respective build commands

#### Netlify Deployment
Similar process for Netlify:

1. **Build locally**: `npm run build:web1`
2. **Drag and drop the `dist/` folder** to Netlify
3. **Repeat for other sites**

#### Other Static Hosts
Any static hosting service can serve the contents of the `dist/` folder after each build.

## Key Features of Each Site

- **Single Product Focus**: Each site shows only one product category on the root page
- **Unique Wallet Attribution**: Each site has its own Solana wallet address for referral tracking
- **SEO Optimized**: Individual meta tags, titles, and descriptions
- **Standalone Operation**: Each site works independently without navigation to other categories

## Technical Architecture

- **Entry Points**: Separate `main-{category}.tsx` files for each site
- **App Components**: Individual `{Category}App.tsx` components with focused branding
- **HTML Templates**: Dedicated HTML files with category-specific metadata
- **Build Configuration**: Vite config supports multiple build modes, all outputting to `dist/`
- **Referral Attribution**: Each page includes wallet address in meta tags and JavaScript

## Referral Attribution System

Each site includes:
- Meta tag in HTML: `<meta name="referral-bridge-wallet" content="solana:..." />`
- JavaScript-based meta tag updates in the page components
- Attribution links pointing to `https://stepup.orbiter.website/{category}`

This enables the Chrome extension to detect the wallet addresses and attribute sales to the correct content creators. 