import { supabase } from './supabase';

type RequestEmailOtpParams = {
  email: string;
  name?: string;
  shouldCreateUser: boolean;
};

type RequestEmailOtpResponse = {
  success: boolean;
  delivery?: 'resend' | 'supabase';
};

const getLoginRedirectUrl = () => `${window.location.origin}/login`;

const sendOtpWithSupabase = async ({ email, name, shouldCreateUser }: RequestEmailOtpParams) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getLoginRedirectUrl(),
      shouldCreateUser,
      data: shouldCreateUser && name ? { full_name: name } : undefined,
    },
  });

  if (error) {
    throw error;
  }

  return { success: true, delivery: 'supabase' as const };
};

export const requestEmailOtp = async (
  params: RequestEmailOtpParams
): Promise<RequestEmailOtpResponse> => {
  try {
    const response = await fetch('/api/auth-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const text = await response.text();
    const payload = text ? (JSON.parse(text) as { error?: string; success?: boolean }) : {};

    if (!response.ok) {
      throw new Error(payload.error || 'Failed to send email code.');
    }

    return {
      success: Boolean(payload.success),
      delivery: 'resend',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const shouldFallback =
      message.includes('Failed to fetch') ||
      message.includes('Unexpected token') ||
      message.includes('Route not found') ||
      message.includes('Cannot POST');

    if (!shouldFallback) {
      throw error;
    }

    return sendOtpWithSupabase(params);
  }
};
