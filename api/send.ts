import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body;
    
    const fromEmail = 'Strategic Pathways <noreply@joinstrategicpathways.com>';
    const productionUrl = process.env.VITE_PRODUCTION_URL;

    let emailData;

    switch (type) {
      case 'welcome':
        emailData = {
          from: fromEmail,
          to: data.email,
          subject: `Welcome to Strategic Pathways, ${data.name}! 🎉`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0b2a3c 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Strategic Pathways!</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">Welcome to Strategic Pathways! Complete your profile to start discovering opportunities.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/onboarding" style="background: #c89f5e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Complete Your Profile</a>
                </div>
              </div>
            </div>
          `
        };
        break;

      case 'project_added':
        emailData = {
          from: fromEmail,
          to: data.email,
          subject: `Project "${data.projectTitle}" added to your profile`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Project Added Successfully!</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Great work, ${data.name}!</h2>
                <p style="color: #4a5568; line-height: 1.6;">You've successfully added "${data.projectTitle}" to your profile.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/profile" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Your Profile</a>
                </div>
              </div>
            </div>
          `
        };
        break;

      case 'cv_uploaded':
        emailData = {
          from: fromEmail,
          to: data.email,
          subject: 'CV/Resume uploaded successfully',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">CV/Resume Uploaded!</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Perfect, ${data.name}!</h2>
                <p style="color: #4a5568; line-height: 1.6;">Your CV/Resume has been uploaded successfully. You can now apply to opportunities with one click!</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/opportunities" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Browse Opportunities</a>
                </div>
              </div>
            </div>
          `
        };
        break;

      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    const result = await resend.emails.send(emailData);
    return res.status(200).json({ success: true, id: result.data?.id });

  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}