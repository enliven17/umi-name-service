const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;
const UMI_RPC = 'https://devnet.uminetwork.com';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use('/', async (req, res) => {
  const url = UMI_RPC + req.url;
  const options = {
    method: req.method,
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
  };

  try {
    console.log(`Proxying request to: ${url}`);
    const response = await fetch(url, options);
    const text = await response.text();

    // Eğer yanıt boşsa, anlamlı bir hata döndür
    if (!text || text.trim() === '') {
      console.log('Empty response from Umi RPC');
      res.status(response.status).json({ 
        error: 'Empty response from Umi Devnet node',
        message: 'The requested module or function may not exist or be indexed yet'
      });
      return;
    }

    // JSON parse edilebiliyorsa öyle döndür, yoksa düz metin döndür
    try {
      const json = JSON.parse(text);
      res.status(response.status).json(json);
    } catch (e) {
      console.log('Non-JSON response from Umi RPC:', text);
      res.status(response.status).send(text);
    }
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ 
      error: err.message,
      message: 'Failed to connect to Umi Devnet RPC'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying to Umi Devnet: ${UMI_RPC}`);
}); 