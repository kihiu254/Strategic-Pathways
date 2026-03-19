export type DashboardProject = {
  id: string;
  title: string;
  client: string;
  budget: string;
  status: 'active' | 'completed';
  members: number;
  progress: number;
  description?: string;
  role?: string;
};

export type RecentApplication = {
  id: string;
  userId: string;
  name: string;
  email: string;
  type: string;
  status: string;
  date: string;
  docs: Record<string, unknown>;
  source: 'profile' | 'document_table';
};

export type DashboardMember = {
  id: string;
  name: string;
  email: string;
  tier: string;
  projects: number;
  rating: number;
  status: string;
  joined: string;
  profileType?: string | null;
  userCategory?: string | null;
  professionalTitle?: string | null;
  sector?: string | null;
  expertise?: unknown;
  yearsOfExperience?: number | null;
  connections: number;
  onboardingCompleted?: boolean | null;
  docs: Record<string, unknown>;
};

export type AdminRecord = {
  id: string;
  full_name?: string | null;
  email: string;
  role: string;
  created_at: string;
  avatar_url?: string | null;
};

export type AuditLogEntry = {
  action: string;
  meta: Record<string, unknown>;
  at: string;
};

export type DocumentViewerData = Pick<RecentApplication, 'id' | 'name' | 'email' | 'docs'>;
