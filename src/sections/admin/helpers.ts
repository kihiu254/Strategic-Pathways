export const PROJECT_ARCHIVED_TAG = 'admin-status:archived';
export const PROJECT_APPROVED_TAG = 'admin-status:approved';

export const formatAdminDate = (value?: string | null) => {
  if (!value) return 'No date';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No date';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getStatusTone = (status?: string | null) => {
  switch ((status || '').toLowerCase()) {
    case 'accepted':
    case 'approved':
    case 'active':
    case 'verified':
      return 'bg-green-500/15 text-green-300';
    case 'reviewed':
    case 'under_review':
      return 'bg-blue-500/15 text-blue-300';
    case 'rejected':
    case 'archived':
    case 'closed':
      return 'bg-red-500/15 text-red-300';
    default:
      return 'bg-amber-500/15 text-amber-200';
  }
};

export const removeProjectAdminTag = (tags: string[] | null | undefined, tagToRemove: string) =>
  (tags || []).filter((tag) => tag !== tagToRemove);

export const removeProjectAdminTags = (tags?: string[] | null) =>
  (tags || []).filter((tag) => !tag.startsWith('admin-status:'));

export const isProjectArchived = (tags?: string[] | null) =>
  (tags || []).includes(PROJECT_ARCHIVED_TAG);

export const isProjectApproved = (tags?: string[] | null) =>
  (tags || []).includes(PROJECT_APPROVED_TAG);

export const readCookieConsent = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('cookie_consent');
};
