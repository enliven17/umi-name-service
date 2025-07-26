import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useWalletContext } from '@/contexts/WalletContext';
import { ConnectWalletModal } from './ConnectWalletModal';
import { ROUTES } from '@/constants/routes';

const HeaderContainer = styled.header`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Nav = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #666;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #333;
  }
`;

const ConnectButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const WalletAddress = styled.span`
  font-family: monospace;
  font-size: 0.875rem;
  color: #64748b;
`;

const ChainBadge = styled.span`
  background: #10b981;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const DisconnectButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #dc2626;
  }
`;

export const Header: React.FC = () => {
  const { walletState, setSelectedChain, setEvmWallet, disconnect } = useWalletContext();
  const [modalOpen, setModalOpen] = useState(false);

  const handleConnectEvm = async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed!');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setEvmWallet({ isConnected: true, address: accounts[0] });
        setSelectedChain('evm');
        setModalOpen(false);
      }
    } catch (error) {
      console.error('EVM wallet connection error:', error);
      alert('EVM wallet connection error!');
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isConnected = walletState.selectedChain === 'evm' && walletState.evmWallet.isConnected;

  return (
    <HeaderContainer>
      <Nav>
        <Logo>
          🌐 Umi Name Service
        </Logo>

        <NavLinks>
          <NavLink to={ROUTES.HOME}>Home</NavLink>
          <NavLink to={ROUTES.DOMAIN_SEARCH}>Search</NavLink>
          <NavLink to={ROUTES.MY_DOMAINS}>My Domains</NavLink>

          {!isConnected ? (
            <ConnectButton onClick={() => setModalOpen(true)}>
              Connect Wallet
            </ConnectButton>
          ) : (
            <WalletInfo>
              <ChainBadge>EVM</ChainBadge>
              <WalletAddress>
                {formatAddress(walletState.evmWallet.address!)}
              </WalletAddress>
              <DisconnectButton onClick={handleDisconnect}>
                Disconnect
              </DisconnectButton>
            </WalletInfo>
          )}
        </NavLinks>
      </Nav>

      <ConnectWalletModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConnectEvm={handleConnectEvm}
      />
    </HeaderContainer>
  );
}; 