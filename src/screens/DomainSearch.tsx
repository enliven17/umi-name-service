import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedDomain, setLoading, setError } from '@/store/slices/domainSlice';
import { checkDomainStatus, registerDomainWithEvmWallet } from '@/api/hybridNameService';
import { useWalletContext } from '@/contexts/WalletContext';
import { Button } from '@/components/styled/Button';
import { Input } from '@/components/styled/Input';

const SearchContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const SearchHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const SearchTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SearchInput = styled(Input)`
  flex: 1;
`;

const ConnectPrompt = styled.div`
  text-align: center;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
  margin-bottom: 2rem;

  p {
    font-size: 1.1rem;
    color: #64748b;
    margin: 0;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  margin-bottom: 1rem;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: #64748b;
`;

const DomainResult = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const DomainHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const DomainName = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const DomainStatus = styled.div<{ $isAvailable: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  background-color: ${({ $isAvailable }) =>
    $isAvailable ? '#dcfce7' : '#fef2f2'
  };
  color: ${({ $isAvailable }) =>
    $isAvailable ? '#166534' : '#dc2626'
  };
  border: 1px solid ${({ $isAvailable }) =>
    $isAvailable ? '#bbf7d0' : '#fecaca'
  };
`;

const RegisterButton = styled(Button)`
  width: 100%;
  margin-top: 1rem;
`;

const TransactionStatus = styled.div<{ $status: 'pending' | 'success' | 'error' }>`
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
  
  ${({ $status }) => {
    switch ($status) {
      case 'pending':
        return `
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        `;
      case 'success':
        return `
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        `;
      case 'error':
        return `
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        `;
    }
  }}
`;

export const DomainSearch: React.FC = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { walletState } = useWalletContext();
  
  const { searchedDomain, isLoading, error } = useSelector((state: any) => state.domains);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const isConnected = walletState.selectedChain === 'evm' && walletState.evmWallet.isConnected;

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    }
  }, [searchTerm]);

  const validateDomainName = (name: string) => {
    if (!name.trim()) {
      return { isValid: false, error: 'Domain name is required' };
    }
    
    if (name.length < 3) {
      return { isValid: false, error: 'Domain name must be at least 3 characters long' };
    }
    
    if (name.length > 20) {
      return { isValid: false, error: 'Domain name must be less than 20 characters long' };
    }
    
    const validChars = /^[a-zA-Z0-9-]+$/;
    if (!validChars.test(name)) {
      return { isValid: false, error: 'Domain name can only contain letters, numbers, and hyphens' };
    }
    
    if (name.startsWith('-') || name.endsWith('-')) {
      return { isValid: false, error: 'Domain name cannot start or end with a hyphen' };
    }
    
    return { isValid: true, error: null };
  };

  const handleSearch = async (term: string) => {
    if (!term.trim()) return;

    const validation = validateDomainName(term);
    if (!validation.isValid) {
      setValidationError(validation.error);
      dispatch(setSearchedDomain(null));
      return;
    }

    setValidationError(null);
    dispatch(setLoading(true));
    dispatch(setError(null));
    setTransactionStatus(null);
    setTransactionHash(null);

    try {
      const status = await checkDomainStatus(term);
      
              const domainInfo = {
          name: term,
          isAvailable: status.isAvailable,
          owner: status.owner || '',
          resolver: '',
          price: status.price,
          expiryDate: null,
          registeredChain: status.registeredChain
        };

      dispatch(setSearchedDomain(domainInfo));
    } catch (err: any) {
      dispatch(setError(err.message || 'Failed to search domain'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleRegister = async () => {
    if (!searchedDomain || !isConnected) return;

    try {
      setTransactionStatus('pending');
      dispatch(setLoading(true));
      
      const txHash = await registerDomainWithEvmWallet(searchedDomain.name);

      setTransactionHash(txHash);
      setTransactionStatus('success');
      console.log('Domain registered on EVM:', txHash);
      
      // 5 saniye sonra domain durumunu yenile
      setTimeout(() => {
        handleSearch(searchTerm);
        setTransactionStatus(null);
        setTransactionHash(null);
      }, 5000);
      
    } catch (err: any) {
      setTransactionStatus('error');
      dispatch(setError(err.message || 'Failed to register domain'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <SearchContainer>
      <SearchHeader>
        <SearchTitle>Search Domain</SearchTitle>
      </SearchHeader>

      {!isConnected && (
        <ConnectPrompt>
          <p>🔗 Connect your MetaMask wallet to search and register domains</p>
        </ConnectPrompt>
      )}

      <SearchForm onSubmit={handleSubmit}>
        <SearchInput
          type="text"
          placeholder="Enter domain name (e.g., myname)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          $fullWidth
          disabled={!isConnected}
        />
        <Button type="submit" disabled={!searchTerm.trim() || !isConnected}>
          Search
        </Button>
      </SearchForm>

      {validationError && (
        <ErrorMessage>{validationError}</ErrorMessage>
      )}

      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}

      {isLoading && (
        <LoadingSpinner>Searching domain...</LoadingSpinner>
      )}

      {searchedDomain && !isLoading && (
        <DomainResult>
          <DomainHeader>
            <DomainName>{searchedDomain.name}.umi</DomainName>
            <DomainStatus $isAvailable={searchedDomain.isAvailable}>
              {searchedDomain.isAvailable ? 'Available' : 'Taken'}
            </DomainStatus>
          </DomainHeader>

          {searchedDomain.isAvailable && (
            <div>
              <p><strong>Price:</strong> {searchedDomain.price} ETH</p>
              <p><strong>Connected Wallet:</strong> {formatAddress(walletState.evmWallet.address!)}</p>
              
              <RegisterButton 
                onClick={handleRegister}
                disabled={!isConnected}
              >
                Register Domain with ETH
              </RegisterButton>
              
              {!isConnected && (
                <p style={{ color: 'red', marginTop: '10px' }}>
                  Please connect your MetaMask wallet first!
                </p>
              )}
            </div>
          )}

          {!searchedDomain.isAvailable && searchedDomain.owner && (
            <div>
              <p><strong>Owner:</strong> {formatAddress(searchedDomain.owner)}</p>
              <p><strong>Chain:</strong> EVM</p>
            </div>
          )}
        </DomainResult>
      )}

      {transactionStatus && (
        <TransactionStatus $status={transactionStatus}>
          {transactionStatus === 'pending' && (
            <div>
              <p>⏳ Transaction pending...</p>
              <p>Please confirm in your MetaMask wallet</p>
            </div>
          )}
          {transactionStatus === 'success' && (
            <div>
              <p>✅ Transaction successful!</p>
              <p>Hash: {transactionHash}</p>
            </div>
          )}
          {transactionStatus === 'error' && (
            <div>
              <p>❌ Transaction failed</p>
              <p>Please try again</p>
            </div>
          )}
        </TransactionStatus>
      )}
    </SearchContainer>
  );
}; 