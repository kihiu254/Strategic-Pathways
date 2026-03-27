const DAY_IN_MS = 24 * 60 * 60 * 1000;

type DeadlineAwareOpportunity = {
  deadline: string;
  rollingDeadline: boolean;
  status?: 'active' | 'closed';
};

const toUtcDay = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

export const getOpportunityDaysUntilDeadline = (opportunity: DeadlineAwareOpportunity) => {
  if (opportunity.rollingDeadline || !opportunity.deadline) {
    return null;
  }

  const deadlineDay = toUtcDay(opportunity.deadline);
  const todayDay = toUtcDay(new Date());

  if (deadlineDay === null || todayDay === null) {
    return null;
  }

  return Math.round((deadlineDay - todayDay) / DAY_IN_MS);
};

export const isOpportunityPastDeadline = (opportunity: DeadlineAwareOpportunity) => {
  const daysUntilDeadline = getOpportunityDaysUntilDeadline(opportunity);
  return daysUntilDeadline !== null && daysUntilDeadline < 0;
};

export const isOpportunityOpenForApplications = (opportunity: DeadlineAwareOpportunity) => {
  return opportunity.status !== 'closed' && !isOpportunityPastDeadline(opportunity);
};
