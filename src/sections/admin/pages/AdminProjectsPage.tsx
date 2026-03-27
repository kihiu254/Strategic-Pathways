import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, FolderArchive, Mail, MessageSquare, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { AppNotificationService } from '../../../lib/appNotifications';
import {
  PROJECT_APPROVED_TAG,
  PROJECT_ARCHIVED_TAG,
  formatAdminDate,
  isProjectApproved,
  isProjectArchived,
  removeProjectAdminTag,
} from '../helpers';

type ProjectRow = {
  id: string;
  user_id: string;
  project_title: string | null;
  organization: string | null;
  project_description: string | null;
  role: string | null;
  is_current: boolean | null;
  tags: string[] | null;
  project_url: string | null;
  created_at: string | null;
  profile: {
    full_name?: string | null;
    email?: string | null;
  } | null;
};

const AdminProjectsPage = () => {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});
  const [activeProject, setActiveProject] = useState<ProjectRow | null>(null);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editDraft, setEditDraft] = useState({
    project_title: '',
    organization: '',
    role: '',
    project_description: '',
    project_url: '',
    is_current: false,
    tags: ''
  });

  const toFileName = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 64) || 'portfolio-project';

  const loadProjects = async () => {
    try {
      setLoadError(null);
      const fullSelect =
        'id, user_id, project_title, organization, project_description, role, is_current, tags, project_url, created_at';
      const fallbackSelect =
        'id, user_id, project_title, organization, project_description, is_current, created_at';

      let projectData = null as null | ProjectRow[];
      let projectError: Error | null = null;

      const { data, error } = await supabase
        .from('user_projects')
        .select(fullSelect)
        .order('created_at', { ascending: false });

      if (error) {
        projectError = error;
        const message = error.message?.toLowerCase() || '';
        const shouldFallback =
          message.includes('column') || message.includes('does not exist');

        if (shouldFallback) {
          const fallback = await supabase
            .from('user_projects')
            .select(fallbackSelect)
            .order('created_at', { ascending: false });

          if (fallback.error) {
            throw fallback.error;
          }

          projectData = (fallback.data || []) as ProjectRow[];
          setLoadError(
            'Some project fields are missing in the database schema. Run docs/admin-dashboard-v2.sql or docs/fix-user-projects-and-admin-view.sql to add missing columns.'
          );
        } else {
          throw error;
        }
      } else {
        projectData = (data || []) as ProjectRow[];
      }

      if (!projectData) {
        throw projectError || new Error('No project data returned.');
      }

      const ownerIds = Array.from(
        new Set(projectData.map((project) => project.user_id).filter(Boolean))
      );

      let ownerLookup: Record<string, { full_name: string | null; email: string | null }> = {};

      if (ownerIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', ownerIds);

        if (profileError) {
          console.warn('Failed to load profile info for projects:', profileError);
        } else {
          ownerLookup = (profileRows || []).reduce<Record<string, { full_name: string | null; email: string | null }>>(
            (accumulator, row) => {
              accumulator[row.id] = {
                full_name: row.full_name,
                email: row.email,
              };
              return accumulator;
            },
            {}
          );
        }
      }

      setProjects(
        projectData.map((project) => ({
          ...project,
          profile: ownerLookup[project.user_id] || null,
        }))
      );
    } catch (error) {
      const err = error as Error;
      console.error('Error loading admin projects:', err);
      const message = err.message?.toLowerCase().includes('permission')
        ? 'Admin access to portfolio projects is blocked by RLS policies. Run docs/admin-dashboard-v2.sql to enable admin reads.'
        : err.message?.toLowerCase().includes('does not exist')
          ? 'The user_projects table is missing. Run docs/admin-dashboard-v2.sql to create the portfolio table.'
          : 'Portfolio projects could not be loaded for moderation. Confirm docs/admin-dashboard-v2.sql has been applied.';
      setLoadError(message);
      toast.error('Portfolio projects could not be loaded for moderation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const archived = isProjectArchived(project.tags);
      const matchesFilter =
        filter === 'all' || (filter === 'archived' ? archived : !archived);
      const matchesQuery =
        !query ||
        [project.project_title, project.organization, project.profile?.full_name, project.profile?.email]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query.toLowerCase()));

      return matchesFilter && matchesQuery;
    });
  }, [filter, projects, query]);

  const summary = {
    total: projects.length,
    archived: projects.filter((project) => isProjectArchived(project.tags)).length,
    live: projects.filter((project) => !isProjectArchived(project.tags)).length,
    current: projects.filter((project) => project.is_current).length,
  };

  const toggleArchive = async (project: ProjectRow) => {
    const archived = isProjectArchived(project.tags);
    const nextTags = archived
      ? removeProjectAdminTag(project.tags, PROJECT_ARCHIVED_TAG)
      : [...removeProjectAdminTag(project.tags, PROJECT_ARCHIVED_TAG), PROJECT_ARCHIVED_TAG];

    try {
      const { error } = await supabase
        .from('user_projects')
        .update({ tags: nextTags })
        .eq('id', project.id);

      if (error) throw error;

      setProjects((current) =>
        current.map((item) =>
          item.id === project.id
            ? {
                ...item,
                tags: nextTags,
              }
            : item
        )
      );

      toast.success(archived ? 'Project restored to the visible moderation queue.' : 'Project archived from the active moderation queue.');
    } catch (error) {
      console.error('Error updating project archive status:', error);
      toast.error('Project archive status could not be updated.');
    }
  };

  const toggleApproval = async (project: ProjectRow) => {
    const approved = isProjectApproved(project.tags);
    const nextTags = approved
      ? removeProjectAdminTag(project.tags, PROJECT_APPROVED_TAG)
      : [...removeProjectAdminTag(project.tags, PROJECT_APPROVED_TAG), PROJECT_APPROVED_TAG];

    try {
      const { error } = await supabase
        .from('user_projects')
        .update({ tags: nextTags })
        .eq('id', project.id);

      if (error) throw error;

      setProjects((current) =>
        current.map((item) =>
          item.id === project.id
            ? {
                ...item,
                tags: nextTags,
              }
            : item
        )
      );

      toast.success(approved ? 'Project moved back to review.' : 'Project approved and published.');
    } catch (error) {
      console.error('Error updating project approval status:', error);
      toast.error('Project approval status could not be updated.');
    }
  };

  const notifyOwner = async (project: ProjectRow) => {
    const message = (messageDrafts[project.id] || '').trim();
    if (!message) {
      toast.error('Write a short owner message before sending.');
      return;
    }

    try {
      await AppNotificationService.notifyUser(project.user_id, {
        title: 'Portfolio project follow-up',
        message,
        type: 'info',
        data: {
          action: 'admin_project_follow_up',
          projectId: project.id,
          projectTitle: project.project_title || 'Portfolio project',
        },
      });

      setMessageDrafts((current) => ({ ...current, [project.id]: '' }));
      toast.success('Project owner notified.');
    } catch (error) {
      console.error('Error sending project owner message:', error);
      toast.error('The owner message could not be sent.');
    }
  };

  const downloadProject = (project: ProjectRow) => {
    const lines = [
      `Project: ${project.project_title || 'Untitled project'}`,
      `Organization: ${project.organization || 'Not supplied'}`,
      `Role: ${project.role || 'Not supplied'}`,
      `Status: ${project.is_current ? 'Current project' : 'Past project'}`,
      `Owner: ${project.profile?.full_name || 'Unknown member'} (${project.profile?.email || 'No email'})`,
      `Created: ${formatAdminDate(project.created_at)}`,
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
    link.download = `${toFileName(project.project_title || 'portfolio-project')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openProject = (project: ProjectRow) => {
    setActiveProject(project);
    setIsEditingProject(false);
    setEditDraft({
      project_title: project.project_title || '',
      organization: project.organization || '',
      role: project.role || '',
      project_description: project.project_description || '',
      project_url: project.project_url || '',
      is_current: Boolean(project.is_current),
      tags: (project.tags || []).join(', ')
    });
  };

  const closeProject = () => {
    setActiveProject(null);
    setIsEditingProject(false);
  };

  const saveProjectUpdates = async () => {
    if (!activeProject) return;

    try {
      const nextTags = editDraft.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload = {
        project_title: editDraft.project_title.trim(),
        organization: editDraft.organization.trim() || null,
        role: editDraft.role.trim() || null,
        project_description: editDraft.project_description.trim() || null,
        project_url: editDraft.project_url.trim() || null,
        is_current: editDraft.is_current,
        tags: nextTags,
      };

      const { error } = await supabase.from('user_projects').update(payload).eq('id', activeProject.id);

      if (error) {
        const message = error.message?.toLowerCase() || '';
        const fallbackPayload = {
          project_title: payload.project_title,
          organization: payload.organization,
          role: payload.role,
          project_description: payload.project_description,
          is_current: payload.is_current,
        };

        if (message.includes('column') || message.includes('does not exist')) {
          const { error: fallbackError } = await supabase
            .from('user_projects')
            .update(fallbackPayload)
            .eq('id', activeProject.id);

          if (fallbackError) throw fallbackError;

          setProjects((current) =>
            current.map((project) =>
              project.id === activeProject.id
                ? {
                    ...project,
                    ...fallbackPayload,
                  }
                : project
            )
          );

          toast.success('Project updated. Some advanced fields are missing in the database schema.');
          setActiveProject((current) =>
            current ? { ...current, ...fallbackPayload } : current
          );
          setIsEditingProject(false);
          return;
        }

        throw error;
      }

      setProjects((current) =>
        current.map((project) =>
          project.id === activeProject.id
            ? {
                ...project,
                project_title: payload.project_title,
                organization: payload.organization,
                role: payload.role,
                project_description: payload.project_description,
                project_url: payload.project_url,
                is_current: payload.is_current,
                tags: payload.tags
              }
            : project
        )
      );

      toast.success('Project updated.');
      setActiveProject((current) =>
        current
          ? {
              ...current,
              project_title: payload.project_title,
              organization: payload.organization,
              role: payload.role,
              project_description: payload.project_description,
              project_url: payload.project_url,
              is_current: payload.is_current,
              tags: payload.tags
            }
          : current
      );
      setIsEditingProject(false);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Project update failed.');
    }
  };

  const deleteProject = async (project: ProjectRow) => {
    const shouldDelete = window.confirm(
      `Delete "${project.project_title || 'this project'}" from the admin workspace? This cannot be undone.`
    );

    if (!shouldDelete) return;

    try {
      const { error } = await supabase.from('user_projects').delete().eq('id', project.id);

      if (error) throw error;

      setProjects((current) => current.filter((item) => item.id !== project.id));
      setMessageDrafts((current) => {
        const next = { ...current };
        delete next[project.id];
        return next;
      });
      if (activeProject?.id === project.id) {
        closeProject();
      }

      toast.success('Project deleted.');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Project deletion failed.');
    }
  };

  return (
    <div className="admin-section-shell">
      {loadError && (
        <div className="rounded-[24px] border border-amber-500/30 bg-amber-500/10 px-5 py-4">
          <p className="text-sm font-semibold text-amber-100">Portfolio projects need database access</p>
          <p className="mt-1 text-xs text-amber-50/80">{loadError}</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Projects', value: summary.total },
          { label: 'Live queue', value: summary.live },
          { label: 'Archived', value: summary.archived },
          { label: 'Current projects', value: summary.current },
        ].map((item) => (
          <div key={item.label} className="admin-surface-card premium-glass p-5 rounded-[24px] border border-white/5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">{item.label}</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-4">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="admin-surface-card premium-glass p-6 rounded-[28px] border border-white/5">
        <div className="flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects, owners, or organizations"
              className="input-glass pl-10 pr-4 py-3 w-full"
            />
          </div>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as 'all' | 'active' | 'archived')}
            className="input-glass px-4 py-3 w-full xl:w-auto"
            title="Filter project moderation status"
          >
            <option value="all">All project states</option>
            <option value="active">Active moderation queue</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const archived = isProjectArchived(project.tags);
          const approved = isProjectApproved(project.tags);

          return (
            <div key={project.id} className="admin-project-card glass-card p-6 border border-white/5 rounded-[28px]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">
                      {project.project_title || 'Untitled project'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${archived ? 'bg-red-500/15 text-red-300' : 'bg-green-500/15 text-green-300'}`}>
                      {archived ? 'archived' : 'active'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${approved ? 'bg-[var(--sp-accent)]/20 text-[var(--sp-accent)]' : 'bg-amber-500/15 text-amber-200'}`}>
                      {approved ? 'approved' : 'pending'}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {project.organization || 'Independent project'}{project.role ? ` · ${project.role}` : ''}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">
                    Uploaded by {project.profile?.full_name || 'Unknown member'} · {project.profile?.email || 'No email'}
                  </p>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{formatAdminDate(project.created_at)}</p>
              </div>

              <p className="text-sm leading-relaxed text-[var(--text-secondary)] mt-5">
                {project.project_description || 'No project summary provided.'}
              </p>

              <div className="flex flex-wrap gap-2 mt-5">
                <span className="admin-stat-pill text-xs text-[var(--text-secondary)]">
                  {project.is_current ? 'Current project' : 'Past project'}
                </span>
                {project.project_url && (
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-stat-pill text-xs text-[var(--sp-accent)] inline-flex items-center gap-2"
                  >
                    <ExternalLink size={12} />
                    Project link
                  </a>
                )}
              </div>

              <div className="grid gap-3 mt-6">
                <textarea
                  value={messageDrafts[project.id] || ''}
                  onChange={(event) =>
                    setMessageDrafts((current) => ({
                      ...current,
                      [project.id]: event.target.value,
                    }))
                  }
                  rows={3}
                  className="input-glass w-full px-4 py-3 resize-none"
                  placeholder="Write a message to the project owner"
                />
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => notifyOwner(project)} className="sp-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2">
                    <MessageSquare size={16} />
                    Message owner
                  </button>
                  <button onClick={() => openProject(project)} className="sp-btn-glass px-4 py-2 text-sm">
                    View project
                  </button>
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
                  {project.profile?.email && (
                    <a href={`mailto:${project.profile.email}`} className="sp-btn-glass px-4 py-2 text-sm inline-flex items-center gap-2">
                      <Mail size={16} />
                      Email owner
                    </a>
                  )}
                  <button onClick={() => toggleApproval(project)} className="sp-btn-glass px-4 py-2 text-sm">
                    {approved ? 'Move to review' : 'Approve / Publish'}
                  </button>
                  <button onClick={() => toggleArchive(project)} className="sp-btn-glass px-4 py-2 text-sm inline-flex items-center gap-2">
                    <FolderArchive size={16} />
                    {archived ? 'Restore project' : 'Archive project'}
                  </button>
                  <button onClick={() => deleteProject(project)} className="sp-btn-glass px-4 py-2 text-sm inline-flex items-center gap-2 text-red-300 hover:text-red-200">
                    <Trash2 size={16} />
                    Delete project
                  </button>
                  <button onClick={() => downloadProject(project)} className="sp-btn-glass px-4 py-2 text-sm">
                    Download summary
                  </button>
                  <Link to={`/admin/user/${project.user_id}`} className="sp-btn-glass px-4 py-2 text-sm">
                    View owner
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && filteredProjects.length === 0 && (
        <div className="admin-surface-card premium-glass p-10 rounded-[28px] border border-dashed border-white/10 text-center text-[var(--text-secondary)]">
          No portfolio projects match the current search.
        </div>
      )}

      {activeProject && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[var(--bg-primary)]/95 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--sp-accent)] font-semibold">Portfolio Project</p>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  {activeProject.project_title || 'Untitled project'}
                </h3>
              </div>
              <button onClick={closeProject} className="sp-btn-glass px-3 py-2 text-sm">
                Close
              </button>
            </div>

            <div className="p-6 space-y-5">
              {!isEditingProject ? (
                <>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Owner</p>
                    <p className="text-sm text-[var(--text-primary)]">
                      {activeProject.profile?.full_name || 'Unknown member'} · {activeProject.profile?.email || 'No email'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Organization</p>
                      <p className="text-sm text-[var(--text-primary)]">{activeProject.organization || 'Not supplied'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Role</p>
                      <p className="text-sm text-[var(--text-primary)]">{activeProject.role || 'Not supplied'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Summary</p>
                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                      {activeProject.project_description || 'No project summary provided.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="admin-stat-pill text-xs text-[var(--text-secondary)]">
                      {activeProject.is_current ? 'Current project' : 'Past project'}
                    </span>
                    {(activeProject.tags || []).map((tag) => (
                      <span key={tag} className="admin-stat-pill text-xs text-[var(--text-secondary)]">
                        {tag}
                      </span>
                    ))}
                    {activeProject.project_url && (
                      <a
                        href={activeProject.project_url}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-stat-pill text-xs text-[var(--sp-accent)] inline-flex items-center gap-2"
                      >
                        <ExternalLink size={12} />
                        Open project link
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Project title</label>
                      <input
                        value={editDraft.project_title}
                        onChange={(event) => setEditDraft((current) => ({ ...current, project_title: event.target.value }))}
                        className="input-glass w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Organization</label>
                      <input
                        value={editDraft.organization}
                        onChange={(event) => setEditDraft((current) => ({ ...current, organization: event.target.value }))}
                        className="input-glass w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Role</label>
                      <input
                        value={editDraft.role}
                        onChange={(event) => setEditDraft((current) => ({ ...current, role: event.target.value }))}
                        className="input-glass w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Project link</label>
                      <input
                        value={editDraft.project_url}
                        onChange={(event) => setEditDraft((current) => ({ ...current, project_url: event.target.value }))}
                        className="input-glass w-full"
                        placeholder="https://"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Summary</label>
                    <textarea
                      value={editDraft.project_description}
                      onChange={(event) => setEditDraft((current) => ({ ...current, project_description: event.target.value }))}
                      className="input-glass w-full min-h-[120px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Tags</label>
                    <input
                      value={editDraft.tags}
                      onChange={(event) => setEditDraft((current) => ({ ...current, tags: event.target.value }))}
                      className="input-glass w-full"
                      placeholder="Comma-separated"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      checked={editDraft.is_current}
                      onChange={(event) => setEditDraft((current) => ({ ...current, is_current: event.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    Mark as current project
                  </label>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-t border-white/10">
              <div className="text-xs text-[var(--text-secondary)]">
                Created {formatAdminDate(activeProject.created_at)}
              </div>
              <div className="flex gap-2">
                {isEditingProject ? (
                  <>
                    <button onClick={() => setIsEditingProject(false)} className="sp-btn-glass px-4 py-2 text-sm">
                      Cancel
                    </button>
                    <button onClick={saveProjectUpdates} className="sp-btn-primary px-4 py-2 text-sm">
                      Save changes
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => deleteProject(activeProject)} className="sp-btn-glass px-4 py-2 text-sm inline-flex items-center gap-2 text-red-300 hover:text-red-200">
                      <Trash2 size={14} />
                      Delete project
                    </button>
                    <button onClick={() => setIsEditingProject(true)} className="sp-btn-glass px-4 py-2 text-sm">
                      Update project
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjectsPage;
