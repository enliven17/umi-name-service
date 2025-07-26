import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

interface EvmWalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  error: string | null;
}

export function useEvmWallet() {
  const [state, setState] = useState<EvmWalletState>({
    isConnected: false,
    address: null,
    balance: '0',
    error: null,
  });

  const connectEvmWallet = useCallback(async () => {
    if (!(window as any).ethereum) {
      setState(s => ({ ...s, error: 'MetaMask yüklü değil.' }));
      return;
    }
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        setState(s => ({ ...s, error: 'Hesap bulunamadı.' }));
        return;
      }
      const address = accounts[0];
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const balance = await provider.getBalance(address);
      setState({ isConnected: true, address, balance: ethers.formatEther(balance), error: null });
    } catch (e: any) {
      setState(s => ({ ...s, error: e.message || 'Bağlantı hatası' }));
    }
  }, []);

  const disconnectEvmWallet = useCallback(() => {
    setState({ isConnected: false, address: null, balance: '0', error: null });
  }, []);

  return {
    ...state,
    connectEvmWallet,
    disconnectEvmWallet,
  };
} 