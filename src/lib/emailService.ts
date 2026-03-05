import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  private static fromEmail = 'Strategic Pathways <noreply@joinstrategicpathways.com>';
  
  // Welcome email when user signs up
  static async sendWelcomeEmail(userEmail: string, userName: string) {
    await resend.emails.send({
      from: this.fromEmail,
      to: userEmail,
      subject: `Welcome to Strategic Pathways, ${userName}! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0b2a3c 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Strategic Pathways!</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${userName},</h2>
            <p style="color: #4a5568; line-height: 1.6;">
              Welcome to Strategic Pathways! We're excited to help you discover high-value opportunities that match your expertise.
            </p>
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0b2a3c; margin-top: 0;">Next Steps:</h3>
              <ul style="color: #4a5568; line-height: 1.8;">
                <li>Complete your profile to get better matches</li>
                <li>Upload your CV/Resume</li>
                <li>Browse available opportunities</li>
                <li>Set up your skills and preferences</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.VITE_PRODUCTION_URL}/onboarding" 
                 style="background: #c89f5e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Complete Your Profile
              </a>
            </div>
            <p style="color: #718096; font-size: 14px; margin-top: 30px;">
              Need help? Reply to this email or visit our <a href="${process.env.VITE_PRODUCTION_URL}/help">Help Center</a>.
            </p>
          </div>
        </div>
      `
    });
  }

  // Onboarding completion email
  static async sendOnboardingCompleteEmail(userEmail: string, userName: string) {
    await resend.emails.send({
      from: this.fromEmail,
      to: userEmail,
      subject: `Profile Complete! You're ready to discover opportunities 🚀`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Profile Complete!</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #0b2a3c; margin-top: 0;">Congratulations, ${userName}!</h2>
            <p style="color: #4a5568; line-height: 1.6;">
              Your profile is now complete and you're ready to discover high-value opportunities that match your expertise.
            </p>
            <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #0b2a3c; margin-top: 0;">What's Next?</h3>
              <ul style="color: #4a5568; line-height: 1.8;">
                <li>Browse personalized opportunity matches</li>
                <li>Get notified about new opportunities</li>
                <li>Apply to roles that interest you</li>
                <li>Track your application status</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.VITE_PRODUCTION_URL}/opportunities" 
                 style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Explore Opportunities
              </a>
            </div>
          </div>
        </div>
      `
    });
  }

  // Onboarding reminder email (sent after 24 hours if not completed)
  static async sendOnboardingReminderEmail(userEmail: string, userName: string) {
    await resend.emails.send({
      from: this.fromEmail,
      to: userEmail,
      subject: `Don't miss out! Complete your Strategic Pathways profile`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Complete Your Profile</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${userName},</h2>
            <p style="color: #4a5568; line-height: 1.6;">
              We noticed you haven't completed your Strategic Pathways profile yet. Don't miss out on opportunities that could be perfect for you!
            </p>
            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #0b2a3c; margin-top: 0;">Why complete your profile?</h3>
              <ul style="color: #4a5568; line-height: 1.8;">
                <li>Get matched with high-value opportunities</li>
                <li>Increase your visibility to top organizations</li>
                <li>Access exclusive roles in your field</li>
                <li>Build your professional network</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.VITE_PRODUCTION_URL}/onboarding" 
                 style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Complete Profile Now
              </a>
            </div>
            <p style="color: #718096; font-size: 14px;">
              It only takes 5 minutes to complete your profile and start discovering opportunities.
            </p>
          </div>
        </div>
      `
    });
  }

  // Project added confirmation
  static async sendProjectAddedEmail(userEmail: string, userName: string, projectTitle: string) {
    await resend.emails.send({
      from: this.fromEmail,
      to: userEmail,
      subject: `Project "${projectTitle}" added to your profile`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Project Added Successfully!</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #0b2a3c; margin-top: 0;">Great work, ${userName}!</h2>
            <p style="color: #4a5568; line-height: 1.6;">
              You've successfully added "<strong>${projectTitle}</strong>" to your profile. This helps showcase your experience to potential opportunities.
            </p>
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #0b2a3c; margin-top: 0;">💡 Pro Tip</h3>
              <p style="color: #4a5568; margin: 0;">
                Adding more projects increases your match score and visibility to high-value opportunities. Consider adding 2-3 more projects to maximize your profile strength.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.VITE_PRODUCTION_URL}/profile" 
                 style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View Your Profile
              </a>
            </div>
          </div>
        </div>
      `
    });
  }

  // CV/Resume uploaded confirmation
  static async sendCVUploadedEmail(userEmail: string, userName: string, fileName: string) {
    await resend.emails.send({
      from: this.fromEmail,
      to: userEmail,
      subject: `CV/Resume uploaded successfully`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">CV/Resume Uploaded!</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #0b2a3c; margin-top: 0;">Perfect, ${userName}!</h2>
            <p style="color: #4a5568; line-height: 1.6;">
              Your CV/Resume "<strong>${fileName}</strong>" has been uploaded successfully. You can now apply to opportunities with one click!
            </p>
            <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #0b2a3c; margin-top: 0;">✅ What this means:</h3>
              <ul style="color: #4a5568; line-height: 1.8;">
                <li>Quick apply to opportunities</li>
                <li>Share your profile with organizations</li>
                <li>Increased visibility in searches</li>
                <li>Professional presentation of your experience</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.VITE_PRODUCTION_URL}/opportunities" 
                 style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Browse Opportunities
              </a>
            </div>
          </div>
        </div>
      `
    });
  }

  // New opportunity match notification
  static async sendOpportunityMatchEmail(userEmail: string, userName: string, opportunityTitle: string, organization: string, matchScore: number) {
    await resend.emails.send({
      from: this.fromEmail,
      to: userEmail,
      subject: `🎯 New ${matchScore}% Match: ${opportunityTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #c89f5e 0%, #d4b76e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎯 New Opportunity Match!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">${matchScore}% Match Score</p>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${userName},</h2>
            <p style="color: #4a5568; line-height: 1.6;">
              We found a great opportunity that matches your profile:
            </p>
            <div style="background: #fffbeb; padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #c89f5e;">
              <h3 style="color: #0b2a3c; margin-top: 0; font-size: 20px;">${opportunityTitle}</h3>
              <p style="color: #c89f5e; font-weight: bold; margin: 5px 0;">${organization}</p>
              <div style="background: #c89f5e; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin-top: 10px;">
                ${matchScore}% Match
              </div>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.VITE_PRODUCTION_URL}/opportunities" 
                 style="background: #c89f5e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 10px;">
                View Opportunity
              </a>
              <a href="${process.env.VITE_PRODUCTION_URL}/opportunities" 
                 style="background: transparent; color: #c89f5e; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; border: 2px solid #c89f5e;">
                Browse All Matches
              </a>
            </div>
            <p style="color: #718096; font-size: 14px; text-align: center;">
              Don't miss out - high-match opportunities get filled quickly!
            </p>
          </div>
        </div>
      `
    });
  }

  // Application status update
  static async sendApplicationStatusEmail(userEmail: string, userName: string, opportunityTitle: string, status: 'accepted' | 'rejected' | 'pending') {
    const statusConfig = {
      accepted: { color: '#10b981', emoji: '🎉', title: 'Application Accepted!' },
      rejected: { color: '#ef4444', emoji: '📝', title: 'Application Update' },
      pending: { color: '#f59e0b', emoji: '⏳', title: 'Application Under Review' }
    };

    const config = statusConfig[status];

    await resend.emails.send({
      from: this.fromEmail,
      to: userEmail,
      subject: `${config.emoji} ${config.title} - ${opportunityTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, ${config.color} 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${config.emoji} ${config.title}</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${userName},</h2>
            <p style="color: #4a5568; line-height: 1.6;">
              ${status === 'accepted' 
                ? `Congratulations! Your application for "${opportunityTitle}" has been accepted.`
                : status === 'rejected'
                ? `Thank you for your interest in "${opportunityTitle}". While your application wasn't selected this time, we encourage you to keep applying to other opportunities.`
                : `Your application for "${opportunityTitle}" is currently under review. We'll notify you as soon as there's an update.`
              }
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.VITE_PRODUCTION_URL}/dashboard" 
                 style="background: ${config.color}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View Dashboard
              </a>
            </div>
          </div>
        </div>
      `
    });
  }
}