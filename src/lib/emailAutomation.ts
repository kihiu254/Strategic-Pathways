import { supabase } from './supabase';

export type ApplicationEntityType = 'opportunity' | 'project';

export class EmailAutomationService {
  private static apiUrl = '/api/send';

  private static async triggerEmail(type: string, data: Record<string, unknown>) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      if (!text) {
        console.warn('Empty response from email service');
        return { success: false, error: 'Empty response' };
      }
      
      const parsed = JSON.parse(text) as { success?: boolean; error?: string };
      return { success: !!parsed.success, error: parsed.error };
    } catch (error: unknown) {
      console.error('Email trigger failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Trigger welcome email on signup
  static async onUserSignup(userId: string, email: string, name: string) {
    await this.triggerEmail('welcome', { email, name });
    
    // Schedule onboarding reminder for 24 hours later
    setTimeout(() => {
      this.checkOnboardingStatus(userId, email, name);
    }, 24 * 60 * 60 * 1000);
  }

  // Check if user completed onboarding, send reminder if not
  static async checkOnboardingStatus(userId: string, email: string, name: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .single();

    if (!profile?.onboarding_completed) {
      await this.triggerEmail('onboarding_reminder', { email, name });
    }
  }

  // Trigger onboarding completion email
  static async onOnboardingComplete(email: string, name: string) {
    await this.triggerEmail('onboarding_complete', { email, name });
  }

  // Trigger profile update email
  static async onProfileUpdated(email: string, name: string) {
    await this.triggerEmail('profile_updated', { email, name });
  }

  // Trigger login activity email
  static async onLoginActivity(email: string, name: string, provider?: string) {
    await this.triggerEmail('login_activity', { email, name, provider });
  }

  // Trigger project added email
  static async onProjectAdded(email: string, name: string, projectTitle: string) {
    await this.triggerEmail('project_added', { email, name, projectTitle });
  }

  // Trigger CV uploaded email
  static async onCVUploaded(email: string, name: string, fileName: string) {
    await this.triggerEmail('cv_uploaded', { email, name, fileName });
  }

  // Trigger opportunity match email
  static async onOpportunityMatch(email: string, name: string, opportunityTitle: string, organization: string, matchScore: number) {
    await this.triggerEmail('opportunity_match', { email, name, opportunityTitle, organization, matchScore });
  }

  // Trigger application status email
  static async onApplicationStatus(
    email: string,
    name: string,
    opportunityTitle: string,
    status: string,
    entityType: ApplicationEntityType = 'opportunity'
  ) {
    await this.triggerEmail('application_status', {
      email,
      name,
      opportunityTitle,
      status,
      entityType,
    });
  }

  // Trigger opportunity interest / application email
  static async onOpportunityInterest(
    email: string,
    name: string,
    opportunityTitle: string,
    organization: string,
    mode: 'internal' | 'external' = 'internal'
  ) {
    await this.onApplicationSubmitted(email, name, opportunityTitle, organization, {
      entityType: 'opportunity',
      mode,
    });
  }

  static async onApplicationSubmitted(
    email: string,
    name: string,
    title: string,
    organization: string,
    options: {
      entityType?: ApplicationEntityType;
      mode?: 'internal' | 'external';
    } = {}
  ) {
    const { entityType = 'opportunity', mode = 'internal' } = options;

    await this.triggerEmail('application_submission', {
      email,
      name,
      title,
      organization,
      mode,
      entityType,
    });
  }

  static async onProjectApplicationStatus(
    email: string,
    name: string,
    projectTitle: string,
    status: string
  ) {
    await this.triggerEmail('application_status', {
      email,
      name,
      opportunityTitle: projectTitle,
      status,
      entityType: 'project' satisfies ApplicationEntityType,
    });
  }

  static async onPortfolioProjectModeration(
    email: string,
    name: string,
    projectTitle: string,
    status: 'published' | 'review' | 'archived' | 'restored'
  ) {
    await this.triggerEmail('portfolio_project_moderation', {
      email,
      name,
      projectTitle,
      status,
    });
  }

  static async onProjectOwnerFollowUp(
    email: string,
    name: string,
    projectTitle: string,
    message: string
  ) {
    await this.triggerEmail('project_owner_follow_up', {
      email,
      name,
      projectTitle,
      message,
    });
  }

  static async onImpactStoryModeration(
    email: string,
    name: string,
    published: boolean
  ) {
    await this.triggerEmail('impact_story_moderation', {
      email,
      name,
      published,
    });
  }

  // Trigger verification document uploaded email
  static async onVerificationDocumentUploaded(email: string, name: string, documentType: string, tier: string) {
    await this.triggerEmail('verification_document_uploaded', { email, name, documentType, tier });
  }

  // Trigger verification status update email
  static async onVerificationStatusUpdate(email: string, name: string, status: string, tier: string, reason?: string) {
    await this.triggerEmail('verification_status_update', { email, name, status, tier, reason });
  }

  // Trigger membership payment confirmation email
  static async onPaymentConfirmed(
    email: string,
    name: string,
    planLabel: string,
    amountLabel: string,
    currency: string
  ) {
    await this.triggerEmail('payment_confirmed', { email, name, planLabel, amountLabel, currency });
  }

  // Community activation sequence emails
  static async onCommunityActivationWelcome(email: string, name: string) {
    return this.triggerEmail('community_activation_welcome', { email, name });
  }

  static async onMemberSpotlightInvite(email: string, name: string) {
    return this.triggerEmail('member_spotlight_invite', { email, name });
  }

  static async onIntroCallInvite(email: string, name: string) {
    return this.triggerEmail('intro_call_invite', { email, name });
  }

  static async submitPartnerInquiry(
    email: string,
    name: string,
    message: string,
    organization?: string
  ) {
    return this.triggerEmail('partner_inquiry', {
      email,
      name,
      message,
      organization: organization || '',
    });
  }
}
