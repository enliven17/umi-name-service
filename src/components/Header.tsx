import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from './styled/Button';
import { theme } from '@/theme';
import { ConnectWalletModal } from './ConnectWalletModal';
import { useWalletContext } from '@/contexts/WalletContext';

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
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    &:hover {
      transform: scale(1.05);
      background: rgba(255, 255, 255, 0.2);
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
  .chain {
    font-size: ${theme.fonts.size.xs};
    color: #fff;
    background: #4fd1c5;
    border-radius: 6px;
    padding: 2px 8px;
    margin-right: 6px;
    font-weight: 600;
    letter-spacing: 1px;
  }
`;

const ConnectButton = styled(Button)`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  font-size: ${theme.fonts.size.sm};
  font-weight: 600;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`;

export const Header: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { walletState, setSelectedChain, setMoveWallet, setEvmWallet, disconnect } = useWalletContext();

  // Zincir seçimine göre cüzdan bağlama fonksiyonları
  const handleConnectMove = async () => {
    if (!(window as any).aptos) {
      alert('Petra veya Martian cüzdanı yüklü değil!');
      return;
    }
    try {
      const response = await (window as any).aptos.connect();
      if (response && response.address) {
        setMoveWallet({ isConnected: true, address: response.address });
        setSelectedChain('move');
        setModalOpen(false);
      }
    } catch (e) {
      alert('MoveVM cüzdan bağlantı hatası!');
    }
  };
  
  const handleConnectEvm = async () => {
    if (!(window as any).ethereum) {
      alert('MetaMask yüklü değil!');
      return;
    }
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setEvmWallet({ isConnected: true, address: accounts[0], balance: '0' });
        setSelectedChain('evm');
        setModalOpen(false);
      }
    } catch (e) {
      alert('EVM cüzdan bağlantı hatası!');
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const isConnected = walletState.selectedChain && 
    ((walletState.selectedChain === 'move' && walletState.moveWallet.isConnected) || 
     (walletState.selectedChain === 'evm' && walletState.evmWallet.isConnected));

  return (
    <HeaderContainer>
      <Logo>
        <div className="logo-icon">🌐</div>
        <h1>Umi Name Service</h1>
      </Logo>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isConnected ? (
          <WalletInfo>
            <span className="chain">{walletState.selectedChain === 'move' ? 'MoveVM' : 'EVM'}</span>
            <div className="address">
              {formatAddress(
                walletState.selectedChain === 'move' 
                  ? walletState.moveWallet.address! 
                  : walletState.evmWallet.address!
              )}
            </div>
            <Button $variant="outline" $size="sm" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </WalletInfo>
        ) : (
          <ConnectButton onClick={() => setModalOpen(true)}>
            Cüzdan Bağla
          </ConnectButton>
        )}
        <ConnectWalletModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConnectMove={handleConnectMove}
          onConnectEvm={handleConnectEvm}
        />
      </div>
    </HeaderContainer>
  );
}; 