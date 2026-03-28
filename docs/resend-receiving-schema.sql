-- Resend inbound email storage
-- Run this in Supabase before enabling the webhook in Resend.

CREATE TABLE IF NOT EXISTS public.received_emails (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resend_email_id text NOT NULL UNIQUE,
  webhook_type text NOT NULL DEFAULT 'email.received',
  webhook_created_at timestamptz,
  received_at timestamptz NOT NULL,
  message_id text,
  subject text NOT NULL DEFAULT '',
  sender text NOT NULL,
  to_addresses text[] NOT NULL DEFAULT '{}',
  cc_addresses text[] NOT NULL DEFAULT '{}',
  bcc_addresses text[] NOT NULL DEFAULT '{}',
  reply_to_addresses text[] NOT NULL DEFAULT '{}',
  route_keys text[] NOT NULL DEFAULT '{}',
  text_content text,
  html_content text,
  headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw_message jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'archived')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.received_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view received emails" ON public.received_emails
  FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update received emails" ON public.received_emails
  FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete received emails" ON public.received_emails
  FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE INDEX IF NOT EXISTS idx_received_emails_received_at
  ON public.received_emails(received_at DESC);

CREATE INDEX IF NOT EXISTS idx_received_emails_status
  ON public.received_emails(status);

CREATE INDEX IF NOT EXISTS idx_received_emails_route_keys
  ON public.received_emails USING gin(route_keys);

CREATE OR REPLACE FUNCTION public.update_received_emails_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_received_emails_updated_at ON public.received_emails;
CREATE TRIGGER set_received_emails_updated_at
  BEFORE UPDATE ON public.received_emails
  FOR EACH ROW EXECUTE FUNCTION public.update_received_emails_updated_at();
