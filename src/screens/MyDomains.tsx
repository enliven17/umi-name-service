import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useWalletContext } from '@/contexts/WalletContext';
import { getUserDomains } from '@/api/hybridNameService';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
`;

const ConnectPrompt = styled.div`
  text-align: center;
  padding: 3rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;

  p {
    font-size: 1.2rem;
    color: #64748b;
    margin: 0;
  }
`;

const WalletInfo = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;

  h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.2rem;
  }

  p {
    margin: 0.5rem 0;
    color: #666;
  }
`;

const ChainBadge = styled.span`
  background: #10b981;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const DomainsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const DomainCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const DomainName = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  margin: 0 0 1rem 0;
`;

const DomainInfo = styled.div`
  p {
    margin: 0.5rem 0;
    color: #666;
    font-size: 0.875rem;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 3rem;
  color: #64748b;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  margin-bottom: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #64748b;

  h3 {
    margin: 0 0 1rem 0;
    color: #333;
  }

  p {
    margin: 0;
  }
`;

export const MyDomains: React.FC = () => {
  const { walletState } = useWalletContext();
  const [domains, setDomains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = walletState.selectedChain === 'evm' && walletState.evmWallet.isConnected;

  useEffect(() => {
    if (isConnected && walletState.evmWallet.address) {
      fetchDomains();
    }
  }, [isConnected, walletState.evmWallet.address]);

  const fetchDomains = async () => {
    if (!walletState.evmWallet.address) return;

    setIsLoading(true);
    setError(null);

    try {
      const userDomains = await getUserDomains(walletState.evmWallet.address);
      setDomains(userDomains);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch domains');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Container>
        <Header>
          <Title>My Domains</Title>
          <Subtitle>View and manage your registered domains</Subtitle>
        </Header>
        <ConnectPrompt>
          <p>🔗 Please connect your MetaMask wallet to view your domains</p>
        </ConnectPrompt>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>My Domains</Title>
        <Subtitle>View and manage your registered domains</Subtitle>
      </Header>

      <WalletInfo>
        <h3>Connected Wallet</h3>
        <p>
          <ChainBadge>EVM</ChainBadge>
          {formatAddress(walletState.evmWallet.address!)}
        </p>
      </WalletInfo>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {isLoading ? (
        <LoadingSpinner>Loading your domains...</LoadingSpinner>
      ) : domains.length === 0 ? (
        <EmptyState>
          <h3>No domains found</h3>
          <p>You haven't registered any domains yet. Start by searching for a domain!</p>
        </EmptyState>
      ) : (
        <DomainsGrid>
          {domains.map((domain, index) => (
            <DomainCard key={index}>
              <DomainName>{domain}.umi</DomainName>
              <DomainInfo>
                <p><strong>Chain:</strong> EVM</p>
                <p><strong>Owner:</strong> {formatAddress(walletState.evmWallet.address!)}</p>
              </DomainInfo>
            </DomainCard>
          ))}
        </DomainsGrid>
      )}
    </Container>
  );
}; 