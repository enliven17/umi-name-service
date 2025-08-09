import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { UMI_DEVNET, CONTRACT } from '@/config/umi';

const ABI = [
  { type: 'function', name: 'isDomainRegistered', stateMutability: 'view', inputs: [{ name: 'domainHash', type: 'bytes32' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'getDomainOwner', stateMutability: 'view', inputs: [{ name: 'domainHash', type: 'bytes32' }], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'getDomainPrice', stateMutability: 'pure', inputs: [], outputs: [{ type: 'uint256' }] },
] as const;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = (searchParams.get('name') || '').trim();
    if (!name) return NextResponse.json({ error: 'name_required' }, { status: 400 });

    const provider = new ethers.JsonRpcProvider(UMI_DEVNET.rpcUrl);
    const contract = new ethers.Contract(CONTRACT.address, ABI, provider);
    const hash = ethers.encodeBytes32String(name);

    const taken: boolean = await contract.isDomainRegistered(hash);
    let owner: string | null = null;
    if (taken) owner = await contract.getDomainOwner(hash);
    const price: bigint = await contract.getDomainPrice();

    return NextResponse.json({ isAvailable: !taken, owner, priceEth: ethers.formatEther(price) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 });
  }
}
