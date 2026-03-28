// Use these helpers for any message that can reach a user-facing toast, alert, or inline error.
const DEFAULT_HELP_MESSAGE = 'Something went wrong. Please try again in a moment.';

const TECHNICAL_DETAILS = [
  /supabase/i,
  /resend/i,
  /firebase/i,
  /imagekit/i,
  /paystack/i,
  /api key/i,
  /service role/i,
  /authorization/i,
  /token/i,
  /session/i,
  /database/i,
  /table/i,
  /schema/i,
  /policy/i,
  /server/i,
  /rpc/i,
  /internal/i,
  /route not found/i,
  /cannot post/i,
  /configured/i,
];

const readErrorMessage = (error: unknown) => {
  if (typeof error === 'string') return error.trim();
  if (error instanceof Error) return error.message.trim();
  return '';
};

export const getSafeErrorMessage = (error: unknown, fallback = DEFAULT_HELP_MESSAGE) => {
  const message = readErrorMessage(error);
  if (!message) return fallback;

  const normalized = message.toLowerCase();

  if (
    normalized.includes('offline') ||
    normalized.includes('network') ||
    normalized.includes('failed to fetch')
  ) {
    return 'You appear to be offline. Please check your connection and try again.';
  }

  if (
    normalized.includes('invalid or expired code') ||
    normalized.includes('verification failed') ||
    normalized.includes('invalid code')
  ) {
    return 'That code is invalid or has expired. Request a new one and try again.';
  }

  if (normalized.includes('no account exists')) {
    return "We couldn't find an account for that email. Please sign up first.";
  }

  if (normalized.includes('account already exists')) {
    return 'An account already exists for that email. Please sign in instead.';
  }

  if (normalized.includes('full name is required')) {
    return 'Please enter your full name to continue.';
  }

  if (normalized.includes('email address is required')) {
    return 'Please enter your email address to continue.';
  }

  if (
    normalized.includes('missing authorization token') ||
    normalized.includes('invalid session') ||
    normalized.includes('session expired')
  ) {
    return 'Your session has expired. Please sign in again.';
  }

  if (TECHNICAL_DETAILS.some((pattern) => pattern.test(message))) {
    return fallback;
  }

  return message;
};

export const GENERIC_AUTH_ERROR = 'We could not complete sign-in right now. Please try again shortly.';
export const GENERIC_SEND_ERROR = "We couldn't send that right now. Please try again shortly.";
export const GENERIC_PAYMENT_ERROR = 'We could not complete your payment right now. Please try again shortly.';
