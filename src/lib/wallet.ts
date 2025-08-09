"use client";
import { createConfig, http } from 'wagmi';
import { injected } from '@wagmi/connectors';
import { umiDevnet } from './chain';

export const wagmiConfig = createConfig({
  chains: [umiDevnet],
  connectors: [injected()],
  transports: {
    [umiDevnet.id]: http(umiDevnet.rpcUrls.default.http[0]),
  },
});


