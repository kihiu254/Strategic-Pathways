import { AppNotificationService } from './appNotifications';
import { EmailAutomationService } from './emailAutomation';
import { supabase } from './supabase';

export const VERIFIED_TIER_LABEL = 'Tier 2 – Verified Professional';
export const REJECTION_NOTICE_STORAGE_KEY = 'sp_rejection_notice';
export const DEFAULT_REJECTION_REASON = 'Criteria not met';

type VerificationStatus = 'approved' | 'rejected';

type VerificationNoticeOptions = {
  userId?: string | null;
  email?: string | null;
  name?: string | null;
  status: VerificationStatus;
  tier?: string;
  reason?: string;
};

const normalizeReason = (reason?: string | null) => {
  const trimmed = reason?.trim();
  return trimmed || DEFAULT_REJECTION_REASON;
};

export const buildVerificationStatusMessage = (status: VerificationStatus, reason?: string) => {
  if (status === 'approved') {
    return 'Your profile verification has been approved. You can now access verified opportunities.';
  }

  const resolvedReason = normalizeReason(reason);
  return `Your verification submission was not approved. Reason: ${resolvedReason}. You have been signed out. Please review your documents and contact support if you need help.`;
};

export const buildVerificationStatusTitle = (status: VerificationStatus) =>
  status === 'approved' ? 'Verification approved' : 'Verification update';

export const storeRejectionNotice = (message: string) => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(REJECTION_NOTICE_STORAGE_KEY, message);
};

export const consumeRejectionNotice = () => {
  if (typeof window === 'undefined') return null;

  const message = window.sessionStorage.getItem(REJECTION_NOTICE_STORAGE_KEY);
  if (message) {
    window.sessionStorage.removeItem(REJECTION_NOTICE_STORAGE_KEY);
  }
  return message;
};

export const fetchLatestRejectionNotice = async (userId: string) => {
  const { data } = await supabase
    .from('notifications')
    .select('message, data, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  const latestRejection = (data || []).find((notification) => {
    const payload = notification.data as Record<string, unknown> | null;
    return payload?.action === 'verification_status_update' && payload?.status === 'rejected';
  });

  return latestRejection?.message || null;
};

export const notifyVerificationStatusChange = async ({
  userId,
  email,
  name,
  status,
  tier = VERIFIED_TIER_LABEL,
  reason,
}: VerificationNoticeOptions) => {
  const safeName = name?.trim() || 'Member';
  const resolvedReason = status === 'rejected' ? normalizeReason(reason) : undefined;
  const message = buildVerificationStatusMessage(status, resolvedReason);
  const title = buildVerificationStatusTitle(status);
  const type = status === 'approved' ? 'success' : 'warning';

  await Promise.allSettled([
    userId
      ? AppNotificationService.notifyUser(userId, {
          title,
          message,
          type,
          data: {
            action: 'verification_status_update',
            status,
            tier,
            ...(resolvedReason ? { reason: resolvedReason } : {}),
          },
        })
      : Promise.resolve(),
    email
      ? EmailAutomationService.onVerificationStatusUpdate(
          email,
          safeName,
          status,
          tier,
          resolvedReason
        )
      : Promise.resolve(),
  ]);
};
