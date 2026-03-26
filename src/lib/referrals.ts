import type { SupabaseClient } from '@supabase/supabase-js';

const REFERRAL_COOKIE = 'sp_referral';
const REFERRAL_PENDING = 'sp_referral_pending';
const CONSENT_KEY = 'cookie_consent';
const ATTRIBUTED_KEY_PREFIX = 'sp_referral_attributed_';
const DEFAULT_DAYS = 30;

const isBrowser = () => typeof window !== 'undefined';

const isConsentGranted = () => {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(CONSENT_KEY) === 'granted';
};

const buildCookieOptions = (days: number) => {
  const maxAge = Math.max(0, Math.floor(days * 24 * 60 * 60));
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  return `Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
};

const setCookie = (name: string, value: string, days = DEFAULT_DAYS) => {
  if (!isBrowser()) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; ${buildCookieOptions(days)}`;
};

const deleteCookie = (name: string) => {
  if (!isBrowser()) return;
  document.cookie = `${name}=; ${buildCookieOptions(-1)}`;
};

const readCookie = (name: string) => {
  if (!isBrowser()) return null;
  const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.substring(name.length + 1));
};

const isValidUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export const captureReferralFromLocation = (search: string) => {
  if (!isBrowser()) return;
  const params = new URLSearchParams(search);
  const ref = params.get('ref');
  if (!ref) return;

  if (isConsentGranted()) {
    setCookie(REFERRAL_COOKIE, ref);
    window.sessionStorage.removeItem(REFERRAL_PENDING);
  } else {
    window.sessionStorage.setItem(REFERRAL_PENDING, ref);
  }
};

export const persistPendingReferral = () => {
  if (!isBrowser()) return;
  if (!isConsentGranted()) return;
  const pending = window.sessionStorage.getItem(REFERRAL_PENDING);
  if (!pending) return;
  setCookie(REFERRAL_COOKIE, pending);
  window.sessionStorage.removeItem(REFERRAL_PENDING);
};

export const getReferralCookie = () => readCookie(REFERRAL_COOKIE);

export const clearReferralCookie = () => {
  if (!isBrowser()) return;
  deleteCookie(REFERRAL_COOKIE);
  window.sessionStorage.removeItem(REFERRAL_PENDING);
};

export const applyReferralAttribution = async ({
  supabase,
  userId,
  email,
}: {
  supabase: SupabaseClient;
  userId: string;
  email?: string | null;
}) => {
  if (!isBrowser()) return;
  const referrerId = getReferralCookie();
  if (!referrerId) return;
  if (!isValidUuid(referrerId)) return;
  if (referrerId === userId) {
    clearReferralCookie();
    return;
  }

  const attributedKey = `${ATTRIBUTED_KEY_PREFIX}${userId}`;
  const alreadyAttributed = window.localStorage.getItem(attributedKey);
  if (alreadyAttributed === referrerId) return;

  const { error } = await supabase.from('referrals').insert({
    referrer_id: referrerId,
    referred_user_id: userId,
    referred_email: email || null,
    referral_code: referrerId.slice(0, 8).toUpperCase(),
    status: 'signed_up',
  });

  if (error) {
    console.warn('Referral attribution failed:', error.message);
    return;
  }

  window.localStorage.setItem(attributedKey, referrerId);
  clearReferralCookie();
};
