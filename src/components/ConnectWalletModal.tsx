import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

const Button = styled.button<{ $move?: boolean }>`
  width: 100%;
  padding: 15px;
  margin: 10px 0;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  background: ${({ $move }) => $move ? '#4fd1c5' : '#f6ad55'};
  color: white;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  padding: 10px;
  margin-top: 10px;
  
  &:hover {
    color: #333;
  }
`;

interface Props {
  open: boolean;
  onClose: () => void;
  onConnectMove: () => void;
  onConnectEvm: () => void;
}

export const ConnectWalletModal: React.FC<Props> = ({ open, onClose, onConnectMove, onConnectEvm }) => {
  if (!open) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Title>Cüzdan Bağla</Title>
        <Button $move onClick={onConnectMove}>
          MoveVM Wallet (Petra / Martian)
        </Button>
        <Button onClick={onConnectEvm}>
          EVM Wallet (MetaMask)
        </Button>
        <CloseButton onClick={onClose}>
          Kapat
        </CloseButton>
      </ModalContent>
    </Overlay>
  );
}; 