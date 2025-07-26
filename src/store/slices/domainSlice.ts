import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DomainState, DomainInfo } from '@/types';

const initialState: DomainState = {
  ownedDomains: [],
  searchedDomain: null,
  isLoading: false,
  error: null,
};

const domainSlice = createSlice({
  name: 'domains',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSearchedDomain: (state, action: PayloadAction<DomainInfo | null>) => {
      state.searchedDomain = action.payload;
    },
    setOwnedDomains: (state, action: PayloadAction<DomainInfo[]>) => {
      state.ownedDomains = action.payload;
    },
    addOwnedDomain: (state, action: PayloadAction<DomainInfo>) => {
      state.ownedDomains.push(action.payload);
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setSearchedDomain,
  setOwnedDomains,
  addOwnedDomain,
  setError,
  clearError,
} = domainSlice.actions;

export default domainSlice.reducer; 