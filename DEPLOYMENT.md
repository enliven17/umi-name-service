# Umi Name Service Deployment Guide

Bu rehber [Umi Network'ün resmi dokümantasyonuna](https://docs.uminetwork.com/deploy-contract) dayanmaktadır.

## Prerequisites

1. **Node.js 18+** kurulu olmalı
2. **MetaMask** veya uyumlu Web3 cüzdanı
3. **Umi Devnet** cüzdanınızda yapılandırılmış olmalı
4. **Test ETH** - Umi faucet'ten alınmalı

## 1. Hardhat Kurulumu

Proje zaten Hardhat ile yapılandırılmış durumda. Gerekli paketler kuruldu:

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @moved/hardhat-plugin @aptos-labs/ts-sdk
```

## 2. Cüzdan Yapılandırması

### Private Key Ekleme

`hardhat.config.js` dosyasında private key'inizi ekleyin:

```javascript
module.exports = {
  defaultNetwork: "devnet",
  networks: {
    devnet: {
      url: "https://devnet.uminetwork.com",
      accounts: ["YOUR_PRIVATE_KEY"] // Buraya private key'inizi ekleyin
    }
  }
};
```

**⚠️ Güvenlik Uyarısı:** Private key'inizi asla GitHub'a push etmeyin. `.env` dosyası kullanın:

```bash
# .env dosyası oluşturun
echo "PRIVATE_KEY=your_private_key_here" > .env
```

Ve `hardhat.config.js`'i güncelleyin:

```javascript
require('dotenv').config();

module.exports = {
  defaultNetwork: "devnet",
  networks: {
    devnet: {
      url: "https://devnet.uminetwork.com",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

### Umi Devnet Yapılandırması

MetaMask'ta Umi Devnet'i ekleyin:
- **Network Name**: Umi Devnet
- **RPC URL**: https://devnet.uminetwork.com
- **Chain ID**: 42069
- **Currency Symbol**: ETH
- **Block Explorer**: https://devnet.explorer.moved.network

## 3. Move Contract Deploy

### Contract Hazırlığı

Move contract'ı `contracts/name-service/` klasöründe hazır durumda:

```
contracts/name-service/
├── Move.toml
└── sources/
    └── name_service.move
```

### Address Güncelleme

`contracts/name-service/Move.toml` dosyasında adresinizi güncelleyin:

```toml
[addresses]
umi_name_service = "YOUR_WALLET_ADDRESS" # Cüzdan adresinizi buraya ekleyin
```

### Contract Compile

```bash
npx hardhat compile
```

### Contract Deploy

```bash
npx hardhat run scripts/deploy.js --network devnet
```

Deploy başarılı olduktan sonra şu bilgileri not edin:
- **Contract Address**: Deploy eden cüzdan adresi
- **Module Path**: `{address}::name_service`

## 4. Frontend Konfigürasyonu

### Contract Address Güncelleme

Deploy tamamlandıktan sonra `src/config/umi.ts` dosyasını güncelleyin:

```typescript
export const UMI_CONFIG: UmiConfig = {
  rpcUrl: 'https://devnet.uminetwork.com',
  chainId: 42069,
  explorerUrl: 'https://devnet.explorer.moved.network',
  contractAddress: 'YOUR_DEPLOYED_CONTRACT_ADDRESS', // Deploy edilen adres
};
```

## 5. Frontend Deploy

### Build

```bash
npm run build
```

### Deploy Options

#### Vercel (Önerilen)

```bash
npm install -g vercel
vercel
```

#### Netlify

1. `dist` klasörünü Netlify'a yükleyin
2. Domain ayarlarını yapılandırın

#### GitHub Pages

`vite.config.ts`'e base path ekleyin:

```typescript
export default defineConfig({
  base: '/umi-name-service/',
  // ... diğer ayarlar
});
```

## 6. Test Etme

1. **Cüzdan Bağlantısı**: Deploy edilen uygulamada cüzdanınızı bağlayın
2. **Network Kontrolü**: Umi Devnet'te olduğunuzdan emin olun
3. **Domain Arama**: Bir domain arayın (örn: "myname")
4. **Domain Kayıt**: Müsaitse kayıt edin

## 7. Contract Fonksiyonları

Deploy edilen contract şu fonksiyonları destekler:

- `register_domain(name, duration_years)` - Yeni domain kaydetme
- `transfer_domain(name, new_owner)` - Domain sahipliği transfer etme
- `renew_domain(name, duration_years)` - Domain yenileme
- `set_resolver(name, resolver)` - Resolver adresi ayarlama
- `is_domain_registered(name)` - Domain kayıtlı mı kontrol etme
- `get_domain_owner(name)` - Domain sahibini alma
- `get_domain_expiry(name)` - Domain bitiş tarihini alma
- `get_user_domains(user_addr)` - Kullanıcının domain'lerini alma

## 8. Troubleshooting

### Yaygın Sorunlar

1. **"Contract not found" hatası**:
   - Contract adresini kontrol edin
   - Deploy işleminin başarılı olduğundan emin olun

2. **"Insufficient balance" hatası**:
   - Umi faucet'ten daha fazla test ETH alın
   - Cüzdan bakiyenizi kontrol edin

3. **"Network not supported" hatası**:
   - Cüzdanınızın Umi Devnet'te olduğundan emin olun
   - Umi Devnet'i cüzdanınıza ekleyin

### Destek

Deploy sorunları için:
- [Umi Dokümantasyonu](https://docs.uminetwork.com/)
- Umi Discord topluluğu
- GitHub issue açın

## 9. Production Checklist

- [ ] Private key güvenliği (.env dosyası)
- [ ] Contract başarıyla deploy edildi
- [ ] Frontend contract adresi güncellendi
- [ ] Test ETH yeterli miktarda
- [ ] Domain arama çalışıyor
- [ ] Domain kayıt çalışıyor
- [ ] Cüzdan bağlantısı stabil
- [ ] Error handling çalışıyor 