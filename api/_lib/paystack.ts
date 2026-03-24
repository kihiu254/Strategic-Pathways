export type PaystackPlan = {
  queryTier: 'professional' | 'firm';
  label: string;
  dbTier: 'Professional' | 'Firm';
  amount: number;
  currency: string;
  profileType: 'Premium (Verified)';
};

type PaystackMode = 'test' | 'live';

const DEFAULT_CALLBACK_ORIGIN = 'http://localhost:5173';

export const resolvePaystackMode = (): PaystackMode =>
  process.env.PAYSTACK_MODE?.toLowerCase() === 'live' ? 'live' : 'test';

export const getActivePaystackConfig = () => {
  const mode = resolvePaystackMode();
  const secretKey =
    mode === 'live'
      ? process.env.PAYSTACK_LIVE_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY
      : process.env.PAYSTACK_TEST_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY;
  const publicKey =
    mode === 'live'
      ? process.env.VITE_PAYSTACK_LIVE_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY
      : process.env.VITE_PAYSTACK_TEST_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY;

  return { mode, secretKey, publicKey };
};

export const getPaystackPlan = (rawTier?: string): PaystackPlan => {
  const normalizedTier = (rawTier || 'professional').toLowerCase();
  const currency = (process.env.VITE_PAYSTACK_CURRENCY || 'USD').toUpperCase();
  const professionalAmount = Number(process.env.VITE_PAYSTACK_PROFESSIONAL_AMOUNT || 0);
  const firmAmount = Number(process.env.VITE_PAYSTACK_CUSTOM_AMOUNT || 0);

  if (normalizedTier === 'firm' || normalizedTier === 'partners' || normalizedTier === 'custom') {
    return {
      queryTier: 'firm',
      label: 'Partners',
      dbTier: 'Firm',
      amount: firmAmount,
      currency,
      profileType: 'Premium (Verified)',
    };
  }

  return {
    queryTier: 'professional',
    label: 'Professional',
    dbTier: 'Professional',
    amount: professionalAmount,
    currency,
    profileType: 'Premium (Verified)',
  };
};

export const ensurePlanIsConfigured = (plan: PaystackPlan) => {
  if (!Number.isFinite(plan.amount) || plan.amount <= 0) {
    const error = new Error(`${plan.label} payment amount is not configured.`);
    (error as Error & { statusCode?: number }).statusCode = 500;
    throw error;
  }
};

export const normalizePaystackErrorMessage = (message: string | undefined, currency?: string) => {
  const normalizedMessage = String(message || '').trim();
  const normalizedCurrency = String(currency || '').trim().toUpperCase();

  if (/currency not supported by merchant/i.test(normalizedMessage)) {
    if (normalizedCurrency === 'USD') {
      return 'USD is not enabled on this Paystack merchant account. Enable international USD payments in Paystack or change VITE_PAYSTACK_CURRENCY to a supported currency.';
    }

    if (normalizedCurrency) {
      return `${normalizedCurrency} is not enabled on this Paystack merchant account. Change VITE_PAYSTACK_CURRENCY or enable that currency in Paystack.`;
    }
  }

  return normalizedMessage || 'Paystack could not process this payment.';
};

export const resolvePaystackCallbackUrl = (origin: string | undefined, tier: string) => {
  const baseUrl = origin || process.env.VITE_PRODUCTION_URL || DEFAULT_CALLBACK_ORIGIN;

  try {
    const url = new URL(baseUrl);
    url.pathname = '/payment';
    url.search = `tier=${encodeURIComponent(tier)}`;
    return url.toString();
  } catch {
    return `${DEFAULT_CALLBACK_ORIGIN}/payment?tier=${encodeURIComponent(tier)}`;
  }
};
