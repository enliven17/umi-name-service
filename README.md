# Umi Name Service (UNS)

A decentralized name service for the Umi Network, allowing users to register and manage `.umi` domain names on the Umi Devnet.

## Features

- 🔗 **Decentralized Domain Registration**: Register `.umi` domains on the Umi network
- ⚡ **Fast & Secure**: Built on Umi's Layer 2 solution for Ethereum
- 💎 **Affordable**: Low-cost domain registration and management
- 🎨 **Modern UI**: Clean, responsive interface similar to ENS
- 🔐 **Wallet Integration**: Connect with MetaMask and other Web3 wallets
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Styled Components
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Web3**: Ethers.js
- **Build Tool**: Vite
- **Network**: Umi Devnet (Chain ID: 42069)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet
- Umi Devnet configured in your wallet

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd umi-name-service
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Wallet Setup

1. Install MetaMask or a compatible Web3 wallet
2. Add Umi Devnet to your wallet:
   - Network Name: Umi Devnet
   - RPC URL: https://devnet.uminetwork.com
   - Chain ID: 42069
   - Currency Symbol: ETH
   - Block Explorer: https://devnet.explorer.moved.network

3. Get test ETH from the Umi faucet
4. Connect your wallet to the application

## Project Structure

```
src/
├── api/             # API clients and calls
├── assets/          # Images, fonts, animations
├── components/      # Reusable UI components
│   └── styled/      # Styled components
├── config/          # Configuration files
├── constants/       # App-wide constants
├── hooks/           # Custom React hooks
├── navigation/      # Navigation logic
├── screens/         # Screen components
├── store/           # Redux store and slices
├── styles/          # Global styles
├── theme/           # Theme configuration
├── types/           # TypeScript types
└── utils/           # Helper functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Smart Contract Integration

The application is designed to work with smart contracts deployed on the Umi network. The contract addresses and ABIs will be configured in the `src/config/umi.ts` file.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Join our Discord community
- Open an issue on GitHub
- Check the Umi documentation at https://docs.uminetwork.com/

## Roadmap

- [ ] Domain registration functionality
- [ ] Domain management (transfer, update records)
- [ ] Subdomain support
- [ ] DNS record management
- [ ] Profile customization
- [ ] Mobile app
- [ ] Integration with other Umi dApps 