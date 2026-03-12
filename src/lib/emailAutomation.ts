import { supabase } from './supabase';

export class EmailAutomationService {
  private static apiUrl = '/api/send';

  private static async triggerEmail(type: string, data: any) {
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
      
      return JSON.parse(text);
    } catch (error) {
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
  static async onApplicationStatus(email: string, name: string, opportunityTitle: string, status: string) {
    await this.triggerEmail('application_status', { email, name, opportunityTitle, status });
  }

  // Trigger verification document uploaded email
  static async onVerificationDocumentUploaded(email: string, name: string, documentType: string, tier: string) {
    await this.triggerEmail('verification_document_uploaded', { email, name, documentType, tier });
  }

  // Trigger verification status update email
  static async onVerificationStatusUpdate(email: string, name: string, status: string, tier: string) {
    await this.triggerEmail('verification_status_update', { email, name, status, tier });
  }
}