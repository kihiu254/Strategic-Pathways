import { NotificationService } from './notificationService';
import { EmailAutomationService } from './emailAutomation';
import { PushNotificationService } from './pushNotifications';
import { supabase } from './supabase';

export class ComprehensiveNotificationService {
  // Send notification via all channels
  static async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'opportunity' | 'system' = 'info',
    data: any = {}
  ) {
    // Get user details
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, fcm_token, notification_preferences')
      .eq('id', userId)
      .single();

    if (!profile) return;

    const preferences = profile.notification_preferences || {
      in_app: true,
      email: true,
      push: true
    };

    // 1. In-app notification (always send)
    await NotificationService.createNotification(userId, title, message, type, data);

    // 2. Push notification (if enabled and token exists)
    if (preferences.push && profile.fcm_token) {
      await PushNotificationService.sendPushNotification(
        profile.fcm_token,
        title,
        message,
        data
      );
    }

    // 3. Email notification (for important events only)
    if (preferences.email && this.shouldSendEmail(type)) {
      await this.sendEmailForType(type, profile.email, profile.full_name, data);
    }
  }

  private static shouldSendEmail(type: string): boolean {
    return ['opportunity', 'system', 'success'].includes(type);
  }

  private static async sendEmailForType(type: string, email: string, name: string, data: any) {
    switch (type) {
      case 'opportunity':
        await EmailAutomationService.onOpportunityMatch(
          email, name, data.opportunityTitle, data.organization, data.matchScore
        );
        break;
      case 'success':
        if (data.action === 'project_added') {
          await EmailAutomationService.onProjectAdded(email, name, data.projectTitle);
        } else if (data.action === 'cv_uploaded') {
          await EmailAutomationService.onCVUploaded(email, name, data.fileName);
        }
        break;
    }
  }

  // Predefined notification methods
  static async notifyNewOpportunity(userId: string, opportunityTitle: string, organization: string, matchScore: number) {
    await this.sendNotification(
      userId,
      'New Opportunity Match! 🎯',
      `${matchScore}% match: ${opportunityTitle} at ${organization}`,
      'opportunity',
      { opportunityTitle, organization, matchScore, action: 'opportunity_match' }
    );
  }

  static async notifyProjectAdded(userId: string, projectTitle: string) {
    await this.sendNotification(
      userId,
      'Project Added Successfully! 📁',
      `"${projectTitle}" has been added to your profile`,
      'success',
      { projectTitle, action: 'project_added' }
    );
  }

  static async notifyWelcome(userId: string) {
    await this.sendNotification(
      userId,
      'Welcome to Strategic Pathways! 👋',
      'Complete your profile to start discovering opportunities',
      'info',
      { action: 'welcome' }
    );
  }

  static async notifyProfileIncomplete(userId: string) {
    await this.sendNotification(
      userId,
      'Complete Your Profile 📝',
      'Finish your profile to unlock more opportunities',
      'warning',
      { action: 'profile_reminder' }
    );
  }
}