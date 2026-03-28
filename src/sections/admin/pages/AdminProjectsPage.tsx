import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, FolderArchive, Mail, MessageSquare, Search, Send, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { AppNotificationService } from '../../../lib/appNotifications';
import { EmailAutomationService } from '../../../lib/emailAutomation';
import {
  PROJECT_APPROVED_TAG,
  PROJECT_ARCHIVED_TAG,
  formatAdminDate,
  isProjectApproved,
  isProjectArchived,
  removeProjectAdminTag,
} from '../helpers';

type PortfolioProjectRow = {
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

type ProjectApplicationSummary = {
  id: string;
  project_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
};

const AdminProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<PortfolioProjectRow[]>([]);
  const [applications, setApplications] = useState<ProjectApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived' | 'published'>('all');
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadError(null);

        const [{ data: projectRows, error: projectError }, { data: appRows, error: appError }] = await Promise.all([
          supabase
            .from('user_projects')
            .select('id, user_id, project_title, organization, project_description, role, is_current, tags, project_url, created_at')
            .order('created_at', { ascending: false }),
          supabase.from('project_applications').select('id, project_id, status'),
        ]);

        if (projectError) throw projectError;

        if (appError) {
          const message = appError.message?.toLowerCase() || '';
          if (message.includes('does not exist')) {
            setLoadError('Run docs/project-applications.sql to enable project applications and the applicant review page.');
          } else {
            throw appError;
          }
        } else {
          setApplications((appRows || []) as ProjectApplicationSummary[]);
        }

        const ownerIds = Array.from(new Set((projectRows || []).map((project) => project.user_id).filter(Boolean)));
        let ownerLookup: Record<string, { full_name: string | null; email: string | null }> = {};

        if (ownerIds.length > 0) {
          const { data: profileRows, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', ownerIds);

          if (!profileError) {
            ownerLookup = (profileRows || []).reduce<Record<string, { full_name: string | null; email: string | null }>>((acc, row) => {
              acc[row.id] = { full_name: row.full_name, email: row.email };
              return acc;
            }, {});
          }
        }

        setProjects(
          ((projectRows || []) as PortfolioProjectRow[]).map((project) => ({
            ...project,
            profile: ownerLookup[project.user_id] || null,
          }))
        );
      } catch (error) {
        const err = error as Error;
        console.error('Error loading admin projects:', err);
        const message = err.message?.toLowerCase().includes('permission')
          ? 'Admin access to portfolio projects is blocked by RLS policies. Run docs/admin-dashboard-v2.sql.'
          : err.message?.toLowerCase().includes('does not exist')
            ? 'The user_projects table is missing. Run docs/admin-dashboard-v2.sql to create the portfolio table.'
            : 'Portfolio projects could not be loaded for moderation.';
        setLoadError(message);
        toast.error('Portfolio projects could not be loaded for moderation.');
      } finally {
        setLoading(false);
      }
    };

    void loadProjects();
  }, []);

  const applicationCounts = useMemo(
    () =>
      applications.reduce<Record<string, { total: number; pending: number }>>((acc, application) => {
        const current = acc[application.project_id] || { total: 0, pending: 0 };
        acc[application.project_id] = {
          total: current.total + 1,
          pending: current.pending + (application.status === 'pending' ? 1 : 0),
        };
        return acc;
      }, {}),
    [applications]
  );

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const archived = isProjectArchived(project.tags);
      const published = isProjectApproved(project.tags) && !archived;
      const matchesFilter =
        filter === 'all' ||
        (filter === 'archived' ? archived : filter === 'published' ? published : !archived);
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
    live: projects.filter((project) => !isProjectArchived(project.tags)).length,
    archived: projects.filter((project) => isProjectArchived(project.tags)).length,
    published: projects.filter((project) => isProjectApproved(project.tags) && !isProjectArchived(project.tags)).length,
    pendingApplicants: applications.filter((application) => application.status === 'pending').length,
  };

  const updateProjectTags = async (projectId: string, nextTags: string[]) => {
    const { error } = await supabase.from('user_projects').update({ tags: nextTags }).eq('id', projectId);
    if (error) throw error;
    setProjects((current) => current.map((project) => (project.id === projectId ? { ...project, tags: nextTags } : project)));
  };

  const toggleArchive = async (project: PortfolioProjectRow) => {
    const archived = isProjectArchived(project.tags);
    const nextTags = archived
      ? removeProjectAdminTag(project.tags, PROJECT_ARCHIVED_TAG)
      : [...removeProjectAdminTag(project.tags, PROJECT_ARCHIVED_TAG), PROJECT_ARCHIVED_TAG];

    try {
      await updateProjectTags(project.id, nextTags);

      const nextStatus = archived ? 'restored' : 'archived';
      const ownerMessage = archived
        ? `"${project.project_title || 'Your project'}" has been restored to the active moderation queue.`
        : `"${project.project_title || 'Your project'}" has been archived by the admin team.`;

      await AppNotificationService.notifyUser(project.user_id, {
        title: archived ? 'Portfolio project restored' : 'Portfolio project archived',
        message: ownerMessage,
        type: archived ? 'info' : 'warning',
        data: {
          action: archived ? 'portfolio_project_restored' : 'portfolio_project_archived',
          projectId: project.id,
          projectTitle: project.project_title || 'Portfolio project',
        },
      }).catch((notificationError) => console.warn('Project archive notification failed:', notificationError));

      if (project.profile?.email) {
        await EmailAutomationService.onPortfolioProjectModeration(
          project.profile.email,
          project.profile.full_name || 'Member',
          project.project_title || 'Portfolio project',
          nextStatus
        );
      }

      toast.success(archived ? 'Project restored to the active moderation queue.' : 'Project archived.');
    } catch (error) {
      console.error('Error updating project archive status:', error);
      toast.error('Project archive status could not be updated.');
    }
  };

  const toggleApproval = async (project: PortfolioProjectRow) => {
    const approved = isProjectApproved(project.tags);
    const nextTags = approved
      ? removeProjectAdminTag(project.tags, PROJECT_APPROVED_TAG)
      : [...removeProjectAdminTag(project.tags, PROJECT_APPROVED_TAG), PROJECT_APPROVED_TAG];

    try {
      await updateProjectTags(project.id, nextTags);

      const moderationTitle = approved ? 'Portfolio project moved to review' : 'Portfolio project published';
      const moderationMessage = approved
        ? `"${project.project_title || 'Your project'}" has been moved back to the review queue.`
        : `"${project.project_title || 'Your project'}" has been approved and published on the projects page.`;

      await AppNotificationService.notifyUser(project.user_id, {
        title: moderationTitle,
        message: moderationMessage,
        type: approved ? 'warning' : 'success',
        data: {
          action: approved ? 'portfolio_project_review' : 'portfolio_project_published',
          projectId: project.id,
          projectTitle: project.project_title || 'Portfolio project',
        },
      }).catch((notificationError) => console.warn('Project publish notification failed:', notificationError));

      if (project.profile?.email) {
        await EmailAutomationService.onPortfolioProjectModeration(
          project.profile.email,
          project.profile.full_name || 'Member',
          project.project_title || 'Portfolio project',
          approved ? 'review' : 'published'
        );
      }

      toast.success(approved ? 'Project moved back to review.' : 'Project approved and published.');
    } catch (error) {
      console.error('Error updating project approval status:', error);
      toast.error('Project approval status could not be updated.');
    }
  };

  const notifyOwner = async (project: PortfolioProjectRow) => {
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

      if (project.profile?.email) {
        await EmailAutomationService.onProjectOwnerFollowUp(
          project.profile.email,
          project.profile.full_name || 'Member',
          project.project_title || 'Portfolio project',
          message
        );
      }

      setMessageDrafts((current) => ({ ...current, [project.id]: '' }));
      toast.success('Project owner notified.');
    } catch (error) {
      console.error('Error sending project owner message:', error);
      toast.error('The owner message could not be sent.');
    }
  };

  const deleteProject = async (project: PortfolioProjectRow) => {
    const shouldDelete = window.confirm(`Delete "${project.project_title || 'this project'}"? This cannot be undone.`);
    if (!shouldDelete) return;

    try {
      const { error } = await supabase.from('user_projects').delete().eq('id', project.id);
      if (error) throw error;
      setProjects((current) => current.filter((item) => item.id !== project.id));
      setApplications((current) => current.filter((item) => item.project_id !== project.id));
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

      <div className="flex justify-end">
        <button onClick={() => navigate('/admin/projects/applications')} className="sp-btn-primary inline-flex items-center gap-2">
          <Users size={16} />
          Review project applications
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          { label: 'Portfolio projects', value: summary.total },
          { label: 'Live queue', value: summary.live },
          { label: 'Archived', value: summary.archived },
          { label: 'Published', value: summary.published },
          { label: 'Pending applicants', value: summary.pendingApplicants },
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
            onChange={(event) => setFilter(event.target.value as 'all' | 'active' | 'archived' | 'published')}
            className="input-glass px-4 py-3 w-full xl:w-auto"
            title="Filter project moderation status"
          >
            <option value="all">All project states</option>
            <option value="active">Active moderation queue</option>
            <option value="published">Published projects</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const archived = isProjectArchived(project.tags);
          const published = isProjectApproved(project.tags) && !archived;
          const counts = applicationCounts[project.id] || { total: 0, pending: 0 };

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
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${published ? 'bg-[var(--sp-accent)]/20 text-[var(--sp-accent)]' : 'bg-amber-500/15 text-amber-200'}`}>
                      {published ? 'published' : 'pending review'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-300">
                      {counts.total} applicant{counts.total === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {project.organization || 'Independent project'}{project.role ? ` - ${project.role}` : ''}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">
                    Uploaded by {project.profile?.full_name || 'Unknown member'} - {project.profile?.email || 'No email'}
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
                {counts.pending > 0 && (
                  <span className="admin-stat-pill text-xs text-amber-200">
                    {counts.pending} pending
                  </span>
                )}
                {project.project_url && (
                  <a href={project.project_url} target="_blank" rel="noreferrer" className="admin-stat-pill text-xs text-[var(--sp-accent)] inline-flex items-center gap-2">
                    <ExternalLink size={12} />
                    Project link
                  </a>
                )}
              </div>

              <textarea
                value={messageDrafts[project.id] || ''}
                onChange={(event) => setMessageDrafts((current) => ({ ...current, [project.id]: event.target.value }))}
                rows={3}
                className="input-glass w-full px-4 py-3 resize-none mt-6"
                placeholder="Write a message to the project owner"
              />

              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => notifyOwner(project)} className="sp-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2">
                  <MessageSquare size={16} />
                  Message owner
                </button>
                <button onClick={() => navigate(`/admin/projects/applications?projectId=${project.id}`)} className="sp-btn-glass px-4 py-2 text-sm inline-flex items-center gap-2">
                  <Send size={16} />
                  Review applicants
                </button>
                {project.project_url && (
                  <a href={project.project_url} target="_blank" rel="noreferrer" className="sp-btn-glass px-4 py-2 text-sm inline-flex items-center gap-2">
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
                  {published ? 'Move to review' : 'Approve / Publish'}
                </button>
                <button onClick={() => toggleArchive(project)} className="sp-btn-glass px-4 py-2 text-sm inline-flex items-center gap-2">
                  <FolderArchive size={16} />
                  {archived ? 'Restore project' : 'Archive project'}
                </button>
                <button onClick={() => deleteProject(project)} className="sp-btn-glass px-4 py-2 text-sm inline-flex items-center gap-2 text-red-300 hover:text-red-200">
                  <Trash2 size={16} />
                  Delete project
                </button>
                <Link to={`/admin/user/${project.user_id}`} className="sp-btn-glass px-4 py-2 text-sm">
                  View owner
                </Link>
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
    </div>
  );
};

export default AdminProjectsPage;
