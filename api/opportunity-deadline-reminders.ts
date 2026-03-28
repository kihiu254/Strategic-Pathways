import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

type ReminderStage = 'week' | 'five_day';

type OpportunityRow = {
  id: string;
  title: string;
  organization: string;
  deadline: string;
  status: 'active' | 'closed';
  tags: string[] | null;
};

type ApplicationRow = {
  id: string;
  opportunity_id: string;
  user_id: string;
  deadline_week_reminded_at: string | null;
  deadline_five_day_reminded_at: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ROLLING_TAG = 'deadline:rolling';
const ROLLING_DEADLINE_DATE = '2099-12-31';

const toUtcDay = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const getDaysUntilDeadline = (deadline: string) => {
  const deadlineDay = toUtcDay(deadline);
  const todayDay = toUtcDay(new Date());

  if (deadlineDay === null || todayDay === null) {
    return null;
  }

  return Math.round((deadlineDay - todayDay) / DAY_IN_MS);
};

const isRollingOpportunity = (opportunity: OpportunityRow) => {
  const tags = opportunity.tags || [];
  return tags.some((tag) => tag.toLowerCase() === ROLLING_TAG) || opportunity.deadline.startsWith(ROLLING_DEADLINE_DATE);
};

const formatDeadline = (deadline: string) =>
  new Date(deadline).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const pluralizeDays = (daysRemaining: number) => `${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;

const buildReminderCopy = (
  stage: ReminderStage,
  opportunity: OpportunityRow,
  daysRemaining: number
) => {
  const formattedDeadline = formatDeadline(opportunity.deadline);
  const stageLabel = stage === 'week' ? '7-day' : '5-day';
  const title =
    stage === 'week'
      ? `Deadline reminder: ${pluralizeDays(daysRemaining)} left`
      : `Urgent deadline reminder: ${pluralizeDays(daysRemaining)} left`;
  const message = `The deadline for "${opportunity.title}" at ${opportunity.organization} is ${formattedDeadline}. ${pluralizeDays(daysRemaining)} remaining.`;

  return { formattedDeadline, stageLabel, title, message };
};

const buildReminderEmail = (
  recipient: ProfileRow,
  opportunity: OpportunityRow,
  stage: ReminderStage,
  daysRemaining: number,
  productionUrl: string
) => {
  const { formattedDeadline, stageLabel } = buildReminderCopy(stage, opportunity, daysRemaining);
  const urgencyColor = stage === 'week' ? '#0b2a3c' : '#b45309';

  return {
    from: 'Strategic Pathways <noreply@joinstrategicpathways.com>',
    to: recipient.email as string,
    subject: `${stage === 'week' ? '7-day' : '5-day'} reminder: ${opportunity.title} closes soon`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, #c89f5e 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Opportunity Deadline Reminder</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #0b2a3c; margin-top: 0;">Hi ${recipient.full_name || 'Member'},</h2>
          <p style="color: #4a5568; line-height: 1.6;">
            This is your ${stageLabel} reminder for <strong>${opportunity.title}</strong> at <strong>${opportunity.organization}</strong>.
          </p>
          <p style="color: #4a5568; line-height: 1.6;">
            The application deadline is <strong>${formattedDeadline}</strong>, with <strong>${pluralizeDays(daysRemaining)}</strong> remaining.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${productionUrl}/opportunities/${opportunity.id}" style="background: #c89f5e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Review Opportunity</a>
          </div>
          <p style="color: #64748b; line-height: 1.6; font-size: 14px;">
            If you still need to review the opportunity details or any next steps, please do so before the deadline passes.
          </p>
        </div>
      </div>
    `,
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!['GET', 'POST'].includes(req.method || '')) {
    return res.status(405).json({ error: 'This request could not be completed.' });
  }

  if (process.env.NODE_ENV === 'production') {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;

    if (!cronSecret) {
      return res.status(500).json({ error: 'Reminder processing is temporarily unavailable.' });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'This request could not be completed.' });
    }
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const productionUrl = process.env.VITE_PRODUCTION_URL || 'https://www.joinstrategicpathways.com';

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return res.status(500).json({ error: 'Reminder processing is temporarily unavailable.' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const resend = new Resend(resendApiKey);

  try {
    const { data: opportunities, error: opportunitiesError } = await supabase
      .from('opportunities')
      .select('id, title, organization, deadline, status, tags')
      .eq('status', 'active');

    if (opportunitiesError) {
      throw opportunitiesError;
    }

    const activeOpportunities = (opportunities || []) as OpportunityRow[];
    const expiredOpportunityIds = activeOpportunities
      .filter((opportunity) => !isRollingOpportunity(opportunity))
      .filter((opportunity) => {
        const daysRemaining = getDaysUntilDeadline(opportunity.deadline);
        return daysRemaining !== null && daysRemaining < 0;
      })
      .map((opportunity) => opportunity.id);

    if (expiredOpportunityIds.length > 0) {
      const { error: closeError } = await supabase
        .from('opportunities')
        .update({ status: 'closed' })
        .in('id', expiredOpportunityIds);

      if (closeError) {
        throw closeError;
      }
    }

    const reminderOpportunityMap = new Map(
      activeOpportunities
        .filter((opportunity) => !isRollingOpportunity(opportunity))
        .map((opportunity) => {
          const daysRemaining = getDaysUntilDeadline(opportunity.deadline);
          return [opportunity.id, { opportunity, daysRemaining }];
        })
        .filter((entry): entry is [string, { opportunity: OpportunityRow; daysRemaining: number }] => entry[1].daysRemaining !== null && entry[1].daysRemaining > 0 && entry[1].daysRemaining <= 7)
    );

    if (reminderOpportunityMap.size === 0) {
      return res.status(200).json({
        success: true,
        closedOpportunities: expiredOpportunityIds.length,
        notificationsCreated: 0,
        emailsSent: 0,
        remindersMarked: 0,
      });
    }

    const opportunityIds = Array.from(reminderOpportunityMap.keys());

    const { data: applications, error: applicationsError } = await supabase
      .from('opportunity_applications')
      .select('id, opportunity_id, user_id, deadline_week_reminded_at, deadline_five_day_reminded_at')
      .in('opportunity_id', opportunityIds);

    if (applicationsError) {
      throw applicationsError;
    }

    const applicationRows = (applications || []) as ApplicationRow[];
    const userIds = Array.from(new Set(applicationRows.map((application) => application.user_id)));

    if (userIds.length === 0) {
      return res.status(200).json({
        success: true,
        closedOpportunities: expiredOpportunityIds.length,
        notificationsCreated: 0,
        emailsSent: 0,
        remindersMarked: 0,
      });
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    if (profilesError) {
      throw profilesError;
    }

    const profilesById = new Map(((profiles || []) as ProfileRow[]).map((profile) => [profile.id, profile]));
    const notifications: Array<Record<string, unknown>> = [];
    const emailJobs: Array<Promise<unknown>> = [];
    const weekReminderIds: string[] = [];
    const fiveDayReminderIds: string[] = [];

    for (const application of applicationRows) {
      const reminderOpportunity = reminderOpportunityMap.get(application.opportunity_id);
      if (!reminderOpportunity) continue;

      const profile = profilesById.get(application.user_id);
      if (!profile) continue;

      const { opportunity, daysRemaining } = reminderOpportunity;
      const stages: ReminderStage[] = [];

      if (!application.deadline_week_reminded_at && daysRemaining <= 7) {
        stages.push('week');
      }

      if (!application.deadline_five_day_reminded_at && daysRemaining <= 5) {
        stages.push('five_day');
      }

      for (const stage of stages) {
        const { title, message } = buildReminderCopy(stage, opportunity, daysRemaining);
        notifications.push({
          user_id: application.user_id,
          title,
          message,
          type: 'opportunity',
          read: false,
          data: {
            action: 'opportunity_deadline_reminder',
            opportunityId: opportunity.id,
            reminderStage: stage,
            daysRemaining,
            deadline: opportunity.deadline,
          },
        });

        if (profile.email) {
          emailJobs.push(
            resend.emails.send(
              buildReminderEmail(profile, opportunity, stage, daysRemaining, productionUrl)
            )
          );
        }

        if (stage === 'week') {
          weekReminderIds.push(application.id);
        } else {
          fiveDayReminderIds.push(application.id);
        }
      }
    }

    if (notifications.length > 0) {
      const { error: notificationsError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationsError) {
        throw notificationsError;
      }
    }

    const emailResults = await Promise.allSettled(emailJobs);
    const emailsSent = emailResults.filter((result) => result.status === 'fulfilled').length;

    if (weekReminderIds.length > 0) {
      const { error: weekUpdateError } = await supabase
        .from('opportunity_applications')
        .update({ deadline_week_reminded_at: new Date().toISOString() })
        .in('id', Array.from(new Set(weekReminderIds)));

      if (weekUpdateError) {
        throw weekUpdateError;
      }
    }

    if (fiveDayReminderIds.length > 0) {
      const { error: fiveDayUpdateError } = await supabase
        .from('opportunity_applications')
        .update({ deadline_five_day_reminded_at: new Date().toISOString() })
        .in('id', Array.from(new Set(fiveDayReminderIds)));

      if (fiveDayUpdateError) {
        throw fiveDayUpdateError;
      }
    }

    return res.status(200).json({
      success: true,
      closedOpportunities: expiredOpportunityIds.length,
      notificationsCreated: notifications.length,
      emailsSent,
      remindersMarked: Array.from(new Set([...weekReminderIds, ...fiveDayReminderIds])).length,
    });
  } catch (error) {
    console.error('Opportunity deadline reminder job failed:', error);
    return res.status(500).json({ error: 'Failed to process opportunity deadline reminders.' });
  }
}
