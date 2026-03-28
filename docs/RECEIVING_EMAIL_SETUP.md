# Resend Receiving Email Setup

This project now includes a Resend inbound webhook at `/api/resend/inbound`.

Use this guide to start receiving mail sent to your Resend-managed domain such as:

- `support@trenilnal.resend.app`
- `info@trenilnal.resend.app`
- `anything@trenilnal.resend.app`

Resend forwards every message for that domain to the webhook, and the app stores the full message content in Supabase after verifying the webhook signature.

## 1. Add environment variables

Set these in Vercel for the project:

```env
RESEND_API_KEY=your_resend_api_key
RESEND_WEBHOOK_SECRET=your_resend_webhook_secret
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Notes:

- `RESEND_WEBHOOK_SECRET` comes from the webhook you create in the Resend dashboard.
- `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are required so the webhook can save inbound emails and notify admins.

## 2. Create the database table

Run:

- `docs/resend-receiving-schema.sql`

This creates the `public.received_emails` table used by the webhook.

## 3. Configure the Resend webhook

In Resend:

1. Open `https://resend.com/webhooks`
2. Click `Add Webhook`
3. Set the endpoint URL to:

```text
https://www.joinstrategicpathways.com/api/resend/inbound
```

If you are testing on a preview deployment, use that deployment URL instead:

```text
https://<your-vercel-deployment>.vercel.app/api/resend/inbound
```

4. Select the event `email.received`
5. Save the webhook
6. Copy the generated webhook secret into `RESEND_WEBHOOK_SECRET`

## 4. Test with your Resend-managed address

After the webhook is deployed, send a test email to any address at:

```text
@trenilnal.resend.app
```

Examples:

- `hello@trenilnal.resend.app`
- `support@trenilnal.resend.app`

## 5. What happens when an email arrives

The webhook will:

1. Verify the signed Resend webhook payload
2. Fetch the full received email body from Resend using the `email_id`
3. Store the email in `public.received_emails`
4. Create admin notifications in `notifications`

## 6. Where to check results

You can confirm delivery in two places:

- Resend dashboard: `Emails` -> `Receiving`
- Supabase table: `public.received_emails`

Useful query:

```sql
select
  received_at,
  sender,
  subject,
  to_addresses,
  route_keys,
  status
from public.received_emails
order by received_at desc;
```

## 7. Route keys

The webhook extracts the local-part of each recipient into `route_keys`.

Examples:

- `support@trenilnal.resend.app` -> `support`
- `jobs@trenilnal.resend.app` -> `jobs`

This makes it easy to add routing logic later if you want different addresses to create tickets, inquiries, or other workflows.
