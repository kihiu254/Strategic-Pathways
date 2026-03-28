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
  private static async getCurrentUserContext() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error('You must be signed in to send notifications.');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return {
      user,
      isAdmin: profile?.role === 'admin',
    };
  }

  private static async insertDirect(payload: NotificationPayload) {
    const { user, isAdmin } = await this.getCurrentUserContext();
    const targetIds = Array.from(
      new Set(
        (payload.userIds?.length ? payload.userIds : payload.userId ? [payload.userId] : [user.id]).filter(Boolean)
      )
    );

    if (!isAdmin && targetIds.some((targetId) => targetId !== user.id)) {
      throw new Error('You can only create notifications for your own account.');
    }

    const { error } = await supabase.from('notifications').insert(
      targetIds.map((targetId) => ({
        user_id: targetId,
        title: payload.title,
        message: payload.message,
        type: payload.type ?? 'info',
        read: false,
        data: payload.data ?? {},
      }))
    );

    if (error) {
      throw new Error(error.message || 'Failed to create notification.');
    }

    return { success: true, count: targetIds.length, mode: 'direct' as const };
  }

  private static async send(payload: NotificationPayload) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return this.insertDirect(payload);
    }

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
        skipped?: boolean;
        success?: boolean;
      } | null;

      if (result?.skipped) {
        return this.insertDirect(payload);
      }

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to create notification.');
      }

      return result;
    } catch (error) {
      console.warn('Notification API unavailable, falling back to direct insert.', error);
      return this.insertDirect(payload);
    }
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
