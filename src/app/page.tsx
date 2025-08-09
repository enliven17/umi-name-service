"use client";

import styled, { keyframes, css } from 'styled-components';
import WavyBackground from '@/components/WavyBackground';
import { useState } from 'react';
import { connectWallet, ensureUmiNetwork, getUserDomains, register, explorer } from '@/lib/evmNameService';

const Container = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
  100% { transform: translateY(0px); }
`;

const rise = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Card = styled.div`
  width: 100%;
  max-width: 980px;
  padding: 36px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 25px 60px rgba(0,0,0,0.35);
  backdrop-filter: blur(16px);
  color: #e5e7eb;
  animation: ${rise} 420ms ease-out both, ${float} 6s ease-in-out 600ms infinite;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 22px;
    background: linear-gradient(135deg, rgba(99,102,241,0.35), rgba(34,211,238,0.25));
    filter: blur(12px);
    z-index: -1;
  }
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 2.25rem;
  color: #fff;
  margin: 0;
  letter-spacing: 0.3px;
`;

const Subtitle = styled.p`
  margin: 8px 0 28px;
  color: #cbd5e1;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
`;

const Input = styled.input`
  flex: 1;
  padding: 16px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.07);
  color: #fff;
  outline: none;
  font-size: 16px;
  transition: box-shadow .2s ease, border-color .2s ease;

  &::placeholder { color: #9ca3af; }
  &:focus {
    border-color: rgba(99,102,241,0.55);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.25);
  }
`;

const shine = keyframes`
  0% { transform: translateX(-150%); }
  100% { transform: translateX(150%); }
`;

type ButtonVariant = 'ghost' | 'check' | 'register';

const Button = styled.button<{ $variant?: ButtonVariant }>`
  position: relative;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid
    ${({ $variant }) =>
      $variant === 'ghost' ? 'rgba(255,255,255,0.25)' : 'transparent'};
  background:
    ${({ $variant }) =>
      $variant === 'ghost'
        ? 'rgba(255,255,255,0.06)'
        : $variant === 'check'
        ? 'linear-gradient(135deg, #3B82F6, #22D3EE)'
        : 'linear-gradient(135deg, #22C55E, #10B981)'};
  color: ${({ $variant }) => ($variant === 'ghost' ? '#e5e7eb' : '#0b1220')};
  font-weight: 700;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.02);
    box-shadow: ${({ $variant }) =>
      $variant === 'ghost'
        ? '0 6px 18px rgba(0,0,0,0.25)'
        : '0 10px 28px rgba(34,211,238,0.25)'};
  }
  &:active { transform: translateY(0px) scale(0.98); }

  ${({ $variant }) =>
    $variant !== 'ghost'
      ? css`
          &::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.35) 40%, transparent 70%);
            transform: translateX(-150%);
            animation: ${shine} 2.2s ease-in-out infinite;
            pointer-events: none;
            mix-blend-mode: overlay;
          }
        `
      : ''}
`;

const Helper = styled.div`
  margin-top: 16px;
  font-size: 14px;
  color: #cbd5e1;
`;

const Badge = styled.span<{ $ok?: boolean }>`
  display: inline-block;
  margin-left: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.2);
  background: ${({ $ok }) => ($ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)')};
  color: ${({ $ok }) => ($ok ? '#34d399' : '#f87171')};
  font-weight: 700;
  font-size: 12px;
`;

export default function Home() {
  const [name, setName] = useState('');
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<{ available: boolean; owner?: string; price?: string } | null>(null);
  const [myDomains, setMyDomains] = useState<string[]>([]);
  const [lastTx, setLastTx] = useState<string | null>(null);

  const safe = async <T,>(fn: () => Promise<T>) => {
    try {
      setError(null); setLoading(true);
      return await fn();
    } catch (e: any) {
      setError(e?.message || 'Unexpected error');
      return undefined as unknown as T;
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    await safe(async () => {
      await ensureUmiNetwork();
      const addr = await connectWallet();
      setWallet(addr);
      const owned = await getUserDomains(addr);
      setMyDomains(owned);
    });
  };

  const handleCheck = async () => {
    if (!name.trim()) return;
    const res = await safe(async () => {
      const r = await fetch(`/api/name/status?name=${encodeURIComponent(name.trim())}`);
      if (!r.ok) throw new Error('Failed to fetch');
      return r.json();
    });
    if (!res) return;
    setInfo({ available: res.isAvailable, owner: res.owner ?? undefined, price: res.priceEth });
  };

  const handleRegister = async () => {
    if (!wallet || !info?.available || !name.trim()) return;
    const tx = await safe(() => register(name.trim()));
    if (!tx) return;
    setLastTx(tx);
    const owned = await getUserDomains(wallet);
    setMyDomains(owned);
  };

  return (
    <WavyBackground>
      <Container>
        <Card>
          <TitleRow>
            <Title>
              Umi Name Service
              {info && (
                <Badge $ok={info.available}>{info.available ? 'Available' : 'Taken'}</Badge>
              )}
            </Title>
            {wallet ? (
              <Button $variant="ghost">{wallet.slice(0,6)}...{wallet.slice(-4)}</Button>
            ) : (
              <Button onClick={handleConnect} $variant="ghost">Connect</Button>
            )}
          </TitleRow>
          <Subtitle>Register your .umi name on Umi Devnet with ETH</Subtitle>
          <Row>
            <Input placeholder="search a name (e.g. satoshi)" value={name} onChange={e=>setName(e.target.value)} />
            <Button onClick={handleCheck} disabled={loading} $variant="check">Check</Button>
            <Button onClick={handleRegister} disabled={loading || !info?.available} $variant="register">Register</Button>
          </Row>
          {loading && <Helper>Processing...</Helper>}
          {error && <Helper style={{ color: '#fca5a5' }}>{error}</Helper>}
          {info && (
            <Helper>
              {info.available ? `Available • Price: ${info.price} ETH` : `Taken • Owner: ${info.owner}`}
            </Helper>
          )}
          {myDomains.length > 0 && (
            <Helper><strong>My .umi names:</strong> {myDomains.map(d=>`${d}.umi`).join(', ')}</Helper>
          )}
          {lastTx && (
            <Helper>
              <a href={explorer.tx(lastTx)} target="_blank" rel="noreferrer">View transaction</a>
            </Helper>
          )}
        </Card>
      </Container>
    </WavyBackground>
  );
}
