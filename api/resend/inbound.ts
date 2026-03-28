import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  extractLocalParts,
  getReceivingClient,
  getReceivingServiceClient,
  toJsonObject,
  verifyResendWebhook,
} from '../_lib/resendReceiving';

type AdminProfile = {
  id: string;
  email?: string | null;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'This request method is not available here.' });
  }

  try {
    const event = await verifyResendWebhook(req);

    if (event.type !== 'email.received') {
      return res.status(200).json({ success: true, ignored: true, eventType: event.type });
    }

    const resend = getReceivingClient();
    const supabase = getReceivingServiceClient();

    const receivedEmailResponse = await resend.emails.receiving.get(event.data.email_id);
    if (receivedEmailResponse.error || !receivedEmailResponse.data) {
      throw new Error(receivedEmailResponse.error?.message || 'Unable to retrieve received email content from Resend.');
    }

    const email = receivedEmailResponse.data;
    const routeKeys = extractLocalParts(email.to);

    const emailPayload = {
      resend_email_id: email.id,
      webhook_type: event.type,
      webhook_created_at: event.created_at,
      received_at: email.created_at,
      message_id: email.message_id,
      subject: email.subject || '(No subject)',
      sender: email.from,
      to_addresses: email.to,
      cc_addresses: email.cc || [],
      bcc_addresses: email.bcc || [],
      reply_to_addresses: email.reply_to || [],
      route_keys: routeKeys,
      text_content: email.text,
      html_content: email.html,
      headers: toJsonObject(email.headers || {}),
      attachments: toJsonObject(email.attachments || []),
      raw_message: toJsonObject(email.raw || {}),
      status: 'new',
    };

    const { error: emailInsertError } = await supabase
      .from('received_emails')
      .upsert(emailPayload, { onConflict: 'resend_email_id' });

    if (emailInsertError) {
      throw emailInsertError;
    }

    const { data: admins, error: adminLookupError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('role', 'admin');

    if (adminLookupError) {
      throw adminLookupError;
    }

    const adminProfiles = (admins || []) as AdminProfile[];
    if (adminProfiles.length > 0) {
      const notificationRows = adminProfiles.map((admin) => ({
        user_id: admin.id,
        title: 'New inbound email received',
        message: `${email.from} sent an email to ${email.to.join(', ')}.`,
        type: 'system',
        read: false,
        data: {
          receivedEmailId: email.id,
          routeKeys,
          sender: email.from,
          subject: email.subject || '',
          to: email.to,
          adminEmail: admin.email || '',
        },
      }));

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notificationRows);

      if (notificationError) {
        console.error('Inbound email notification insert failed:', notificationError);
      }
    }

    return res.status(200).json({
      success: true,
      type: event.type,
      emailId: email.id,
      recipients: email.to,
      routeKeys,
    });
  } catch (error: any) {
    console.error('Inbound email receive error:', error);
    const statusCode = typeof error?.statusCode === 'number' ? error.statusCode : 500;

    return res.status(statusCode).json({
      error: statusCode === 400
        ? 'The inbound webhook could not be verified.'
        : 'Inbound email processing is temporarily unavailable.',
    });
  }
}
