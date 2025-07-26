import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { UMI_CONFIG } from '@/config/umi';

const aptosConfig = new AptosConfig({
  network: Network.DEVNET,
  fullnode: UMI_CONFIG.rpcUrl,
});
const aptos = new Aptos(aptosConfig);

// Ethereum adresini Move adresine çevir
const convertToMoveAddress = (ethereumAddress: string): string => {
  // 0x prefix'ini kaldır
  const cleanAddress = ethereumAddress.replace('0x', '');
  
  // Ethereum adresi 20 byte (40 hex karakter), Move adresi 32 byte (64 hex karakter) olmalı
  // 20 byte'ı 32 byte'a çevirmek için başına 12 byte (24 hex karakter) sıfır ekle
  const paddedAddress = cleanAddress.padStart(64, '0');
  
  console.log('Address conversion:');
  console.log('  Original:', ethereumAddress);
  console.log('  Clean:', cleanAddress);
  console.log('  Padded:', paddedAddress);
  console.log('  Final:', `0x${paddedAddress}`);
  console.log('  Length:', paddedAddress.length);
  
  return `0x${paddedAddress}`;
};

// Doğrudan HTTP isteği ile Move view fonksiyonu çağır
async function callMoveViewFunction(functionName: string, args: any[]): Promise<any> {
  try {
    const moduleAddress = UMI_CONFIG.contractAddress;
    const url = `${UMI_CONFIG.rpcUrl}/view`;
    
    const payload = {
      function: `${moduleAddress}::name_service::${functionName}`,
      functionArguments: args,
      typeArguments: []
    };

    console.log('Calling Move view function:', payload);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Move view response:', data);
    
    return data;
  } catch (error) {
    console.error(`Error calling Move view function ${functionName}:`, error);
    throw error;
  }
}

// Kullanıcıya ait domainleri Move kontratından çeker
export async function getUserDomains(address: string): Promise<string[]> {
  try {
    const moveAddress = convertToMoveAddress(address);
    
    console.log('Original address:', address);
    console.log('Converted Move address:', moveAddress);
    
    // Önce Aptos SDK ile dene
    try {
      const result = await aptos.view({
        payload: {
          function: `${UMI_CONFIG.contractAddress}::name_service::get_user_domains`,
          functionArguments: [moveAddress],
        },
      });
      return result[0] as string[];
    } catch (aptosError) {
      console.log('Aptos SDK failed, trying direct HTTP:', aptosError);
      
      // Aptos SDK başarısız olursa doğrudan HTTP ile dene
      const data = await callMoveViewFunction('get_user_domains', [moveAddress]);
      return data[0] as string[];
    }
  } catch (error) {
    console.error('Error in getUserDomains:', error);
    // Hata durumunda boş array döndür
    return [];
  }
}

// Domain alınabilir mi?
export async function isDomainAvailable(domain: string): Promise<boolean> {
  try {
    // Önce Aptos SDK ile dene
    try {
      const result = await aptos.view({
        payload: {
          function: `${UMI_CONFIG.contractAddress}::name_service::is_domain_registered`,
          functionArguments: [domain],
        },
      });
      return !(result[0] as boolean);
    } catch (aptosError) {
      console.log('Aptos SDK failed, trying direct HTTP:', aptosError);
      
      // Aptos SDK başarısız olursa doğrudan HTTP ile dene
      const data = await callMoveViewFunction('is_domain_registered', [domain]);
      return !(data[0] as boolean);
    }
  } catch (error) {
    console.error('Error in isDomainAvailable:', error);
    // Hata durumunda domain'in alınabilir olduğunu varsay
    return true;
  }
}

// Domain sahibi kim?
export async function getDomainOwner(domain: string): Promise<string | null> {
  try {
    // Önce Aptos SDK ile dene
    try {
      const result = await aptos.view({
        payload: {
          function: `${UMI_CONFIG.contractAddress}::name_service::get_domain_owner`,
          functionArguments: [domain],
        },
      });
      return result[0] as string | null;
    } catch (aptosError) {
      console.log('Aptos SDK failed, trying direct HTTP:', aptosError);
      
      // Aptos SDK başarısız olursa doğrudan HTTP ile dene
      const data = await callMoveViewFunction('get_domain_owner', [domain]);
      return data[0] as string | null;
    }
  } catch (error) {
    console.error('Error in getDomainOwner:', error);
    // Hata durumunda null döndür
    return null;
  }
}

// Domain kaydetme fonksiyonu - şimdilik placeholder
export async function registerDomain(
  userAddress: string,
  domainName: string,
  durationYears: number = 1
): Promise<string> {
  try {
    const moduleAddress = UMI_CONFIG.contractAddress;
    
    console.log('Registering domain:', {
      userAddress,
      domainName,
      durationYears,
      moduleAddress
    });
    
    // TODO: Implement actual transaction submission
    // For now, return a placeholder transaction hash
    return '0xplaceholder_transaction_hash';
  } catch (error) {
    console.error('Error in registerDomain:', error);
    throw error;
  }
}

// Domain yenileme fonksiyonu - şimdilik placeholder
export async function renewDomain(
  userAddress: string,
  domainName: string,
  durationYears: number = 1
): Promise<string> {
  try {
    const moduleAddress = UMI_CONFIG.contractAddress;
    
    console.log('Renewing domain:', {
      userAddress,
      domainName,
      durationYears,
      moduleAddress
    });
    
    // TODO: Implement actual transaction submission
    return '0xplaceholder_transaction_hash';
  } catch (error) {
    console.error('Error in renewDomain:', error);
    throw error;
  }
}

// Domain transfer fonksiyonu - şimdilik placeholder
export async function transferDomain(
  userAddress: string,
  domainName: string,
  newOwnerAddress: string
): Promise<string> {
  try {
    const moduleAddress = UMI_CONFIG.contractAddress;
    const newOwnerMoveAddress = convertToMoveAddress(newOwnerAddress);
    
    console.log('Transferring domain:', {
      userAddress,
      domainName,
      newOwnerAddress,
      newOwnerMoveAddress,
      moduleAddress
    });
    
    // TODO: Implement actual transaction submission
    return '0xplaceholder_transaction_hash';
  } catch (error) {
    console.error('Error in transferDomain:', error);
    throw error;
  }
} 