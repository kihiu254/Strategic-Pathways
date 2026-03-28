import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, ClipboardList, Gift, Shield, Sparkles, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import { getSidebarItems } from '../constants';

type OverviewSnapshot = {
  members: number;
  opportunities: number;
  pendingApplications: number;
  pendingStories: number;
  admins: number;
  projects: number;
  referrals: number;
};

const emptySnapshot: OverviewSnapshot = {
  members: 0,
  opportunities: 0,
  pendingApplications: 0,
  pendingStories: 0,
  admins: 0,
  projects: 0,
  referrals: 0,
};

const AdminOverviewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<OverviewSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);

  const sections = useMemo(
    () => getSidebarItems(t).filter((item) => item.id !== 'overview'),
    [t]
  );

  useEffect(() => {
    const loadSnapshot = async () => {
      try {
        const [
          membersResult,
          opportunitiesResult,
          opportunityApplicationsResult,
          projectApplicationsResult,
          storiesResult,
          adminsResult,
          projectsResult,
          referralsResult,
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('opportunities').select('*', { count: 'exact', head: true }),
          supabase
            .from('opportunity_applications')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending'),
          supabase
            .from('project_applications')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending'),
          supabase
            .from('impact_stories')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', false),
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'admin'),
          supabase.from('user_projects').select('*', { count: 'exact', head: true }),
          supabase.from('referrals').select('*', { count: 'exact', head: true }),
        ]);

        setSnapshot({
          members: membersResult.count || 0,
          opportunities: opportunitiesResult.count || 0,
          pendingApplications: (opportunityApplicationsResult.count || 0) + (projectApplicationsResult.count || 0),
          pendingStories: storiesResult.count || 0,
          admins: adminsResult.count || 0,
          projects: projectsResult.count || 0,
          referrals: referralsResult.count || 0,
        });
      } catch (error) {
        console.error('Error loading admin overview snapshot:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadSnapshot();
  }, []);

  const heroStats = [
    { label: 'Members', value: snapshot.members, icon: Users },
    { label: 'Open opportunities', value: snapshot.opportunities, icon: Activity },
    { label: 'Pending applications', value: snapshot.pendingApplications, icon: ClipboardList },
    { label: 'Pending stories', value: snapshot.pendingStories, icon: Sparkles },
  ];

  const workflowCards = [
    {
      label: 'Applications queue',
      value: snapshot.pendingApplications,
      hint: 'Review, note, and approve candidate submissions.',
      path: '/admin/applications',
      icon: ClipboardList,
    },
    {
      label: 'Portfolio moderation',
      value: snapshot.projects,
      hint: 'Review member-submitted portfolio projects, publish them, and manage applicants.',
      path: '/admin/projects',
      icon: Shield,
    },
    {
      label: 'Story moderation',
      value: snapshot.pendingStories,
      hint: 'Approve impact stories before they appear on the public site.',
      path: '/admin/success-stories',
      icon: Sparkles,
    },
    {
      label: 'Referral visibility',
      value: snapshot.referrals,
      hint: 'Track referral outcomes and consent readiness.',
      path: '/admin/referrals',
      icon: Gift,
    },
  ];

  return (
    <div className="admin-section-shell">
      <section className="admin-hero-panel premium-glass p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--sp-accent)]/10 via-transparent to-transparent" />
        <div className="relative grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-5">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--sp-accent)] font-bold">
              Admin command center
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              Every major admin workflow now has its own page and moderation lane.
            </h2>
            <p className="text-sm lg:text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
              Use the routed workspace to move between opportunities, applications, project moderation,
              onboarding review, referrals, content prep, and success-story publishing without losing context.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/admin/applications')} className="sp-btn-primary px-4 py-2 text-sm">
                Open applications
              </button>
              <button onClick={() => navigate('/admin/projects')} className="sp-btn-glass px-4 py-2 text-sm">
                Review projects
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {heroStats.map((item) => (
              <div key={item.label} className="admin-surface-card glass-card p-4 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-white/5 text-[var(--sp-accent)]">
                    <item.icon size={18} />
                  </div>
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    {loading ? '...' : item.value}
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mt-3">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {workflowCards.map((card) => (
          <button
            key={card.label}
            onClick={() => navigate(card.path)}
            className="admin-surface-card premium-glass p-6 rounded-[28px] border border-white/5 text-left group hover:border-[var(--sp-accent)]/30 transition-all"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="p-3 rounded-2xl bg-white/5 text-[var(--sp-accent)] group-hover:scale-110 transition-transform">
                <card.icon size={20} />
              </div>
              <ArrowRight size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--sp-accent)] transition-colors" />
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-6">{loading ? '...' : card.value}</p>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-3">{card.label}</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-2">{card.hint}</p>
          </button>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => navigate(section.path)}
            className="admin-surface-card premium-glass p-5 rounded-[24px] border border-white/5 text-left hover:border-[var(--sp-accent)]/30 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-white/5 text-[var(--sp-accent)] group-hover:scale-110 transition-transform">
                <section.icon size={18} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                Open
              </span>
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-base">{section.label}</h3>
            <p className="text-[var(--text-secondary)] text-xs mt-2">{section.description}</p>
          </button>
        ))}
      </section>
    </div>
  );
};

export default AdminOverviewPage;
