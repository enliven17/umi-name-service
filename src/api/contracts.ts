import { ethers } from 'ethers';
import { UMI_CONFIG } from '@/config/umi';
import { DomainInfo, RegistrationRequest } from '@/types';

// Simple ABI for the name service contract
const NAME_SERVICE_ABI = [
  // Events
  'event NameRegistered(string name, address indexed owner, uint256 expiry)',
  'event NameTransferred(string name, address indexed from, address indexed to)',
  
  // View functions
  'function ownerOf(string name) view returns (address)',
  'function expiryOf(string name) view returns (uint256)',
  'function isAvailable(string name) view returns (bool)',
  'function getPrice(string name) view returns (uint256)',
  'function getNamesByOwner(address owner) view returns (string[])',
  
  // State changing functions
  'function register(string name, uint256 duration) payable',
  'function renew(string name, uint256 duration) payable',
  'function transfer(string name, address to)',
  'function setResolver(string name, address resolver)',
];

export class NameServiceContract {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(UMI_CONFIG.rpcUrl);
    this.contract = new ethers.Contract(
      UMI_CONFIG.contractAddress,
      NAME_SERVICE_ABI,
      this.provider
    );
  }

  setSigner(signer: ethers.Signer) {
    this.signer = signer;
    this.contract = this.contract.connect(signer);
  }

  async checkDomainAvailability(name: string): Promise<boolean> {
    try {
      const isAvailable = await this.contract.isAvailable(name);
      return isAvailable;
    } catch (error) {
      console.error('Error checking domain availability:', error);
      return false;
    }
  }

  async getDomainInfo(name: string): Promise<DomainInfo | null> {
    try {
      const [owner, expiry, isAvailable, price] = await Promise.all([
        this.contract.ownerOf(name),
        this.contract.expiryOf(name),
        this.contract.isAvailable(name),
        this.contract.getPrice(name),
      ]);

      return {
        name,
        owner: owner === ethers.ZeroAddress ? '' : owner,
        resolver: '', // Will be implemented when resolver contract is available
        expiryDate: expiry > 0 ? new Date(Number(expiry) * 1000) : null,
        isAvailable,
        price: ethers.formatEther(price),
      };
    } catch (error) {
      console.error('Error getting domain info:', error);
      return null;
    }
  }

  async getOwnedDomains(address: string): Promise<DomainInfo[]> {
    try {
      const names = await this.contract.getNamesByOwner(address);
      const domainInfos = await Promise.all(
        names.map((name: string) => this.getDomainInfo(name))
      );
      return domainInfos.filter((domain): domain is DomainInfo => domain !== null);
    } catch (error) {
      console.error('Error getting owned domains:', error);
      return [];
    }
  }

  async registerDomain(request: RegistrationRequest): Promise<ethers.ContractTransaction> {
    if (!this.signer) {
      throw new Error('Signer not set');
    }

    const price = await this.contract.getPrice(request.name);
    const totalCost = price * BigInt(request.duration);

    const tx = await this.contract.register(request.name, request.duration, {
      value: totalCost,
    });

    return tx;
  }

  async renewDomain(name: string, duration: number): Promise<ethers.ContractTransaction> {
    if (!this.signer) {
      throw new Error('Signer not set');
    }

    const price = await this.contract.getPrice(name);
    const totalCost = price * BigInt(duration);

    const tx = await this.contract.renew(name, duration, {
      value: totalCost,
    });

    return tx;
  }

  async transferDomain(name: string, to: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) {
      throw new Error('Signer not set');
    }

    const tx = await this.contract.transfer(name, to);
    return tx;
  }

  async setResolver(name: string, resolver: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) {
      throw new Error('Signer not set');
    }

    const tx = await this.contract.setResolver(name, resolver);
    return tx;
  }

  // Helper method to validate domain name
  static validateDomainName(name: string): { isValid: boolean; error?: string } {
    if (!name || name.length < 3) {
      return { isValid: false, error: 'Domain name must be at least 3 characters long' };
    }

    if (name.length > 63) {
      return { isValid: false, error: 'Domain name must be less than 63 characters' };
    }

    // Check for valid characters (alphanumeric and hyphens, but not starting/ending with hyphen)
    const validPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!validPattern.test(name)) {
      return { 
        isValid: false, 
        error: 'Domain name can only contain lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.' 
      };
    }

    return { isValid: true };
  }
}

// Export singleton instance
export const nameServiceContract = new NameServiceContract(); 