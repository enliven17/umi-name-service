import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { UMI_CONFIG } from '@/config/umi';

const aptosConfig = new AptosConfig({
  network: Network.DEVNET,
  fullnode: UMI_CONFIG.rpcUrl,
});
const aptos = new Aptos(aptosConfig);

// Kullanıcıya ait domainleri Move kontratından çeker
export async function getUserDomains(address: string): Promise<string[]> {
  const moveAddress = address.startsWith('0x') ? address : `0x${address}`;
  const moduleAddress = UMI_CONFIG.contractAddress;
  const result = await aptos.view({
    payload: {
      function: `${moduleAddress}::name_service::get_user_domains`,
      functionArguments: [moveAddress],
    },
  });
  // Sonuç bir string[] olacak şekilde parse edilir
  return result[0] as string[];
} 