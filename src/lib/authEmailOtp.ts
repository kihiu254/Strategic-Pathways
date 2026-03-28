import { supabase } from './supabase';
import { GENERIC_AUTH_ERROR, getSafeErrorMessage } from './safeFeedback';

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

const shouldPreferServerOtp = () => {
  const serverOtpPreference = import.meta.env.VITE_USE_SERVER_EMAIL_OTP?.toLowerCase();

  if (serverOtpPreference === 'true') {
    return true;
  }

  if (serverOtpPreference === 'false') {
    return false;
  }

  // Default to the server route in every environment so OTP delivery
  // stays consistent between local development and production.
  return true;
};

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
    throw new Error(getSafeErrorMessage(error, 'We could not send your code right now.'));
  }

  return { success: true, delivery: 'supabase' as const };
};

export const requestEmailOtp = async (
  params: RequestEmailOtpParams
): Promise<RequestEmailOtpResponse> => {
  if (!shouldPreferServerOtp()) {
    return sendOtpWithSupabase(params);
  }

  const fallbackToSupabase = async (reason: unknown) => {
    console.warn('Server OTP unavailable, falling back to Supabase OTP.', reason);
    return sendOtpWithSupabase(params);
  };

  try {
    const response = await fetch('/api/auth-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const text = await response.text();
    const payload = text ? (JSON.parse(text) as { error?: string; success?: boolean }) : {};

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(getSafeErrorMessage(payload.error, GENERIC_AUTH_ERROR));
      }
      if (response.status === 404) {
        throw new Error("We couldn't find an account for that email. Please sign up first.");
      }
      if (response.status === 409) {
        throw new Error('An account already exists for that email. Please sign in instead.');
      }
      if (response.status >= 500) {
        return fallbackToSupabase(payload.error);
      }
      return fallbackToSupabase(payload.error);
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
      message.includes('Cannot POST');

    if (!shouldFallback) {
      throw new Error(getSafeErrorMessage(error, 'We could not send your code right now.'));
    }

    return fallbackToSupabase(error);
  }
};
