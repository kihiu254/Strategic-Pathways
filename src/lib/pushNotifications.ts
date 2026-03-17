// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';
import { toast } from 'sonner';

export class PushNotificationService {
  static async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: 'BGhhd5Ty38TvWa5BmubE6LqE8yRhHFd_yGKmCVw4DZhw2vJPLMquamOzS7rXQWNBWyV9e0iWM923_JFTpjHczFE'
        });
        
        // Save token to user profile
        await this.saveTokenToDatabase(token);
        return token;
      }
    } catch (error) {
      console.error('Push notification permission error:', error);
    }
  }

  static async saveTokenToDatabase(token: string) {
    const { supabase } = await import('./supabase');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.id) {
      await supabase
        .from('profiles')
        .update({ fcm_token: token })
        .eq('id', user.id);
    }
  }

  static setupForegroundListener() {
    onMessage(messaging, (payload) => {
      
      toast.success(payload.notification?.title || 'New notification', {
        description: payload.notification?.body,
        action: payload.data && payload.data.url ? {
          label: 'View',
          onClick: () => window.open(payload.data?.url, '_blank')
        } : undefined
      });
    });
  }

  // Send push notification (server-side)
  static async sendPushNotification(
    userToken: string,
    title: string,
    body: string,
    data?: any
  ) {
    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: userToken,
        notification: { title, body },
        data
      })
    });
    return response.json();
  }
}