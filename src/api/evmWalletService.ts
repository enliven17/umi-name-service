import { ethers } from 'ethers';
import { UMI_CONFIG } from '@/config/umi';

async function getSystemConfig() {
  try {
    const response = await fetch('http://localhost:5000/api/config');
    if (!response.ok) throw new Error('Failed to fetch config');
    return await response.json();
  } catch (error) {
    console.error('Error fetching system config:', error);
    throw error;
  }
}

// Gerçek cüzdan ile domain kaydı
export async function registerDomainWithEvmWallet(
  domainName: string,
  durationYears: number = 1
): Promise<string> {
  try {
    console.log('Registering domain on EVM with connected wallet:', { domainName, durationYears });

    if (!(window as any).ethereum) {
      throw new Error('MetaMask not connected');
    }

    const config = await getSystemConfig();
    const provider = new ethers.BrowserProvider((window as any).ethereum);

    const accounts = await provider.listAccounts();
    if (accounts.length === 0) {
      throw new Error('No EVM wallet account found');
    }

    const signer = await provider.getSigner();
    console.log('EVM wallet address:', await signer.getAddress());

    // Kontrat ABI'sini güncelle - registerDomain fonksiyonunu kullan
    const contract = new ethers.Contract(
      config.evmContractAddress,
      [
        'function registerDomain(string domain) payable',
        'function isDomainRegistered(string domain) view returns (bool)',
        'function getDomainOwner(string domain) view returns (address)',
        'function getUserDomains(address user) view returns (string[])',
        'event DomainRegistered(address indexed owner, string domain, uint256 expiry)'
      ],
      signer
    );

    const pricesResponse = await fetch('http://localhost:5000/api/prices');
    const prices = await pricesResponse.json();
    const ethPrice = ethers.parseEther(prices.eth);

    console.log('Domain price:', prices.eth, 'ETH');

    const tx = await contract.registerDomain(domainName, {
      value: ethPrice
    });

    console.log('EVM transaction sent:', tx.hash);

    const receipt = await tx.wait();

    console.log('EVM transaction completed:', receipt);
    return tx.hash;

  } catch (error) {
    console.error('Error in registerDomainWithEvmWallet:', error);
    throw error;
  }
}

// Private key ile domain kaydı (eski yöntem - test için)
export async function registerDomainEVMWithWallet(
  privateKey: string,
  domainName: string,
  durationYears: number = 1
): Promise<string> {
  try {
    console.log('Registering domain on EVM with private key:', { domainName, durationYears });

    const config = await getSystemConfig();

    const provider = new ethers.JsonRpcProvider(config.evmRpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('EVM wallet address:', wallet.address);

    const contract = new ethers.Contract(
      config.evmContractAddress,
      [
        'function registerDomain(string domain) payable',
        'function isDomainRegistered(string domain) view returns (bool)',
        'function getDomainOwner(string domain) view returns (address)',
        'function getUserDomains(address user) view returns (string[])',
        'event DomainRegistered(address indexed owner, string domain, uint256 expiry)'
      ],
      wallet
    );

    const pricesResponse = await fetch('http://localhost:5000/api/prices');
    const prices = await pricesResponse.json();
    const ethPrice = ethers.parseEther(prices.eth);

    console.log('Domain price:', prices.eth, 'ETH');

    const tx = await contract.registerDomain(domainName, {
      value: ethPrice
    });

    console.log('EVM transaction sent:', tx.hash);

    const receipt = await tx.wait();

    console.log('EVM transaction completed:', receipt);
    return tx.hash;

  } catch (error) {
    console.error('Error in registerDomainEVMWithWallet:', error);
    throw error;
  }
}

export async function checkDomainStatusEVM(domainName: string): Promise<{ isRegistered: boolean; owner: string | null }> {
  try {
    const config = await getSystemConfig();
    const provider = new ethers.JsonRpcProvider(config.evmRpcUrl);
    const contract = new ethers.Contract(
      config.evmContractAddress,
      [
        'function isDomainRegistered(string domain) view returns (bool)',
        'function getDomainOwner(string domain) view returns (address)'
      ],
      provider
    );
    const isRegistered = await contract.isDomainRegistered(domainName);
    if (isRegistered) {
      const owner = await contract.getDomainOwner(domainName);
      return { isRegistered: true, owner };
    } else {
      return { isRegistered: false, owner: null };
    }
  } catch (error) {
    console.error('Error checking EVM domain status:', error);
    return { isRegistered: false, owner: null };
  }
}

export async function getUserDomainsEVM(userAddress: string): Promise<string[]> {
  try {
    const config = await getSystemConfig();
    const provider = new ethers.JsonRpcProvider(config.evmRpcUrl);
    const contract = new ethers.Contract(
      config.evmContractAddress,
      [
        'function getUserDomains(address user) view returns (bytes32[])'
      ],
      provider
    );
    const domainHashes = await contract.getUserDomains(userAddress);
    // bytes32 array'i string array'e çevir (şimdilik boş array döndür)
    return [];
  } catch (error) {
    console.error('Error getting EVM user domains:', error);
    return [];
  }
} 