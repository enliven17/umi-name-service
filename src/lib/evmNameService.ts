"use client";
import { ethers } from 'ethers';
import { UMI_DEVNET, CONTRACT } from '@/config/umi';

const ABI = [
  { "type":"function", "name":"registerDomain", "stateMutability":"payable", "inputs":[{"name":"domainHash","type":"bytes32"}], "outputs":[] },
  { "type":"function", "name":"isDomainRegistered", "stateMutability":"view", "inputs":[{"name":"domainHash","type":"bytes32"}], "outputs":[{"type":"bool"}] },
  { "type":"function", "name":"getDomainOwner", "stateMutability":"view", "inputs":[{"name":"domainHash","type":"bytes32"}], "outputs":[{"type":"address"}] },
  { "type":"function", "name":"getUserDomains", "stateMutability":"view", "inputs":[{"name":"user","type":"address"}], "outputs":[{"type":"bytes32[]"}] }
] as const;

const DOMAIN_PRICE_WEI = 1000000000000000n; // 0.001 ETH (must match contract)
const DOMAIN_PRICE_ETH = '0.001';

const iface = new ethers.Interface(ABI);

export const hasEthereum = () => typeof window !== 'undefined' && !!(window as any).ethereum;

const walletProvider = () => new ethers.BrowserProvider((window as any).ethereum);

const rpcUrl = () => (typeof window !== 'undefined' ? `${window.location.origin}/api/rpc` : UMI_DEVNET.rpcUrl);

async function rpcRequest(payload: any) {
  const res = await fetch(rpcUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'rpc_error');
  return json.result;
}

async function rpcCall(data: string): Promise<string> {
  const result = await rpcRequest({ id: Date.now(), jsonrpc: '2.0', method: 'eth_call', params: [{ to: CONTRACT.address, data }, 'latest'] });
  return result as string;
}

const getWriteContract = async () => {
  if (!hasEthereum()) throw new Error('MetaMask is not installed');
  const signer = await walletProvider().getSigner();
  return new ethers.Contract(CONTRACT.address, ABI, signer);
};

export async function ensureUmiNetwork() {
  if (!hasEthereum()) throw new Error('MetaMask is not installed');
  const targetHex = '0x' + UMI_DEVNET.id.toString(16);
  const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
  if (chainId === targetHex) return;
  try {
    await (window as any).ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: targetHex }] });
  } catch (e: any) {
    if (e?.code === 4902) {
      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{ chainId: targetHex, chainName: UMI_DEVNET.name, nativeCurrency: UMI_DEVNET.nativeCurrency, rpcUrls: [UMI_DEVNET.rpcUrl], blockExplorerUrls: [UMI_DEVNET.explorerUrl] }],
      });
    } else {
      throw e;
    }
  }
}

export async function connectWallet(): Promise<string> {
  if (!hasEthereum()) throw new Error('MetaMask is not installed');
  try { await ensureUmiNetwork(); } catch {}
  try {
    const existing = await (window as any).ethereum.request({ method: 'eth_accounts' });
    if (existing && existing.length > 0) return existing[0];
    const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) throw new Error('No accounts returned');
    return accounts[0];
  } catch (e: any) {
    if (e?.code === 4001) throw new Error('Connection request was rejected in wallet');
    if (typeof e?.message === 'string' && e.message.toLowerCase().includes('proxy')) {
      throw new Error('Wallet extension error. Please reopen the wallet popup or refresh the page.');
    }
    throw e;
  }
}

export async function checkDomain(name: string) {
  if (!name) throw new Error('Name is required');
  const hash = ethers.encodeBytes32String(name);
  // isDomainRegistered
  const data1 = iface.encodeFunctionData('isDomainRegistered', [hash]);
  const ret1 = await rpcCall(data1);
  const [taken] = iface.decodeFunctionResult('isDomainRegistered', ret1) as [boolean];
  let owner: string | null = null;
  if (taken) {
    const data2 = iface.encodeFunctionData('getDomainOwner', [hash]);
    const ret2 = await rpcCall(data2);
    [owner] = iface.decodeFunctionResult('getDomainOwner', ret2) as [string];
  }
  return { isAvailable: !taken, owner, priceEth: DOMAIN_PRICE_ETH };
}

export async function register(name: string) {
  if (!name) throw new Error('Name is required');
  await ensureUmiNetwork();
  const c = await getWriteContract();
  const signer = await (c.runner!.provider as any).getSigner?.() ?? null;
  const provider = (signer && (signer.provider as ethers.BrowserProvider)) || walletProvider();
  const gasPrice = await provider.getGasPrice();
  const hash = ethers.encodeBytes32String(name);
  const tx = await c.registerDomain(hash, {
    value: DOMAIN_PRICE_WEI,
    // force legacy tx to avoid RPC variant index issues
    type: 0,
    gasPrice,
    gasLimit: 200000n,
  });
  const receipt = await tx.wait();
  return receipt.hash as string;
}

export async function getUserDomains(address: string): Promise<string[]> {
  if (!address) return [];
  const data = iface.encodeFunctionData('getUserDomains', [address]);
  const raw = await rpcCall(data);
  const [hashes] = iface.decodeFunctionResult('getUserDomains', raw) as [string[]];
  return hashes.map((h) => { try { return ethers.decodeBytes32String(h); } catch { return h; } });
}

export const explorer = {
  tx: (hash: string) => `${UMI_DEVNET.explorerUrl}/tx/${hash}`,
  address: (addr: string) => `${UMI_DEVNET.explorerUrl}/address/${addr}`,
};
