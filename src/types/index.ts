// Wallet and Web3 types
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
}

// Name Service types
export interface DomainInfo {
  name: string;
  owner: string;
  resolver: string;
  expiryDate: Date | null;
  isAvailable: boolean;
  price: string;
}

export interface RegistrationRequest {
  name: string;
  owner: string;
  duration: number; // in years
}

// Redux store types
export interface RootState {
  wallet: WalletState;
  domains: DomainState;
  ui: UIState;
}

export interface DomainState {
  ownedDomains: DomainInfo[];
  searchedDomain: DomainInfo | null;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  theme: 'light' | 'dark';
  isLoading: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Umi Network configuration
export interface UmiConfig {
  rpcUrl: string;
  chainId: number;
  explorerUrl: string;
  contractAddress: string;
} 