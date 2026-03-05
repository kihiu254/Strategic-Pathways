# Comprehensive Notifications System Setup

## 1. Database Setup
Run the SQL in `docs/notifications-schema.sql` in your Supabase SQL editor.

## 2. Install Dependencies
```bash
npm install date-fns
```

## 3. Enable Realtime in Supabase
1. Go to your Supabase project dashboard
2. Navigate to Database > Replication
3. Ensure `notifications` table is enabled for realtime

## 4. Usage Examples

### Trigger Notifications
```typescript
import { NotificationService } from '../lib/notificationService';

// Welcome new user
await NotificationService.notifyWelcome(userId, userName);

// New opportunity match
await NotificationService.notifyNewOpportunity(userId, "Digital Consultant", "opp-123");

// Application status update
await NotificationService.notifyApplicationStatus(userId, "accepted", "Tech Lead Role");
```

### Use in Components
```typescript
import { useNotifications } from '../hooks/useNotifications';

const MyComponent = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map(n => (
        <div key={n.id} onClick={() => markAsRead(n.id)}>
          {n.title}
        </div>
      ))}
    </div>
  );
};
```

## 5. Features Included

✅ Real-time notifications via Supabase Realtime
✅ Unread count badge
✅ Mark as read functionality
✅ Different notification types (info, success, warning, error, opportunity, system)
✅ Notification templates for common actions
✅ Responsive design
✅ Auto-navigation based on notification type
✅ Timestamp formatting
✅ Bulk mark as read

## 6. Cost Comparison

**Supabase Realtime**: $0 (included in plan)
**Pusher**: $49/month for 500K messages
**Firebase**: $0.06 per 100K operations
**Socket.io**: Requires server hosting (~$20/month)

## 7. Next Steps

1. Set up database triggers for automatic notifications
2. Add email/SMS notifications via Supabase Edge Functions
3. Implement push notifications for mobile
4. Add notification preferences for users