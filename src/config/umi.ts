import { UmiConfig } from '@/types';

export const UMI_CONFIG = {
  rpcUrl: 'http://localhost:4000', // Proxy server
  contractAddress: '0x00000000000000000000000071197e7a1CA5A2cb2AD82432B924F69B1E3dB123',
  domainPrice: '1', // APT
  domainPriceEth: '0.001', // ETH
};

export const UMI_NETWORK = {
  name: 'Umi Devnet',
  rpcUrl: UMI_CONFIG.rpcUrl,
  chainId: UMI_CONFIG.chainId,
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH', // MetaMask'ın beklediği symbol
    decimals: 18,
  },
  blockExplorerUrls: [UMI_CONFIG.explorerUrl],
};

// Domain pricing (in wei)
export const DOMAIN_PRICES = {
  1: 1000000000000000000n, // 1 year: 1 ETH
  2: 1800000000000000000n, // 2 years: 1.8 ETH
  3: 2500000000000000000n, // 3 years: 2.5 ETH
  5: 4000000000000000000n, // 5 years: 4 ETH
  10: 7000000000000000000n, // 10 years: 7 ETH
} as const;

// Registration duration options (in years)
export const REGISTRATION_DURATIONS = [1, 2, 3, 5, 10] as const;

export const MIN_REGISTRATION_YEARS = 1;
export const MAX_REGISTRATION_YEARS = 10; 