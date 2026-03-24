import type { VercelRequest } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const getRequiredEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    const error = new Error(`${name} is not configured.`);
    (error as Error & { statusCode?: number }).statusCode = 500;
    throw error;
  }

  return value;
};

const extractAccessToken = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!accessToken) {
    const error = new Error('Missing authorization token.');
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  return accessToken;
};

export const createAuthenticatedClient = (accessToken: string) => {
  const supabaseUrl = getRequiredEnv('VITE_SUPABASE_URL');
  const supabaseAnonKey = getRequiredEnv('VITE_SUPABASE_ANON_KEY');

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};

export const getAuthContext = async (req: VercelRequest) => {
  const accessToken = extractAccessToken(req);
  const authClient = createAuthenticatedClient(accessToken);

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser(accessToken);

  if (authError || !user) {
    const error = new Error('Invalid session.');
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  return { accessToken, user };
};
