import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { hasPaidMembershipAccess } from '../lib/membershipAccess';
import { hasCompletedPremiumProfile } from '../lib/profileCompletion';
import {
  type Project,
  type ProjectApplicationStatus,
  type ProjectProfile,
  formatProjectDeadline,
  isProjectOpenForApplications,
  parseProject,
} from '../lib/projects';
import { isProjectArchived, isProjectApproved } from './admin/helpers';

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const user = useAuthStore((state) => state.user);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProjectProfile | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<ProjectApplicationStatus | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const getApplicationLabel = (status?: typeof applicationStatus) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Not selected';
      case 'reviewed':
        return 'Under review';
      case 'pending':
        return 'Pending';
      default:
        return 'Apply now';
    }
  };

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_projects')
          .select('id, user_id, project_title, organization, project_description, role, is_current, tags, project_url, created_at, profile:profiles!user_projects_user_id_fkey(full_name, email)')
          .eq('id', projectId)
          .single();

        if (error) throw error;
        if (!isProjectApproved(data?.tags) || isProjectArchived(data?.tags)) {
          throw new Error('Project not published');
        }
        setProject(parseProject(data));
      } catch (error) {
        console.error('Error loading project:', error);
        toast.error('Project details could not be loaded.');
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    void loadProject();
  }, [projectId]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsProfileLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('tier, profile_type, onboarding_completed, profile_completion_percentage, user_category, verification_tier, bio, sector, years_of_experience, expertise')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching project applicant profile:', error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    void fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!user || !projectId) {
        setApplicationStatus(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('project_applications')
          .select('status')
          .eq('user_id', user.id)
          .eq('project_id', projectId)
          .maybeSingle();

        if (error) throw error;
        setApplicationStatus((data?.status as ProjectApplicationStatus | undefined) || null);
      } catch (error) {
        console.error('Error fetching project application status:', error);
      }
    };

    void fetchApplication();
  }, [projectId, user]);

  const applicationClosed = project ? !isProjectOpenForApplications(project) : false;
  const canApplyWithCurrentPlan = hasPaidMembershipAccess(profile);

  const requireEligibleMember = () => {
    if (!user) {
      toast.error('You need to log in before applying to a project.');
      navigate('/login');
      return false;
    }
    if (isProfileLoading || !profile) {
      toast.error('We are still loading your profile. Try again in a moment.');
      return false;
    }
    if (!hasPaidMembershipAccess(profile)) {
      toast.error('Upgrade your membership to apply for this project.', {
        action: {
          label: 'Membership',
          onClick: () => navigate('/pricing'),
        },
      });
      return false;
    }
    if (!hasCompletedPremiumProfile(profile)) {
      toast.error('Complete your onboarding before applying to this project.');
      navigate('/onboarding/full');
      return false;
    }
    return true;
  };

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

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 sm:pt-28 pb-12 sm:pb-16">
      <SEO title={project.title || 'Project Details'} />

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
                <span className="px-3 py-1 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-xs">
                  {project.sector}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-[var(--text-secondary)] text-xs">
                  {project.ownership}
                </span>
                {applicationClosed && (
                  <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-300 text-xs font-bold">
                    Deadline passed
                  </span>
                )}
                {applicationStatus && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-200 text-xs font-bold">
                    {getApplicationLabel(applicationStatus)}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-[var(--text-primary)] leading-tight break-words">
                {project.title || 'Untitled project'}
              </h1>

              <div className="flex flex-wrap gap-3 text-[var(--text-secondary)] mt-6 text-sm">
                <span className="flex items-center gap-2 break-words"><Building2 size={14} className="text-[var(--sp-accent)] shrink-0" />{project.organization}</span>
                <span className="flex items-center gap-2 break-words"><MapPin size={14} className="text-[var(--sp-accent)] shrink-0" />{project.location}</span>
                <span className="flex items-center gap-2 break-words"><Briefcase size={14} className="text-[var(--sp-accent)] shrink-0" />{project.type}</span>
                <span className="flex items-center gap-2 break-words"><Clock size={14} className="text-[var(--sp-accent)] shrink-0" />{project.duration}</span>
                <span className="flex items-center gap-2 break-words"><DollarSign size={14} className="text-[var(--sp-accent)] shrink-0" />{project.compensation}</span>
                <span className="flex items-center gap-2 break-words"><Calendar size={14} className="text-[var(--sp-accent)] shrink-0" />Deadline: {formatProjectDeadline(project)}</span>
              </div>

              {applicationClosed && (
                <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-sm text-red-200">
                    Applications for this project are closed because the deadline has passed.
                  </p>
                </div>
              )}
            </div>

            <div className="w-full lg:w-[320px] premium-glass rounded-3xl border border-white/10 p-6">
              <div className="space-y-3">
                {applicationStatus || canApplyWithCurrentPlan ? (
                  <button
                    onClick={() => {
                      if (!applicationStatus && !requireEligibleMember()) return;
                      navigate(`/projects/${project.id}/apply`);
                    }}
                    disabled={applicationClosed || isProfileLoading}
                    className={`sp-btn-primary w-full flex items-center justify-center gap-2 ${
                      applicationClosed || isProfileLoading ? 'opacity-60 cursor-not-allowed hover:translate-y-0' : ''
                    }`}
                  >
                    {getApplicationLabel(applicationStatus)}
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button onClick={() => navigate('/pricing')} className="sp-btn-primary w-full flex items-center justify-center gap-2">
                    Upgrade to apply
                    <ArrowRight size={16} />
                  </button>
                )}
                {project.applicationLink && (
                  <a
                    href={project.applicationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="sp-btn-glass w-full flex items-center justify-center gap-2"
                  >
                    External application link
                    <ExternalLink size={16} />
                  </a>
                )}
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="sp-btn-glass w-full flex items-center justify-center gap-2"
                  >
                    Open project link
                    <ExternalLink size={16} />
                  </a>
                )}
                {!canApplyWithCurrentPlan && (
                  <button
                    onClick={() => navigate('/pricing')}
                    className="sp-btn-glass w-full flex items-center justify-center gap-2"
                  >
                    <Shield size={16} />
                    Upgrade for early access
                  </button>
                )}
                <button onClick={() => navigate('/contact')} className="sp-btn-glass w-full">
                  Contact the team
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 lg:gap-8 mt-8 sm:mt-10">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Project overview</h2>
                <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed break-words">{project.description}</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Requirements</h2>
                <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)]">
                  {project.requirements.length > 0
                    ? project.requirements.map((requirement, index) => <li key={`${requirement}-${index}`}>{requirement}</li>)
                    : <li>No specific requirements were listed.</li>}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-light rounded-3xl p-5">
                <h3 className="font-bold text-[var(--text-primary)] mb-3">Leading organization</h3>
                <p className="text-[var(--text-secondary)] break-words">{project.organization}</p>
              </div>
              <div className="glass-light rounded-3xl p-5">
                <h3 className="font-bold text-[var(--text-primary)] mb-3">When to apply</h3>
                <p className="text-[var(--text-secondary)] break-words">Deadline: {formatProjectDeadline(project)}</p>
              </div>
              {project.tags.length > 0 && (
                <div className="glass-light rounded-3xl p-5">
                  <h3 className="font-bold text-[var(--text-primary)] mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
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
