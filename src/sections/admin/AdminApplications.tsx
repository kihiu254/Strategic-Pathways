import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Eye, CheckCircle, X, User 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RecentApplication, DocumentViewerData } from './types';

interface AdminApplicationsProps {
  recentApplications: RecentApplication[];
  selectedApplications: string[];
  setSelectedApplications: (ids: string[]) => void;
  handleBulkApprove: () => void;
  handleBulkReject: () => void;
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
  getStatusBadge: (status: string) => string;
  handleViewDocs: (app: DocumentViewerData) => void;
}

const AdminApplications: React.FC<AdminApplicationsProps> = ({
  recentApplications,
  selectedApplications,
  setSelectedApplications,
  handleBulkApprove,
  handleBulkReject,
  handleApprove,
  handleReject,
  getStatusBadge,
  handleViewDocs
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [now] = useState(() => Date.now());

  const filteredApplications = recentApplications.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-section-shell">
      <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">These approvals are for profile verification submissions.</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Duplicate review is based on repeated names or repeated email addresses in member records.
        </p>
      </div>

      <div className="flex items-center gap-4 flex-wrap mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder={t('dashboard.placeholders.searchMembers')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-glass pl-10 pr-4 py-2 w-64"
            aria-label="Search applications"
            title="Search applications"
          />
        </div>
        <div className="flex gap-2 ml-auto">
          {selectedApplications.length > 0 && (
            <>
              <button 
                onClick={handleBulkApprove}
                className="sp-btn-primary px-4 py-2 flex items-center gap-2 text-sm"
              >
                <CheckCircle size={16} />
                {t('dashboard.buttons.bulkApprove')} ({selectedApplications.length})
              </button>
              <button 
                onClick={handleBulkReject}
                className="sp-btn-glass px-4 py-2 flex items-center gap-2 text-sm text-red-400 border-red-500/20"
              >
                <X size={16} />
                {t('dashboard.buttons.bulkReject')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredApplications.map((app) => (
          <div key={app.id} className="admin-surface-card premium-glass rounded-[24px] p-6 border border-white/5 hover:border-[var(--sp-accent)]/30 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <input 
                type="checkbox"
                className="w-4 h-4 rounded border-[var(--sp-accent)]/30 bg-transparent text-[var(--sp-accent)] cursor-pointer"
                checked={selectedApplications.includes(app.id)}
                onChange={(e) => {
                  setSelectedApplications(
                    e.target.checked 
                      ? [...selectedApplications, app.id] 
                      : selectedApplications.filter(id => id !== app.id)
                  );
                }}
                aria-label={`Select application for ${app.name}`}
                title={`Select application for ${app.name}`}
              />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C89F5E] to-[#8B7355] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-[var(--text-inverse)] font-semibold">{app.name.charAt(0)}</span>
              </div>
              <div className="min-w-0">
                <h4 className="text-[var(--text-primary)] font-medium text-lg leading-tight">{app.name}</h4>
                <p className="text-[var(--text-secondary)] text-sm opacity-70">{app.email} &middot; {app.type}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
              <div className="flex flex-col items-end">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(app.status)} mb-1`}>
                  {app.status.replace('_', ' ')}
                </span>
                <span className="text-[var(--text-secondary)] text-[10px] font-medium opacity-60">
                   {Math.max(0, Math.round((now - new Date(app.date).getTime()) / 86400000))}d ago
                </span>
              </div>
              
              <div className="flex gap-2 h-10">
                <button 
                  onClick={() => navigate(`/admin/user/${app.userId}`)} 
                  className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all" 
                  title="View Profile"
                >
                  <User size={18} />
                </button>
                <button 
                  onClick={() => handleViewDocs(app)} 
                  className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all" 
                  title="View Documents"
                >
                  <Eye size={18} />
                </button>
                <button 
                  onClick={() => handleApprove(app.id)} 
                  className="p-2.5 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all" 
                  title="Approve"
                >
                  <CheckCircle size={18} />
                </button>
                <button 
                  onClick={() => handleReject(app.id)} 
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all" 
                  title="Reject"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredApplications.length === 0 && (
          <div className="text-center py-20 px-6 rounded-[32px] border border-dashed border-white/10">
            <p className="text-[var(--text-secondary)] text-lg">No applications found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApplications;
