import { getFirebaseMessaging } from './_lib/firebaseAdmin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, notification, data } = req.body;
    const messaging = getFirebaseMessaging();

    if (!messaging) {
      return res.status(200).json({
        success: false,
        skipped: true,
        message: 'Firebase push is not configured.',
      });
    }

    if (!token || !notification?.title || !notification?.body) {
      return res.status(400).json({ error: 'token, notification.title, and notification.body are required.' });
    }

    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
        icon: '/logo.png'
      },
      data: Object.entries(data || {}).reduce<Record<string, string>>((accumulator, [key, value]) => {
        if (value === undefined || value === null) return accumulator;
        accumulator[key] = typeof value === 'string' ? value : JSON.stringify(value);
        return accumulator;
      }, {}),
      webpush: {
        fcmOptions: {
          link: data?.url || 'https://www.joinstrategicpathways.com'
        }
      }
    };

    const response = await messaging.send(message);
    res.json({ success: true, messageId: response });

  } catch (error) {
    console.error('Push notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
}
