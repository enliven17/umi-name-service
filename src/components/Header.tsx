import React from 'react';
import styled from 'styled-components';
import { useWallet } from '@/hooks/useWallet';
import { Button } from './styled/Button';
import { theme } from '@/theme';
import { ROUTES } from '@/constants/routes';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  background-color: ${theme.colors.background.primary};
  border-bottom: 1px solid ${theme.colors.neutral[200]};
  box-shadow: ${theme.shadows.sm};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  
  h1 {
    font-size: ${theme.fonts.size['2xl']};
    font-weight: ${theme.fonts.weight.bold};
    color: ${theme.colors.primary[500]};
    margin: 0;
  }
  
  .logo-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.secondary[500]});
    border-radius: ${theme.borderRadius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: ${theme.fonts.weight.bold};
  }
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  
  .address {
    font-family: ${theme.fonts.family.mono};
    font-size: ${theme.fonts.size.sm};
    color: ${theme.colors.text.secondary};
    background-color: ${theme.colors.neutral[100]};
    padding: ${theme.spacing[1]} ${theme.spacing[2]};
    border-radius: ${theme.borderRadius.md};
  }
  
  .balance {
    font-size: ${theme.fonts.size.sm};
    color: ${theme.colors.text.secondary};
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error[500]};
  font-size: ${theme.fonts.size.sm};
  margin-right: ${theme.spacing[3]};
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
  margin-right: ${theme.spacing[4]};
`;

const NavLink = styled.a`
  color: ${theme.colors.text.primary};
  text-decoration: none;
  font-weight: ${theme.fonts.weight.medium};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${theme.colors.neutral[100]};
  }
`;

export const Header: React.FC = () => {
  const { isConnected, address, balance, error, connectWallet, disconnectWallet } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <HeaderContainer>
      <Logo>
        <div className="logo-icon">U</div>
        <h1>Umi Name Service</h1>
      </Logo>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {isConnected && (
          <Navigation>
            <NavLink href={ROUTES.MY_DOMAINS}>My Domains</NavLink>
          </Navigation>
        )}
        
        {isConnected ? (
          <WalletInfo>
            <div className="balance">{balance} ETH</div>
            <div className="address">{formatAddress(address!)}</div>
            <Button variant="outline" size="sm" onClick={disconnectWallet}>
              Disconnect
            </Button>
          </WalletInfo>
        ) : (
          <Button onClick={connectWallet} disabled={false}>
            Connect Wallet
          </Button>
        )}
      </div>
    </HeaderContainer>
  );
}; 