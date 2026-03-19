import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Filter, Plus, Eye, FileText, Trash2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DashboardMember, DocumentViewerData } from './types';

interface AdminMemberDirectoryProps {
  members: DashboardMember[];
  handleViewDocs: (app: DocumentViewerData) => void;
  handleDeleteMember: (id: string) => void;
  getStatusBadge: (status: string) => string;
  setShowAddMember: (show: boolean) => void;
}

const AdminMemberDirectory: React.FC<AdminMemberDirectoryProps> = ({
  members,
  handleViewDocs,
  handleDeleteMember,
  getStatusBadge,
  setShowAddMember
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="admin-section-shell">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input type="text" placeholder={t('dashboard.placeholders.searchMembers')} className="input-glass pl-10 pr-4 py-2 w-full text-sm" aria-label="Search members" title="Search members" />
          </div>
          <button className="sp-btn-glass flex items-center gap-2 text-sm"><Filter size={14} /> {t('dashboard.buttons.filter')}</button>
        </div>
        <button onClick={() => setShowAddMember(true)} className="sp-btn-primary flex items-center gap-2 text-sm transition-transform hover:scale-105">
          <Plus size={14} /> {t('dashboard.buttons.addMember')}
        </button>
      </div>

      <div className="admin-surface-card premium-glass rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.2em] font-bold">
              <tr>
                <th className="px-8 py-5">Member</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Tier</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {members.map((member) => (
                <tr key={member.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C89F5E] to-[#8B7355] flex items-center justify-center shadow-lg shadow-[var(--sp-accent)]/10 group-hover:scale-110 transition-transform">
                        <span className="text-[var(--text-inverse)] font-bold">{member.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--sp-accent)] transition-colors">{member.name}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] opacity-60">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase ${getStatusBadge(member.status)}`}>
                      {member.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs text-[var(--text-secondary)]">{member.tier || 'Community'}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/admin/user/${member.id}`)} 
                        className="p-2 rounded-xl bg-white/5 text-[var(--text-secondary)] hover:bg-[var(--sp-accent)] hover:text-[var(--text-inverse)] transition-all" 
                        aria-label={`View profile for ${member.name}`} 
                        title={`View profile for ${member.name}`}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleViewDocs({ id: member.id, name: member.name, email: member.email, docs: member.docs || {} })} 
                        className="p-2 rounded-xl bg-white/5 text-[var(--text-secondary)] hover:bg-purple-500 hover:text-white transition-all" 
                        aria-label={`View documents for ${member.name}`} 
                        title={`View documents for ${member.name}`}
                      >
                        <FileText size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMember(member.id)} 
                        className="p-2 rounded-xl bg-white/5 text-[var(--text-secondary)] hover:bg-red-500 hover:text-white transition-all" 
                        aria-label={`Delete member ${member.name}`} 
                        title={`Delete member ${member.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-[var(--text-secondary)]">
                    No members found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMemberDirectory;
