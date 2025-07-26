import { ethers } from 'ethers';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { UMI_CONFIG } from '@/config/umi';

// Backend API base URL
const BACKEND_URL = 'http://localhost:5000';

// Aptos SDK konfigürasyonu
const aptosConfig = new AptosConfig({
  network: Network.DEVNET,
  fullnode: UMI_CONFIG.rpcUrl,
});
const aptos = new Aptos(aptosConfig);

// Ethereum adresini Move adresine çevir
const convertToMoveAddress = (ethereumAddress: string): string => {
  const cleanAddress = ethereumAddress.replace('0x', '');
  const paddedAddress = cleanAddress.padStart(64, '0');
  return `0x${paddedAddress}`;
};

// Backend'den sistem konfigürasyonunu al
export async function getSystemConfig() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/config`);
    if (!response.ok) throw new Error('Failed to fetch config');
    return await response.json();
  } catch (error) {
    console.error('Error fetching system config:', error);
    throw error;
  }
}

// Backend'den domain fiyatlarını al
export async function getDomainPrices() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/prices`);
    if (!response.ok) throw new Error('Failed to fetch prices');
    return await response.json();
  } catch (error) {
    console.error('Error fetching domain prices:', error);
    throw error;
  }
}

// Move kontratından domain durumunu kontrol et
async function checkDomainStatusMove(domainName: string): Promise<{ isRegistered: boolean; owner: string | null }> {
  try {
    console.log('Checking Move domain status for:', domainName);
    
    // is_domain_registered fonksiyonunu çağır
    const isRegisteredResult = await aptos.view({
      payload: {
        function: `${UMI_CONFIG.contractAddress}::name_service::is_domain_registered`,
        functionArguments: [domainName],
      },
    });
    
    const isRegistered = isRegisteredResult[0] as boolean;
    console.log('Move domain registered:', isRegistered);
    
    if (isRegistered) {
      // Domain kayıtlıysa sahibini al
      const ownerResult = await aptos.view({
        payload: {
          function: `${UMI_CONFIG.contractAddress}::name_service::get_domain_owner`,
          functionArguments: [domainName],
        },
      });
      
      const owner = ownerResult[0] as string;
      console.log('Move domain owner:', owner);
      return { isRegistered: true, owner };
    } else {
      return { isRegistered: false, owner: null };
    }
  } catch (error) {
    console.error('Error checking Move domain status:', error);
    // Hata durumunda domain'in alınabilir olduğunu varsay
    return { isRegistered: false, owner: null };
  }
}

// EVM kontratından domain durumunu kontrol et
async function checkDomainStatusEVM(domainName: string): Promise<{ isRegistered: boolean; owner: string | null }> {
  try {
    console.log('Checking EVM domain status for:', domainName);
    
    const config = await getSystemConfig();
    const provider = new ethers.JsonRpcProvider(config.evmRpcUrl);
    const contract = new ethers.Contract(
      config.evmContractAddress,
      [
        'function isDomainRegistered(string) view returns (bool)',
        'function getDomainOwner(string) view returns (address)'
      ],
      provider
    );
    
    const isRegistered = await contract.isDomainRegistered(domainName);
    console.log('EVM domain registered:', isRegistered);
    
    if (isRegistered) {
      const owner = await contract.getDomainOwner(domainName);
      console.log('EVM domain owner:', owner);
      return { isRegistered: true, owner };
    } else {
      return { isRegistered: false, owner: null };
    }
  } catch (error) {
    console.error('Error checking EVM domain status:', error);
    // Hata durumunda domain'in alınabilir olduğunu varsay
    return { isRegistered: false, owner: null };
  }
}

// Domain durumunu kontrol et (hem Move hem EVM)
export async function checkDomainStatus(domainName: string) {
  try {
    console.log('Checking domain status for:', domainName);
    
    // Her iki chain'den domain durumunu kontrol et
    const [moveStatus, evmStatus] = await Promise.all([
      checkDomainStatusMove(domainName),
      checkDomainStatusEVM(domainName)
    ]);
    
    console.log('Move status:', moveStatus);
    console.log('EVM status:', evmStatus);
    
    // Domain herhangi bir chain'de kayıtlıysa alınamaz
    const isAvailable = !moveStatus.isRegistered && !evmStatus.isRegistered;
    const moveAvailable = !moveStatus.isRegistered;
    const evmAvailable = !evmStatus.isRegistered;
    
    // Hangi chain'de kayıtlı olduğunu belirle
    let registeredChain = null;
    let owner = null;
    
    if (moveStatus.isRegistered) {
      registeredChain = 'move';
      owner = moveStatus.owner;
    } else if (evmStatus.isRegistered) {
      registeredChain = 'evm';
      owner = evmStatus.owner;
    }
    
    const prices = await getDomainPrices();
    
    return {
      name: domainName,
      isAvailable,
      moveAvailable,
      evmAvailable,
      owner,
      registeredChain,
      prices
    };
  } catch (error) {
    console.error('Error checking domain status:', error);
    throw error;
  }
}

// Move kontratından kullanıcı domainlerini al
export async function getUserDomainsMove(address: string): Promise<string[]> {
  try {
    console.log('Getting Move domains for address:', address);
    
    // Move kontratında getUserDomains fonksiyonu yoksa boş array döndür
    const result = await aptos.view({
      payload: {
        function: `${UMI_CONFIG.contractAddress}::name_service::get_user_domains`,
        functionArguments: [address],
      },
    });
    
    // Result'ın array olup olmadığını kontrol et
    if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
      const domains = result[0] as string[];
      console.log('Move domains:', domains);
      return domains;
    } else {
      console.log('No Move domains found or invalid response format');
      return [];
    }
  } catch (error) {
    console.error('Error in getUserDomainsMove:', error);
    // Hata durumunda boş array döndür
    return [];
  }
}

// EVM kontratından kullanıcı domainlerini al
export async function getUserDomainsEVM(address: string): Promise<string[]> {
  try {
    console.log('Getting EVM domains for address:', address);
    
    const config = await getSystemConfig();
    const provider = new ethers.JsonRpcProvider(config.evmRpcUrl);
    const contract = new ethers.Contract(
      config.evmContractAddress,
      ['function getUserDomains(address) view returns (string[])'],
      provider
    );
    
    const domains = await contract.getUserDomains(address);
    console.log('EVM domains:', domains);
    return domains;
  } catch (error) {
    console.error('Error in getUserDomainsEVM:', error);
    return [];
  }
}

// Kullanıcının tüm domainlerini al (hibrit)
export async function getUserDomains(address: string): Promise<{
  move: string[];
  evm: string[];
  all: string[];
}> {
  try {
    const [moveDomains, evmDomains] = await Promise.all([
      getUserDomainsMove(address),
      getUserDomainsEVM(address)
    ]);

    return {
      move: moveDomains,
      evm: evmDomains,
      all: [...moveDomains, ...evmDomains]
    };
  } catch (error) {
    console.error('Error getting user domains:', error);
    return { move: [], evm: [], all: [] };
  }
}

// Domain kaydet (Move - APT ile)
export async function registerDomainMove(
  userAddress: string,
  domainName: string,
  durationYears: number = 1
): Promise<string> {
  try {
    console.log('Registering domain on Move:', { userAddress, domainName, durationYears });
    
    // TODO: Implement actual Move transaction with wallet
    // Bu kısım wallet entegrasyonu gerektirir
    
    // Şimdilik sadece log
    console.log('Move registration would be called here');
    
    return '0xplaceholder_move_transaction_hash';
  } catch (error) {
    console.error('Error in registerDomainMove:', error);
    throw error;
  }
}

// Domain kaydet (EVM - ETH ile)
export async function registerDomainEVM(
  userAddress: string,
  domainName: string,
  durationYears: number = 1
): Promise<string> {
  try {
    console.log('Registering domain on EVM:', { userAddress, domainName, durationYears });
    
    // TODO: Implement actual EVM transaction with wallet
    // Bu kısım wallet entegrasyonu gerektirir
    
    // Şimdilik sadece log
    console.log('EVM registration would be called here');
    
    return '0xplaceholder_evm_transaction_hash';
  } catch (error) {
    console.error('Error in registerDomainEVM:', error);
    throw error;
  }
} 