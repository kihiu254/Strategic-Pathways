import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getActivePaystackConfig, getPaystackPlan, ensurePlanIsConfigured, normalizePaystackErrorMessage, resolvePaystackCallbackUrl } from '../_lib/paystack.js';
import { getAuthContext } from '../_lib/supabase.js';

type InitializeRequestBody = {
  tier?: string;
  currency?: string;
  origin?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = (req.body ?? {}) as InitializeRequestBody;
    const { user } = await getAuthContext(req);
    const plan = getPaystackPlan(body.tier, body.currency);
    ensurePlanIsConfigured(plan);

    const { mode, secretKey } = getActivePaystackConfig();

    if (!secretKey) {
      return res.status(500).json({ error: `Paystack ${mode} secret key is not configured.` });
    }

    const email = user.email;

    if (!email) {
      return res.status(400).json({ error: 'An email address is required before starting payment.' });
    }

    const callbackUrl = resolvePaystackCallbackUrl(body.origin, plan.queryTier, plan.currency);
    const reference = `sp_${plan.queryTier}_${user.id.replace(/-/g, '').slice(0, 12)}_${Date.now()}`;

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: plan.amount,
        currency: plan.currency,
        reference,
        callback_url: callbackUrl,
        metadata: {
          userId: user.id,
          tier: plan.queryTier,
          dbTier: plan.dbTier,
          currency: plan.currency,
          profileType: plan.profileType,
          environment: mode,
          source: 'strategic-pathways-web',
        },
      }),
    });

    const payload = await paystackResponse.json();

    if (!paystackResponse.ok || !payload?.status || !payload?.data?.authorization_url) {
      console.error('Paystack initialization failed:', payload);
      return res.status(502).json({
        error: normalizePaystackErrorMessage(payload?.message, plan.currency),
      });
    }

    return res.status(200).json({
      authorizationUrl: payload.data.authorization_url,
      accessCode: payload.data.access_code,
      reference: payload.data.reference,
      mode,
    });
  } catch (error) {
    const statusCode = (error as Error & { statusCode?: number }).statusCode || 500;
    console.error('Paystack initialize error:', error);
    return res.status(statusCode).json({ error: error instanceof Error ? error.message : 'Payment initialization failed.' });
  }
}
