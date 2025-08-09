"use client";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { injected } from "@wagmi/connectors";
import { umiDevnet } from "@/lib/chain";

// Will be replaced after deploy
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_UNS_ADDRESS as `0x${string}` | undefined;

const ABI = [
  { "type": "function", "name": "isAvailable", "stateMutability": "view", "inputs": [{"name":"name","type":"string"}], "outputs": [{"name":"","type":"bool"}] },
  { "type": "function", "name": "priceWei", "stateMutability": "view", "inputs": [], "outputs": [{"name":"","type":"uint256"}] },
  { "type": "function", "name": "register", "stateMutability": "payable", "inputs": [{"name":"rawName","type":"string"}], "outputs": [{"name":"tokenId","type":"uint256"}] },
];

export default function Home() {
  const { address, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const [name, setName] = useState("");

  const price = useReadContract({
    abi: ABI as any,
    address: CONTRACT_ADDRESS,
    functionName: "priceWei",
    chainId: umiDevnet.id,
    query: { enabled: !!CONTRACT_ADDRESS, retry: 0 },
  });

  const available = useReadContract({
    abi: ABI as any,
    address: CONTRACT_ADDRESS,
    functionName: "isAvailable",
    args: [name],
    chainId: umiDevnet.id,
    query: { enabled: !!CONTRACT_ADDRESS && name.length > 0, retry: 0 },
  });

  const { data: hash, isPending: isMinting, writeContract } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (chain && chain.id !== umiDevnet.id) {
      switchChain({ chainId: umiDevnet.id }).catch(() => {});
    }
  }, [chain, switchChain]);

  const addNetwork = async () => {
    try {
      // @ts-ignore
      await window.ethereum?.request?.({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xA455',
          chainName: 'UMI Devnet',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://devnet.uminetwork.com'],
          blockExplorerUrls: ['https://devnet.explorer.moved.network'],
        }],
      });
    } catch {}
  };

  const onConnect = () => connect({ connector: injected() });
  const onRegister = () => {
    if (!CONTRACT_ADDRESS) return;
    if (!name) return;
    const value = (price.data as bigint | undefined) ?? 0n;
    writeContract({
      abi: ABI as any,
      address: CONTRACT_ADDRESS,
      functionName: "register",
      args: [name],
      chainId: umiDevnet.id,
      value,
    });
  };

  const priceEth = useMemo(() => {
    const v = price.data as bigint | undefined;
    if (typeof v === "bigint") return Number(v) / 1e18;
    return 0;
  }, [price.data]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-300/20 to-emerald-400/20">
      <div className="glass max-w-xl w-full p-8 rounded-2xl shadow-2xl border border-white/20 bg-white/10 backdrop-blur">
        <h1 className="text-3xl font-semibold mb-6">UMI Name Service</h1>
        {!address ? (
          <div className="flex gap-3">
            <button onClick={onConnect} className="px-4 py-2 rounded-lg bg-black/80 text-white hover:bg-black">Connect Wallet</button>
            <button onClick={addNetwork} className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30">Add UMI</button>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm opacity-80">{address}</span>
            <button onClick={() => disconnect()} className="text-sm underline">Disconnect</button>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <label className="block text-sm opacity-80">Username (.umi)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="example" className="w-full px-4 py-3 rounded-xl bg-white/60 text-black focus:outline-none" />

          {name && (
            <div className="text-sm">
              {available.isLoading ? "Checking..." : available.error ? "Check failed" : available.data === true ? "Available" : available.data === false ? "Taken" : null}
            </div>
          )}

          <div className="text-sm opacity-80">Price: {price.isLoading ? "..." : `${priceEth} ETH`}</div>

          <button
                  disabled={!address || !CONTRACT_ADDRESS || available.data === false || isMinting}
                  onClick={onRegister}
                  className="mt-2 px-4 py-3 rounded-xl bg-emerald-600 text-white disabled:opacity-50">
            {isMinting ? "Awaiting confirmation..." : "Buy"}
          </button>

          {receipt.isLoading && <div className="text-sm">Transaction pending...</div>}
          {receipt.data && <div className="text-sm">Completed: {hash}</div>}
        </div>
      </div>
      <style jsx global>{`
        .glass { box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
}
