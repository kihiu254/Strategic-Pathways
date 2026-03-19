import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, LayoutDashboard, Shield 
} from 'lucide-react';

interface AdminHeaderProps {
  activeSectionLabel: string;
  adminProfile: { full_name?: string | null; email?: string; avatar_url?: string | null } | null;
  isAdminMenuOpen: boolean;
  setIsAdminMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  adminMenuRef: React.RefObject<HTMLDivElement | null>;
  userEmail?: string;


}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeSectionLabel,
  adminProfile,
  isAdminMenuOpen,
  setIsAdminMenuOpen,
  adminMenuRef,
  userEmail,
}) => {

  const navigate = useNavigate();


  return (
    <header className="admin-dashboard-header">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[var(--sp-accent)] shadow-[0_0_10px_rgba(200,159,94,0.4)]" />
          <h1 className="text-sm font-bold tracking-tight admin-header-title uppercase">{activeSectionLabel}</h1>
        </div>

        <div className="flex items-center gap-3 ml-auto" ref={adminMenuRef}>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight truncate max-w-[180px]">
              {adminProfile?.full_name || 'Admin User'}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-70">
              Super Admin
            </p>
          </div>
          <div 
            onClick={() => setIsAdminMenuOpen((prev) => !prev)}
            className="admin-profile-orb" 
            title="Admin account settings"
          >
            {adminProfile?.avatar_url ? (
              <img src={adminProfile.avatar_url} alt="Admin" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-[var(--text-inverse)] font-bold text-xs">
                {(adminProfile?.full_name || 'Admin').charAt(0).toUpperCase()}
              </span>
            )}
            
            {isAdminMenuOpen && (
              <div className="absolute right-0 top-[110%] w-64 glass-card p-2 z-50 animate-in slide-in-from-top-4 shadow-2xl border border-white/10">
                <div className="px-3 py-2 border-b border-white/10 mb-2">
                  <p className="text-[var(--text-primary)] font-medium truncate text-sm">
                    {adminProfile?.full_name || 'Admin User'}
                  </p>
                  <p className="text-[var(--text-secondary)] text-[10px] truncate opacity-60">
                    {adminProfile?.email || userEmail}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsAdminMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors text-left"
                >
                  <User size={14} />
                  <span className="text-xs">My Profile</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setIsAdminMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors text-left"
                >
                  <LayoutDashboard size={14} />
                  <span className="text-xs">User Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/admin');
                    setIsAdminMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors text-left"
                >
                  <Shield size={14} />
                  <span className="text-xs">Admin Dashboard</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
