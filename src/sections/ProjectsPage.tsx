import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, FileDown, FolderOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';

type ProjectRow = {
  id: string;
  project_title: string | null;
  organization: string | null;
  role: string | null;
  project_description: string | null;
  is_current: boolean | null;
  tags: string[] | null;
  project_url: string | null;
  created_at: string | null;
};

const APPROVED_TAG = 'admin-status:approved';

const ProjectsPage = () => {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadError(null);
        const { data, error } = await supabase
          .from('user_projects')
          .select(
            'id, project_title, organization, role, project_description, is_current, tags, project_url, created_at'
          )
          .contains('tags', [APPROVED_TAG])
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects((data || []) as ProjectRow[]);
      } catch (error) {
        const err = error as Error;
        const message = err.message?.toLowerCase() || '';
        const friendly = message.includes('permission')
          ? 'Approved projects are blocked by database permissions. Run docs/ensure-admin-project-visibility.sql or enable public reads.'
          : message.includes('column') || message.includes('does not exist')
            ? 'Projects schema is missing fields. Run docs/admin-dashboard-v2.sql or docs/complete-schema-update.sql.'
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
    const current = projects.filter((project) => project.is_current).length;
    return { total, current };
  }, [projects]);

  const downloadProject = (project: ProjectRow) => {
    const fileName =
      (project.project_title || 'portfolio-project')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .slice(0, 64) || 'portfolio-project';

    const lines = [
      `Project: ${project.project_title || 'Untitled project'}`,
      `Organization: ${project.organization || 'Not supplied'}`,
      `Role: ${project.role || 'Not supplied'}`,
      `Status: ${project.is_current ? 'Current project' : 'Past project'}`,
      `Created: ${project.created_at || 'No date'}`,
      `Tags: ${(project.tags || []).join(', ') || 'None'}`,
      `Project link: ${project.project_url || 'Not supplied'}`,
      '',
      'Summary:',
      project.project_description || 'No project summary provided.',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-28 pb-16">
      <SEO title="Approved Projects" />
      <div className="max-w-6xl mx-auto px-6">
        <div className="glass-card rounded-[32px] border border-white/10 p-8 md:p-10 mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--sp-accent)] font-bold mb-3">
                Approved Portfolio Projects
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                Project Library
              </h1>
              <p className="text-sm md:text-base text-[var(--text-secondary)] mt-3 max-w-2xl">
                Browse verified member projects that have been approved by Strategic Pathways admins.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="glass-light rounded-2xl px-5 py-4 text-center min-w-[140px]">
                <p className="text-2xl font-bold text-[var(--text-primary)]">{summary.total}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] mt-2">Total</p>
              </div>
              <div className="glass-light rounded-2xl px-5 py-4 text-center min-w-[140px]">
                <p className="text-2xl font-bold text-[var(--text-primary)]">{summary.current}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] mt-2">Current</p>
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
            Loading approved projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card p-10 text-center text-[var(--text-secondary)]">
            No approved projects yet. Check back after the admin team publishes projects.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="admin-project-card glass-card p-6 border border-white/5 rounded-[28px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-[var(--text-primary)]">
                        {project.project_title || 'Untitled project'}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[var(--sp-accent)]/20 text-[var(--sp-accent)]">
                        Approved
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        project.is_current ? 'bg-green-500/15 text-green-300' : 'bg-white/10 text-[var(--text-secondary)]'
                      }`}>
                        {project.is_current ? 'Current' : 'Past'}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      {project.organization || 'Independent project'}{project.role ? ` · ${project.role}` : ''}
                    </p>
                  </div>
                  <FolderOpen className="text-[var(--sp-accent)]" size={20} />
                </div>

                <p className="text-sm leading-relaxed text-[var(--text-secondary)] mt-4">
                  {project.project_description || 'No project summary provided.'}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {(project.tags || []).filter((tag) => !tag.startsWith('admin-status:')).map((tag) => (
                    <span key={tag} className="admin-stat-pill text-xs text-[var(--text-secondary)]">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-5">
                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noreferrer"
                      className="sp-btn-glass px-4 py-2 text-sm inline-flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Open project link
                    </a>
                  )}
                  <button
                    onClick={() => downloadProject(project)}
                    className="sp-btn-glass px-4 py-2 text-sm inline-flex items-center gap-2"
                  >
                    <FileDown size={16} />
                    Download summary
                  </button>
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
