import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useWalletContext } from '@/contexts/WalletContext';
import { getUserDomains } from '@/api/hybridNameService';
import { Card } from '@/components/styled/Card';
import { theme } from '@/theme';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing[6]};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[8]};
`;

const Title = styled.h1`
  font-size: ${theme.fonts.size['3xl']};
  font-weight: ${theme.fonts.weight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
`;

const Subtitle = styled.p`
  font-size: ${theme.fonts.size.lg};
  color: ${theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;
`;

const ConnectPrompt = styled.div`
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  margin: ${theme.spacing[8]} 0;
  text-align: center;
  
  p {
    margin: 0;
    color: #856404;
    font-weight: ${theme.fonts.weight.medium};
    font-size: ${theme.fonts.size.lg};
  }
`;

const DomainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing[6]};
  margin-top: ${theme.spacing[6]};
`;

const DomainCard = styled(Card)`
  padding: ${theme.spacing[6]};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const DomainName = styled.h3`
  font-size: ${theme.fonts.size.xl};
  font-weight: ${theme.fonts.weight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[3]};
`;

const DomainInfo = styled.div`
  margin-bottom: ${theme.spacing[4]};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[2]};
  
  .label {
    font-size: ${theme.fonts.size.sm};
    color: ${theme.colors.text.secondary};
  }
  
  .value {
    font-size: ${theme.fonts.size.sm};
    font-weight: ${theme.fonts.weight.medium};
    color: ${theme.colors.text.primary};
  }
`;

const ChainBadge = styled.span<{ $chain: 'move' | 'evm' }>`
  display: inline-block;
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fonts.size.xs};
  font-weight: ${theme.fonts.weight.medium};
  background: ${({ $chain }) => 
    $chain === 'move' ? theme.colors.primary[100] : theme.colors.secondary[100]};
  color: ${({ $chain }) => 
    $chain === 'move' ? theme.colors.primary[700] : theme.colors.secondary[700]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing[12]};
  color: ${theme.colors.text.secondary};
  
  .icon {
    font-size: 4rem;
    margin-bottom: ${theme.spacing[4]};
  }
  
  h3 {
    font-size: ${theme.fonts.size.xl};
    margin-bottom: ${theme.spacing[2]};
    color: ${theme.colors.text.primary};
  }
  
  p {
    font-size: ${theme.fonts.size.lg};
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]};
  color: ${theme.colors.text.secondary};
`;

interface DomainData {
  move: string[];
  evm: string[];
  all: string[];
}

export const MyDomains: React.FC = () => {
  const { walletState } = useWalletContext();
  const [domains, setDomains] = useState<DomainData>({ move: [], evm: [], all: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = walletState.selectedChain && 
    ((walletState.selectedChain === 'move' && walletState.moveWallet.isConnected) || 
     (walletState.selectedChain === 'evm' && walletState.evmWallet.isConnected));

  const fetchUserDomains = async () => {
    if (!isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      const userAddress = walletState.selectedChain === 'move' 
        ? walletState.moveWallet.address! 
        : walletState.evmWallet.address!;

      const userDomains = await getUserDomains(userAddress);
      setDomains(userDomains);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch domains');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchUserDomains();
    }
  }, [isConnected, walletState.selectedChain]);

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
          <p>🔗 Connect your wallet to view your domains</p>
        </ConnectPrompt>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <Header>
          <Title>My Domains</Title>
          <Subtitle>View and manage your registered domains</Subtitle>
        </Header>
        
        <LoadingSpinner>
          <p>Loading your domains...</p>
        </LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>My Domains</Title>
          <Subtitle>View and manage your registered domains</Subtitle>
        </Header>
        
        <div style={{ textAlign: 'center', color: 'red', padding: theme.spacing[8] }}>
          <p>Error: {error}</p>
        </div>
      </Container>
    );
  }

  const allDomains = domains.all;
  const connectedChain = walletState.selectedChain;

  return (
    <Container>
      <Header>
        <Title>My Domains</Title>
        <Subtitle>
          View and manage your registered domains
          {connectedChain && (
            <span style={{ display: 'block', marginTop: theme.spacing[2], fontSize: theme.fonts.size.sm }}>
              Connected: <strong>{connectedChain.toUpperCase()}</strong> - {formatAddress(connectedChain === 'move' ? walletState.moveWallet.address! : walletState.evmWallet.address!)}
            </span>
          )}
        </Subtitle>
      </Header>

      {allDomains.length === 0 ? (
        <EmptyState>
          <div className="icon">🏠</div>
          <h3>No domains found</h3>
          <p>You haven't registered any domains yet. Start by searching for a domain name!</p>
        </EmptyState>
      ) : (
        <DomainGrid>
          {allDomains.map((domain, index) => (
            <DomainCard key={index}>
              <DomainName>{domain}.umi</DomainName>
              <DomainInfo>
                <InfoRow>
                  <span className="label">Chain:</span>
                  <ChainBadge $chain={connectedChain as 'move' | 'evm'}>
                    {connectedChain?.toUpperCase()}
                  </ChainBadge>
                </InfoRow>
                <InfoRow>
                  <span className="label">Owner:</span>
                  <span className="value">
                    {formatAddress(connectedChain === 'move' ? walletState.moveWallet.address! : walletState.evmWallet.address!)}
                  </span>
                </InfoRow>
                <InfoRow>
                  <span className="label">Status:</span>
                  <span className="value" style={{ color: theme.colors.success[600] }}>
                    Active
                  </span>
                </InfoRow>
              </DomainInfo>
            </DomainCard>
          ))}
        </DomainGrid>
      )}
    </Container>
  );
}; 