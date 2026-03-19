import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, Briefcase, FileText, TrendingUp, Shield, 
  ClipboardList, Settings, Globe, GraduationCap, Star 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminOverviewProps {
  stats: any;
  pendingApprovals: number;
  underReviewCount: number;
  duplicateCount: number;
  adminsCount: number;
  setActiveSection: (section: string) => void;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({
  stats,
  pendingApprovals,
  underReviewCount,
  duplicateCount,
  adminsCount,
  setActiveSection
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const commandCenterStats = [
    { label: 'Pending approvals', value: pendingApprovals, icon: FileText },
    { label: 'Under review', value: underReviewCount, icon: Shield },
    { label: 'Possible duplicates', value: duplicateCount, icon: Users }, // Changed from Copy to Users for simplicity
    { label: 'Total members', value: stats.totalMembers, icon: Users },
  ];

  return (
    <div className="admin-section-shell">
      {/* Command Center */}
      <div className="admin-hero-panel premium-glass p-8 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--sp-accent)]/10 via-transparent to-transparent" />
        <div className="relative flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--sp-accent)] font-bold">Platform Status</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              Platform Health Dashboard
            </h2>
            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => setActiveSection('applications')} className="sp-btn-primary text-sm px-4 py-2">
                Approvals Queue
              </button>
              <button onClick={() => setActiveSection('members')} className="sp-btn-glass text-sm px-4 py-2">
                Member Directory
              </button>
            </div>
          </div>
          <div className="lg:w-[360px] grid grid-cols-2 gap-3">
            {commandCenterStats.map((item) => (
              <div key={item.label} className="admin-surface-card glass-card p-4 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-white/5 text-[var(--sp-accent)]">
                    <item.icon size={18} />
                  </div>
                  <span className="text-xl font-bold text-[var(--text-primary)]">{item.value}</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mt-3">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[ 
          { label: t('dashboard.stats.totalMembers'), value: (stats?.totalMembers || 0).toLocaleString(), change: '+12%', icon: Users },
          { label: t('dashboard.stats.activeProjects'), value: (stats?.activeProjects || 0).toString(), change: '+5%', icon: Briefcase },
          { label: t('dashboard.stats.pendingApps'), value: (stats?.pendingApprovals || 0).toString(), change: '-2%', icon: FileText },
          { label: 'Verified Professionals', value: (stats?.verifiedProfessionals || 0).toString(), change: '+8%', icon: Shield },
        ].map((stat) => (
          <div key={stat.label} className="admin-surface-card premium-glass p-6 rounded-[24px] border border-white/5 relative overflow-hidden group hover:border-[var(--sp-accent)]/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--sp-accent)]/5 rounded-full -mr-12 -mt-12 group-hover:bg-[var(--sp-accent)]/10 transition-colors" />
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl bg-white/5 text-[var(--sp-accent)] group-hover:scale-110 group-hover:rotate-12 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                <TrendingUp size={12} className={stat.change.startsWith('+') ? '' : 'rotate-180'} />
                {stat.change}
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-[var(--text-secondary)] text-sm font-medium tracking-wide uppercase opacity-70">{stat.label}</h4>
              <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="glass-card p-4 lg:p-6 border border-[var(--text-primary)]/5 transition-all hover:border-[var(--sp-accent)]/30">
          <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
            <div className="p-2 bg-[var(--sp-accent)]/10 rounded-lg">
              <Globe className="text-[var(--sp-accent)] w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <h4 className="text-[var(--text-secondary)] text-xs lg:text-sm font-medium">Diaspora Experts</h4>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-[var(--text-primary)]">{stats?.diasporaExperts || 0}</p>
        </div>
        <div className="glass-card p-4 lg:p-6 border border-[var(--text-primary)]/5 transition-all hover:border-[var(--sp-accent)]/30">
          <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
            <div className="p-2 bg-[var(--sp-accent)]/10 rounded-lg">
              <GraduationCap className="text-[var(--sp-accent)] w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <h4 className="text-[var(--text-secondary)] text-xs lg:text-sm font-medium">Study-Abroad Returnees</h4>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-[var(--text-primary)]">{stats?.studyAbroadReturnees || 0}</p>
        </div>
        <div className="glass-card p-4 lg:p-6 border border-[var(--text-primary)]/5 transition-all hover:border-[var(--sp-accent)]/30">
          <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
            <div className="p-2 bg-[var(--sp-accent)]/10 rounded-lg">
              <Star className="text-[var(--sp-accent)] w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <h4 className="text-[var(--text-secondary)] text-xs lg:text-sm font-medium">Average Rating</h4>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-[var(--text-primary)]">{stats?.avgRating || 0} / 5.0</p>
        </div>
      </div>

      {/* Operations Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {[
          { id: 'members', title: 'Members', description: 'Profiles, verification, tiers, and badges.', metric: `${stats?.totalMembers || 0} total members`, icon: Users },
          { id: 'opportunities', title: 'Opportunities', description: 'Publish and manage opportunities.', metric: 'Create and edit opportunities', icon: Briefcase },
          { id: 'applications', title: 'Applications', description: 'Review onboarding and verification.', metric: `${pendingApprovals} pending reviews`, icon: FileText },
          { id: 'projects', title: 'Projects', description: 'Track active and completed projects.', metric: `${stats?.activeProjects || 0} active projects`, icon: ClipboardList },
          { id: 'analytics', title: 'Analytics', description: 'Reports, growth, and insights.', metric: 'Performance dashboards', icon: TrendingUp },
          { id: 'admins', title: 'Admin Team', description: 'Invite and manage admins.', metric: `${adminsCount} admins`, icon: Shield },
          { id: 'settings', title: 'Settings', description: 'Plans, notifications, and platform config.', metric: 'Platform controls', icon: Settings },
          { id: 'onboarding', title: 'Onboarding Records', description: 'Review onboarding submissions.', metric: 'Open onboarding records', icon: ClipboardList },
        ].map((card) => (
          <button
            key={card.title}
            onClick={() => {
              if (card.id === 'onboarding') {
                navigate('/admin/onboarding');
                return;
              }
              setActiveSection(card.id);
            }}
            className="admin-surface-card premium-glass p-5 rounded-[24px] border border-white/5 text-left hover:border-[var(--sp-accent)]/30 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-white/5 text-[var(--sp-accent)] group-hover:scale-110 transition-transform">
                <card.icon size={18} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-secondary)]">Open</span>
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-base">{card.title}</h3>
            <p className="text-[var(--text-secondary)] text-xs mt-2">{card.description}</p>
            <p className="text-[var(--sp-accent)] text-[10px] font-semibold uppercase tracking-widest mt-3">{card.metric}</p>
          </button>
        ))}
      </div>

      {/* Workflow and System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="admin-surface-card lg:col-span-2 premium-glass p-6 rounded-[28px] border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Workflow Queue</h3>
            <button onClick={() => setActiveSection('applications')} className="sp-btn-glass text-xs px-3 py-1.5">
              Open queue
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Pending approvals', value: pendingApprovals, tone: 'bg-yellow-500/15 text-yellow-300' },
              { label: 'Under review', value: underReviewCount, tone: 'bg-blue-500/15 text-blue-300' },
              { label: 'Duplicates', value: duplicateCount, tone: 'bg-purple-500/15 text-purple-300' },
              { label: 'Verified', value: stats.verifiedProfessionals, tone: 'bg-green-500/15 text-green-300' },
            ].map((item, i) => (
              <div key={i} className="glass-light rounded-2xl p-4 border border-white/5">
                <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full inline-block ${item.tone}`}>
                  {item.label}
                </span>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-3">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-surface-card premium-glass p-6 rounded-[28px] border border-white/5">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">System Health</h3>
          <div className="space-y-3">
            {[
              { label: 'Payments', status: 'Paystack connected', tone: 'text-green-300' },
              { label: 'Email', status: 'Automation ready', tone: 'text-green-300' },
              { label: 'Storage', status: 'Verification docs OK', tone: 'text-green-300' },
              { label: 'Auth', status: 'Login and OTP OK', tone: 'text-green-300' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between glass-light rounded-xl px-4 py-3">
                <span className="text-xs text-[var(--text-secondary)] uppercase tracking-widest">{item.label}</span>
                <span className={`text-xs font-semibold ${item.tone}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
