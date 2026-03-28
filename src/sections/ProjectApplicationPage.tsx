import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { AppNotificationService } from '../lib/appNotifications';
import { EmailAutomationService } from '../lib/emailAutomation';
import {
  type Project,
  type ProjectApplication,
  type ProjectProfile,
  formatProjectDeadline,
  getProjectApplicationStatusMeta,
  isProjectOpenForApplications,
  parseProject,
} from '../lib/projects';
import { hasPaidMembershipAccess } from '../lib/membershipAccess';
import { hasCompletedPremiumProfile } from '../lib/profileCompletion';
import { isProjectArchived, isProjectApproved } from './admin/helpers';

const ProjectApplicationPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const user = useAuthStore((state) => state.user);

  const [project, setProject] = useState<Project | null>(null);
  const [profile, setProfile] = useState<ProjectProfile | null>(null);
  const [application, setApplication] = useState<ProjectApplication | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

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
        toast.error('Project could not be loaded.');
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    void loadProject();
  }, [projectId]);

  useEffect(() => {
    const loadProfileAndApplication = async () => {
      if (!user || !projectId) {
        setIsProfileLoading(false);
        return;
      }

      try {
        const [{ data: profileData, error: profileError }, { data: applicationData, error: applicationError }] = await Promise.all([
          supabase
            .from('profiles')
            .select('tier, profile_type, onboarding_completed, profile_completion_percentage, user_category, verification_tier, bio, sector, years_of_experience, expertise')
            .eq('id', user.id)
            .single(),
          supabase
            .from('project_applications')
            .select('id, project_id, user_id, status, applied_at, cover_letter')
            .eq('user_id', user.id)
            .eq('project_id', projectId)
            .maybeSingle(),
        ]);

        if (profileError) throw profileError;
        if (applicationError) throw applicationError;

        setProfile(profileData);
        setApplication((applicationData as ProjectApplication | null) || null);
        setCoverLetter(String(applicationData?.cover_letter || ''));
      } catch (error) {
        console.error('Error loading project application context:', error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    void loadProfileAndApplication();
  }, [projectId, user]);

  const applicationClosed = project ? !isProjectOpenForApplications(project) : false;
  const canApplyWithCurrentPlan = hasPaidMembershipAccess(profile);
  const statusMeta = application ? getProjectApplicationStatusMeta(application.status) : null;

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
      toast.error('A paid membership is required before you can apply.', {
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

  const submitApplication = async () => {
    if (!project || !user || isSubmitting) return;
    if (!requireEligibleMember()) return;

    if (applicationClosed) {
      toast.error('Applications for this project are closed because the deadline has passed.');
      return;
    }

    if (application) {
      if (project.applicationLink) {
        window.open(project.applicationLink, '_blank', 'noopener,noreferrer');
        return;
      }

      toast.info(`Application status: ${getProjectApplicationStatusMeta(application.status).label}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        project_id: project.id,
        user_id: user.id,
        status: 'pending' as const,
        applied_at: new Date().toISOString(),
        cover_letter: coverLetter.trim() || null,
      };

      const { data, error } = await supabase
        .from('project_applications')
        .insert(
          project.applicationLink
            ? { ...payload, notes: 'External application link opened by member.' }
            : payload
        )
        .select('id, project_id, user_id, status, applied_at, cover_letter')
        .single();

      if (error) {
        if (error.code === '23505') {
          const { data: existingApplication } = await supabase
            .from('project_applications')
            .select('id, project_id, user_id, status, applied_at, cover_letter')
            .eq('user_id', user.id)
            .eq('project_id', project.id)
            .maybeSingle();

          if (existingApplication) {
            setApplication(existingApplication as ProjectApplication);
            setCoverLetter(String(existingApplication.cover_letter || ''));
            toast.info('You already have an application for this project.');
            return;
          }
        }

        throw error;
      }

      setApplication(data as ProjectApplication);

      await AppNotificationService.notifySelf({
        title: project.applicationLink ? 'Project application link opened' : 'Project application received',
        message: project.applicationLink
          ? `Your interest in "${project.title}" has been tracked.`
          : `Your application for "${project.title}" was submitted successfully.`,
        type: 'opportunity',
        data: {
          action: project.applicationLink ? 'project_interest' : 'project_application_submitted',
          projectId: project.id,
          projectTitle: project.title,
        },
      }).catch((notificationError) => console.warn('Notification failed:', notificationError));

      await EmailAutomationService.onOpportunityInterest(
        user.email || '',
        user.user_metadata?.full_name || user.email || 'Member',
        project.title,
        project.organization,
        project.applicationLink ? 'external' : 'internal'
      );

      if (project.applicationLink) {
        toast.success('Application tracked as pending. Complete the external form to continue.');
        window.open(project.applicationLink, '_blank', 'noopener,noreferrer');
      } else {
        toast.success('Project application submitted. Status: Pending.');
      }
    } catch (error) {
      toast.error(`Failed to submit project application: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--sp-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading project application...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <button onClick={() => navigate('/projects')} className="sp-btn-glass inline-flex items-center gap-2 mb-6">
            <ArrowLeft size={16} />
            Back to projects
          </button>
          <div className="glass-card rounded-3xl border border-white/10 p-8">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Project not found</h1>
            <p className="text-[var(--text-secondary)]">This project may have been removed or is no longer active.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 sm:pt-28 pb-12 sm:pb-16">
      <SEO title={`${project.title} Application`} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-8">
          <button onClick={() => navigate(`/projects/${project.id}`)} className="sp-btn-glass inline-flex items-center justify-center gap-2 w-full sm:w-auto">
            <ArrowLeft size={16} />
            View project
          </button>
          <button onClick={() => navigate('/projects')} className="sp-btn-glass w-full sm:w-auto">
            Back to projects
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="glass-card rounded-[32px] border border-white/10 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="sp-label">Project application</span>
              <span className="px-3 py-1 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-xs">
                {project.sector}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-[var(--text-secondary)] text-xs">
                {project.ownership}
              </span>
              {statusMeta && (
                <span className={`px-3 py-1 rounded-full border text-xs font-bold ${statusMeta.tone}`}>
                  {statusMeta.label}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] leading-tight">{project.title}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-[var(--text-secondary)] mt-5">
              <span className="flex items-center gap-2"><Building2 size={14} className="text-[var(--sp-accent)]" />{project.organization}</span>
              <span className="flex items-center gap-2"><MapPin size={14} className="text-[var(--sp-accent)]" />{project.location}</span>
              <span className="flex items-center gap-2"><Briefcase size={14} className="text-[var(--sp-accent)]" />{project.type}</span>
              <span className="flex items-center gap-2"><Calendar size={14} className="text-[var(--sp-accent)]" />Deadline: {formatProjectDeadline(project)}</span>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Why this project matters</h2>
                <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">{project.description}</p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Requirements</h2>
                <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)]">
                  {project.requirements.length > 0
                    ? project.requirements.map((requirement, index) => <li key={`${requirement}-${index}`}>{requirement}</li>)
                    : <li>No specific requirements were listed.</li>}
                </ul>
              </div>

              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">
                  Optional note for this application
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(event) => setCoverLetter(event.target.value)}
                  rows={6}
                  disabled={Boolean(application)}
                  className={`input-glass w-full px-4 py-3 resize-none ${application ? 'opacity-70 cursor-not-allowed' : ''}`}
                  placeholder="Add a short note about your fit, availability, or why you want to be considered."
                />
                <p className="text-xs text-[var(--text-secondary)] mt-2">
                  {application
                    ? 'This note has already been saved with your application.'
                    : 'This will be visible to the admin team reviewing applicants.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="premium-glass rounded-[32px] border border-white/10 p-6">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Application status</h2>

              {statusMeta ? (
                <div className={`rounded-2xl border p-4 ${statusMeta.tone}`}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5" />
                    <div>
                      <p className="font-semibold">{statusMeta.label}</p>
                      <p className="text-sm mt-1">{statusMeta.body}</p>
                      {application?.applied_at && (
                        <p className="text-xs mt-2 opacity-80">
                          Submitted on {new Date(application.applied_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-[var(--text-secondary)] text-sm">
                  No application has been submitted yet. Use the action below to apply.
                </div>
              )}

              {applicationClosed && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 mt-4">
                  Applications for this project are closed because the deadline has passed.
                </div>
              )}

              {!canApplyWithCurrentPlan && (
                <div className="rounded-2xl border border-[var(--sp-accent)]/20 bg-[var(--sp-accent)]/10 p-4 text-sm text-[var(--text-secondary)] mt-4">
                  Paid membership is required before you can submit this project application.
                </div>
              )}

              <div className="mt-5 space-y-3">
                {canApplyWithCurrentPlan ? (
                  <button
                    onClick={submitApplication}
                    disabled={applicationClosed || isSubmitting}
                    className={`sp-btn-primary w-full flex items-center justify-center gap-2 ${
                      applicationClosed || isSubmitting ? 'opacity-60 cursor-not-allowed hover:translate-y-0' : ''
                    }`}
                  >
                    {application
                      ? project.applicationLink
                        ? 'Open application link again'
                        : `Status: ${statusMeta?.label || 'Pending'}`
                      : project.applicationLink
                        ? 'Track and open external application'
                        : 'Submit application'}
                    {application || !project.applicationLink ? <ArrowRight size={16} /> : <ExternalLink size={16} />}
                  </button>
                ) : (
                  <button onClick={() => navigate('/pricing')} className="sp-btn-primary w-full flex items-center justify-center gap-2">
                    Upgrade membership
                    <Shield size={16} />
                  </button>
                )}

                <button onClick={() => navigate(`/projects/${project.id}`)} className="sp-btn-glass w-full flex items-center justify-center gap-2">
                  <FileText size={16} />
                  View full project details
                </button>
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
              </div>
            </div>

            <div className="glass-card rounded-[32px] border border-white/10 p-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Before you submit</h3>
              <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                <div className="flex items-start gap-3">
                  <Clock size={16} className="mt-0.5 text-[var(--sp-accent)]" />
                  <span>Your application status will appear here immediately after submission.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield size={16} className="mt-0.5 text-[var(--sp-accent)]" />
                  <span>Admins can review, approve, reject, and contact applicants directly from the admin workspace.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectApplicationPage;
