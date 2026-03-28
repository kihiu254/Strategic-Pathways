import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { getSafeErrorMessage } from '../lib/safeFeedback';
import { isOpportunityOpenForApplications } from '../lib/opportunityDeadline';
import { hasPaidMembershipAccess } from '../lib/membershipAccess';
import { hasCompletedPremiumProfile } from '../lib/profileCompletion';

const OWNERSHIP_PREFIX = 'ownership:';
const APPLY_LINK_PREFIX = 'apply-link:';
const ROLLING_TAG = 'deadline:rolling';
const ROLLING_DEADLINE_DATE = '2099-12-31';

type OpportunityProfile = {
  tier: string;
  profile_type: string;
  onboarding_completed: boolean;
  profile_completion_percentage?: number | null;
  user_category?: string | null;
  verification_tier?: string | null;
  bio?: string | null;
  sector?: string | null;
  years_of_experience?: string | null;
  expertise?: string[] | null;
};

type OpportunityApplication = {
  id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at: string | null;
  cover_letter: string | null;
};

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  location: string;
  type: string;
  duration: string;
  description: string;
  requirements: string[];
  compensation: string;
  sector: string;
  tags: string[];
  deadline: string;
  status: 'active' | 'closed';
  ownership: string;
  applicationLink: string;
  rollingDeadline: boolean;
};

const parseOpportunity = (row: Record<string, unknown>): Opportunity => {
  const rawTags = Array.isArray(row.tags) ? (row.tags as string[]) : [];
  const ownershipTag = rawTags.find((tag) => tag.toLowerCase().startsWith(OWNERSHIP_PREFIX));
  const applyLinkTag = rawTags.find((tag) => tag.toLowerCase().startsWith(APPLY_LINK_PREFIX));
  const rollingDeadline =
    rawTags.some((tag) => tag.toLowerCase() === ROLLING_TAG) ||
    String(row.deadline || '').startsWith(ROLLING_DEADLINE_DATE);

  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    organization: String(row.organization || ''),
    location: String(row.location || ''),
    type: String(row.type || 'Project-based'),
    duration: String(row.duration || ''),
    description: String(row.description || ''),
    requirements: Array.isArray(row.requirements) ? (row.requirements as string[]) : [],
    compensation: String(row.compensation || ''),
    sector: String(row.sector || 'Others'),
    tags: rawTags.filter(
      (tag) =>
        !tag.toLowerCase().startsWith(OWNERSHIP_PREFIX) &&
        !tag.toLowerCase().startsWith(APPLY_LINK_PREFIX) &&
        tag.toLowerCase() !== ROLLING_TAG
    ),
    deadline: String(row.deadline || ''),
    status: row.status === 'closed' ? 'closed' : 'active',
    ownership: ownershipTag ? ownershipTag.slice(OWNERSHIP_PREFIX.length) : 'Private',
    applicationLink: applyLinkTag ? applyLinkTag.slice(APPLY_LINK_PREFIX.length) : '',
    rollingDeadline,
  };
};

const getStatusMeta = (status: OpportunityApplication['status']) => {
  switch (status) {
    case 'accepted':
      return {
        label: 'Accepted',
        tone: 'border-green-500/30 bg-green-500/10 text-green-300',
        body: 'Your application has been accepted.',
      };
    case 'rejected':
      return {
        label: 'Not selected',
        tone: 'border-red-500/30 bg-red-500/10 text-red-300',
        body: 'This application was not selected this time.',
      };
    case 'reviewed':
      return {
        label: 'Under review',
        tone: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
        body: 'Your application has been received and is currently under review.',
      };
    default:
      return {
        label: 'Pending',
        tone: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
        body: 'Your application was submitted successfully and is waiting for review.',
      };
  }
};

const OpportunityApplicationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { opportunityId } = useParams();
  const user = useAuthStore((state) => state.user);

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [profile, setProfile] = useState<OpportunityProfile | null>(null);
  const [application, setApplication] = useState<OpportunityApplication | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    const loadOpportunity = async () => {
      if (!opportunityId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .eq('id', opportunityId)
          .eq('status', 'active')
          .single();

        if (error) throw error;
        setOpportunity(parseOpportunity(data));
      } catch (error) {
        console.error('Error loading opportunity:', error);
        toast.error('Opportunity could not be loaded.');
        setOpportunity(null);
      } finally {
        setLoading(false);
      }
    };

    void loadOpportunity();
  }, [opportunityId]);

  useEffect(() => {
    const loadProfileAndApplication = async () => {
      if (!user || !opportunityId) {
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
            .from('opportunity_applications')
            .select('id, status, applied_at, cover_letter')
            .eq('user_id', user.id)
            .eq('opportunity_id', opportunityId)
            .maybeSingle(),
        ]);

        if (profileError) throw profileError;
        if (applicationError) throw applicationError;

        setProfile(profileData);
        setApplication((applicationData as OpportunityApplication | null) || null);
        setCoverLetter(String(applicationData?.cover_letter || ''));
      } catch (error) {
        console.error('Error loading application context:', error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    void loadProfileAndApplication();
  }, [opportunityId, user]);

  const applicationClosed = opportunity ? !isOpportunityOpenForApplications(opportunity) : false;
  const canApplyWithCurrentPlan = hasPaidMembershipAccess(profile);
  const statusMeta = application ? getStatusMeta(application.status) : null;

  const formatDeadline = () => {
    if (!opportunity) return 'TBD';
    if (opportunity.rollingDeadline) return t('opportunitiesPage.values.rolling');
    if (!opportunity.deadline) return t('opportunitiesPage.values.tbd');
    return new Date(opportunity.deadline).toLocaleDateString();
  };

  const requireEligibleMember = () => {
    if (!user) {
      toast.error(t('opportunitiesPage.errors.loginToApply'));
      navigate('/login');
      return false;
    }
    if (isProfileLoading || !profile) {
      toast.error(t('opportunitiesPage.errors.profileLoading'));
      return false;
    }
    if (!hasPaidMembershipAccess(profile)) {
      toast.error(t('opportunitiesPage.errors.upgradeToApply'), {
        action: {
          label: t('opportunitiesPage.actions.membership'),
          onClick: () => navigate('/pricing'),
        },
      });
      return false;
    }
    if (!hasCompletedPremiumProfile(profile)) {
      toast.error(t('opportunitiesPage.errors.completeOnboarding'));
      navigate('/onboarding/full');
      return false;
    }
    return true;
  };

  const submitApplication = async () => {
    if (!opportunity || !user || isSubmitting) return;
    if (!requireEligibleMember()) return;

    if (applicationClosed) {
      toast.error(
        t('opportunitiesPage.errors.deadlinePassed', {
          defaultValue: 'Applications for this opportunity are closed because the deadline has passed.',
        })
      );
      return;
    }

    if (application) {
      if (opportunity.applicationLink) {
        window.open(opportunity.applicationLink, '_blank', 'noopener,noreferrer');
        return;
      }

      toast.info(`Application status: ${getStatusMeta(application.status).label}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        opportunity_id: opportunity.id,
        user_id: user.id,
        status: 'pending' as const,
        applied_at: new Date().toISOString(),
        cover_letter: coverLetter.trim() || null,
      };

      const { data, error } = await supabase
        .from('opportunity_applications')
        .insert(
          opportunity.applicationLink
            ? { ...payload, notes: 'External application link opened by member.' }
            : payload
        )
        .select('id, status, applied_at, cover_letter')
        .single();

      if (error) {
        if (error.code === '23505') {
          const { data: existingApplication } = await supabase
            .from('opportunity_applications')
            .select('id, status, applied_at, cover_letter')
            .eq('user_id', user.id)
            .eq('opportunity_id', opportunity.id)
            .maybeSingle();

          if (existingApplication) {
            setApplication(existingApplication as OpportunityApplication);
            setCoverLetter(String(existingApplication.cover_letter || ''));
            toast.info('You already have an application for this opportunity.');
            return;
          }
        }

        throw error;
      }

      setApplication(data as OpportunityApplication);

      await AppNotificationService.notifySelf({
        title: opportunity.applicationLink ? 'Application link opened' : t('opportunitiesPage.notifications.receivedTitle'),
        message: opportunity.applicationLink
          ? t('opportunitiesPage.notifications.selectedMessage', { title: opportunity.title })
          : t('opportunitiesPage.notifications.receivedMessage', { title: opportunity.title }),
        type: 'opportunity',
        data: {
          action: opportunity.applicationLink ? 'opportunity_interest' : 'application_submitted',
          opportunityId: opportunity.id,
          opportunityTitle: opportunity.title,
        },
      }).catch((notificationError) => console.warn('Notification failed:', notificationError));

      await EmailAutomationService.onApplicationSubmitted(
        user.email || '',
        user.user_metadata?.full_name || user.email || 'Member',
        opportunity.title,
        opportunity.organization,
        {
          entityType: 'opportunity',
          mode: opportunity.applicationLink ? 'external' : 'internal',
        }
      );

      if (opportunity.applicationLink) {
        toast.success('Application tracked as pending. Complete the external form to continue.');
        window.open(opportunity.applicationLink, '_blank', 'noopener,noreferrer');
      } else {
        toast.success('Application submitted. Status: Pending.');
      }
    } catch (error) {
      toast.error(getSafeErrorMessage(error, 'We could not submit your application right now. Please try again shortly.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--sp-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">{t('opportunitiesPage.loading')}</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <button onClick={() => navigate('/opportunities')} className="sp-btn-glass inline-flex items-center gap-2 mb-6">
            <ArrowLeft size={16} />
            Back to opportunities
          </button>
          <div className="glass-card rounded-3xl border border-white/10 p-8">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Opportunity not found</h1>
            <p className="text-[var(--text-secondary)]">This opportunity may have been removed or is no longer active.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 sm:pt-28 pb-12 sm:pb-16">
      <SEO title={`${opportunity.title} Application`} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-8">
          <button onClick={() => navigate(`/opportunities/${opportunity.id}`)} className="sp-btn-glass inline-flex items-center justify-center gap-2 w-full sm:w-auto">
            <ArrowLeft size={16} />
            View opportunity
          </button>
          <button onClick={() => navigate('/opportunities')} className="sp-btn-glass w-full sm:w-auto">
            Back to opportunities
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="glass-card rounded-[32px] border border-white/10 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="sp-label">Application</span>
              <span className="px-3 py-1 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-xs">
                {opportunity.sector}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-[var(--text-secondary)] text-xs">
                {opportunity.ownership}
              </span>
              {statusMeta && (
                <span className={`px-3 py-1 rounded-full border text-xs font-bold ${statusMeta.tone}`}>
                  {statusMeta.label}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] leading-tight">{opportunity.title}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-[var(--text-secondary)] mt-5">
              <span className="flex items-center gap-2"><Building2 size={14} className="text-[var(--sp-accent)]" />{opportunity.organization}</span>
              <span className="flex items-center gap-2"><MapPin size={14} className="text-[var(--sp-accent)]" />{opportunity.location}</span>
              <span className="flex items-center gap-2"><Briefcase size={14} className="text-[var(--sp-accent)]" />{opportunity.type}</span>
              <span className="flex items-center gap-2"><Calendar size={14} className="text-[var(--sp-accent)]" />Deadline: {formatDeadline()}</span>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Why this role matters</h2>
                <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">{opportunity.description}</p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Requirements</h2>
                <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)]">
                  {opportunity.requirements.length > 0
                    ? opportunity.requirements.map((requirement, index) => <li key={`${requirement}-${index}`}>{requirement}</li>)
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
                  Applications for this opportunity are closed because the deadline has passed.
                </div>
              )}

              {!canApplyWithCurrentPlan && (
                <div className="rounded-2xl border border-[var(--sp-accent)]/20 bg-[var(--sp-accent)]/10 p-4 text-sm text-[var(--text-secondary)] mt-4">
                  Paid membership is required before you can submit this application.
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
                      ? opportunity.applicationLink
                        ? 'Open application link again'
                        : `Status: ${statusMeta?.label || 'Pending'}`
                      : opportunity.applicationLink
                        ? 'Track and open external application'
                        : 'Submit application'}
                    {application || !opportunity.applicationLink ? <ArrowRight size={16} /> : <ExternalLink size={16} />}
                  </button>
                ) : (
                  <button onClick={() => navigate('/pricing')} className="sp-btn-primary w-full flex items-center justify-center gap-2">
                    Upgrade membership
                    <Shield size={16} />
                  </button>
                )}

                <button onClick={() => navigate(`/opportunities/${opportunity.id}`)} className="sp-btn-glass w-full flex items-center justify-center gap-2">
                  <FileText size={16} />
                  View full opportunity details
                </button>
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

export default OpportunityApplicationPage;
