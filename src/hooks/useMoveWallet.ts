import { useState, useCallback } from 'react';

interface MoveWalletState {
  isConnected: boolean;
  address: string | null;
  error: string | null;
}

export function useMoveWallet() {
  const [state, setState] = useState<MoveWalletState>({
    isConnected: false,
    address: null,
    error: null,
  });

  const connectMoveWallet = useCallback(async () => {
    if (!(window as any).aptos) {
      setState(s => ({ ...s, error: 'Petra veya Martian cüzdanı yüklü değil.' }));
      return;
    }
    try {
      const response = await (window as any).aptos.connect();
      if (response && response.address) {
        setState({ isConnected: true, address: response.address, error: null });
      } else {
        setState(s => ({ ...s, error: 'Cüzdan adresi alınamadı.' }));
      }
    } catch (e: any) {
      setState(s => ({ ...s, error: e.message || 'Bağlantı hatası' }));
    }
  }, []);

  const disconnectMoveWallet = useCallback(() => {
    setState({ isConnected: false, address: null, error: null });
  }, []);

  return {
    ...state,
    connectMoveWallet,
    disconnectMoveWallet,
  };
} 