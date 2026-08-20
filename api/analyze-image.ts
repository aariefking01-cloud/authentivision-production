import type { IncomingMessage, ServerResponse } from 'http';
import { handleAnalyzeImage } from '../src/lib/server/analysis-handler';

export default async function handler(req: any, res: any) {
  // Support CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    const result = await handleAnalyzeImage(body, 'vercel');
    return res.status(result.status).json(result.data);
  } catch (err: any) {
    console.error('Vercel API error in analyze-image:', err);
    return res.status(500).json({
      error: 'AI_ANALYSIS_FAILED',
      message: err?.message || 'Server error during forensic analysis execution',
    });
  }
}
