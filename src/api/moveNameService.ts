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

// Kullanıcıya ait domainleri Move kontratından çeker
export async function getUserDomains(address: string): Promise<string[]> {
  try {
    const moveAddress = convertToMoveAddress(address);
    const moduleAddress = UMI_CONFIG.contractAddress;
    
    console.log('Original address:', address);
    console.log('Converted Move address:', moveAddress);
    
    const result = await aptos.view({
      payload: {
        function: `${moduleAddress}::name_service::get_user_domains`,
        functionArguments: [moveAddress],
      },
    });
    return result[0] as string[];
  } catch (error) {
    console.error('Error in getUserDomains:', error);
    throw error;
  }
}

// Domain alınabilir mi?
export async function isDomainAvailable(domain: string): Promise<boolean> {
  try {
    const moduleAddress = UMI_CONFIG.contractAddress;
    const result = await aptos.view({
      payload: {
        function: `${moduleAddress}::name_service::is_domain_registered`,
        functionArguments: [domain],
      },
    });
    // is_domain_registered true ise domain alınmış demektir, false ise alınabilir
    return !(result[0] as boolean);
  } catch (error) {
    console.error('Error in isDomainAvailable:', error);
    throw error;
  }
}

// Domain sahibi kim?
export async function getDomainOwner(domain: string): Promise<string | null> {
  try {
    const moduleAddress = UMI_CONFIG.contractAddress;
    const result = await aptos.view({
      payload: {
        function: `${moduleAddress}::name_service::get_domain_owner`,
        functionArguments: [domain],
      },
    });
    // Eğer domain alınmamışsa null dönebilir
    return result[0] as string | null;
  } catch (error) {
    console.error('Error in getDomainOwner:', error);
    throw error;
  }
} 