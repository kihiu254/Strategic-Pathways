import {
  Briefcase,
  ClipboardList,
  FileText,
  Gift,
  LayoutDashboard,
  Settings,
  Shield,
  Sparkles,
  Type,
  User,
  Users,
} from 'lucide-react';

type Translate = (key: string) => string;

export type AdminSidebarGroup = 'operations' | 'community' | 'content' | 'governance' | 'account';

export type AdminSidebarItem = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  description: string;
  group: AdminSidebarGroup;
  section: 'primary' | 'account';
};

export const getSidebarItems = (t: Translate): AdminSidebarItem[] => [
  {
    id: 'overview',
    label: t('adminSidebar.items.overview.label'),
    icon: LayoutDashboard,
    path: '/admin',
    description: t('adminSidebar.items.overview.description'),
    group: 'operations',
    section: 'primary',
  },
  {
    id: 'opportunities',
    label: t('adminSidebar.items.opportunities.label'),
    icon: Briefcase,
    path: '/admin/opportunities',
    description: t('adminSidebar.items.opportunities.description'),
    group: 'operations',
    section: 'primary',
  },
  {
    id: 'applications',
    label: t('adminSidebar.items.applications.label'),
    icon: FileText,
    path: '/admin/applications',
    description: t('adminSidebar.items.applications.description'),
    group: 'operations',
    section: 'primary',
  },
  {
    id: 'projects',
    label: t('adminSidebar.items.projects.label'),
    icon: ClipboardList,
    path: '/admin/projects',
    description: t('adminSidebar.items.projects.description'),
    group: 'community',
    section: 'primary',
  },
  {
    id: 'members',
    label: t('adminSidebar.items.members.label'),
    icon: Users,
    path: '/admin/members',
    description: t('adminSidebar.items.members.description'),
    group: 'community',
    section: 'primary',
  },
  {
    id: 'onboarding',
    label: t('adminSidebar.items.onboarding.label'),
    icon: ClipboardList,
    path: '/admin/onboarding',
    description: t('adminSidebar.items.onboarding.description'),
    group: 'operations',
    section: 'primary',
  },
  {
    id: 'admins',
    label: t('adminSidebar.items.admins.label'),
    icon: Shield,
    path: '/admin/admins',
    description: t('adminSidebar.items.admins.description'),
    group: 'governance',
    section: 'primary',
  },
  {
    id: 'success-stories',
    label: t('adminSidebar.items.successStories.label'),
    icon: Sparkles,
    path: '/admin/success-stories',
    description: t('adminSidebar.items.successStories.description'),
    group: 'community',
    section: 'primary',
  },
  {
    id: 'referrals',
    label: t('adminSidebar.items.referrals.label'),
    icon: Gift,
    path: '/admin/referrals',
    description: t('adminSidebar.items.referrals.description'),
    group: 'operations',
    section: 'primary',
  },
  {
    id: 'site-content',
    label: t('adminSidebar.items.siteContent.label'),
    icon: Type,
    path: '/admin/site-content',
    description: t('adminSidebar.items.siteContent.description'),
    group: 'content',
    section: 'primary',
  },
  {
    id: 'settings',
    label: t('adminSidebar.items.settings.label'),
    icon: Settings,
    path: '/admin/settings',
    description: t('adminSidebar.items.settings.description'),
    group: 'account',
    section: 'account',
  },
  {
    id: 'profile',
    label: t('adminSidebar.items.profile.label'),
    icon: User,
    path: '/admin/profile',
    description: t('adminSidebar.items.profile.description'),
    group: 'account',
    section: 'account',
  },
];

export const getAdminPageMeta = (pathname: string, t: Translate) => {
  const items = getSidebarItems(t);
  const exactMatch = items.find((item) => item.path === pathname);

  if (exactMatch) {
    return exactMatch;
  }

  const nestedMatch = items.find(
    (item) => item.path !== '/admin' && pathname.startsWith(`${item.path}/`)
  );

  if (nestedMatch) {
    return nestedMatch;
  }

  if (pathname.startsWith('/admin/user/')) {
    const members = items.find((item) => item.id === 'members') || items[0];
    return {
      ...members,
      label: t('adminSidebar.items.memberDetail.label'),
      description: t('adminSidebar.items.memberDetail.description'),
    };
  }

  if (pathname.startsWith('/admin/opportunities/')) {
    return items.find((item) => item.id === 'opportunities') || items[0];
  }

  return items[0];
};
