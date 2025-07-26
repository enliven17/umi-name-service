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
    const response = await fetch(url, options);
    const text = await response.text();

    // Eğer yanıt boşsa, 204 döndür
    if (!text) {
      res.status(response.status).json({});
      return;
    }

    // JSON parse edilebiliyorsa öyle döndür, yoksa düz metin döndür
    try {
      const json = JSON.parse(text);
      res.status(response.status).json(json);
    } catch (e) {
      res.status(response.status).send(text);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 