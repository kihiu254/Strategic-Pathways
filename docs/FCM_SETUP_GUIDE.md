# Firebase FCM Setup - Step by Step

## Step 1: Enable Cloud Messaging API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: `strategic-pathways-ba4ba`
3. Go to APIs & Services → Library
4. Search "Firebase Cloud Messaging API"
5. Click Enable

## Step 2: Generate VAPID Key
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `strategic-pathways-ba4ba`
3. Go to Project Settings (gear icon)
4. Click "Cloud Messaging" tab
5. Under "Web Push certificates" → Click "Generate key pair"
6. Copy the key and add to .env:
```
VITE_FIREBASE_VAPID_KEY=your_generated_key_here
```

## Step 3: Install Dependencies
```bash
npm install firebase
```

## Step 4: Initialize Push Notifications
Add to your main.tsx or App.tsx:
```typescript
import { PushNotificationService } from './lib/pushNotifications';

// Request permission when app loads
useEffect(() => {
  PushNotificationService.requestPermission();
  PushNotificationService.setupForegroundListener();
}, []);
```

## Step 5: Test Push Notifications
1. Open your app in browser
2. Allow notification permissions
3. Check browser console for FCM token
4. Use Firebase Console → Cloud Messaging → Send test message

## Ready to Use!
Your Firebase FCM is now configured for unlimited free push notifications.