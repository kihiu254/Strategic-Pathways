import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Filter, Search, Eye, Edit2, Users 
} from 'lucide-react';
import type { DashboardProject } from './types';

interface AdminProjectsProps {
  projects: DashboardProject[];
  projectsError?: string | null;
  getStatusBadge: (status: string) => string;
  onNewProject: () => void;
  onInspectProject: (project: DashboardProject) => void;
  onEditProject: (project: DashboardProject) => void;
}

const AdminProjects: React.FC<AdminProjectsProps> = ({
  projects,
  projectsError,
  getStatusBadge,
  onNewProject,
  onInspectProject,
  onEditProject
}) => {
  const { t } = useTranslation();

  return (
    <div className="admin-section-shell">
      {projectsError && (
        <div className="mb-6 rounded-[24px] border border-amber-500/30 bg-amber-500/10 px-5 py-4">
          <p className="text-sm font-semibold text-amber-200">Projects could not be loaded for this admin session.</p>
          <p className="mt-1 text-xs text-amber-100/80">
            {projectsError} Run `app/docs/complete-schema-update.sql` or `app/docs/fix-user-projects-and-admin-view.sql`
            in Supabase if the `user_projects` table still only allows owners to read their own rows.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 md:gap-4 items-stretch md:items-center justify-between mb-6">
        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input 
            type="text"
            placeholder={t('dashboard.placeholders.searchProjects')}
            className="input-glass pl-10 pr-4 py-2 w-full"
            aria-label="Search projects"
            title="Search projects"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="sp-btn-glass flex items-center gap-2 justify-center w-full sm:w-auto">
            <Filter size={16} />
            {t('dashboard.buttons.filter')}
          </button>
          <button 
            onClick={onNewProject}
            className="sp-btn-primary flex items-center gap-2 justify-center w-full sm:w-auto"
          >
            <Plus size={16} />
            {t('dashboard.buttons.newProject')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="admin-project-card glass-card p-6 group hover:border-[var(--sp-accent)]/30 transition-all border-white/5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--sp-accent)] mb-2 font-bold opacity-80 transition-opacity group-hover:opacity-100">Project Delivery</p>
                <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight group-hover:text-[var(--sp-accent)] transition-colors">{project.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm opacity-70">{project.client}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(project.status)}`}>
                {project.status}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
              <span className="admin-stat-pill text-[var(--sp-accent)] font-bold text-xs ring-1 ring-[var(--sp-accent)]/20">{project.budget}</span>
              <span className="admin-stat-pill text-[var(--text-secondary)] flex items-center gap-2 text-xs font-medium">
                <Users size={14} />
                {project.members} staff
              </span>
              <span className="admin-stat-pill text-[var(--text-secondary)] text-xs font-medium">{project.progress}% velocity</span>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                <span className="text-[var(--text-secondary)] opacity-60">Execution Progress</span>
                <span className="text-[var(--text-primary)]">{project.progress}%</span>
              </div>
              <progress className="admin-progress h-2 w-full" value={project.progress} max={100} aria-label={`Progress for ${project.title}`} />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => onInspectProject(project)}
                className="sp-btn-glass flex-1 flex items-center justify-center gap-2 py-2.5 font-bold transition-transform active:scale-95"
              >
                <Eye size={16} />
                Inspect
              </button>
              <button 
                onClick={() => onEditProject(project)}
                className="sp-btn-glass flex items-center justify-center px-4 transition-transform active:scale-95" 
                aria-label={`Edit project ${project.title}`} 
                title={`Edit project ${project.title}`}
              >
                <Edit2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && !projectsError && (
          <div className="lg:col-span-2 text-center py-20 bg-white/5 rounded-[32px] border border-dashed border-white/10">
            <p className="text-[var(--text-secondary)]">No active projects found in the pipeline.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;
