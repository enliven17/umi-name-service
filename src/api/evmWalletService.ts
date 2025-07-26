import { ethers } from 'ethers';
import { UMI_CONFIG } from '@/config/umi';

// EVM Contract ABI - bytes32 version
const EVM_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "domainHash",
        "type": "bytes32"
      }
    ],
    "name": "registerDomain",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "domainHash",
        "type": "bytes32"
      }
    ],
    "name": "isDomainRegistered",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "domainHash",
        "type": "bytes32"
      }
    ],
    "name": "getDomainOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "domainHash",
        "type": "bytes32"
      }
    ],
    "name": "getDomainExpiry",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserDomains",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDomainPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  }
];

const EVM_CONTRACT_ADDRESS = '0xd2479Fa6758F5d0B84D963C8076f15fd4017df4E';

export const registerDomainWithEvmWallet = async (domainName: string): Promise<string> => {
  try {
    console.log('Registering domain on EVM with connected wallet:', { domainName });
    
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    console.log('EVM wallet address:', address);

    const contract = new ethers.Contract(EVM_CONTRACT_ADDRESS, EVM_CONTRACT_ABI, signer);

    // Convert domain name to bytes32 hash
    const domainHash = ethers.encodeBytes32String(domainName);
    console.log('Domain hash:', domainHash);

    // Get domain price
    const price = await contract.getDomainPrice();
    console.log('Domain price:', ethers.formatEther(price), 'ETH');

    // Register domain
    const tx = await contract.registerDomain(domainHash, { value: price });
    console.log('Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    return receipt.hash;
  } catch (error) {
    console.error('Error in registerDomainWithEvmWallet:', error);
    throw error;
  }
};

export const checkDomainStatusEVM = async (domainName: string): Promise<{ isRegistered: boolean; owner?: string; expiry?: number }> => {
  try {
    const provider = new ethers.JsonRpcProvider(UMI_CONFIG.rpcUrl);
    const contract = new ethers.Contract(EVM_CONTRACT_ADDRESS, EVM_CONTRACT_ABI, provider);

    const domainHash = ethers.encodeBytes32String(domainName);
    
    const isRegistered = await contract.isDomainRegistered(domainHash);
    
    if (isRegistered) {
      const owner = await contract.getDomainOwner(domainHash);
      const expiry = await contract.getDomainExpiry(domainHash);
      
      return {
        isRegistered: true,
        owner,
        expiry: Number(expiry)
      };
    }
    
    return { isRegistered: false };
  } catch (error) {
    console.error('Error checking EVM domain status:', error);
    return { isRegistered: false };
  }
};

export const getUserDomainsEVM = async (address: string): Promise<string[]> => {
  try {
    const provider = new ethers.JsonRpcProvider(UMI_CONFIG.rpcUrl);
    const contract = new ethers.Contract(EVM_CONTRACT_ADDRESS, EVM_CONTRACT_ABI, provider);

    const domainHashes = await contract.getUserDomains(address);
    
    // Convert bytes32 hashes back to domain names
    const domainNames: string[] = [];
    for (const hash of domainHashes) {
      try {
        // This is a simplified conversion - in practice you'd need to store the original domain names
        const domainName = ethers.decodeBytes32String(hash);
        domainNames.push(domainName);
      } catch (e) {
        // If conversion fails, use the hash as fallback
        domainNames.push(hash);
      }
    }
    
    return domainNames;
  } catch (error) {
    console.error('Error getting EVM user domains:', error);
    return [];
  }
}; 