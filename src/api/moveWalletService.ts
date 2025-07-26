import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import { UMI_CONFIG } from '@/config/umi';

const aptosConfig = new AptosConfig({
  network: Network.DEVNET,
  fullnode: UMI_CONFIG.rpcUrl,
});
const aptos = new Aptos(aptosConfig);

export function createMoveAccountFromPrivateKey(privateKey: string): Account {
  try {
    const movePrivateKey = new Ed25519PrivateKey(privateKey);
    const account = Account.fromPrivateKey({ privateKey: movePrivateKey });
    return account;
  } catch (error) {
    console.error('Error creating Move account:', error);
    throw error;
  }
}

// Gerçek cüzdan ile domain kaydı
export async function registerDomainWithMoveWallet(
  domainName: string,
  durationYears: number = 1
): Promise<string> {
  try {
    console.log('Registering domain on Move with connected wallet:', { domainName, durationYears });
    
    if (!(window as any).aptos) {
      throw new Error('Petra or Martian wallet not connected');
    }

    // Cüzdan bağlantısını kontrol et
    const account = await (window as any).aptos.account();
    if (!account) {
      throw new Error('No Move wallet account found');
    }

    console.log('Move wallet account:', account.address);
    
    // Transaction payload oluştur
    const payload = {
      function: `${UMI_CONFIG.contractAddress}::name_service::register_domain`,
      functionArguments: [domainName, durationYears],
      typeArguments: []
    };

    console.log('Transaction payload:', payload);

    // Cüzdan ile transaction gönder
    const pendingTransaction = await (window as any).aptos.signAndSubmitTransaction(payload);
    
    console.log('Move transaction submitted:', pendingTransaction.hash);
    
    // Transaction'ın tamamlanmasını bekle
    const response = await aptos.transaction.waitForTransaction({
      transactionHash: pendingTransaction.hash
    });
    
    console.log('Move transaction completed:', response);
    return pendingTransaction.hash;
    
  } catch (error) {
    console.error('Error in registerDomainWithMoveWallet:', error);
    throw error;
  }
}

// Private key ile domain kaydı (eski yöntem - test için)
export async function registerDomainMoveWithWallet(
  privateKey: string,
  domainName: string,
  durationYears: number = 1
): Promise<string> {
  try {
    console.log('Registering domain on Move with private key:', { domainName, durationYears });
    
    const account = createMoveAccountFromPrivateKey(privateKey);
    console.log('Move account address:', account.accountAddress.toString());
    
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${UMI_CONFIG.contractAddress}::name_service::register_domain`,
        functionArguments: [domainName, durationYears],
        typeArguments: []
      }
    });
    
    const pendingTransaction = await aptos.transaction.signAndSubmitTransaction({
      signer: account,
      transaction
    });
    
    const response = await aptos.transaction.waitForTransaction({
      transactionHash: pendingTransaction.hash
    });
    
    console.log('Move transaction completed:', response);
    return pendingTransaction.hash;
    
  } catch (error) {
    console.error('Error in registerDomainMoveWithWallet:', error);
    throw error;
  }
}

// Domain durumunu kontrol et (Move)
export async function checkDomainStatusMove(domainName: string): Promise<{ isRegistered: boolean; owner: string | null }> {
  try {
    console.log('Checking Move domain status for:', domainName);
    
    const result = await aptos.view({
      payload: {
        function: `${UMI_CONFIG.contractAddress}::name_service::is_domain_registered`,
        functionArguments: [domainName],
      },
    });
    
    const isRegistered = result[0] as boolean;
    console.log('Move domain registered:', isRegistered);
    
    if (isRegistered) {
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
    return { isRegistered: false, owner: null };
  }
}

// Kullanıcı domainlerini al (Move)
export async function getUserDomainsMove(address: string): Promise<string[]> {
  try {
    console.log('Getting Move domains for address:', address);
    
    const result = await aptos.view({
      payload: {
        function: `${UMI_CONFIG.contractAddress}::name_service::get_user_domains`,
        functionArguments: [address],
      },
    });
    
    const domains = result[0] as string[];
    console.log('Move domains:', domains);
    return domains;
  } catch (error) {
    console.error('Error in getUserDomainsMove:', error);
    return [];
  }
} 