# Firebase Cloud Messaging (FCM) Setup Guide

## Why Firebase FCM?

✅ **Completely FREE** - No limits on notifications
✅ **Cross-platform** - Web, iOS, Android
✅ **Reliable** - Google's infrastructure
✅ **Real-time** - Instant delivery
✅ **Background notifications** - Works when app is closed

## Cost Comparison

| Service | Monthly Cost | Features |
|---------|-------------|----------|
| **Firebase FCM** | **$0** | Unlimited push notifications |
| **Supabase Realtime** | $0 | In-app notifications only |
| **Resend** | $0-20 | Email notifications only |
| **OneSignal** | $9-99 | Push notifications with limits |
| **Pusher** | $49+ | Real-time with message limits |

## Setup Instructions

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project: "strategic-pathways"
3. Enable Cloud Messaging

### 2. Get Configuration
Add to `.env`:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

### 3. Install Dependencies
```bash
npm install firebase
```

### 4. Initialize in App
```typescript
// In main.tsx or App.tsx
import { PushNotificationService } from './lib/pushNotifications';

// Request permission on app load
PushNotificationService.requestPermission();
PushNotificationService.setupForegroundListener();
```

### 5. Update Database Schema
```sql
-- Add FCM token to profiles
ALTER TABLE profiles ADD COLUMN fcm_token TEXT;
ALTER TABLE profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"in_app": true, "email": true, "push": true}';
```

## Recommended Architecture

### Multi-Channel Notifications
```
User Action → Comprehensive Notification Service
    ├── In-app (Supabase Realtime) ✅ FREE
    ├── Push (Firebase FCM) ✅ FREE  
    └── Email (Resend) ✅ $0-20/month
```

### Usage Example
```typescript
import { ComprehensiveNotificationService } from './lib/comprehensiveNotifications';

// Sends in-app + push + email (if applicable)
await ComprehensiveNotificationService.notifyNewOpportunity(
  userId,
  "Digital Transformation Consultant",
  "Nairobi County Government",
  95
);
```

## Benefits of This Approach

1. **Cost-Effective**: Firebase FCM is completely free
2. **Comprehensive**: Covers all notification channels
3. **User Choice**: Users can disable specific notification types
4. **Reliable**: Uses Google's infrastructure
5. **Scalable**: Handles millions of notifications

## Implementation Priority

1. ✅ **Phase 1**: In-app notifications (Supabase) - DONE
2. ✅ **Phase 2**: Email notifications (Resend) - DONE
3. 🚀 **Phase 3**: Push notifications (Firebase FCM) - IMPLEMENT NOW
4. 📊 **Phase 4**: Analytics and user preferences

## Total Monthly Cost

- **Current**: $0-20 (Resend only)
- **With Firebase FCM**: $0-20 (FCM is free!)
- **Scalability**: Unlimited notifications at no extra cost

Firebase FCM is the clear winner for push notifications - it's free, reliable, and scales infinitely.