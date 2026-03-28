import type { IncomingMessage } from 'node:http';
import { createClient } from '@supabase/supabase-js';
import { Resend, type GetReceivingEmailResponseSuccess, type WebhookEventPayload } from 'resend';

type SupabaseJson =
  | string
  | number
  | boolean
  | null
  | { [key: string]: SupabaseJson | undefined }
  | SupabaseJson[];

const getRequiredEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    const error = new Error(`Missing required environment variable: ${name}`);
    (error as Error & { statusCode?: number }).statusCode = 500;
    throw error;
  }

  return value;
};

const getHeaderValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
};

const readStreamBody = async (req: IncomingMessage) => {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString('utf8');
};

export const getWebhookPayload = async (req: IncomingMessage & { body?: unknown }) => {
  if (typeof req.body === 'string') {
    return req.body;
  }

  if (Buffer.isBuffer(req.body)) {
    return req.body.toString('utf8');
  }

  if (req.body && typeof req.body === 'object') {
    return JSON.stringify(req.body);
  }

  const rawBody = await readStreamBody(req);
  return rawBody || '{}';
};

export const verifyResendWebhook = async (
  req: IncomingMessage & {
    body?: unknown;
    headers: IncomingMessage['headers'];
  },
) => {
  const resend = new Resend(getRequiredEnv('RESEND_API_KEY'));
  const webhookSecret = getRequiredEnv('RESEND_WEBHOOK_SECRET');
  const payload = await getWebhookPayload(req);

  try {
    return resend.webhooks.verify({
      payload,
      headers: {
        id: getHeaderValue(req.headers['svix-id']),
        timestamp: getHeaderValue(req.headers['svix-timestamp']),
        signature: getHeaderValue(req.headers['svix-signature']),
      },
      webhookSecret,
    }) as WebhookEventPayload;
  } catch (error) {
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }
};

export const getReceivingClient = () => new Resend(getRequiredEnv('RESEND_API_KEY'));

export const getReceivingServiceClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    const error = new Error('Missing Supabase service configuration for inbound email receiving.');
    (error as Error & { statusCode?: number }).statusCode = 500;
    throw error;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const extractLocalParts = (addresses: string[]) =>
  addresses
    .map((address) => {
      const trimmed = address.trim().toLowerCase();
      const atIndex = trimmed.indexOf('@');
      return atIndex > 0 ? trimmed.slice(0, atIndex) : trimmed;
    })
    .filter(Boolean);

export const toJsonObject = (value: unknown): SupabaseJson => JSON.parse(JSON.stringify(value ?? null)) as SupabaseJson;

export type ReceivedEmailRecord = Pick<
  GetReceivingEmailResponseSuccess,
  'id' | 'to' | 'from' | 'created_at' | 'subject' | 'bcc' | 'cc' | 'reply_to' | 'html' | 'text' | 'headers' | 'message_id' | 'raw' | 'attachments'
>;
