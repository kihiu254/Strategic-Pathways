import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'opportunity' | 'system';

type NotificationRequestBody = {
  userId?: string;
  userIds?: string[];
  title?: string;
  message?: string;
  type?: NotificationType;
  data?: Record<string, unknown>;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return res.status(500).json({ error: 'Notification service is not configured.' });
  }

  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!accessToken) {
    return res.status(401).json({ error: 'Missing authorization token.' });
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
    return res.status(401).json({ error: 'Invalid session.' });
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
    return res.status(400).json({ error: 'Title and message are required.' });
  }

  const { data: requesterProfile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = requesterProfile?.role === 'admin';

  if (!isAdmin && targetIds.some((targetId) => targetId !== user.id)) {
    return res.status(403).json({ error: 'You can only create notifications for your own account.' });
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

  if (error) {
    console.error('Notification insert failed:', error);
    return res.status(500).json({ error: 'Failed to create notification.' });
  }

  return res.status(200).json({ success: true, count: targetIds.length });
}
