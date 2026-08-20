import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { handleAnalyzeImage, handleForensicNarrator, getApiKey } from './src/lib/server/analysis-handler';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Health route
  app.get('/api/health', (_req, res) => {
    const { key, name } = getApiKey();
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      apiKeyPresent: Boolean(key),
      keyVariable: name,
    });
  });

  // Safe diagnostics endpoint (NEVER exposes secret keys)
  app.get('/api/diagnostics', (_req, res) => {
    const { key, name } = getApiKey();
    res.json({
      environment: process.env.NODE_ENV || 'development',
      apiKeyPresent: Boolean(key),
      keyVariable: name,
      modelConfigured: 'gemini-2.5-flash',
      serverTimestamp: new Date().toISOString(),
    });
  });

  // Server-side route for full multimodal image authenticity analysis
  app.post('/api/analyze-image', async (req, res) => {
    const result = await handleAnalyzeImage(req.body, 'express');
    return res.status(result.status).json(result.data);
  });

  // Server-side route for forensic narrative explanation
  app.post('/api/forensic-narrator', async (req, res) => {
    const result = await handleForensicNarrator(req.body, 'express');
    return res.status(result.status).json(result.data);
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('{*all}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AuthentiVision server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
