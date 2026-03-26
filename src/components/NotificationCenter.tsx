import { useState } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-400" size={16} />;
      case 'warning': return <AlertTriangle className="text-yellow-400" size={16} />;
      case 'error': return <AlertCircle className="text-red-400" size={16} />;
      case 'opportunity': return <Bell className="text-[var(--sp-accent)]" size={16} />;
      default: return <Info className="text-blue-400" size={16} />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    setIsOpen(false);
    navigate('/notifications');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-white/5 relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[120]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-[90vw] max-w-sm sm:w-96 sm:max-w-none max-h-[500px] glass-card p-4 z-[121] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('notifications.title')}</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[var(--sp-accent)] hover:underline flex items-center gap-1"
                  >
                    <CheckCheck size={12} />
                    {t('notifications.markAsRead')}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <X size={16} className="text-[var(--text-secondary)]" />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                  <Bell size={32} className="mx-auto mb-2 opacity-30" />
                  <p>{t('notifications.empty')}</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all hover:bg-white/5 ${
                      notification.read 
                        ? 'border-white/5 opacity-70' 
                        : 'border-[var(--sp-accent)]/20 bg-[var(--sp-accent)]/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--text-primary)] text-sm font-medium mb-1">
                          {notification.title}
                        </p>
                        <p className="text-[var(--text-secondary)] text-xs leading-relaxed mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[var(--sp-accent)]">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-[var(--sp-accent)] rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t border-white/10 mt-4 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/notifications');
                  }}
                  className="w-full text-center text-sm text-[var(--text-secondary)] hover:text-[var(--sp-accent)] transition-colors"
                >
                  {t('notifications.viewAll')}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
