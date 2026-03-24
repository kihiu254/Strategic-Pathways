import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getActivePaystackConfig, getPaystackPlan, ensurePlanIsConfigured, normalizePaystackErrorMessage } from '../_lib/paystack.js';
import { createAuthenticatedClient, getAuthContext } from '../_lib/supabase.js';

type VerifyRequestBody = {
  reference?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = (req.body ?? {}) as VerifyRequestBody;
    const reference = body.reference?.trim();

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required.' });
    }

    const { accessToken, user } = await getAuthContext(req);
    const { secretKey, mode } = getActivePaystackConfig();

    if (!secretKey) {
      return res.status(500).json({ error: 'Paystack secret key is not configured.' });
    }

    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const payload = await paystackResponse.json();

    if (!paystackResponse.ok || !payload?.status || !payload?.data) {
      console.error('Paystack verification failed:', payload);
      return res.status(502).json({
        error: normalizePaystackErrorMessage(payload?.message),
      });
    }

    const transaction = payload.data;
    const metadata = transaction.metadata ?? {};
    const plan = getPaystackPlan(
      String(metadata.tier || metadata.dbTier || 'professional'),
      String(metadata.currency || transaction.currency || '')
    );
    ensurePlanIsConfigured(plan);

    if (metadata.userId && metadata.userId !== user.id) {
      return res.status(403).json({ error: 'This payment does not belong to the current user.' });
    }

    if (transaction.status !== 'success') {
      return res.status(400).json({
        error: normalizePaystackErrorMessage(transaction.gateway_response || transaction.status, plan.currency),
      });
    }

    if (Number(transaction.amount) !== plan.amount) {
      return res.status(400).json({ error: 'Payment amount does not match the selected membership.' });
    }

    if (String(transaction.currency || '').toUpperCase() !== plan.currency) {
      return res.status(400).json({ error: 'Payment currency does not match the configured membership currency.' });
    }

    const userClient = createAuthenticatedClient(accessToken);
    const { error: updateError } = await userClient.from('profiles').upsert({
      id: user.id,
      email: user.email,
      tier: plan.dbTier,
      profile_type: plan.profileType,
      onboarding_completed: false,
      updated_at: new Date().toISOString(),
    });

    if (updateError) {
      console.error('Failed to update profile after payment:', updateError);
      return res.status(500).json({ error: 'Payment was verified, but the account could not be updated.' });
    }

    return res.status(200).json({
      success: true,
      mode,
      tier: plan.dbTier,
      redirectTo: '/onboarding/full',
      reference,
    });
  } catch (error) {
    const statusCode = (error as Error & { statusCode?: number }).statusCode || 500;
    console.error('Paystack verify error:', error);
    return res.status(statusCode).json({ error: error instanceof Error ? error.message : 'Payment verification failed.' });
  }
}
