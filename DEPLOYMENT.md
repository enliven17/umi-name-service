# Umi Name Service Deployment Guide

## Prerequisites

1. **Umi CLI**: Install the Umi CLI tool
2. **Test ETH**: Get test ETH from the Umi faucet
3. **Wallet**: Set up a wallet with Umi Devnet

## Smart Contract Deployment

### 1. Deploy the Move Contract

The Move contract is located in `contracts/NameService.move`. To deploy it:

1. **Install Umi CLI** (if not already installed):
   ```bash
   # Follow instructions at https://docs.uminetwork.com/
   ```

2. **Deploy the contract**:
   ```bash
   # Navigate to the contracts directory
   cd contracts
   
   # Deploy using Umi CLI
   umi deploy NameService.move
   ```

3. **Note the contract address** after deployment

### 2. Update Configuration

After deploying the contract, update the contract address in `src/config/umi.ts`:

```typescript
export const UMI_CONFIG: UmiConfig = {
  rpcUrl: 'https://devnet.uminetwork.com',
  chainId: 42069,
  explorerUrl: 'https://devnet.explorer.moved.network',
  contractAddress: 'YOUR_DEPLOYED_CONTRACT_ADDRESS', // Update this
};
```

## Frontend Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Configure environment variables** in Vercel dashboard if needed

### 3. Deploy to Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to Netlify

### 4. Deploy to GitHub Pages

1. **Add GitHub Pages configuration** to `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/umi-name-service/',
     // ... other config
   });
   ```

2. **Push to GitHub** and enable GitHub Pages

## Testing the Deployment

1. **Connect your wallet** to the deployed application
2. **Switch to Umi Devnet** in your wallet
3. **Search for a domain** (e.g., "myname")
4. **Register the domain** if available

## Contract Functions

The deployed contract supports the following functions:

- `register_domain(name, duration_years)` - Register a new domain
- `transfer_domain(name, new_owner)` - Transfer domain ownership
- `renew_domain(name, duration_years)` - Renew domain registration
- `set_resolver(name, resolver)` - Set resolver address
- `is_domain_registered(name)` - Check if domain is registered
- `get_domain_owner(name)` - Get domain owner
- `get_domain_expiry(name)` - Get domain expiry date
- `get_user_domains(user_addr)` - Get user's domains

## Price Structure

Domain prices are based on name length:
- 3 characters: 0.01 ETH
- 4 characters: 0.005 ETH
- 5 characters: 0.002 ETH
- 6+ characters: 0.001 ETH

## Troubleshooting

### Common Issues

1. **"Contract not found" error**:
   - Verify the contract address in `src/config/umi.ts`
   - Ensure the contract was deployed successfully

2. **"Insufficient balance" error**:
   - Get more test ETH from the Umi faucet
   - Check your wallet balance

3. **"Network not supported" error**:
   - Ensure your wallet is connected to Umi Devnet
   - Add Umi Devnet to your wallet if not already added

### Support

For deployment issues:
- Check the Umi documentation: https://docs.uminetwork.com/
- Join the Umi Discord community
- Open an issue on GitHub 