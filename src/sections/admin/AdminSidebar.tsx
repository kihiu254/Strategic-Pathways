import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Minimize2, Maximize2 
} from 'lucide-react';
import { type AdminSidebarGroup, getSidebarItems } from './constants';

interface AdminSidebarProps {
  activeSection: string;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sidebarItems = getSidebarItems(t);
  const primaryItems = sidebarItems.filter((item) => item.section === 'primary');
  const accountItems = sidebarItems.filter((item) => item.section === 'account');
  const groupOrder: AdminSidebarGroup[] = ['operations', 'community', 'content', 'governance'];
  const groupedItems = groupOrder
    .map((group) => ({
      group,
      label: t(`adminSidebar.groups.${group}`),
      items: primaryItems.filter((item) => item.group === group),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className={`admin-dashboard-sidebar custom-scrollbar transition-all duration-500 ease-[var(--transition-premium)] ${isSidebarCollapsed ? 'lg:w-72' : 'lg:w-24'} w-full lg:flex lg:flex-col hidden lg:block premium-glass border-r border-white/5 z-40`}>
      {/* Logo */}
      <div className="p-8 border-b border-white/5">
        <button
          onClick={() => navigate('/')}
          className={`flex items-center gap-4 group transition-all ${!isSidebarCollapsed && 'justify-center'}`}
          aria-label={t('adminSidebar.goHome')}
          title={t('adminSidebar.goHome')}
        >
          <div className={`p-2 rounded-2xl bg-gradient-to-br from-[#C89F5E] to-[#8B7355] shadow-lg shadow-[var(--sp-accent)]/20 group-hover:scale-110 transition-transform`}>
            <img src="/logo.png" alt="SP" className="h-6 w-auto brightness-0 invert" />
          </div>
          {isSidebarCollapsed && (
            <div className="flex flex-col items-start translate-y-1">
              <span className="text-[var(--text-primary)] font-bold tracking-tight text-lg leading-none">STRATEGIC</span>
              <span className="text-[var(--sp-accent)] font-semibold text-[10px] tracking-[0.2em] uppercase mt-1">{t('adminSidebar.pathwaysAdmin')}</span>
            </div>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-6 pt-4 space-y-6 overflow-y-auto custom-scrollbar">
        {groupedItems.map((group) => (
          <div key={group.group} className="space-y-2">
            {isSidebarCollapsed && (
              <p className="px-4 text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)]/70">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                    activeSection === item.id
                      ? 'text-[var(--text-inverse)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  } ${!isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                  aria-label={item.label}
                  title={item.label}
                >
                  {activeSection === item.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#C89F5E] to-[#D4B76E] animate-shimmer" />
                  )}
                  <item.icon size={20} className="relative z-10" />
                  {isSidebarCollapsed && <span className="relative z-10 text-sm">{item.label}</span>}
                  {!isSidebarCollapsed && activeSection === item.id && (
                    <div className="absolute right-0 w-1.5 h-full bg-[var(--sp-accent)] rounded-l-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 hidden lg:block space-y-3">
        {accountItems.length > 0 && (
          <div className="space-y-2">
            {isSidebarCollapsed && (
              <p className="px-4 text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)]/70">
                {t('adminSidebar.groups.account')}
              </p>
            )}
            {accountItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                  activeSection === item.id
                    ? 'text-[var(--text-inverse)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                } ${!isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                aria-label={item.label}
                title={item.label}
              >
                {activeSection === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C89F5E] to-[#D4B76E] animate-shimmer" />
                )}
                <item.icon size={18} className="relative z-10" />
                {isSidebarCollapsed && <span className="relative z-10 text-sm">{item.label}</span>}
                {!isSidebarCollapsed && activeSection === item.id && (
                  <div className="absolute right-0 w-1.5 h-full bg-[var(--sp-accent)] rounded-l-full" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Toggle Sidebar */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[var(--text-secondary)] hover:bg-white/5 transition-all group ${
            !isSidebarCollapsed ? 'justify-center px-0' : ''
          }`}
          aria-label={isSidebarCollapsed ? t('dashboard.sidebar.collapse') : t('adminSidebar.expand')}
          title={isSidebarCollapsed ? t('dashboard.sidebar.collapse') : t('adminSidebar.expand')}
        >
          <div className="group-hover:rotate-180 transition-transform duration-500">
            {isSidebarCollapsed ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </div>
          {isSidebarCollapsed && <span className="font-medium text-sm">{t('dashboard.sidebar.collapse')}</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
