import { useEffect } from 'react';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import SEO from '../components/SEO';
import { useNotifications, type Notification } from '../hooks/useNotifications';
import { useAuthStore } from '../store/authStore';

const NotificationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [navigate, user]);

  if (!user) return null;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-400" size={18} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-400" size={18} />;
      case 'error':
        return <AlertCircle className="text-red-400" size={18} />;
      case 'opportunity':
        return <Bell className="text-[var(--sp-accent)]" size={18} />;
      default:
        return <Info className="text-blue-400" size={18} />;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    const action = notification.data?.action;
    if (
      action === 'application_submitted' ||
      action === 'application_status_update' ||
      action === 'opportunity_interest'
    ) {
      navigate('/opportunities');
      return;
    }

    if (
      action === 'profile_updated' ||
      action === 'profile_onboarding_complete' ||
      action === 'basic_onboarding_complete' ||
      action === 'payment_confirmed'
    ) {
      navigate('/profile');
      return;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-28 pb-16">
      <SEO title={t('notifications.title')} />
      <div className="max-w-4xl mx-auto px-6">
        <div className="glass-card p-8 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">{t('notifications.title')}</h1>
              <p className="text-[var(--text-secondary)] mt-2">
                {t('notifications.review')}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="sp-btn-glass inline-flex items-center gap-2"
              >
                <CheckCheck size={16} />
                {t('notifications.markAsRead')}
              </button>
            )}
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
                <Bell className="mx-auto mb-4 text-[var(--text-secondary)]/50" size={32} />
                <p className="text-[var(--text-secondary)]">{t('notifications.empty')}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void handleNotificationClick(notification)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all hover:bg-white/5 ${
                    notification.read
                      ? 'border-white/10'
                      : 'border-[var(--sp-accent)]/30 bg-[var(--sp-accent)]/8'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0">{getIcon(notification.type)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-[var(--text-primary)] font-semibold">{notification.title}</h2>
                          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--sp-accent)]" />
                        )}
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--sp-accent)]/80">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
