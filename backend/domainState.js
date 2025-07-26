const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
const PORT = 5000;

// CORS ayarları
app.use(cors());
app.use(express.json());

// Umi Network RPC URL'leri
const UMI_MOVE_RPC = 'https://devnet.uminetwork.com';
const UMI_EVM_RPC = 'https://devnet.uminetwork.com';

// Kontrat adresleri
const MOVE_CONTRACT_ADDRESS = '0x00000000000000000000000071197e7a1CA5A2cb2AD82432B924F69B1E3dB123';
const EVM_CONTRACT_ADDRESS = '0x0E90a99b22Cc5b281FF52f418BAe4ec909a7F5fb';

// Domain fiyatları (APT ve ETH cinsinden)
const DOMAIN_PRICE_APT = '1'; // 1 APT
const DOMAIN_PRICE_ETH = '0.001'; // 0.001 ETH

// In-memory domain state (gerçek uygulamada veritabanı kullanılır)
const domainState = new Map();

// Domain state sorgulama
app.get('/api/domain/:name', (req, res) => {
  const name = req.params.name.toLowerCase();
  if (domainState.has(name)) {
    res.json(domainState.get(name));
  } else {
    res.json({ available: true });
  }
});

// Domain kaydetme
app.post('/api/domain', (req, res) => {
  const { name, chain, owner } = req.body;
  if (!name || !chain || !owner) return res.status(400).json({ error: "Missing params" });
  if (domainState.has(name)) return res.status(409).json({ error: "Domain already taken" });
  domainState.set(name, { chain, owner });
  res.json({ success: true });
});

// Sistem konfigürasyonu endpoint'i
app.get('/api/config', (req, res) => {
  res.json({
    moveContractAddress: MOVE_CONTRACT_ADDRESS,
    evmContractAddress: EVM_CONTRACT_ADDRESS,
    moveRpcUrl: UMI_MOVE_RPC,
    evmRpcUrl: UMI_EVM_RPC,
    prices: {
      apt: DOMAIN_PRICE_APT,
      eth: DOMAIN_PRICE_ETH
    }
  });
});

// Domain fiyatları endpoint'i
app.get('/api/prices', (req, res) => {
  res.json({
    apt: DOMAIN_PRICE_APT,
    eth: DOMAIN_PRICE_ETH
  });
});

// Tüm domainleri listele (test için)
app.get('/api/domains', (req, res) => {
  const domains = Array.from(domainState.entries()).map(([name, data]) => ({
    name,
    ...data
  }));
  res.json(domains);
});

app.listen(PORT, () => {
  console.log(`Domain state API running on http://localhost:${PORT}`);
}); 