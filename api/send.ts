import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, organization, message } = req.body;

    // Send an email notification to the Admin
    const { data, error } = await resend.emails.send({
      from: 'Strategic Pathways <hello@joinstrategicpathways.com>',
      to: ['hello@joinstrategicpathways.com'],
      replyTo: email,
      subject: `New Partner Inquiry: ${organization || name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0b2a3c;">New Partnership Inquiry</h2>
          <p>You have received a new message from the Strategic Pathways portal.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Organization:</strong> ${organization || 'N/A'}</p>
          
          <h3 style="margin-top: 20px;">Message:</h3>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
            <p style="white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #888;">
            This email was generated automatically by the Strategic Pathways platform. You can reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return res.status(400).json({ error });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Serverless Function Error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
