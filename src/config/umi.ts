import { UmiConfig } from '@/types';

export const UMI_CONFIG: UmiConfig = {
  rpcUrl: 'https://devnet.uminetwork.com',
  chainId: 42069,
  explorerUrl: 'https://devnet.explorer.moved.network',
  contractAddress: '0x0000000000000000000000000000000000000000', // Placeholder - will be updated with actual contract
};

export const UMI_NETWORK = {
  name: 'Umi Devnet',
  rpcUrl: UMI_CONFIG.rpcUrl,
  chainId: UMI_CONFIG.chainId,
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: [UMI_CONFIG.explorerUrl],
};

export const DOMAIN_PRICES = {
  '3': '0.01', // 3 characters
  '4': '0.005', // 4 characters
  '5': '0.002', // 5 characters
  '6+': '0.001', // 6+ characters
};

export const MIN_REGISTRATION_YEARS = 1;
export const MAX_REGISTRATION_YEARS = 10; 