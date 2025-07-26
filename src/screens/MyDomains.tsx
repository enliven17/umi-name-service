import React, { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { getUserDomains } from '@/api/moveNameService';
import styled from 'styled-components';
import { theme } from '@/theme';

const Container = styled.div`
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, 
    ${theme.colors.primary[50]} 0%, 
    ${theme.colors.secondary[50]} 50%, 
    ${theme.colors.primary[100]} 100%);
  padding: ${theme.spacing[8]} ${theme.spacing[6]};
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    pointer-events: none;
  }
`;

const Content = styled.div`
  max-width: 800px;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${theme.borderRadius.xl};
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: ${theme.spacing[8]};
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.8s ease-out;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Title = styled.h2`
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: ${theme.fonts.weight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[6]};
  text-align: center;
  background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.secondary[600]});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const DomainList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const DomainItem = styled.li`
  font-size: ${theme.fonts.size.lg};
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[3]};
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid ${theme.colors.neutral[200]};
  border-radius: ${theme.borderRadius.lg};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.secondary[500]});
    transition: width 0.3s ease;
  }
  
  &:hover {
    transform: translateX(8px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    border-color: ${theme.colors.primary[300]};
    
    &::before {
      width: 8px;
    }
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[12]};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${theme.colors.neutral[200]};
  border-top: 4px solid ${theme.colors.primary[500]};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: ${theme.spacing[4]};
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fonts.size.lg};
  margin: 0;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]};
`;

const ErrorMessage = styled.p`
  color: ${theme.colors.error[600]};
  font-size: ${theme.fonts.size.lg};
  background: rgba(239, 68, 68, 0.1);
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid rgba(239, 68, 68, 0.3);
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing[12]};
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, ${theme.colors.neutral[200]}, ${theme.colors.neutral[300]});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[6]};
  font-size: ${theme.fonts.size['3xl']};
  color: ${theme.colors.neutral[500]};
`;

const EmptyText = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fonts.size.lg};
  margin: 0;
`;

const ConnectPrompt = styled.div`
  text-align: center;
  padding: ${theme.spacing[12]};
`;

const ConnectText = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fonts.size.xl};
  margin: 0;
  background: linear-gradient(135deg, ${theme.colors.warning[50]}, ${theme.colors.warning[100]});
  padding: ${theme.spacing[6]} ${theme.spacing[8]};
  border-radius: ${theme.borderRadius.xl};
  border: 2px solid ${theme.colors.warning[200]};
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
`;

export const MyDomains: React.FC = () => {
  const { isConnected, address } = useWallet();
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      setLoading(true);
      getUserDomains(address)
        .then(setDomains)
        .catch((err) => setError(err.message || 'Failed to fetch domains'))
        .finally(() => setLoading(false));
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <Container>
        <Content>
          <ConnectPrompt>
            <ConnectText>🔗 Please connect your wallet to view your domains</ConnectText>
          </ConnectPrompt>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <Title>My Domains</Title>
        
        {loading && (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading your domains...</LoadingText>
          </LoadingContainer>
        )}
        
        {error && (
          <ErrorContainer>
            <ErrorMessage>❌ {error}</ErrorMessage>
          </ErrorContainer>
        )}
        
        {domains.length === 0 && !loading && !error && (
          <EmptyState>
            <EmptyIcon>🏠</EmptyIcon>
            <EmptyText>You don't own any domains yet.</EmptyText>
            <EmptyText style={{ marginTop: theme.spacing[2], fontSize: theme.fonts.size.base }}>
              Start by searching for a domain name on the home page!
            </EmptyText>
          </EmptyState>
        )}
        
        {domains.length > 0 && !loading && (
          <DomainList>
            {domains.map((domain, index) => (
              <DomainItem 
                key={domain}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                🌐 {domain}.umi
              </DomainItem>
            ))}
          </DomainList>
        )}
      </Content>
    </Container>
  );
}; 