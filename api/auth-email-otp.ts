import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const getProductionUrl = () => {
  const explicitUrl =
    process.env.VITE_PRODUCTION_URL ||
    process.env.PRODUCTION_URL ||
    process.env.SITE_URL;

  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'https://www.joinstrategicpathways.com';
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'This request method is not available here.' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!resendApiKey || !supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'We could not send your code right now. Please try again shortly.' });
  }

  const { email, name, shouldCreateUser } = req.body ?? {};
  const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : '';
  const trimmedName = typeof name === 'string' ? name.trim() : '';

  if (!normalizedEmail) {
    return res.status(400).json({ error: 'Please enter your email address to continue.' });
  }

  if (shouldCreateUser && !trimmedName) {
    return res.status(400).json({ error: 'Please enter your full name to continue.' });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    const resend = new Resend(resendApiKey);

    const { data: accountExists, error: existsError } = await supabase.rpc('check_user_exists', {
      user_email: normalizedEmail,
    });

    if (existsError) {
      throw existsError;
    }

    if (!shouldCreateUser && !accountExists) {
      return res.status(404).json({ error: "We couldn't find an account for that email. Please sign up first." });
    }

    if (shouldCreateUser && accountExists) {
      return res.status(409).json({ error: 'An account already exists for that email. Please sign in instead.' });
    }

    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
      options: {
        redirectTo: `${getProductionUrl()}/login`,
        data: shouldCreateUser && trimmedName ? { full_name: trimmedName } : undefined,
      },
    });

    if (error) {
      throw error;
    }

    const otpCode = data.properties?.email_otp;
    const actionLink = data.properties?.action_link;

    if (!otpCode || !actionLink) {
      throw new Error('We could not prepare your sign-in code. Please try again.');
    }

    const safeName = escapeHtml(trimmedName || 'there');
    const safeEmail = escapeHtml(normalizedEmail);
    const safeCode = escapeHtml(otpCode);
    const safeActionLink = escapeHtml(actionLink);
    const subject = shouldCreateUser
      ? 'Your Strategic Pathways verification code'
      : 'Your Strategic Pathways sign-in code';

    await resend.emails.send({
      from: 'Strategic Pathways <noreply@updates.joinstrategicpathways.com>',
      to: normalizedEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0b2a3c;">
          <div style="background: linear-gradient(135deg, #0b2a3c 0%, #c89f5e 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Strategic Pathways</h1>
            <p style="margin: 12px 0 0; color: #f6f4ef; font-size: 16px;">
              ${shouldCreateUser ? 'Complete your account setup' : 'Use this code to sign in'}
            </p>
          </div>
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 16px 16px;">
            <p style="margin-top: 0; font-size: 16px;">Hi ${safeName},</p>
            <p style="line-height: 1.7; color: #334155;">
              Enter this verification code in Strategic Pathways to continue with <strong>${safeEmail}</strong>.
            </p>
            <div style="margin: 28px 0; text-align: center;">
              <div style="display: inline-block; letter-spacing: 0.4em; font-size: 32px; font-weight: 700; padding: 18px 24px; border-radius: 14px; background: #0b2a3c; color: #f6f4ef;">
                ${safeCode}
              </div>
            </div>
            <p style="line-height: 1.7; color: #334155;">
              If you prefer, you can also continue directly from this secure link:
            </p>
            <div style="margin: 24px 0; text-align: center;">
              <a href="${safeActionLink}" style="display: inline-block; background: #c89f5e; color: #0b2a3c; text-decoration: none; padding: 14px 24px; border-radius: 10px; font-weight: 700;">
                Open Strategic Pathways
              </a>
            </div>
            <p style="margin-bottom: 0; line-height: 1.7; color: #64748b; font-size: 14px;">
              This code expires soon. If you did not request it, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
      text: `Strategic Pathways\n\nUse this verification code for ${normalizedEmail}: ${otpCode}\n\nOr open this secure link: ${actionLink}\n\nIf you did not request this email, you can safely ignore it.`,
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Email OTP send error:', error);
    return res.status(500).json({
      error: 'We could not send your code right now. Please try again shortly.',
    });
  }
}
