import { useEffect } from 'react';
import { ethers } from 'ethers';
import { useAppDispatch, useAppSelector } from './redux';
import {
  setConnecting,
  setConnected,
  setDisconnected,
  setBalance,
  setError,
} from '@/store/slices/walletSlice';
import { UMI_CONFIG } from '@/config/umi';

export const useWallet = () => {
  const dispatch = useAppDispatch();
  const wallet = useAppSelector((state) => state.wallet);

  const connectWallet = async () => {
    try {
      dispatch(setConnecting(true));
      dispatch(setError(null));

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const account = accounts[0];

      if (!account) {
        throw new Error('No accounts found');
      }

      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      if (chainId !== UMI_CONFIG.chainId) {
        // Try to switch to Umi network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${UMI_CONFIG.chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${UMI_CONFIG.chainId.toString(16)}`,
                  chainName: 'Umi Devnet',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: [UMI_CONFIG.rpcUrl],
                  blockExplorerUrls: [UMI_CONFIG.explorerUrl],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      const balance = await provider.getBalance(account);
      const balanceInEth = ethers.formatEther(balance);

      dispatch(setConnected({ address: account, chainId }));
      dispatch(setBalance(balanceInEth));

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          dispatch(setDisconnected());
        } else {
          dispatch(setConnected({ address: accounts[0], chainId }));
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        if (Number(chainId) !== UMI_CONFIG.chainId) {
          dispatch(setError('Please switch to Umi Devnet'));
        }
      });

    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to connect wallet'));
    }
  };

  const disconnectWallet = () => {
    dispatch(setDisconnected());
  };

  const refreshBalance = async () => {
    if (!wallet.address) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(wallet.address);
      const balanceInEth = ethers.formatEther(balance);
      dispatch(setBalance(balanceInEth));
    } catch (error: any) {
      console.error('Failed to refresh balance:', error);
    }
  };

  useEffect(() => {
    // Check if wallet is already connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          connectWallet();
        }
      });
    }
  }, []);

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  };
}; 