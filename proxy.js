const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 4000;
const UMI_RPC = 'https://devnet.uminetwork.com';

app.use(cors());
app.use(express.json());

app.use('/', async (req, res) => {
  const url = UMI_RPC + req.url;
  const options = {
    method: req.method,
    headers: { ...req.headers, host: undefined, origin: undefined },
    body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
  };
  try {
    const response = await fetch(url, options);
    const data = await response.buffer();
    res.status(response.status);
    res.set(response.headers.raw());
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 