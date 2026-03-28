import { getToken, isSupported, onMessage } from 'firebase/messaging';
import { toast } from 'sonner';
import { messaging } from './firebase';

const PENDING_FCM_TOKEN_KEY = 'sp_pending_fcm_token';
const DEFAULT_VAPID_KEY = 'BGhhd5Ty38TvWa5BmubE6LqE8yRhHFd_yGKmCVw4DZhw2vJPLMquamOzS7rXQWNBWyV9e0iWM923_JFTpjHczFE';

export class PushNotificationService {
  private static foregroundListenerReady = false;

  private static get vapidKey() {
    return import.meta.env.VITE_FIREBASE_VAPID_KEY || DEFAULT_VAPID_KEY;
  }

  private static async ensureSupported() {
    if (typeof window === 'undefined' || typeof Notification === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      return await isSupported();
    } catch (error) {
      console.warn('Push notifications are not supported in this browser.', error);
      return false;
    }
  }

  private static async getServiceWorkerRegistration() {
    const supported = await this.ensureSupported();
    if (!supported) return null;

    return navigator.serviceWorker.register('/firebase-messaging-sw.js');
  }

  private static cachePendingToken(token: string | null) {
    if (typeof window === 'undefined') return;

    if (token) {
      window.localStorage.setItem(PENDING_FCM_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(PENDING_FCM_TOKEN_KEY);
    }
  }

  private static getPendingToken() {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(PENDING_FCM_TOKEN_KEY);
  }

  private static async fetchCurrentToken() {
    const registration = await this.getServiceWorkerRegistration();
    if (!registration) return null;

    return getToken(messaging, {
      vapidKey: this.vapidKey,
      serviceWorkerRegistration: registration,
    });
  }

  static async requestPermission() {
    try {
      const supported = await this.ensureSupported();
      if (!supported) return null;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return null;
      }

      const token = await this.fetchCurrentToken();
      if (!token) return null;

      await this.saveTokenToDatabase(token);
      return token;
    } catch (error) {
      console.error('Push notification permission error:', error);
      return null;
    }
  }

  static async syncTokenForCurrentUser() {
    try {
      const supported = await this.ensureSupported();
      if (!supported || Notification.permission !== 'granted') {
        return null;
      }

      const token = this.getPendingToken() || (await this.fetchCurrentToken());
      if (!token) return null;

      await this.saveTokenToDatabase(token);
      return token;
    } catch (error) {
      console.error('Push token sync failed:', error);
      return null;
    }
  }

  static async saveTokenToDatabase(token: string) {
    const { supabase } = await import('./supabase');
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      this.cachePendingToken(token);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ fcm_token: token })
      .eq('id', user.id);

    if (error) {
      console.error('Failed to save FCM token:', error);
      this.cachePendingToken(token);
      return;
    }

    this.cachePendingToken(null);
  }

  static setupForegroundListener() {
    if (this.foregroundListenerReady) {
      return;
    }

    this.foregroundListenerReady = true;
    void (async () => {
      const supported = await this.ensureSupported();
      if (!supported) return;

      onMessage(messaging, (payload) => {
        toast.success(payload.notification?.title || 'New notification', {
          description: payload.notification?.body,
          action: payload.data?.url
            ? {
                label: 'View',
                onClick: () => window.open(payload.data?.url, '_blank'),
              }
            : undefined,
        });
      });
    })();
  }

  static async sendPushNotification(userToken: string, title: string, body: string, data?: Record<string, unknown>) {
    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: userToken,
        notification: { title, body },
        data,
      }),
    });

    return response.json();
  }
}
