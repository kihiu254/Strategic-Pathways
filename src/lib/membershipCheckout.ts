import type { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from './supabase';

export type MembershipTier = 'professional' | 'firm';

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
  user: User | null;
  session: Session | null;
  onCommunityFallback?: () => void;
};

const getMembershipPlan = (tier: MembershipTier): MembershipPlan => {
  const currency = (import.meta.env.VITE_PAYSTACK_CURRENCY || 'USD').toUpperCase();

  if (tier === 'firm') {
    return {
      queryTier: 'firm',
      label: 'Partners',
      dbTier: 'Firm',
      amount: Number(import.meta.env.VITE_PAYSTACK_CUSTOM_AMOUNT || 0),
      currency,
    };
  }

  return {
    queryTier: 'professional',
    label: 'Professional',
    dbTier: 'Professional',
    amount: Number(import.meta.env.VITE_PAYSTACK_PROFESSIONAL_AMOUNT || 0),
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
  user,
  session,
}: MembershipCheckoutOptions) => {
  if (!user || !session?.access_token) {
    toast.error('Please sign in to continue with payment.');
    return;
  }

  const plan = getMembershipPlan(tier);

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
