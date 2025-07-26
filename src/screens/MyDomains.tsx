import React, { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { getUserDomains } from '@/api/moveNameService';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
  margin: 40px auto;
  padding: 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 24px;
`;

const DomainList = styled.ul`
  list-style: none;
  padding: 0;
`;

const DomainItem = styled.li`
  font-size: 1.2rem;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
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
    return <Container><Title>Please connect your wallet</Title></Container>;
  }

  return (
    <Container>
      <Title>My Domains</Title>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {domains.length === 0 && !loading && <p>You don't own any domains yet.</p>}
      <DomainList>
        {domains.map((domain) => (
          <DomainItem key={domain}>{domain}.umi</DomainItem>
        ))}
      </DomainList>
    </Container>
  );
}; 