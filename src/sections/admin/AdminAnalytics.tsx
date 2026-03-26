import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react';

interface MonthlyActivity {
  label: string;
  members: number;
  projects: number;
  membersHeightClass: string;
  projectsHeightClass: string;
}

interface AdminAnalyticsProps {
  stats: {
    totalMembers: number;
    pendingApprovals: number;
    activeProjects: number;
    totalRevenue: string;
  };
  monthlyActivity: MonthlyActivity[];
}

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  stats,
  monthlyActivity
}) => {
  const { t } = useTranslation();

  return (
    <div className="admin-section-shell">
      <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-sm text-[var(--text-secondary)]">
        {t('adminAnalytics.liveUpdate')}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="admin-surface-card premium-glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden group hover:border-[var(--sp-accent)]/30 transition-all">
          <h3 className="text-sm uppercase tracking-widest font-semibold text-[var(--text-secondary)] mb-4">{t('dashboard.analytics.revenue')}</h3>
          <div className="text-4xl font-bold text-[var(--text-primary)] mb-2">{stats?.totalRevenue || '$0'}</div>
          <p className="text-green-400 text-sm flex items-center gap-1 font-medium">
            <TrendingUp size={16} />
            +23% {t('dashboard.analytics.lastMonth')}
          </p>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[var(--sp-accent)]/10 rounded-full blur-2xl group-hover:bg-[var(--sp-accent)]/20 transition-colors" />
        </div>
        <div className="admin-surface-card premium-glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden group hover:border-[var(--sp-accent)]/30 transition-all">
          <h3 className="text-sm uppercase tracking-widest font-semibold text-[var(--text-secondary)] mb-4">{t('dashboard.analytics.activeMembers')}</h3>
          <div className="text-4xl font-bold text-[var(--text-primary)] mb-2">{stats?.totalMembers || 0}</div>
          <p className="text-green-400 text-sm flex items-center gap-1 font-medium">
            <TrendingUp size={16} />
            +12% {t('dashboard.analytics.lastMonth')}
          </p>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
        </div>
        <div className="admin-surface-card premium-glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden group hover:border-[var(--sp-accent)]/30 transition-all">
          <h3 className="text-sm uppercase tracking-widest font-semibold text-[var(--text-secondary)] mb-4">{t('dashboard.analytics.successRate')}</h3>
          <div className="text-4xl font-bold text-[var(--text-primary)] mb-2">94%</div>
          <p className="text-green-400 text-sm flex items-center gap-1 font-medium">
            <TrendingUp size={16} />
            +5% {t('dashboard.analytics.lastMonth')}
          </p>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors" />
        </div>
      </div>

      <div className="admin-surface-card premium-glass p-8 rounded-[32px] border border-white/5">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-8">{t('adminAnalytics.monthlyActivityDistribution')}</h3>
        <div className="admin-monthly-chart">
          {monthlyActivity.map((month) => (
            <div key={month.label} className="admin-bar-column">
              <div className="admin-monthly-pair">
                <div 
                  className="admin-monthly-members transition-all duration-700" 
                  style={{ height: `${Math.max(5, (month.members / (Math.max(...(monthlyActivity || []).map(m => m.members)) || 1)) * 100)}%` }} 
                />
                <div 
                  className="admin-monthly-projects transition-all duration-700 delay-100" 
                  style={{ height: `${Math.max(5, (month.projects / (Math.max(...(monthlyActivity || []).map(m => m.projects)) || 1)) * 100)}%` }} 
                />
              </div>
              <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-tighter mt-4 opacity-60">{month.label}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-8 mt-10">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md bg-gradient-to-br from-[#C89F5E] to-[#D4B76E]" />
            <span className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider">{t('dashboard.analytics.newMembers')}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md bg-[#8B7355]" />
            <span className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider">{t('dashboard.sections.projects')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
