import { supabase } from './supabase';

export type AppNotificationType = 'info' | 'success' | 'warning' | 'error' | 'opportunity' | 'system';

type NotificationPayload = {
  userId?: string;
  userIds?: string[];
  title: string;
  message: string;
  type?: AppNotificationType;
  data?: Record<string, unknown>;
};

export class AppNotificationService {
  private static async send(payload: NotificationPayload) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('You must be signed in to send notifications.');
    }

    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(result?.error || 'Failed to create notification.');
    }

    return response.json();
  }

  static async notifySelf(payload: Omit<NotificationPayload, 'userId' | 'userIds'>) {
    return this.send(payload);
  }

  static async notifyUser(userId: string, payload: Omit<NotificationPayload, 'userId' | 'userIds'>) {
    return this.send({ ...payload, userId });
  }

  static async notifyUsers(userIds: string[], payload: Omit<NotificationPayload, 'userId' | 'userIds'>) {
    return this.send({ ...payload, userIds });
  }
}
