import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setSearchedDomain, setLoading, setError } from '@/store/slices/domainSlice';
import { Button } from '@/components/styled/Button';
import { Input } from '@/components/styled/Input';
import { Card } from '@/components/styled/Card';
import { isDomainAvailable, getDomainOwner } from '@/api/moveNameService';
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

export const DomainSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isConnected, address } = useWallet();
  const { searchedDomain, isLoading, error } = useAppSelector((state: any) => state.domains);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [validationError, setValidationError] = useState<string | null>(null);

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
    
    // Sadece harf, rakam ve tire kabul et
    const validChars = /^[a-zA-Z0-9-]+$/;
    if (!validChars.test(name)) {
      return { isValid: false, error: 'Domain name can only contain letters, numbers, and hyphens' };
    }
    
    // Tire ile başlayamaz veya bitemez
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

    try {
      // Move kontratından domain bilgilerini çek
      const [isAvailable, owner] = await Promise.all([
        isDomainAvailable(term),
        getDomainOwner(term)
      ]);

      const domainInfo = {
        name: term,
        isAvailable,
        owner: owner || '',
        resolver: '', // Henüz resolver fonksiyonu yok
        price: '1', // Sabit fiyat, gerçek uygulamada kontrat'tan çekilebilir
        expiryDate: null // Henüz expiry date fonksiyonu yok
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
    if (searchTerm.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleRegister = () => {
    if (searchedDomain && isConnected) {
      navigate(`${ROUTES.REGISTER}?name=${encodeURIComponent(searchedDomain.name)}`);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <SearchContainer>
      <SearchHeader>
        <SearchTitle>Search Domain</SearchTitle>
      </SearchHeader>

      <SearchForm onSubmit={handleSubmit}>
        <SearchInput
          type="text"
          placeholder="Enter domain name (e.g., myname)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        <Button type="submit" disabled={!searchTerm.trim()}>
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

          <DomainInfo>
            <InfoItem>
              <div className="label">Owner</div>
              <div className="value">
                {searchedDomain.owner 
                  ? formatAddress(searchedDomain.owner)
                  : 'No owner'
                }
              </div>
            </InfoItem>
            
            <InfoItem>
              <div className="label">Registration Price</div>
              <div className="value">{searchedDomain.price} ETH</div>
            </InfoItem>
          </DomainInfo>

          <ActionButtons>
            {searchedDomain.isAvailable ? (
              <Button
                onClick={handleRegister}
                disabled={!isConnected}
                fullWidth
              >
                {isConnected ? 'Register Domain' : 'Connect Wallet to Register'}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.HOME)}
                fullWidth
              >
                Search Another Domain
              </Button>
            )}
          </ActionButtons>
        </DomainResult>
      )}
    </SearchContainer>
  );
}; 