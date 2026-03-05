import { supabase } from '../lib/supabase';

export class NotificationService {
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'opportunity' | 'system' = 'info',
    data: any = {}
  ) {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        data
      });

    if (error) {
      console.error('Failed to create notification:', error);
    }
  }

  // Predefined notification templates
  static async notifyNewOpportunity(userId: string, opportunityTitle: string, opportunityId: string) {
    await this.createNotification(
      userId,
      'New Opportunity Match!',
      `A new opportunity "${opportunityTitle}" matches your profile. Check it out now!`,
      'opportunity',
      { opportunityId, type: 'new_opportunity' }
    );
  }

  static async notifyProfileUpdate(userId: string) {
    await this.createNotification(
      userId,
      'Profile Updated',
      'Your profile has been successfully updated.',
      'success',
      { type: 'profile_update' }
    );
  }

  static async notifyApplicationStatus(userId: string, status: string, opportunityTitle: string) {
    const statusMessages = {
      accepted: `Congratulations! Your application for "${opportunityTitle}" has been accepted.`,
      rejected: `Your application for "${opportunityTitle}" was not selected this time.`,
      pending: `Your application for "${opportunityTitle}" is under review.`
    };

    await this.createNotification(
      userId,
      'Application Update',
      statusMessages[status as keyof typeof statusMessages] || 'Your application status has been updated.',
      status === 'accepted' ? 'success' : status === 'rejected' ? 'warning' : 'info',
      { type: 'application_status', status, opportunityTitle }
    );
  }

  static async notifyWelcome(userId: string, userName: string) {
    await this.createNotification(
      userId,
      `Welcome to Strategic Pathways, ${userName}!`,
      'Complete your profile to get matched with high-value opportunities.',
      'info',
      { type: 'welcome' }
    );
  }

  static async notifySkillVerification(userId: string, skillName: string, verified: boolean) {
    await this.createNotification(
      userId,
      verified ? 'Skill Verified!' : 'Skill Verification Failed',
      verified 
        ? `Your "${skillName}" skill has been verified. This increases your match score!`
        : `Your "${skillName}" skill verification was unsuccessful. You can try again.`,
      verified ? 'success' : 'warning',
      { type: 'skill_verification', skillName, verified }
    );
  }

  static async notifySystemMaintenance(userId: string, maintenanceDate: string) {
    await this.createNotification(
      userId,
      'Scheduled Maintenance',
      `System maintenance is scheduled for ${maintenanceDate}. Some features may be temporarily unavailable.`,
      'system',
      { type: 'maintenance', date: maintenanceDate }
    );
  }
}

// Trigger notifications based on database changes
export const setupNotificationTriggers = () => {
  // Listen for new opportunities that match user profiles
  supabase
    .channel('opportunity-matches')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'opportunities' },
      async (payload) => {
        // Logic to find matching users and notify them
        // This would typically be handled by a database function or edge function
        console.log('New opportunity created:', payload.new);
      }
    )
    .subscribe();
};