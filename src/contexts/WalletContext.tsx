import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WalletState {
  selectedChain: 'move' | 'evm' | null;
  moveWallet: {
    isConnected: boolean;
    address: string | null;
  };
  evmWallet: {
    isConnected: boolean;
    address: string | null;
    balance: string;
  };
}

interface WalletContextType {
  walletState: WalletState;
  setSelectedChain: (chain: 'move' | 'evm' | null) => void;
  setMoveWallet: (wallet: { isConnected: boolean; address: string | null }) => void;
  setEvmWallet: (wallet: { isConnected: boolean; address: string | null; balance: string }) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    selectedChain: null,
    moveWallet: { isConnected: false, address: null },
    evmWallet: { isConnected: false, address: null, balance: '0' },
  });

  const setSelectedChain = (chain: 'move' | 'evm' | null) => {
    setWalletState(prev => ({ ...prev, selectedChain: chain }));
  };

  const setMoveWallet = (wallet: { isConnected: boolean; address: string | null }) => {
    setWalletState(prev => ({ ...prev, moveWallet: wallet }));
  };

  const setEvmWallet = (wallet: { isConnected: boolean; address: string | null; balance: string }) => {
    setWalletState(prev => ({ ...prev, evmWallet: wallet }));
  };

  const disconnect = () => {
    setWalletState({
      selectedChain: null,
      moveWallet: { isConnected: false, address: null },
      evmWallet: { isConnected: false, address: null, balance: '0' },
    });
  };

  return (
    <WalletContext.Provider value={{
      walletState,
      setSelectedChain,
      setMoveWallet,
      setEvmWallet,
      disconnect,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}; 