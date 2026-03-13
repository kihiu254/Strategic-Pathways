import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const privateKey = process.env.VITE_IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      return res.status(500).json({ error: 'ImageKit private key missing' });
    }

    const token = req.query.token || crypto.randomBytes(16).toString('hex');
    const expire = req.query.expire || Math.floor(Date.now() / 1000) + 1800; // 30 mins
    
    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(token + expire)
      .digest('hex');

    return res.status(200).json({
      token,
      expire,
      signature
    });
  } catch (error) {
    console.error('ImageKit auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
