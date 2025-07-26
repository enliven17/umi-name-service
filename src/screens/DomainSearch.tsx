import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setSearchedDomain, setLoading, setError } from '@/store/slices/domainSlice';
import { Button } from '@/components/styled/Button';
import { Input } from '@/components/styled/Input';
import { Card } from '@/components/styled/Card';
import { checkDomainStatus } from '@/api/hybridNameService';
import { registerDomainWithMoveWallet } from '@/api/moveWalletService';
import { registerDomainWithEvmWallet } from '@/api/evmWalletService';
import { useWalletContext } from '@/contexts/WalletContext';
import { theme } from '@/theme';
import { ROUTES } from '@/constants/routes';

const SearchContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing[8]} ${theme.spacing[6]};
`;

const SearchHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[8]};
`;

const SearchTitle = styled.h1`
  font-size: ${theme.fonts.size['4xl']};
  font-weight: ${theme.fonts.weight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
`;

const SearchForm = styled.form`
  display: flex;
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[8]};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const SearchInput = styled(Input)`
  flex: 1;
  font-size: ${theme.fonts.size.lg};
`;

const DomainResult = styled(Card)`
  margin-top: ${theme.spacing[6]};
`;

const DomainHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing[4]};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing[3]};
  }
`;

const DomainName = styled.h2`
  font-size: ${theme.fonts.size['2xl']};
  font-weight: ${theme.fonts.weight.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const DomainStatus = styled.div<{ isAvailable: boolean }>`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.fonts.size.sm};
  font-weight: ${theme.fonts.weight.medium};
  background-color: ${({ isAvailable }) => 
    isAvailable ? theme.colors.success[100] : theme.colors.error[100]
  };
  color: ${({ isAvailable }) => 
    isAvailable ? theme.colors.success[700] : theme.colors.error[700]
  };
  border: 1px solid ${({ isAvailable }) => 
    isAvailable ? theme.colors.success[200] : theme.colors.error[200]
  };
`;

const DomainInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
`;

const InfoItem = styled.div`
  .label {
    font-size: ${theme.fonts.size.sm};
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing[1]};
  }
  
  .value {
    font-size: ${theme.fonts.size.base};
    color: ${theme.colors.text.primary};
    font-weight: ${theme.fonts.weight.medium};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error[500]};
  text-align: center;
  padding: ${theme.spacing[4]};
  background-color: ${theme.colors.error[50]};
  border: 1px solid ${theme.colors.error[200]};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing[4]};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing[8]};
  
  &::after {
    content: '';
    width: 32px;
    height: 32px;
    border: 3px solid ${theme.colors.neutral[200]};
    border-top: 3px solid ${theme.colors.primary[500]};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ConnectPrompt = styled.div`
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[4]};
  text-align: center;
  
  p {
    margin: 0;
    color: #856404;
    font-weight: ${theme.fonts.weight.medium};
  }
`;

const ChainSelector = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const ChainOption = styled.div<{ $selected: boolean }>`
  flex: 1;
  padding: ${theme.spacing[4]};
  border: 2px solid ${({ $selected }) => $selected ? theme.colors.primary[500] : theme.colors.neutral[200]};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${({ $selected }) => $selected ? theme.colors.primary[50] : 'white'};
  
  &:hover {
    border-color: ${theme.colors.primary[400]};
    background: ${theme.colors.primary[50]};
  }
  
  .chain-name {
    font-size: ${theme.fonts.size.lg};
    font-weight: ${theme.fonts.weight.bold};
    color: ${theme.colors.text.primary};
    margin-bottom: ${theme.spacing[2]};
  }
  
  .chain-description {
    font-size: ${theme.fonts.size.sm};
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing[2]};
  }
  
  .chain-price {
    font-size: ${theme.fonts.size.sm};
    font-weight: ${theme.fonts.weight.medium};
    color: ${theme.colors.primary[600]};
  }
`;

const RegisterButton = styled(Button)`
  width: 100%;
  margin-top: ${theme.spacing[4]};
  font-size: ${theme.fonts.size.lg};
  padding: ${theme.spacing[4]};
`;

const TransactionStatus = styled.div<{ $status: 'pending' | 'success' | 'error' | null }>`
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  margin-top: ${theme.spacing[4]};
  text-align: center;
  
  ${({ $status }) => {
    switch ($status) {
      case 'pending':
        return `
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #1e40af;
        `;
      case 'success':
        return `
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #15803d;
        `;
      case 'error':
        return `
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #dc2626;
        `;
      default:
        return '';
    }
  }}
`;

const DomainChainInfo = styled.div`
  background: ${theme.colors.neutral[50]};
  border: 1px solid ${theme.colors.neutral[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[3]};
  margin: ${theme.spacing[3]} 0;

  .chain-status {
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    margin-bottom: ${theme.spacing[2]};

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${theme.colors.success[500]};
    }

    .status-indicator.taken {
      background: ${theme.colors.error[500]};
    }
  }
`;

export const DomainSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { walletState } = useWalletContext();
  const { searchedDomain, isLoading, error } = useAppSelector((state: any) => state.domains);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState<'move' | 'evm' | null>(null);
  const [domainStatus, setDomainStatus] = useState<any>(null);
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const isConnected = walletState.selectedChain && 
    ((walletState.selectedChain === 'move' && walletState.moveWallet.isConnected) || 
     (walletState.selectedChain === 'evm' && walletState.evmWallet.isConnected));

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
      setDomainStatus(null);
      return;
    }

    setValidationError(null);
    dispatch(setLoading(true));
    dispatch(setError(null));
    setSelectedChain(null);
    setTransactionStatus(null);
    setTransactionHash(null);

    try {
      const status = await checkDomainStatus(term);
      setDomainStatus(status);
      
      const domainInfo = {
        name: term,
        isAvailable: status.isAvailable,
        owner: status.owner || '',
        resolver: '',
        price: status.isAvailable ? 'Choose chain' : 'N/A',
        expiryDate: null,
        moveAvailable: status.moveAvailable,
        evmAvailable: status.evmAvailable,
        registeredChain: status.registeredChain,
        prices: status.prices
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

  const handleChainSelect = (chain: 'move' | 'evm') => {
    setSelectedChain(chain);
  };

  const handleRegister = async () => {
    if (!selectedChain || !searchedDomain || !isConnected) return;

    // Cüzdan zinciri ile seçilen zincir uyumlu mu kontrol et
    if (walletState.selectedChain !== selectedChain) {
      alert(`Please connect your ${selectedChain.toUpperCase()} wallet first!`);
      return;
    }

    try {
      setTransactionStatus('pending');
      dispatch(setLoading(true));
      
      let txHash: string;
      
      if (selectedChain === 'move') {
        txHash = await registerDomainWithMoveWallet(searchedDomain.name, 1);
      } else {
        txHash = await registerDomainWithEvmWallet(searchedDomain.name, 1);
      }

      setTransactionHash(txHash);
      setTransactionStatus('success');
      console.log(`Domain registered on ${selectedChain.toUpperCase()}:`, txHash);
      
      // 5 saniye sonra domain durumunu yenile
      setTimeout(() => {
        handleSearch(searchTerm);
        setSelectedChain(null);
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
          <p>🔗 Connect your wallet to search and register domains</p>
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
        <LoadingSpinner />
      )}

      {searchedDomain && !isLoading && (
        <DomainResult>
          <DomainHeader>
            <DomainName>{searchedDomain.name}.umi</DomainName>
            <DomainStatus isAvailable={searchedDomain.isAvailable}>
              {searchedDomain.isAvailable ? 'Available' : 'Taken'}
            </DomainStatus>
          </DomainHeader>

          {searchedDomain.isAvailable && domainStatus && (
            <>
              <DomainChainInfo>
                <div className="chain-status">
                  <div className={`status-indicator ${domainStatus.moveAvailable ? '' : 'taken'}`} />
                  <span>MoveVM (APT): {domainStatus.moveAvailable ? 'Available' : 'Taken'}</span>
                </div>
                <div className="chain-status">
                  <div className={`status-indicator ${domainStatus.evmAvailable ? '' : 'taken'}`} />
                  <span>EVM (ETH): {domainStatus.evmAvailable ? 'Available' : 'Taken'}</span>
                </div>
              </DomainChainInfo>

              {!selectedChain ? (
                <ChainSelector>
                  <ChainOption 
                    $selected={selectedChain === 'move'} 
                    onClick={() => handleChainSelect('move')}
                    style={{ opacity: domainStatus.moveAvailable ? 1 : 0.5, cursor: domainStatus.moveAvailable ? 'pointer' : 'not-allowed' }}
                  >
                    <div className="chain-name">MoveVM</div>
                    <div className="chain-description">Register with APT</div>
                    <div className="chain-price">{domainStatus.prices?.apt || '0.1'} APT</div>
                  </ChainOption>
                  <ChainOption 
                    $selected={selectedChain === 'evm'} 
                    onClick={() => handleChainSelect('evm')}
                    style={{ opacity: domainStatus.evmAvailable ? 1 : 0.5, cursor: domainStatus.evmAvailable ? 'pointer' : 'not-allowed' }}
                  >
                    <div className="chain-name">EVM</div>
                    <div className="chain-description">Register with ETH</div>
                    <div className="chain-price">{domainStatus.prices?.eth || '0.01'} ETH</div>
                  </ChainOption>
                </ChainSelector>
              ) : (
                <div>
                  <p>Selected Chain: <strong>{selectedChain.toUpperCase()}</strong></p>
                  <p>Connected Wallet: <strong>{formatAddress(walletState.selectedChain === 'move' ? walletState.moveWallet.address! : walletState.evmWallet.address!)}</strong></p>
                  
                  <RegisterButton 
                    onClick={handleRegister}
                    disabled={walletState.selectedChain !== selectedChain}
                  >
                    Register Domain with {selectedChain === 'move' ? 'APT' : 'ETH'}
                  </RegisterButton>
                  
                  {walletState.selectedChain !== selectedChain && (
                    <p style={{ color: 'red', marginTop: '10px' }}>
                      Please connect your {selectedChain.toUpperCase()} wallet first!
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {!searchedDomain.isAvailable && domainStatus?.owner && (
            <div>
              <p><strong>Owner:</strong> {formatAddress(domainStatus.owner)}</p>
              <p><strong>Chain:</strong> {domainStatus.registeredChain?.toUpperCase()}</p>
            </div>
          )}
        </DomainResult>
      )}

      {transactionStatus && (
        <TransactionStatus $status={transactionStatus}>
          {transactionStatus === 'pending' && (
            <div>
              <p>⏳ Transaction pending...</p>
              <p>Please confirm in your wallet</p>
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