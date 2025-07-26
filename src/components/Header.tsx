import React from 'react';
import styled from 'styled-components';
import { useWallet } from '@/hooks/useWallet';
import { Button } from './styled/Button';
import { theme } from '@/theme';
import { ROUTES } from '@/constants/routes';
import logo2 from '@/assets/logo2.png';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.secondary[600]});
  color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  
  h1 {
    font-size: ${theme.fonts.size.xl};
    font-weight: ${theme.fonts.weight.bold};
    color: white;
    margin: 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  .logo-icon {
    width: 32px;
    height: 32px;
    border-radius: ${theme.borderRadius.lg};
    object-fit: cover;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[6]};
  margin-right: ${theme.spacing[6]};
`;

const NavLink = styled.a`
  color: white;
  text-decoration: none;
  font-weight: ${theme.fonts.weight.medium};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transition: left 0.3s ease;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    
    &::before {
      left: 0;
    }
  }
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  background: rgba(255, 255, 255, 0.1);
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.lg};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  .address {
    font-family: ${theme.fonts.family.mono};
    font-size: ${theme.fonts.size.xs};
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.1);
    padding: ${theme.spacing[1]} ${theme.spacing[2]};
    border-radius: ${theme.borderRadius.md};
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .balance {
    font-size: ${theme.fonts.size.xs};
    color: rgba(255, 255, 255, 0.9);
    font-weight: ${theme.fonts.weight.medium};
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error[300]};
  font-size: ${theme.fonts.size.xs};
  margin-right: ${theme.spacing[3]};
  background: rgba(239, 68, 68, 0.1);
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid rgba(239, 68, 68, 0.3);
`;

const ConnectButton = styled(Button)`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  font-size: ${theme.fonts.size.sm};
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`;

const DisconnectButton = styled(Button)`
  background: rgba(239, 68, 68, 0.2);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  font-size: ${theme.fonts.size.xs};
  
  &:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: translateY(-1px);
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
        <img src={logo2} alt="Umi Name Service Logo" className="logo-icon" />
        <h1>Umi Name Service</h1>
      </Logo>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {/* My Domains linki kaldırıldı */}
        
        {isConnected ? (
          <WalletInfo>
            <div className="balance">{balance} ETH</div>
            <div className="address">{formatAddress(address!)}</div>
                             <DisconnectButton $variant="outline" $size="sm" onClick={disconnectWallet}>
                   Disconnect
                 </DisconnectButton>
          </WalletInfo>
        ) : (
          <ConnectButton onClick={connectWallet} disabled={false}>
            Connect Wallet
          </ConnectButton>
        )}
      </div>
    </HeaderContainer>
  );
}; 