import { handleForensicNarrator } from '../src/lib/server/analysis-handler';

export default async function handler(req: any, res: any) {
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
    const result = await handleForensicNarrator(body, 'vercel');
    return res.status(result.status).json(result.data);
  } catch (err: any) {
    console.error('Vercel API error in forensic-narrator:', err);
    return res.status(500).json({
      error: 'NARRATOR_FAILED',
      message: err?.message || 'Server error during forensic narrative generation',
    });
  }
}
