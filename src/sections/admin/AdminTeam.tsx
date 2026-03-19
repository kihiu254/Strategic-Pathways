import React from 'react';
import { 
  Search, Plus, Star, X 
} from 'lucide-react';
import type { AdminRecord, DashboardMember } from './types';



interface AdminTeamProps {
  admins: AdminRecord[];
  members: DashboardMember[];
  showPromoteList: boolean;
  setShowPromoteList: (show: boolean) => void;
  showAddAdmin: boolean;
  setShowAddAdmin: (show: boolean) => void;
  promoteSearch: string;
  setPromoteSearch: (search: string) => void;
  newAdmin: { email: string; full_name: string; password?: string };
  setNewAdmin: (admin: { email: string; full_name: string; password?: string }) => void;

  handleMakeAdmin: (id: string, email: string) => void;
  handleAddAdmin: () => void;
  handleRemoveAdmin: (id: string) => void;
}

const AdminTeam: React.FC<AdminTeamProps> = ({
  admins,
  members,
  showPromoteList,
  setShowPromoteList,
  showAddAdmin,
  setShowAddAdmin,
  promoteSearch,
  setPromoteSearch,
  newAdmin,
  setNewAdmin,
  handleMakeAdmin,
  handleAddAdmin,
  handleRemoveAdmin
}) => {
  return (
    <div className="admin-section-shell">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input 
            type="text"
            placeholder="Search admins..."
            className="input-glass pl-10 pr-4 py-2.5 w-full text-sm"
            aria-label="Search admins"
            title="Search admins"
          />
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowPromoteList(!showPromoteList)}
            className={`sp-btn-glass flex items-center gap-2 text-sm px-4 ${showPromoteList ? 'bg-[var(--sp-accent)]/10 border-[var(--sp-accent)]/50' : ''}`}
          >
            <Star size={14} />
            Promote Member
          </button>
          <button 
            onClick={() => setShowAddAdmin(true)}
            className="sp-btn-primary flex items-center gap-2 text-sm px-4"
          >
            <Plus size={14} />
            Add New Admin
          </button>
        </div>
      </div>

      {showPromoteList && (
        <div className="admin-surface-card premium-glass p-6 space-y-4 rounded-[28px] border border-[var(--sp-accent)]/20 animate-in zoom-in-95">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Select Member to Promote</h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input 
                type="text"
                placeholder="Search candidates..."
                value={promoteSearch}
                onChange={(e) => setPromoteSearch(e.target.value)}
                className="input-glass pl-9 pr-4 py-1.5 text-xs w-64"
                aria-label="Search members to promote"
                title="Search members to promote"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {members
              .filter(m => 
                !admins.some(a => a.id === m.id) && 
                (m.name.toLowerCase().includes(promoteSearch.toLowerCase()) || 
                 m.email.toLowerCase().includes(promoteSearch.toLowerCase()))
              )
              .map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 glass-light rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C89F5E] to-[#8B7355] flex items-center justify-center">
                      <span className="text-[var(--text-inverse)] text-xs font-bold">{member.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--sp-accent)] transition-colors">{member.name}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] opacity-60">{member.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleMakeAdmin(member.id, member.email)}
                    className="sp-btn-primary text-[10px] py-1.5 px-4"
                  >
                    Grant Access
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {showAddAdmin && (
        <div className="admin-surface-card premium-glass p-8 rounded-[28px] border border-[var(--sp-accent)]/20 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Add New Administrator</h3>
            <button 
              onClick={() => setShowAddAdmin(false)} 
              className="text-[var(--text-secondary)] hover:text-white transition-colors"
              title="Close add admin panel"
              aria-label="Close add admin panel"
            >

              <X size={20} />
            </button>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">Email Address *</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="input-glass w-full px-4 py-3"
                  placeholder="admin@strategicpathways.co.ke"
                  aria-label="New admin email"
                  title="New admin email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">Full Name *</label>
                <input
                  type="text"
                  value={newAdmin.full_name}
                  onChange={(e) => setNewAdmin({...newAdmin, full_name: e.target.value})}
                  className="input-glass w-full px-4 py-3"
                  placeholder="John Doe"
                  aria-label="New admin full name"
                  title="New admin full name"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">Temporary Password (optional)</label>
                <input
                  type="text"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  className="input-glass w-full px-4 py-3"
                  placeholder="Leave empty for auto-generation"
                  aria-label="Temporary password"
                  title="Temporary password"
                />
                <p className="text-[10px] text-[var(--text-secondary)] opacity-60 pl-1">Password must be at least 8 characters with numbers and symbols if manual.</p>
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <button onClick={handleAddAdmin} className="sp-btn-primary flex-1 py-3 font-bold">
                Create Admin Account
              </button>
              <button 
                onClick={() => {
                  setShowAddAdmin(false);
                  setNewAdmin({ email: '', full_name: '', password: '' });
                }} 
                className="sp-btn-glass px-8"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-surface-card premium-glass rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.2em] font-bold">
              <tr>
                <th className="px-8 py-6">Admin Identity</th>
                <th className="px-8 py-6">Control Level</th>
                <th className="px-8 py-6">Activation Date</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {admins.map((admin) => (
                <tr key={admin.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--sp-accent)] to-[#8B7355] flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                        {admin.avatar_url ? (
                          <img src={admin.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <span className="text-[var(--text-inverse)] font-bold text-lg">
                            {admin.full_name ? admin.full_name.charAt(0) : admin.email.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--sp-accent)] transition-colors truncate">{admin.full_name || 'Admin User'}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] opacity-60 font-medium tracking-tight uppercase truncate">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-bold tracking-[0.2em] px-3 py-1.5 bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] border border-[var(--sp-accent)]/20 rounded-lg uppercase">
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs text-[var(--text-secondary)] font-medium">
                    {new Date(admin.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleRemoveAdmin(admin.id)}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title={`Revoke admin credentials for ${admin.full_name || admin.email}`}
                        aria-label={`Revoke admin credentials for ${admin.full_name || admin.email}`}
                      >

                          <X size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTeam;
