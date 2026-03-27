export type PaystackPlan = {
  queryTier: 'professional' | 'firm';
  label: string;
  dbTier: 'Professional' | 'Firm';
  amount: number;
  currency: string;
  profileType: 'Premium (Verified)';
};

type PaystackMode = 'test' | 'live';
type PaystackKeyType = 'public' | 'secret';

const DEFAULT_CALLBACK_ORIGIN = 'http://localhost:5173';
const DEFAULT_PRIMARY_CURRENCY = 'USD';
const DEFAULT_LOCAL_CURRENCY = 'KES';
const DEFAULT_PROFESSIONAL_AMOUNT = 10000;
const DEFAULT_FIRM_AMOUNT = 25000;
const DEFAULT_PROFESSIONAL_LOCAL_AMOUNT = 1290000;
const DEFAULT_FIRM_LOCAL_AMOUNT = 3225000;

const getPrimaryCurrency = () => (process.env.VITE_PAYSTACK_CURRENCY || DEFAULT_PRIMARY_CURRENCY).toUpperCase();

const getLocalCurrency = () =>
  (process.env.VITE_PAYSTACK_LOCAL_CURRENCY || (getPrimaryCurrency() === DEFAULT_PRIMARY_CURRENCY ? DEFAULT_LOCAL_CURRENCY : ''))
    .toUpperCase()
    .trim();

const resolveSupportedCurrencies = () => {
  const primaryCurrency = getPrimaryCurrency();
  const localCurrency = getLocalCurrency();
  const supportedCurrencies = [primaryCurrency];

  if (localCurrency && localCurrency !== primaryCurrency) {
    supportedCurrencies.push(localCurrency);
  }

  return supportedCurrencies;
};

const resolvePlanAmount = (tier: 'professional' | 'firm', currency: string) => {
  const primaryCurrency = getPrimaryCurrency();
  const isLocalCurrency = currency === getLocalCurrency() && currency !== primaryCurrency;

  if (tier === 'firm') {
    return Number(
      isLocalCurrency
        ? process.env.VITE_PAYSTACK_CUSTOM_LOCAL_AMOUNT || DEFAULT_FIRM_LOCAL_AMOUNT
        : process.env.VITE_PAYSTACK_CUSTOM_AMOUNT || DEFAULT_FIRM_AMOUNT
    );
  }

  return Number(
    isLocalCurrency
      ? process.env.VITE_PAYSTACK_PROFESSIONAL_LOCAL_AMOUNT || DEFAULT_PROFESSIONAL_LOCAL_AMOUNT
      : process.env.VITE_PAYSTACK_PROFESSIONAL_AMOUNT || DEFAULT_PROFESSIONAL_AMOUNT
  );
};

export const resolvePaystackMode = (): PaystackMode =>
  process.env.PAYSTACK_MODE?.toLowerCase() === 'live' ? 'live' : 'test';

const normalizeEnvValue = (value: string | undefined) => String(value || '').trim();

const paystackKeyMatchesMode = (value: string, type: PaystackKeyType, mode: PaystackMode) =>
  value.startsWith(`${type === 'public' ? 'pk' : 'sk'}_${mode}_`);

const resolveModeAwarePaystackKey = (
  mode: PaystackMode,
  modeSpecificValue: string | undefined,
  fallbackValue: string | undefined,
  type: PaystackKeyType
) => {
  const preferredValue = normalizeEnvValue(modeSpecificValue);

  if (preferredValue) {
    return preferredValue;
  }

  const fallback = normalizeEnvValue(fallbackValue);

  if (fallback && paystackKeyMatchesMode(fallback, type, mode)) {
    return fallback;
  }

  return '';
};

export const getActivePaystackConfig = () => {
  const mode = resolvePaystackMode();
  const secretKey = resolveModeAwarePaystackKey(
    mode,
    mode === 'live' ? process.env.PAYSTACK_LIVE_SECRET_KEY : process.env.PAYSTACK_TEST_SECRET_KEY,
    process.env.PAYSTACK_SECRET_KEY,
    'secret'
  );
  const publicKey = resolveModeAwarePaystackKey(
    mode,
    mode === 'live' ? process.env.VITE_PAYSTACK_LIVE_PUBLIC_KEY : process.env.VITE_PAYSTACK_TEST_PUBLIC_KEY,
    process.env.VITE_PAYSTACK_PUBLIC_KEY,
    'public'
  );

  return { mode, secretKey, publicKey };
};

export const getSupportedPaystackCurrencies = () => resolveSupportedCurrencies();

export const getPaystackPlan = (rawTier?: string, rawCurrency?: string): PaystackPlan => {
  const normalizedTier = (rawTier || 'professional').toLowerCase();
  const supportedCurrencies = getSupportedPaystackCurrencies();
  const requestedCurrency = String(rawCurrency || '').toUpperCase().trim();
  const currency = supportedCurrencies.includes(requestedCurrency) ? requestedCurrency : getPrimaryCurrency();

  if (normalizedTier === 'firm' || normalizedTier === 'partners' || normalizedTier === 'custom') {
    return {
      queryTier: 'firm',
      label: 'Partners',
      dbTier: 'Firm',
      amount: resolvePlanAmount('firm', currency),
      currency,
      profileType: 'Premium (Verified)',
    };
  }

  return {
    queryTier: 'professional',
    label: 'Professional',
    dbTier: 'Professional',
    amount: resolvePlanAmount('professional', currency),
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

export const resolvePaystackCallbackUrl = (origin: string | undefined, tier: string, currency?: string) => {
  const baseUrl = origin || process.env.VITE_PRODUCTION_URL || DEFAULT_CALLBACK_ORIGIN;

  try {
    const url = new URL(baseUrl);
    url.pathname = '/payment';
    url.search = `tier=${encodeURIComponent(tier)}${currency ? `&currency=${encodeURIComponent(currency)}` : ''}`;
    return url.toString();
  } catch {
    return `${DEFAULT_CALLBACK_ORIGIN}/payment?tier=${encodeURIComponent(tier)}${currency ? `&currency=${encodeURIComponent(currency)}` : ''}`;
  }
};
