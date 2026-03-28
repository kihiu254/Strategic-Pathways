import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getFirebaseMessaging } from './_lib/firebaseAdmin';

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'opportunity' | 'system';

type NotificationRequestBody = {
  userId?: string;
  userIds?: string[];
  title?: string;
  message?: string;
  type?: NotificationType;
  data?: Record<string, unknown>;
};

const getBaseUrl = () => {
  const explicitUrl = process.env.VITE_PRODUCTION_URL || process.env.PRODUCTION_URL || process.env.SITE_URL;
  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'https://www.joinstrategicpathways.com';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'This request method is not available here.' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return res.status(200).json({
      success: false,
      skipped: true,
      message: 'Notifications are temporarily unavailable.',
    });
  }

  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!accessToken) {
    return res.status(401).json({ error: 'Please sign in and try again.' });
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser(accessToken);

  if (authError || !user) {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }

  const body = (req.body ?? {}) as NotificationRequestBody;
  const title = body.title?.trim();
  const message = body.message?.trim();
  const type = body.type ?? 'info';
  const data = body.data ?? {};
  const targetIds = Array.from(
    new Set(
      (body.userIds?.length ? body.userIds : body.userId ? [body.userId] : [user.id]).filter(Boolean)
    )
  );

  if (!title || !message) {
    return res.status(400).json({ error: 'Please complete all required fields and try again.' });
  }

  const { data: requesterProfile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = requesterProfile?.role === 'admin';

  if (!isAdmin && targetIds.some((targetId) => targetId !== user.id)) {
    return res.status(403).json({ error: 'This action is not available for your account.' });
  }

  const { error } = await serviceClient.from('notifications').insert(
    targetIds.map((targetId) => ({
      user_id: targetId,
      title,
      message,
      type,
      read: false,
      data,
    }))
  );

  let dbError = null;
  if (error) {
    console.error('Notification insert failed:', JSON.stringify(error, null, 2));
    dbError = error;
    // We don't return 500 immediately to allow push notifications to still be attempted
  }

  let pushSent = 0;
  try {
    const { data: recipientProfiles, error: profileError } = await serviceClient
      .from('profiles')
      .select('id, fcm_token')
      .in('id', targetIds);

    if (profileError) {
      throw profileError;
    }

    const tokens = (recipientProfiles || [])
      .map((profile) => profile.fcm_token)
      .filter((token): token is string => typeof token === 'string' && token.trim().length > 0);

    const messaging = tokens.length > 0 ? getFirebaseMessaging() : null;
    if (messaging && tokens.length > 0) {
      const response = await messaging.sendEachForMulticast({
        tokens,
        notification: {
          title,
          body: message,
        },
        data: Object.entries(data).reduce<Record<string, string>>((accumulator, [key, value]) => {
          if (value === undefined || value === null) return accumulator;
          accumulator[key] = typeof value === 'string' ? value : JSON.stringify(value);
          return accumulator;
        }, {}),
        webpush: {
          fcmOptions: {
            link:
              typeof data.url === 'string'
                ? data.url
                : typeof data.opportunityId === 'string'
                  ? `${getBaseUrl()}/opportunities/${data.opportunityId}`
                  : typeof data.projectId === 'string'
                    ? `${getBaseUrl()}/projects/${data.projectId}`
                    : `${getBaseUrl()}/notifications`,
          },
        },
      });

      pushSent = response.successCount;

      const invalidTokens = response.responses
        .map((result, index) => {
          const code = result.error?.code;
          const isInvalidToken =
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered';
          return !result.success && isInvalidToken ? tokens[index] : null;
        })
        .filter((token): token is string => Boolean(token));

      if (invalidTokens.length > 0) {
        await serviceClient
          .from('profiles')
          .update({ fcm_token: null })
          .in('fcm_token', invalidTokens);
      }
    }
  } catch (pushError) {
    console.error('Push dispatch failed:', pushError);
  }

  // If DB failed but push succeeded (or was attempted), return success but with a warning or the DB error if both failed
  if (dbError && pushSent === 0) {
    return res.status(500).json({ 
      error: 'We could not save that notification right now.',
      details: process.env.NODE_ENV === 'development' ? dbError : undefined 
    });
  }

  return res.status(200).json({ 
    success: !dbError || pushSent > 0, 
    count: targetIds.length, 
    pushSent,
    warning: dbError ? 'Database sync failed, but push was attempted.' : undefined
  });
}
