import { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { AdminRecord } from './admin/types';
import AdminHeader from './admin/AdminHeader';
import AdminSidebar from './admin/AdminSidebar';
import { getAdminPageMeta, getSidebarItems } from './admin/constants';
import './AdminDashboard.css';

export type AdminLayoutOutletContext = {
  adminProfile: AdminRecord | null;
  refreshAdminProfile: () => Promise<void>;
  userEmail?: string;
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [adminProfile, setAdminProfile] = useState<AdminRecord | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  const sidebarItems = useMemo(() => getSidebarItems(t), [t]);
  const activePage = useMemo(
    () => getAdminPageMeta(location.pathname, t),
    [location.pathname, t]
  );

  const refreshAdminProfile = async () => {
    if (!user?.id) {
      setAdminProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, role, created_at')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error loading admin profile:', error);
      return;
    }

    setAdminProfile(data as AdminRecord);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await refreshAdminProfile();
      } finally {
        setIsBooting(false);
      }
    };

    void load();
  }, [user?.id]);

  useEffect(() => {
    setIsAdminMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        adminMenuRef.current &&
        event.target instanceof Node &&
        !adminMenuRef.current.contains(event.target)
      ) {
        setIsAdminMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isBooting) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 gap-4">
        <Loader2 className="w-10 h-10 text-[var(--sp-accent)] animate-spin" />
        <p className="text-[var(--text-secondary)] font-medium">{t('adminDashboard.booting')}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-shell">
      <AdminHeader
        activeSectionLabel={activePage.label}
        adminProfile={adminProfile}
        isAdminMenuOpen={isAdminMenuOpen}
        setIsAdminMenuOpen={setIsAdminMenuOpen}
        adminMenuRef={adminMenuRef}
        userEmail={user?.email}
      />

      <div className="admin-layout-body">
        <AdminSidebar
          activeSection={activePage.id}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />

        <div className="admin-dashboard-main">
          <main className="admin-content-area scroll-smooth">
            <div className="admin-section-shell mb-6">
              <div className="admin-section-heading">
                <span className="admin-section-badge">{activePage.label}</span>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                      {activePage.label}
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-3xl">
                      {activePage.description}
                    </p>
                  </div>
                  {location.pathname !== '/admin' && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="sp-btn-glass px-4 py-2 text-sm self-start lg:self-auto"
                    >
                      {t('adminDashboard.backToOverview')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:hidden mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                      activePage.id === item.id
                        ? 'bg-[var(--sp-accent)] text-[var(--text-inverse)]'
                        : 'bg-white/5 text-[var(--text-secondary)]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <Outlet
              context={{
                adminProfile,
                refreshAdminProfile,
                userEmail: user?.email,
              }}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
