import { getApiKey } from '../src/lib/server/analysis-handler';

export default function handler(req: any, res: any) {
  const { key, name } = getApiKey();
  return res.status(200).json({
    environment: process.env.VERCEL ? 'vercel-production' : process.env.NODE_ENV || 'development',
    apiKeyPresent: Boolean(key),
    keyVariable: name,
    modelConfigured: 'gemini-3.7-flash',
    serverTimestamp: new Date().toISOString(),
  });
}
