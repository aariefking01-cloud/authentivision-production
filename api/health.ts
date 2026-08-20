import { getApiKey } from '../src/lib/server/analysis-handler';

export default function handler(req: any, res: any) {
  const { key, name } = getApiKey();
  return res.status(200).json({
    status: 'ok',
    environment: 'vercel',
    time: new Date().toISOString(),
    apiKeyPresent: Boolean(key),
    keyVariable: name,
  });
}
