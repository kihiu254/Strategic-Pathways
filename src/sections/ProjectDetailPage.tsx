import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, ExternalLink, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';

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

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_projects')
          .select('id, project_title, organization, role, project_description, is_current, tags, project_url, created_at')
          .eq('id', projectId)
          .contains('tags', [APPROVED_TAG])
          .single();

        if (error) throw error;
        setProject((data || null) as ProjectRow | null);
      } catch (error) {
        console.error('Error loading project details:', error);
        toast.error('Project details could not be loaded.');
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    void loadProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--sp-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] pt-24 sm:pt-28 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <button onClick={() => navigate('/projects')} className="sp-btn-glass inline-flex items-center justify-center gap-2 mb-8 w-full sm:w-auto">
            <ArrowLeft size={16} />
            Back to Projects
          </button>
          <div className="glass-card rounded-3xl border border-white/10 p-6 sm:p-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4">Project not found</h1>
            <p className="text-[var(--text-secondary)] mb-6">
              This project may have been removed or is no longer publicly available.
            </p>
            <button onClick={() => navigate('/projects')} className="sp-btn-primary w-full sm:w-auto">
              View Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  const visibleTags = (project.tags || []).filter((tag) => !tag.startsWith('admin-status:'));

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 sm:pt-28 pb-12 sm:pb-16">
      <SEO title={project.project_title || 'Project Details'} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <button onClick={() => navigate('/projects')} className="sp-btn-glass inline-flex items-center justify-center gap-2 mb-8 w-full sm:w-auto">
          <ArrowLeft size={16} />
          Back to Projects
        </button>

        <div className="glass-card rounded-[32px] border border-white/10 p-5 sm:p-6 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="sp-label">Projects</span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[var(--sp-accent)]/20 text-[var(--sp-accent)]">
                  Approved
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  project.is_current ? 'bg-green-500/15 text-green-300' : 'bg-white/10 text-[var(--text-secondary)]'
                }`}>
                  {project.is_current ? 'Current' : 'Past'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-[var(--text-primary)] leading-tight break-words">
                {project.project_title || 'Untitled project'}
              </h1>

              <div className="flex flex-wrap gap-3 text-[var(--text-secondary)] mt-6 text-sm">
                <span className="flex items-center gap-2 break-words">
                  <Building2 size={14} className="text-[var(--sp-accent)]" />
                  {project.organization || 'Independent project'}
                </span>
                {project.role && (
                  <span className="flex items-center gap-2 break-words">
                    <FolderOpen size={14} className="text-[var(--sp-accent)]" />
                    {project.role}
                  </span>
                )}
                <span className="flex items-center gap-2 break-words">
                  <Calendar size={14} className="text-[var(--sp-accent)]" />
                  {project.created_at ? `Published ${new Date(project.created_at).toLocaleDateString()}` : 'Publish date unavailable'}
                </span>
              </div>
            </div>

            <div className="w-full lg:w-[300px] premium-glass rounded-3xl border border-white/10 p-6">
              <div className="space-y-3">
                <button onClick={() => navigate('/projects')} className="sp-btn-primary w-full">
                  View More Projects
                </button>
                {project.project_url && (
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noreferrer"
                    className="sp-btn-glass w-full flex items-center justify-center gap-2"
                  >
                    Open project link
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 lg:gap-8 mt-8 sm:mt-10">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Project Summary</h2>
              <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed break-words">
                {project.project_description || 'No project summary provided.'}
              </p>
            </div>

            <div className="space-y-6">
              <div className="glass-light rounded-3xl p-5">
                <h3 className="font-bold text-[var(--text-primary)] mb-3">Role</h3>
                <p className="text-[var(--text-secondary)] break-words">{project.role || 'Not supplied'}</p>
              </div>
              <div className="glass-light rounded-3xl p-5">
                <h3 className="font-bold text-[var(--text-primary)] mb-3">Organization</h3>
                <p className="text-[var(--text-secondary)] break-words">{project.organization || 'Independent project'}</p>
              </div>
              {visibleTags.length > 0 && (
                <div className="glass-light rounded-3xl p-5">
                  <h3 className="font-bold text-[var(--text-primary)] mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {visibleTags.map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded-full bg-white/5 text-[var(--text-secondary)] text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
