import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'strategic-pathways-ba4ba',
      privateKey: 'WBTRLIbTj56aezjy0QaE7llHaRbXbz0egYq5gtq8h_4'.replace(/\\n/g, '\n'),
      clientEmail: `firebase-adminsdk@strategic-pathways-ba4ba.iam.gserviceaccount.com`
    })
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, notification, data } = req.body;

    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
        icon: '/logo.png'
      },
      data: data || {},
      webpush: {
        fcmOptions: {
          link: data?.url || 'https://www.joinstrategicpathways.com'
        }
      }
    };

    const response = await admin.messaging().send(message);
    res.json({ success: true, messageId: response });

  } catch (error) {
    console.error('Push notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
}