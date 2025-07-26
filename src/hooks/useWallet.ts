import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  error: string | null;
  isNetworkRequestPending: boolean;
  privateKey: string | null;
}

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: '0',
    error: null,
    isNetworkRequestPending: false,
    privateKey: null,
  });

  const connectWallet = useCallback(async () => {
    console.log('connectWallet called');
    
    if (!window.ethereum) {
      console.error('MetaMask is not installed');
      setState(prev => ({ ...prev, error: 'MetaMask is not installed' }));
      return;
    }

    try {
      console.log('Setting network request pending...');
      setState(prev => ({ ...prev, isNetworkRequestPending: true, error: null }));
      
      console.log('Requesting accounts...');
      
      // MetaMask'ın hazır olup olmadığını kontrol et
      if (!window.ethereum.isMetaMask) {
        throw new Error('MetaMask is not available');
      }

      // Extension context hatası için try-catch
      let accounts;
      try {
        accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
      } catch (error: any) {
        if (error.message.includes('Extension context invalidated')) {
          console.error('MetaMask extension context invalidated');
          setState(prev => ({ 
            ...prev, 
            error: 'MetaMask extension error. Please refresh the page and try again.',
            isNetworkRequestPending: false 
          }));
          return;
        }
        throw error;
      }

      console.log('Accounts received:', accounts);

      if (accounts.length === 0) {
        console.error('No accounts found');
        setState(prev => ({ 
          ...prev, 
          error: 'No accounts found',
          isNetworkRequestPending: false 
        }));
        return;
      }

      const account = accounts[0];
      console.log('Selected account:', account);
      
      console.log('Checking chain ID...');
      let chainId;
      try {
        chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });
      } catch (error: any) {
        if (error.message.includes('Extension context invalidated')) {
          console.error('MetaMask extension context invalidated during chain check');
          setState(prev => ({ 
            ...prev, 
            error: 'MetaMask extension error. Please refresh the page and try again.',
            isNetworkRequestPending: false 
          }));
          return;
        }
        throw error;
      }

      console.log('Current chain ID:', chainId);

      if (chainId !== '0xa455') { // 42069 in hex
        console.log('Switching to Umi Devnet...');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xa455' }],
          });
          console.log('Successfully switched to Umi Devnet');
        } catch (switchError: any) {
          console.log('Switch error:', switchError);
          if (switchError.code === 4902) {
            console.log('Adding Umi Devnet...');
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xa455',
                    chainName: 'Umi Devnet',
                    nativeCurrency: {
                      name: 'Ether',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://devnet.umi.network'],
                    blockExplorerUrls: ['https://devnet.explorer.moved.network'],
                  },
                ],
              });
              console.log('Successfully added Umi Devnet');
            } catch (addError) {
              console.error('Failed to add Umi Devnet:', addError);
              setState(prev => ({ 
                ...prev, 
                error: 'Failed to add Umi Devnet',
                isNetworkRequestPending: false 
              }));
              return;
            }
          } else {
            console.error('Failed to switch to Umi Devnet:', switchError);
            setState(prev => ({ 
              ...prev, 
              error: 'Failed to switch to Umi Devnet',
              isNetworkRequestPending: false 
            }));
            return;
          }
        }
      }

      console.log('Getting balance...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(account);
      const balanceInEth = ethers.formatEther(balance);
      console.log('Balance:', balanceInEth);

      console.log('Setting connected state...');
      setState({
        isConnected: true,
        address: account,
        balance: balanceInEth,
        error: null,
        isNetworkRequestPending: false,
        privateKey: null,
      });

      console.log('Wallet connected successfully');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      let errorMessage = 'Failed to connect wallet';
      
      if (error.message.includes('Extension context invalidated')) {
        errorMessage = 'MetaMask extension error. Please refresh the page and try again.';
      } else if (error.message.includes('User rejected')) {
        errorMessage = 'Connection was rejected by user';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isNetworkRequestPending: false 
      }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    console.log('Disconnecting wallet...');
    setState({
      isConnected: false,
      address: null,
      balance: '0',
      error: null,
      isNetworkRequestPending: false,
      privateKey: null,
    });
  }, []);

  // Sayfa yüklendiğinde mevcut bağlantıyı kontrol et
  useEffect(() => {
    const checkExistingConnection = async () => {
      console.log('Checking existing connection...');
      if (!window.ethereum) {
        console.log('No MetaMask found');
        return;
      }

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        console.log('Existing accounts:', accounts);
        if (accounts.length > 0) {
          console.log('Found existing connection, connecting...');
          connectWallet();
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
        // Extension context hatası durumunda sessizce geç
        if (error instanceof Error && error.message.includes('Extension context invalidated')) {
          console.log('MetaMask extension context invalidated during initial check');
        }
      }
    };

    checkExistingConnection();
  }, [connectWallet]);

  // MetaMask event listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (state.address && accounts[0] !== state.address) {
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      console.log('Chain changed, reloading...');
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [state.address, connectWallet, disconnectWallet]);

  console.log('Wallet state:', state);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
  };
}; 