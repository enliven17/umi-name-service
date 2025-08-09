import { defineChain } from 'viem';

export const umiDevnet = defineChain({
  id: 42069,
  name: 'UMI Devnet',
  network: 'umi-devnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://devnet.uminetwork.com'] },
    public: { http: ['https://devnet.uminetwork.com'] },
  },
  blockExplorers: {
    default: { name: 'UMI Explorer', url: 'https://devnet.explorer.moved.network' },
  },
});


