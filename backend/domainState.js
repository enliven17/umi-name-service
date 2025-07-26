const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// CORS ayarları
app.use(cors());
app.use(express.json());

// EVM kontrat adresi
const EVM_CONTRACT_ADDRESS = '0x2823Af7e1F2F50703eD9f81Ac4B23DC1E78B9E53';

// Domain fiyatı (sadece ETH)
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
  const { name, owner } = req.body;
  if (!name || !owner) return res.status(400).json({ error: "Missing params" });
  if (domainState.has(name)) return res.status(409).json({ error: "Domain already taken" });
  domainState.set(name, { chain: 'evm', owner });
  res.json({ success: true });
});

// Sistem konfigürasyonu endpoint'i
app.get('/api/config', (req, res) => {
  res.json({
    evmContractAddress: EVM_CONTRACT_ADDRESS,
    evmRpcUrl: 'https://devnet.uminetwork.com',
    prices: {
      eth: DOMAIN_PRICE_ETH
    }
  });
});

// Domain fiyatları endpoint'i
app.get('/api/prices', (req, res) => {
  res.json({
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