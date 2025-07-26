import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WalletState {
  selectedChain: 'evm' | null;
  evmWallet: {
    isConnected: boolean;
    address: string | null;
  };
}

interface WalletContextType {
  walletState: WalletState;
  setSelectedChain: (chain: 'evm' | null) => void;
  setEvmWallet: (wallet: { isConnected: boolean; address: string | null }) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    selectedChain: null,
    evmWallet: { isConnected: false, address: null },
  });

  const setSelectedChain = (chain: 'evm' | null) => {
    setWalletState(prev => ({ ...prev, selectedChain: chain }));
  };

  const setEvmWallet = (wallet: { isConnected: boolean; address: string | null }) => {
    setWalletState(prev => ({ ...prev, evmWallet: wallet }));
  };

  const disconnect = () => {
    setWalletState({
      selectedChain: null,
      evmWallet: { isConnected: false, address: null },
    });
  };

  const value: WalletContextType = {
    walletState,
    setSelectedChain,
    setEvmWallet,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}; 