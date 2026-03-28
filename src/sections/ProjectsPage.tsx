import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Calendar, ExternalLink, FolderOpen, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { formatProjectDeadline, parseProject, type Project } from '../lib/projects';
import { isProjectArchived, isProjectApproved } from './admin/helpers';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadError(null);
        const { data, error } = await supabase
          .from('user_projects')
          .select('id, user_id, project_title, organization, project_description, role, is_current, tags, project_url, created_at, profile:profiles!user_projects_user_id_fkey(full_name, email)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        const rows = (data || []) as Array<Record<string, unknown> & { tags?: string[] | null }>;
        setProjects(
          rows
            .filter((row) => isProjectApproved(row.tags) && !isProjectArchived(row.tags))
            .map((row) => parseProject(row))
        );
      } catch (error) {
        const err = error as Error;
        const message = err.message?.toLowerCase() || '';
        const friendly = message.includes('permission')
          ? 'Projects are blocked by database permissions. Run docs/admin-dashboard-v2.sql and docs/project-applications.sql so approved portfolio projects can be published.'
          : message.includes('does not exist')
            ? 'The user_projects table or required columns are missing. Run docs/admin-dashboard-v2.sql and docs/project-applications.sql in Supabase before testing this page.'
            : 'Projects could not be loaded right now.';
        setLoadError(friendly);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const summary = useMemo(() => {
    const total = projects.length;
    const rolling = projects.filter((project) => project.rollingDeadline).length;
    return { total, rolling };
  }, [projects]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 sm:pt-28 pb-12 sm:pb-16">
      <SEO title="Projects" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="glass-card rounded-[32px] border border-white/10 p-5 sm:p-6 md:p-10 mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--sp-accent)] font-bold mb-3">
                Strategic Pathways Projects
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] break-words">
                Open Project Pipeline
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-3 max-w-2xl">
                Browse active projects, understand the scope, and apply with the same guided flow already used for opportunities.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="glass-light rounded-2xl px-4 sm:px-5 py-4 text-center min-w-0">
                <p className="text-2xl font-bold text-[var(--text-primary)]">{summary.total}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] mt-2">Active</p>
              </div>
              <div className="glass-light rounded-2xl px-4 sm:px-5 py-4 text-center min-w-0">
                <p className="text-2xl font-bold text-[var(--text-primary)]">{summary.rolling}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] mt-2">Rolling</p>
              </div>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="rounded-[24px] border border-amber-500/30 bg-amber-500/10 px-5 py-4 mb-8">
            <p className="text-sm font-semibold text-amber-100">Projects could not be loaded</p>
            <p className="mt-1 text-xs text-amber-50/80">{loadError}</p>
          </div>
        )}

        {loading ? (
          <div className="glass-card p-10 text-center text-[var(--text-secondary)]">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card p-10 text-center text-[var(--text-secondary)]">
            No active projects yet. Check back after the admin team publishes one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="admin-project-card glass-card p-6 border border-white/5 rounded-[28px]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-[var(--text-primary)] break-words">
                        {project.title || 'Untitled project'}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[var(--sp-accent)]/20 text-[var(--sp-accent)]">
                        {project.sector}
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white/10 text-[var(--text-secondary)]">
                        {project.rollingDeadline ? 'Rolling' : 'Deadline set'}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-2 break-words">
                      {project.organization} - {project.type}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)] mt-3">
                      <span className="flex items-center gap-2">
                        <MapPin size={12} className="text-[var(--sp-accent)]" />
                        {project.location}
                      </span>
                      <span className="flex items-center gap-2">
                        <Briefcase size={12} className="text-[var(--sp-accent)]" />
                        {project.duration}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar size={12} className="text-[var(--sp-accent)]" />
                        {formatProjectDeadline(project)}
                      </span>
                    </div>
                  </div>
                  <FolderOpen className="text-[var(--sp-accent)] shrink-0" size={20} />
                </div>

                <p className="text-sm leading-relaxed text-[var(--text-secondary)] mt-4 break-words">
                  {project.description || 'No project summary provided.'}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.map((tag) => (
                    <span key={tag} className="admin-stat-pill text-xs text-[var(--text-secondary)]">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mt-5">
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="sp-btn-primary px-4 py-2 text-sm inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    View details
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate(`/projects/${project.id}/apply`)}
                    className="sp-btn-glass px-4 py-2 text-sm inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    Apply now
                    <ArrowRight size={16} />
                  </button>
                  {project.applicationLink && (
                    <a
                      href={project.applicationLink}
                      target="_blank"
                      rel="noreferrer"
                      className="sp-btn-glass px-4 py-2 text-sm inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      External link
                      <ExternalLink size={16} />
                    </a>
                  )}
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="sp-btn-glass px-4 py-2 text-sm inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      Open project link
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
