import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/binance/ticker', async (req, res) => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
      if (!response.ok) throw new Error('Failed to fetch BTC price');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching BTC price:', error);
      res.status(500).json({ error: 'Failed to fetch BTC price' });
    }
  });

  app.get('/api/binance/options/ticker', async (req, res) => {
    try {
      const response = await fetch('https://eapi.binance.com/eapi/v1/ticker');
      if (!response.ok) throw new Error('Failed to fetch options ticker');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching options ticker:', error);
      res.status(500).json({ error: 'Failed to fetch options ticker' });
    }
  });

  app.get('/api/binance/options/mark', async (req, res) => {
    try {
      const response = await fetch('https://eapi.binance.com/eapi/v1/mark');
      if (!response.ok) throw new Error('Failed to fetch options mark');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching options mark:', error);
      res.status(500).json({ error: 'Failed to fetch options mark' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
