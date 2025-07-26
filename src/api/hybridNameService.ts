import { ethers } from 'ethers';
import { UMI_CONFIG } from '@/config/umi';

const EVM_CONTRACT_ADDRESS = '0x2823Af7e1F2F50703eD9f81Ac4B23DC1E78B9E53';
const EVM_CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "domainHash", "type": "bytes32" }
    ],
    "name": "registerDomain",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "domainHash", "type": "bytes32" }
    ],
    "name": "isDomainRegistered",
    "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "domainHash", "type": "bytes32" }
    ],
    "name": "getDomainOwner",
    "outputs": [ { "internalType": "address", "name": "", "type": "address" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getUserDomains",
    "outputs": [ { "internalType": "bytes32[]", "name": "", "type": "bytes32[]" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDomainPrice",
    "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "stateMutability": "pure",
    "type": "function"
  }
];

export async function checkDomainStatus(domainName: string) {
  try {
    const provider = new ethers.JsonRpcProvider(UMI_CONFIG.rpcUrl);
    const contract = new ethers.Contract(EVM_CONTRACT_ADDRESS, EVM_CONTRACT_ABI, provider);
    const domainHash = ethers.encodeBytes32String(domainName);
    const isRegistered = await contract.isDomainRegistered(domainHash);
    let owner = null;
    if (isRegistered) {
      owner = await contract.getDomainOwner(domainHash);
    }
    const price = await contract.getDomainPrice();
    return {
      name: domainName,
      isAvailable: !isRegistered,
      owner,
      price: ethers.formatEther(price),
      registeredChain: isRegistered ? 'evm' : null
    };
  } catch (error) {
    console.error('Error checking EVM domain status:', error);
    throw error;
  }
}

export async function registerDomainWithEvmWallet(domainName: string): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask is not installed');
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(EVM_CONTRACT_ADDRESS, EVM_CONTRACT_ABI, signer);
  const domainHash = ethers.encodeBytes32String(domainName);
  const price = await contract.getDomainPrice();
  const tx = await contract.registerDomain(domainHash, { value: price });
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function getUserDomains(address: string): Promise<string[]> {
  try {
    const provider = new ethers.JsonRpcProvider(UMI_CONFIG.rpcUrl);
    const contract = new ethers.Contract(EVM_CONTRACT_ADDRESS, EVM_CONTRACT_ABI, provider);
    const domainHashes = await contract.getUserDomains(address);
    return domainHashes.map((hash: string) => {
      try {
        return ethers.decodeBytes32String(hash);
      } catch {
        return hash;
      }
    });
  } catch (error) {
    console.error('Error getting EVM user domains:', error);
    return [];
  }
} 