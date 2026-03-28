import { Resend } from 'resend';

const getProductionUrl = () => {
  const explicitUrl = process.env.VITE_PRODUCTION_URL || process.env.PRODUCTION_URL || process.env.SITE_URL;
  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'https://www.joinstrategicpathways.com';
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'This request method is not available here.' });
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return res.status(500).json({ error: "We couldn't send that message right now. Please try again shortly." });
    }

    const resend = new Resend(resendApiKey);
    const { type, data } = req.body;
    
    const fromEmail = 'Strategic Pathways <noreply@updates.joinstrategicpathways.com>';
    const productionUrl = getProductionUrl();

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

      case 'login_activity':
        emailData = {
          from: fromEmail,
          to: data.email,
          subject: 'New login to your Strategic Pathways account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0b2a3c 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Login Successful</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">Your Strategic Pathways account was accessed successfully${data.provider ? ` using ${data.provider}` : ''}.</p>
                <p style="color: #4a5568; line-height: 1.6;">If this was you, no action is required. If you do not recognize this login, please secure your account immediately.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/profile" style="background: #0b2a3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Your Account</a>
                </div>
              </div>
            </div>
          `
        };
        break;

      case 'onboarding_complete':
        emailData = {
          from: fromEmail,
          to: data.email,
          subject: 'Your profile details were submitted successfully',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0b2a3c 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Profile Details Saved</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">Your profile details have been saved successfully. Your account is now better positioned for opportunities, referrals, and collaboration inside Strategic Pathways.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/profile" style="background: #c89f5e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Review Your Profile</a>
                </div>
              </div>
            </div>
          `
        };
        break;

      case 'onboarding_reminder':
        emailData = {
          from: fromEmail,
          to: data.email,
          subject: 'Complete your Strategic Pathways profile',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0b2a3c 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Complete Your Profile</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">You are one step away from unlocking more relevant opportunities and collaboration pathways. Complete your onboarding to activate your profile fully.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/onboarding" style="background: #c89f5e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Continue Onboarding</a>
                </div>
              </div>
            </div>
          `
        };
        break;

      case 'profile_updated':
        emailData = {
          from: fromEmail,
          to: data.email,
          subject: 'Your Strategic Pathways profile was updated',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #2563eb 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Profile Updated</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">Your profile details were updated successfully. Keeping your profile current improves your visibility for relevant opportunities.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/profile" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Profile</a>
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

      case 'application_submission':
      case 'opportunity_interest': {
        const entityType = data.entityType === 'project' ? 'project' : 'opportunity';
        const entityLabel = entityType === 'project' ? 'project' : 'opportunity';
        const entityLabelTitle = entityType === 'project' ? 'Project' : 'Opportunity';
        const actionTitle = data.mode === 'external' ? `${entityLabelTitle} Selected` : 'Application Submitted';
        const title = data.title || data.opportunityTitle;
        const targetPath = entityType === 'project' ? '/projects' : '/opportunities';

        emailData = {
          from: fromEmail,
          to: data.email,
          subject: data.mode === 'external'
            ? `External application opened for "${title}"`
            : `Application submitted for "${title}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0b2a3c 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${actionTitle}</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">
                  ${data.mode === 'external'
                    ? `You opened the external application flow for the <strong>${entityLabel}</strong> <strong>${title}</strong> at <strong>${data.organization}</strong>.`
                    : `Your application for the <strong>${entityLabel}</strong> <strong>${title}</strong> at <strong>${data.organization}</strong> has been submitted successfully.`}
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}${targetPath}" style="background: #c89f5e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View ${entityType === 'project' ? 'Projects' : 'Opportunities'}</a>
                </div>
              </div>
            </div>
          `
        };
        break;
      }

      case 'application_status': {
        const entityType = data.entityType === 'project' ? 'project' : 'opportunity';
        const entityLabel = entityType === 'project' ? 'project application' : 'application';
        const entityDestination = entityType === 'project' ? '/projects' : '/opportunities';

        emailData = {
          from: fromEmail,
          to: data.email,
          subject: `Application update for "${data.opportunityTitle}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, ${data.status === 'accepted' ? '#15803d' : data.status === 'rejected' ? '#b91c1c' : '#0b2a3c'} 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Application Status Update</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">
                  ${data.status === 'accepted'
                    ? `Congratulations. Your ${entityLabel} for <strong>${data.opportunityTitle}</strong> has been accepted.`
                    : data.status === 'rejected'
                      ? `Your ${entityLabel} for <strong>${data.opportunityTitle}</strong> was not selected this time.`
                      : `Your ${entityLabel} for <strong>${data.opportunityTitle}</strong> is under review.`}
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}${entityDestination}" style="background: #0b2a3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Browse ${entityType === 'project' ? 'Projects' : 'Opportunities'}</a>
                </div>
              </div>
            </div>
          `
        };
        break;
      }

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

      case 'opportunity_match':
        emailData = {
          from: fromEmail,
          to: data.email,
          subject: `New opportunity match: ${data.opportunityTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0b2a3c 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">New Opportunity Match</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">
                  We found a strong opportunity match for you: <strong>${data.opportunityTitle}</strong> at <strong>${data.organization}</strong>.
                </p>
                <p style="color: #4a5568; line-height: 1.6;">
                  Match score: <strong>${data.matchScore}%</strong>
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/opportunities" style="background: #c89f5e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Opportunities</a>
                </div>
              </div>
            </div>
          `
        };
        break;

      case 'payment_confirmed':
        emailData = {
          from: fromEmail,
          to: data.email,
          subject: `${data.planLabel} membership payment confirmed`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #15803d 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Payment Confirmed</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">We have confirmed your ${data.planLabel} membership payment of <strong>${data.amountLabel}</strong>.</p>
                <p style="color: #4a5568; line-height: 1.6;">Your subscription is active and the relevant onboarding flow is now unlocked.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/profile" style="background: #15803d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Continue in Strategic Pathways</a>
                </div>
              </div>
            </div>
          `
        };
        break;

      case 'portfolio_project_moderation': {
        const statusConfig = {
          published: {
            title: 'Portfolio Project Published',
            subject: `Your project "${data.projectTitle}" is now published`,
            color: '#15803d',
            body: `Your portfolio project <strong>${data.projectTitle}</strong> has been approved and published on the projects page.`,
          },
          review: {
            title: 'Portfolio Project Review Update',
            subject: `Your project "${data.projectTitle}" was moved back to review`,
            color: '#f59e0b',
            body: `Your portfolio project <strong>${data.projectTitle}</strong> has been moved back to the review queue for further checks.`,
          },
          archived: {
            title: 'Portfolio Project Archived',
            subject: `Your project "${data.projectTitle}" was archived`,
            color: '#b91c1c',
            body: `Your portfolio project <strong>${data.projectTitle}</strong> has been archived and is no longer visible in the active moderation queue.`,
          },
          restored: {
            title: 'Portfolio Project Restored',
            subject: `Your project "${data.projectTitle}" was restored`,
            color: '#2563eb',
            body: `Your portfolio project <strong>${data.projectTitle}</strong> has been restored to the active moderation queue.`,
          },
        } as const;

        const config = statusConfig[data.status as keyof typeof statusConfig] || statusConfig.review;

        emailData = {
          from: fromEmail,
          to: data.email,
          subject: config.subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, ${config.color} 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${config.title}</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">${config.body}</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/profile" style="background: ${config.color}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Your Profile</a>
                </div>
              </div>
            </div>
          `
        };
        break;
      }

      case 'project_owner_follow_up':
        emailData = {
          from: fromEmail,
          to: data.email,
          subject: `Update on your project "${data.projectTitle}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0b2a3c 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Project Follow-Up</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">
                  The Strategic Pathways admin team sent an update about your project <strong>${data.projectTitle}</strong>.
                </p>
                <div style="margin: 24px 0; padding: 18px 20px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #334155; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/profile" style="background: #0b2a3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Your Profile</a>
                </div>
              </div>
            </div>
          `
        };
        break;

      case 'impact_story_moderation':
        emailData = {
          from: fromEmail,
          to: data.email,
          subject: data.published ? 'Your impact story is now live' : 'Your impact story was moved back to review',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, ${data.published ? '#15803d' : '#f59e0b'} 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${data.published ? 'Impact Story Approved' : 'Impact Story Review Update'}</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">
                  ${data.published
                    ? 'Your impact story has been approved and is now live on the Strategic Pathways Impact page.'
                    : 'Your impact story has been moved out of the public Impact page for further review.'}
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/profile" style="background: ${data.published ? '#15803d' : '#f59e0b'}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Your Profile</a>
                </div>
              </div>
            </div>
          `
        };
        break;

      case 'community_activation_welcome':
        emailData = {
          from: fromEmail,
          to: data.email,
          subject: 'Welcome to Strategic Pathways',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0b2a3c 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Strategic Pathways</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">
                  We're excited to have you inside Strategic Pathways. Keep your profile current so we can surface the most relevant opportunities and collaborations.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/profile" style="background: #c89f5e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Your Profile</a>
                </div>
              </div>
            </div>
          `
        };
        break;

      case 'member_spotlight_invite':
        emailData = {
          from: fromEmail,
          to: data.email,
          subject: 'Member Spotlight Invitation',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1d4ed8 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Member Spotlight Invitation</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">
                  We'd love to feature your work in an upcoming Strategic Pathways member spotlight. Share a short story in your profile and we will review it for publication.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/profile" style="background: #1d4ed8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Share Your Story</a>
                </div>
              </div>
            </div>
          `
        };
        break;

      case 'intro_call_invite':
        emailData = {
          from: fromEmail,
          to: data.email,
          subject: 'Introductory Call Invite',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0f766e 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Introductory Call Invite</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">
                  Let's schedule a short introductory call so we can align your profile with the highest-impact opportunities.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/profile" style="background: #0f766e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Schedule a Call</a>
                </div>
              </div>
            </div>
          `
        };
        break;

      case 'verification_document_uploaded':
        emailData = {
          from: fromEmail,
          to: data.email,
          subject: 'Verification document uploaded successfully',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #8b5cf6 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Document Uploaded!</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Thank you, ${data.name}!</h2>
                <p style="color: #4a5568; line-height: 1.6;">Your ${data.documentType} for ${data.tier} has been uploaded successfully. Our team will review it within 2-3 business days.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/verification" style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Verification Status</a>
                </div>
              </div>
            </div>
          `
        };
        break;

      case 'verification_status_update': {
        const isRejected = data.status === 'rejected';
        const isApproved = data.status === 'approved';
        const verificationTier = data.tier || 'Verification review';
        const rejectionReason = typeof data.reason === 'string' && data.reason.trim()
          ? data.reason.trim()
          : 'Criteria not met';

        emailData = {
          from: fromEmail,
          to: data.email,
          subject: isRejected
            ? 'Verification submission update'
            : isApproved
              ? `Verification approved - ${verificationTier}`
              : `Verification status update - ${verificationTier}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, ${isRejected ? '#b91c1c' : isApproved ? '#15803d' : '#f59e0b'} 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${isRejected ? 'Verification Not Approved' : isApproved ? 'Verification Approved' : 'Verification Update'}</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #4a5568; line-height: 1.6;">
                  ${isRejected
                    ? `Your verification submission was not approved for <strong>${verificationTier}</strong>.`
                    : isApproved
                      ? `Your verification has been approved for <strong>${verificationTier}</strong>.`
                      : `Your verification status has been updated to: <strong>${verificationTier}</strong>.`}
                </p>
                ${isRejected ? `
                <div style="margin: 24px 0; padding: 18px 20px; border-radius: 10px; background: #fef2f2; border: 1px solid #fecaca;">
                  <p style="margin: 0 0 8px; color: #991b1b; font-weight: bold;">Reason for rejection</p>
                  <p style="margin: 0; color: #7f1d1d; line-height: 1.6;">${rejectionReason}</p>
                </div>
                <p style="color: #4a5568; line-height: 1.6;">
                  Your current session has been ended. Please address the issue above, then sign in again after your submission is ready for review.
                </p>
                ` : ''}
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${productionUrl}/verification" style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Details</a>
                </div>
              </div>
            </div>
          `
        };
        break;
      }

      case 'partner_inquiry': {
        // Fetch all admins to broadcast the inquiry
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        const hasServiceRole = Boolean(supabaseUrl && serviceRoleKey);
        const supabase = hasServiceRole ? createClient(supabaseUrl, serviceRoleKey) : null;

        const { data: admins } = supabase
          ? await supabase
              .from('profiles')
              .select('email, id')
              .eq('role', 'admin')
          : { data: [] as { email?: string | null; id: string }[] };

        const adminEmails = admins?.map(a => a.email).filter(Boolean) || [];
        const recipients = [...new Set([...adminEmails, 'info@joinstrategicpathways.com'])];

        emailData = {
          from: fromEmail,
          to: recipients,
          subject: `New Inquiry: ${data.name} - ${data.organization || 'Individual'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0b2a3c; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">New Partner/Join Inquiry</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Organization:</strong> ${data.organization || 'N/A'}</p>
                <p><strong>Message:</strong></p>
                <div style="background: #f7fafc; padding: 20px; border-radius: 8px; font-style: italic;">
                  ${data.message}
                </div>
                <div style="margin-top: 30px; text-align: center;">
                  <a href="${productionUrl}/admin" style="background: #c89f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Admin Dashboard</a>
                </div>
              </div>
            </div>
          `
        };

        // Also create in-app notifications for all admins
        if (supabase && admins && admins.length > 0) {
          try {
            const { error: notifyError } = await supabase.from('notifications').insert(
              admins.map(admin => ({
                user_id: admin.id,
                title: 'New Partner Inquiry',
                message: `${data.name} from ${data.organization || 'Individual'} sent a message.`,
                type: 'system',
                read: false,
                data: { inquiry_email: data.email }
              }))
            );
            if (notifyError) {
              console.warn('Admin notification failed during inquiry:', JSON.stringify(notifyError, null, 2));
            }
          } catch (e) {
            console.warn('Admin notification error during inquiry:', e);
          }
        }
        break;
      }

      default:
        return res.status(400).json({ error: 'This request could not be completed.' });
    }

    const result = await resend.emails.send(emailData);
    return res.status(200).json({ success: true, id: result.data?.id });

  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: "We couldn't send that message right now. Please try again shortly." });
  }
}
