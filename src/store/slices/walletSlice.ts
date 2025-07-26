import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WalletState } from '@/types';

const initialState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  balance: null,
  isConnecting: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
    },
    setConnected: (state, action: PayloadAction<{ address: string; chainId: number }>) => {
      state.isConnected = true;
      state.address = action.payload.address;
      state.chainId = action.payload.chainId;
      state.isConnecting = false;
      state.error = null;
    },
    setDisconnected: (state) => {
      state.isConnected = false;
      state.address = null;
      state.chainId = null;
      state.balance = null;
      state.isConnecting = false;
      state.error = null;
    },
    setBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isConnecting = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setConnecting,
  setConnected,
  setDisconnected,
  setBalance,
  setError,
  clearError,
} = walletSlice.actions;

export default walletSlice.reducer; 