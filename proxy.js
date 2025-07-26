const http = require('http');
const https = require('https');
const url = require('url');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PORT = 4000;
const UMI_RPC_URL = 'https://devnet.uminetwork.com';

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', proxy: 'running' }));
    return;
  }

  try {
    const targetUrl = UMI_RPC_URL + req.url;
    console.log(`Proxying request to: ${targetUrl}`);

    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };

    // Add body for POST requests
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          options.body = body;
          const response = await fetch(targetUrl, options);
          const text = await response.text();

          if (!text || text.trim() === '') {
            res.writeHead(response.status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Empty response from Umi Devnet node' }));
            return;
          }

          try {
            const json = JSON.parse(text);
            res.writeHead(response.status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(json));
          } catch (e) {
            res.writeHead(response.status, { 'Content-Type': 'text/plain' });
            res.end(text);
          }
        } catch (err) {
          console.error('Proxy error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    } else {
      // GET requests
      const response = await fetch(targetUrl, options);
      const text = await response.text();

      if (!text || text.trim() === '') {
        res.writeHead(response.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Empty response from Umi Devnet node' }));
        return;
      }

      try {
        const json = JSON.parse(text);
        res.writeHead(response.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(json));
      } catch (e) {
        res.writeHead(response.status, { 'Content-Type': 'text/plain' });
        res.end(text);
      }
    }
  } catch (err) {
    console.error('Proxy error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying to Umi Devnet: ${UMI_RPC_URL}`);
}); 