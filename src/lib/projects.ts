import { isOpportunityOpenForApplications } from './opportunityDeadline';

export const PROJECT_ROLLING_DEADLINE_DATE = '2099-12-31';
export const PROJECT_OWNERSHIP_PREFIX = 'ownership:';
export const PROJECT_APPLY_LINK_PREFIX = 'apply-link:';
export const PROJECT_ROLLING_TAG = 'deadline:rolling';

export type ProjectStatus = 'active' | 'closed';
export type ProjectApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

export type ProjectProfile = {
  tier: string;
  profile_type: string;
  onboarding_completed: boolean;
  profile_completion_percentage?: number | null;
  user_category?: string | null;
  verification_tier?: string | null;
  bio?: string | null;
  sector?: string | null;
  years_of_experience?: string | null;
  expertise?: string[] | null;
};

export type Project = {
  id?: string;
  title: string;
  organization: string;
  location: string;
  type: string;
  duration: string;
  description: string;
  requirements: string[];
  compensation: string;
  sector: string;
  tags: string[];
  deadline: string;
  status: ProjectStatus;
  created_at?: string;
  ownership: string;
  applicationLink: string;
  projectUrl: string;
  rollingDeadline: boolean;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
};

export type ProjectRow = {
  id?: string;
  title?: string | null;
  organization?: string | null;
  location?: string | null;
  type?: string | null;
  duration?: string | null;
  description?: string | null;
  requirements?: string[] | null;
  compensation?: string | null;
  sector?: string | null;
  tags?: string[] | null;
  deadline?: string | null;
  status?: string | null;
  created_at?: string | null;
  project_title?: string | null;
  project_description?: string | null;
  role?: string | null;
  project_url?: string | null;
  is_current?: boolean | null;
  user_id?: string | null;
  profile?: {
    full_name?: string | null;
    email?: string | null;
  } | null;
};

export type ProjectApplication = {
  id: string;
  project_id: string;
  user_id: string;
  status: ProjectApplicationStatus;
  applied_at: string | null;
  cover_letter: string | null;
  notes?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  project?: {
    title?: string | null;
    organization?: string | null;
  } | null;
  profile?: {
    full_name?: string | null;
    email?: string | null;
    professional_title?: string | null;
  } | null;
};

export const createEmptyProject = (): Project => ({
  title: '',
  organization: '',
  location: '',
  type: 'Project-based',
  duration: '',
  description: '',
  requirements: [],
  compensation: '',
  sector: 'Technology',
  tags: [],
  deadline: '',
  status: 'active',
  ownership: 'Private',
  applicationLink: '',
  projectUrl: '',
  rollingDeadline: false,
});

export const parseProject = (row: ProjectRow): Project => {
  const rawTags = Array.isArray(row.tags) ? row.tags : [];
  const ownershipTag = rawTags.find((tag) => tag.toLowerCase().startsWith(PROJECT_OWNERSHIP_PREFIX));
  const applyLinkTag = rawTags.find((tag) => tag.toLowerCase().startsWith(PROJECT_APPLY_LINK_PREFIX));
  const rollingDeadline =
    rawTags.some((tag) => tag.toLowerCase() === PROJECT_ROLLING_TAG) ||
    String(row.deadline || '').startsWith(PROJECT_ROLLING_DEADLINE_DATE);
  const publicTags = rawTags.filter(
    (tag) =>
      !tag.toLowerCase().startsWith(PROJECT_OWNERSHIP_PREFIX) &&
      !tag.toLowerCase().startsWith(PROJECT_APPLY_LINK_PREFIX) &&
      !tag.toLowerCase().startsWith('admin-status:') &&
      tag.toLowerCase() !== PROJECT_ROLLING_TAG
  );
  const derivedSector = row.sector || publicTags[0] || 'Portfolio';
  const derivedStatus = row.status === 'closed' || rawTags.includes('admin-status:archived') ? 'closed' : 'active';

  return {
    id: row.id,
    title: row.title || row.project_title || '',
    organization: row.organization || 'Independent project',
    location: row.location || 'Location shared after review',
    type: row.type || row.role || 'Project collaboration',
    duration: row.duration || (row.is_current ? 'Current project' : 'Completed project'),
    description: row.description || row.project_description || '',
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    compensation: row.compensation || 'To be discussed',
    sector: derivedSector,
    tags: publicTags,
    deadline: rollingDeadline || !row.deadline ? '' : new Date(row.deadline).toISOString().slice(0, 10),
    status: derivedStatus,
    created_at: row.created_at || undefined,
    ownership: ownershipTag ? ownershipTag.slice(PROJECT_OWNERSHIP_PREFIX.length) : 'Member-led',
    applicationLink: applyLinkTag ? applyLinkTag.slice(PROJECT_APPLY_LINK_PREFIX.length) : '',
    projectUrl: row.project_url || '',
    rollingDeadline,
    ownerId: row.user_id || undefined,
    ownerName: row.profile?.full_name || undefined,
    ownerEmail: row.profile?.email || undefined,
  };
};

export const serializeProject = (project: Project, userId?: string) => {
  const cleanTags = project.tags.map((tag) => tag.trim()).filter(Boolean);
  cleanTags.push(`${PROJECT_OWNERSHIP_PREFIX}${project.ownership}`);

  if (project.applicationLink.trim()) {
    cleanTags.push(`${PROJECT_APPLY_LINK_PREFIX}${project.applicationLink.trim()}`);
  }

  if (project.rollingDeadline) {
    cleanTags.push(PROJECT_ROLLING_TAG);
  }

  return {
    title: project.title.trim(),
    organization: project.organization.trim(),
    location: project.location.trim(),
    type: project.type,
    duration: project.duration.trim(),
    description: project.description.trim(),
    requirements: project.requirements.map((item) => item.trim()).filter(Boolean),
    compensation: project.compensation.trim(),
    sector: project.sector,
    tags: cleanTags,
    deadline: project.rollingDeadline
      ? `${PROJECT_ROLLING_DEADLINE_DATE}T00:00:00.000Z`
      : new Date(`${project.deadline}T00:00:00`).toISOString(),
    status: project.status,
    created_by: userId,
  };
};

export const validateProject = (project: Project): string | null => {
  if (project.title.trim().length < 8) return 'Add a clearer project title with at least 8 characters.';
  if (project.organization.trim().length < 2) return 'Add the organization or team leading this project.';
  if (project.location.trim().length < 2) return 'Add where the project work will happen.';
  if (project.duration.trim().length < 3) return 'Add a meaningful project duration.';
  if (project.compensation.trim().length < 3) return 'Add compensation details for this project.';
  if (project.description.trim().length < 120) return 'Add a fuller project description with at least 120 characters.';
  if (!project.rollingDeadline && !project.deadline) return 'Add a deadline or mark the project as rolling.';

  if (project.applicationLink.trim()) {
    try {
      new URL(project.applicationLink.trim());
    } catch {
      return 'The external application link must be a valid URL.';
    }
  }

  return null;
};

export const formatProjectDeadline = (project: Pick<Project, 'deadline' | 'rollingDeadline'>, rolling = 'Rolling', tbd = 'TBD') => {
  if (project.rollingDeadline) return rolling;
  if (!project.deadline) return tbd;
  return new Date(`${project.deadline}T00:00:00`).toLocaleDateString();
};

export const isProjectOpenForApplications = (
  project: Pick<Project, 'deadline' | 'rollingDeadline' | 'status'>
) => isOpportunityOpenForApplications(project);

export const getProjectApplicationStatusMeta = (status: ProjectApplicationStatus) => {
  switch (status) {
    case 'accepted':
      return {
        label: 'Accepted',
        tone: 'border-green-500/30 bg-green-500/10 text-green-300',
        body: 'Your project application has been accepted.',
      };
    case 'rejected':
      return {
        label: 'Not selected',
        tone: 'border-red-500/30 bg-red-500/10 text-red-300',
        body: 'This project application was not selected this time.',
      };
    case 'reviewed':
      return {
        label: 'Under review',
        tone: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
        body: 'Your project application has been received and is under review.',
      };
    default:
      return {
        label: 'Pending',
        tone: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
        body: 'Your project application was submitted successfully and is waiting for review.',
      };
  }
};
