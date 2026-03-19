import { 
  LayoutDashboard, Users, Briefcase, FileText, Settings, 
  TrendingUp, Shield, ClipboardList, User
} from 'lucide-react';

export const getSidebarItems = (t: any) => [
  { id: 'overview', label: t('dashboard.sections.overview'), icon: LayoutDashboard },
  { id: 'members', label: t('dashboard.sections.members'), icon: Users },
  { id: 'projects', label: t('dashboard.sections.projects'), icon: Briefcase },
  { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
  { id: 'applications', label: t('dashboard.sections.applications'), icon: FileText },
  { id: 'onboarding', label: 'Onboarding Records', icon: ClipboardList },
  { id: 'analytics', label: t('dashboard.sections.analytics'), icon: TrendingUp },
  { id: 'admins', label: t('dashboard.sections.admins'), icon: Shield },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'settings', label: t('dashboard.sections.settings'), icon: Settings },
];

export const getSectionDescriptions = (t: any): Record<string, string> => ({
  overview: 'Premium command center for growth, compliance, and member operations.',
  members: 'Monitor member quality, verification, and lifecycle from a single table.',
  projects: 'Track delivery pipelines, budgets, and execution momentum.',
  opportunities: 'Publish opportunities with the same polished experience members expect.',
  applications: 'Review verifications quickly with clear, high-confidence actions.',
  analytics: 'Keep an eye on growth, throughput, and platform performance.',
  admins: 'Manage trusted operators and access controls without friction.',
  profile: 'Update your admin identity, security, and preferences.',
  settings: 'Tune platform defaults, tiers, and notification behaviors.',
  onboarding: 'Jump into the dedicated onboarding review workspace.'
});
