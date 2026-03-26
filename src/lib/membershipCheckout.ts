import type { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from './supabase';

export type MembershipTier = 'professional' | 'firm';
export type MembershipCurrency = string;

type MembershipPlan = {
  queryTier: MembershipTier;
  label: string;
  dbTier: 'Professional' | 'Firm';
  amount: number;
  currency: string;
};

type VerificationResponse = {
  redirectTo?: string;
  tier?: string;
};

type MembershipCheckoutOptions = {
  tier: MembershipTier;
  currency?: MembershipCurrency;
  user: User | null;
  session: Session | null;
  onCommunityFallback?: () => void;
};

type MembershipCurrencyOption = {
  code: MembershipCurrency;
  label: string;
};

const getPrimaryCurrency = () => (import.meta.env.VITE_PAYSTACK_CURRENCY || 'USD').toUpperCase();

const getLocalCurrency = () => (import.meta.env.VITE_PAYSTACK_LOCAL_CURRENCY || '').toUpperCase().trim();

export const getMembershipCurrencyOptions = (): MembershipCurrencyOption[] => {
  const primaryCurrency = getPrimaryCurrency();
  const localCurrency = getLocalCurrency();
  const options: MembershipCurrencyOption[] = [];

  // If local currency is KES, we want to prioritize it for M-Pesa visibility
  if (localCurrency && localCurrency !== primaryCurrency) {
    options.push({
      code: localCurrency,
      label: localCurrency === 'KES' ? 'KES (M-Pesa / Local Cards)' : `${localCurrency} (Local)`,
    });
  }

  options.push({
    code: primaryCurrency,
    label: primaryCurrency === 'USD' ? 'USD (International Cards)' : `${primaryCurrency} (International)`,
  });

  return options;
};

export const getDefaultMembershipCurrency = () => getMembershipCurrencyOptions()[0]?.code || 'USD';

const resolveMembershipAmount = (tier: MembershipTier, currency: MembershipCurrency) => {
  const primaryCurrency = getPrimaryCurrency();
  const isLocalCurrency = currency === getLocalCurrency() && currency !== primaryCurrency;

  if (tier === 'firm') {
    return Number(
      isLocalCurrency
        ? import.meta.env.VITE_PAYSTACK_CUSTOM_LOCAL_AMOUNT || 0
        : import.meta.env.VITE_PAYSTACK_CUSTOM_AMOUNT || 0
    );
  }

  return Number(
    isLocalCurrency
      ? import.meta.env.VITE_PAYSTACK_PROFESSIONAL_LOCAL_AMOUNT || 0
      : import.meta.env.VITE_PAYSTACK_PROFESSIONAL_AMOUNT || 0
  );
};

export const formatMembershipAmount = (currency: MembershipCurrency, amount: number) => {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Not configured';
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  } catch {
    return `${currency} ${(amount / 100).toLocaleString()}`;
  }
};

export const getMembershipPlanDetails = (tier: MembershipTier, requestedCurrency?: MembershipCurrency): MembershipPlan => {
  const currencyOptions = getMembershipCurrencyOptions();
  const currency = currencyOptions.some((option) => option.code === requestedCurrency)
    ? String(requestedCurrency)
    : getDefaultMembershipCurrency();

  if (tier === 'firm') {
    return {
      queryTier: 'firm',
      label: 'Partners',
      dbTier: 'Firm',
      amount: resolveMembershipAmount('firm', currency),
      currency,
    };
  }

  return {
    queryTier: 'professional',
    label: 'Professional',
    dbTier: 'Professional',
    amount: resolveMembershipAmount('professional', currency),
    currency,
  };
};

const moveUserToCommunity = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      tier: 'Community',
      profile_type: 'Standard Member',
      onboarding_completed: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw error;
  }
};

export const verifyMembershipPayment = async (accessToken: string, reference: string) => {
  const response = await fetch('/api/paystack/verify', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reference }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Unable to verify your payment.');
  }

  return payload as VerificationResponse;
};

const fallbackToCommunity = async (
  userId: string,
  message: string,
  onCommunityFallback?: () => void,
  variant: 'info' | 'error' = 'info'
) => {
  await moveUserToCommunity(userId);

  if (variant === 'error') {
    toast.error(message);
  } else {
    toast.info(message);
  }

  onCommunityFallback?.();
};

const shouldReturnToCommunityOnFailure = (message: string) => {
  return !/currency not supported by merchant|not enabled on this paystack merchant account/i.test(message);
};

export const launchMembershipCheckout = async ({
  tier,
  currency,
  user,
  session,
}: MembershipCheckoutOptions) => {
  if (!user || !session?.access_token) {
    toast.error('Please sign in to continue with payment.');
    return;
  }

  const plan = getMembershipPlanDetails(tier, currency);

  if (!Number.isFinite(plan.amount) || plan.amount <= 0) {
    toast.error(`${plan.label} amount is not configured.`);
    return;
  }

  if (!user.email) {
    toast.error('Your account needs an email address before payment can continue.');
    return;
  }

  try {
    const response = await fetch('/api/paystack/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tier: plan.queryTier,
        currency: plan.currency,
        origin: window.location.origin,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload.authorizationUrl) {
      throw new Error(payload.error || 'Unable to start Paystack checkout.');
    }

    window.location.assign(payload.authorizationUrl);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to start Paystack checkout.';
    toast.error(message);
  }
};

export const handleMembershipVerificationFailure = async (
  userId: string,
  message: string,
  onCommunityFallback?: () => void
) => {
  if (!shouldReturnToCommunityOnFailure(message)) {
    toast.error(message);
    return;
  }

  await fallbackToCommunity(userId, `${message} Your account has been returned to Community.`, onCommunityFallback, 'error');
};
