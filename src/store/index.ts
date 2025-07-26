import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './slices/walletSlice';
import domainReducer from './slices/domainSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    domains: domainReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['wallet/setProvider', 'wallet/setSigner'],
        ignoredPaths: ['wallet.provider', 'wallet.signer'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 