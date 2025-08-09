"use client";
import { createPublicClient, createWalletClient, custom, defineChain } from 'viem';
import { publicActionsL2, walletActionsL2 } from 'viem/op-stack';
import { UMI_DEVNET } from '@/config/umi';

export const umiChain = defineChain({
  id: UMI_DEVNET.id,
  name: UMI_DEVNET.name,
  nativeCurrency: UMI_DEVNET.nativeCurrency,
  sourceId: UMI_DEVNET.id,
  rpcUrls: { default: { http: [UMI_DEVNET.rpcUrl] } },
});

export const publicClient = () =>
  createPublicClient({ chain: umiChain, transport: custom(window.ethereum!) }).extend(publicActionsL2());

export const walletClient = () =>
  createWalletClient({ chain: umiChain, transport: custom(window.ethereum!) }).extend(walletActionsL2());
