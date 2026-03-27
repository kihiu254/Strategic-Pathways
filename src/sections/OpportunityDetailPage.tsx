import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { AppNotificationService } from '../lib/appNotifications';
import { EmailAutomationService } from '../lib/emailAutomation';
import { isOpportunityOpenForApplications } from '../lib/opportunityDeadline';

const OWNERSHIP_PREFIX = 'ownership:';
const APPLY_LINK_PREFIX = 'apply-link:';
const ROLLING_TAG = 'deadline:rolling';
const ROLLING_DEADLINE_DATE = '2099-12-31';

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
  created_at: string;
  match_score?: number;
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
    created_at: String(row.created_at || ''),
    match_score: typeof row.match_score === 'number' ? row.match_score : undefined,
    ownership: ownershipTag ? ownershipTag.slice(OWNERSHIP_PREFIX.length) : 'Private',
    applicationLink: applyLinkTag ? applyLinkTag.slice(APPLY_LINK_PREFIX.length) : '',
    rollingDeadline,
  };
};

const OpportunitiesDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { opportunityId } = useParams();
  const user = useAuthStore((state) => state.user);

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ tier: string; profile_type: string; onboarding_completed: boolean } | null>(null);
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
        toast.error(t('opportunitiesPage.errors.load'));
        setOpportunity(null);
      } finally {
        setLoading(false);
      }
    };

    void loadOpportunity();
  }, [opportunityId, t]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsProfileLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('tier, profile_type, onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    void fetchProfile();
  }, [user]);

  const formatDeadline = () => {
    if (!opportunity) return t('opportunitiesPage.values.tbd');
    if (opportunity.rollingDeadline) return t('opportunitiesPage.values.rolling');
    if (!opportunity.deadline) return t('opportunitiesPage.values.tbd');
    return new Date(opportunity.deadline).toLocaleDateString();
  };

  const applicationClosed = opportunity ? !isOpportunityOpenForApplications(opportunity) : false;

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
    if (['Community', 'Standard (MVP)', 'Standard Member'].includes(profile.tier)) {
      toast.error(t('opportunitiesPage.errors.upgradeToApply'), {
        action: {
          label: t('opportunitiesPage.actions.membership'),
          onClick: () => navigate('/pricing'),
        },
      });
      return false;
    }
    if (!profile.onboarding_completed) {
      toast.error(t('opportunitiesPage.errors.completeOnboarding'));
      navigate('/onboarding/full');
      return false;
    }
    return true;
  };

  const submitApplication = async () => {
    if (!opportunity || !user) {
      if (!user) {
        toast.error(t('opportunitiesPage.errors.loginToApply'));
        navigate('/login');
      }
      return;
    }

    if (!isOpportunityOpenForApplications(opportunity)) {
      toast.error(
        t('opportunitiesPage.errors.deadlinePassed', {
          defaultValue: 'Applications for this opportunity are closed because the deadline has passed.',
        })
      );
      return;
    }

    if (!requireEligibleMember()) return;

    if (opportunity.applicationLink) {
      const { error: trackingError } = await supabase.from('opportunity_applications').insert({
        opportunity_id: opportunity.id,
        user_id: user.id,
        status: 'pending',
        applied_at: new Date().toISOString(),
        notes: 'External application link opened by member.',
      });

      if (trackingError && trackingError.code !== '23505') {
        toast.error(t('opportunitiesPage.errors.submitFailed', { message: trackingError.message }));
        return;
      }

      await AppNotificationService.notifySelf({
        title: t('opportunitiesPage.notifications.selectedTitle'),
        message: t('opportunitiesPage.notifications.selectedMessage', { title: opportunity.title }),
        type: 'opportunity',
        data: { action: 'opportunity_interest', opportunityId: opportunity.id, opportunityTitle: opportunity.title },
      }).catch((notificationError) => console.warn('Notification failed:', notificationError));

      await EmailAutomationService.onOpportunityInterest(
        user.email || '',
        user.user_metadata?.full_name || user.email || 'Member',
        opportunity.title,
        opportunity.organization,
        'external'
      );

      window.open(opportunity.applicationLink, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      const { error } = await supabase.from('opportunity_applications').insert({
        opportunity_id: opportunity.id,
        user_id: user.id,
        status: 'pending',
        applied_at: new Date().toISOString(),
      });

      if (error) throw error;

      await AppNotificationService.notifySelf({
        title: t('opportunitiesPage.notifications.receivedTitle'),
        message: t('opportunitiesPage.notifications.receivedMessage', { title: opportunity.title }),
        type: 'opportunity',
        data: { action: 'application_submitted', opportunityId: opportunity.id, opportunityTitle: opportunity.title },
      }).catch((notificationError) => console.warn('Notification failed:', notificationError));

      await EmailAutomationService.onOpportunityInterest(
        user.email || '',
        user.user_metadata?.full_name || user.email || 'Member',
        opportunity.title,
        opportunity.organization,
        'internal'
      );

      toast.success(t('opportunitiesPage.notifications.submitSuccess'));
    } catch (error) {
      toast.error(t('opportunitiesPage.errors.submitFailed', { message: (error as Error).message }));
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
      <div className="min-h-screen bg-[var(--bg-primary)] pt-24 sm:pt-28 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <button onClick={() => navigate('/opportunities')} className="sp-btn-glass inline-flex items-center justify-center gap-2 mb-8 w-full sm:w-auto">
            <ArrowLeft size={16} />
            {t('opportunitiesPage.actions.viewDetails')}
          </button>
          <div className="glass-card rounded-3xl border border-white/10 p-6 sm:p-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4">Opportunity not found</h1>
            <p className="text-[var(--text-secondary)] mb-6">
              This opportunity may have been removed or is no longer active.
            </p>
            <button onClick={() => navigate('/opportunities')} className="sp-btn-primary w-full sm:w-auto">
              {t('nav.opportunities')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 sm:pt-28 pb-12 sm:pb-16">
      <SEO title={opportunity.title} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <button onClick={() => navigate('/opportunities')} className="sp-btn-glass inline-flex items-center justify-center gap-2 mb-8 w-full sm:w-auto">
          <ArrowLeft size={16} />
          {t('nav.opportunities')}
        </button>

        <div className="glass-card rounded-[32px] border border-white/10 p-5 sm:p-6 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="sp-label">{t('nav.opportunities')}</span>
                <span className="px-3 py-1 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-xs">
                  {opportunity.sector}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-[var(--text-secondary)] text-xs">
                  {opportunity.ownership}
                </span>
                {applicationClosed && (
                  <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-300 text-xs font-bold">
                    {t('opportunitiesPage.labels.deadlinePassed', { defaultValue: 'Deadline passed' })}
                  </span>
                )}
                {opportunity.match_score && (
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold flex items-center gap-1">
                    <Star size={12} className="fill-green-400" />
                    {t('opportunitiesPage.labels.match', { score: opportunity.match_score })}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-[var(--text-primary)] leading-tight break-words">
                {opportunity.title}
              </h1>

              <div className="flex flex-wrap gap-3 text-[var(--text-secondary)] mt-6 text-sm">
                <span className="flex items-center gap-2 break-words"><Building2 size={14} className="text-[var(--sp-accent)] shrink-0" />{opportunity.organization}</span>
                <span className="flex items-center gap-2 break-words"><MapPin size={14} className="text-[var(--sp-accent)] shrink-0" />{opportunity.location}</span>
                <span className="flex items-center gap-2 break-words"><Briefcase size={14} className="text-[var(--sp-accent)] shrink-0" />{opportunity.type}</span>
                <span className="flex items-center gap-2 break-words"><Clock size={14} className="text-[var(--sp-accent)] shrink-0" />{opportunity.duration}</span>
                <span className="flex items-center gap-2 break-words"><DollarSign size={14} className="text-[var(--sp-accent)] shrink-0" />{opportunity.compensation}</span>
                <span className="flex items-center gap-2 break-words"><Calendar size={14} className="text-[var(--sp-accent)] shrink-0" />{t('opportunitiesPage.labels.deadline', { value: formatDeadline() })}</span>
              </div>

              {applicationClosed && (
                <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-sm text-red-200">
                    {t('opportunitiesPage.errors.deadlinePassed', {
                      defaultValue: 'Applications for this opportunity are closed because the deadline has passed.',
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="w-full lg:w-[320px] premium-glass rounded-3xl border border-white/10 p-6">
              <div className="space-y-3">
                <button onClick={() => navigate('/pricing')} className="sp-btn-primary w-full flex items-center justify-center gap-2">
                  {t('opportunitiesPage.actions.freeToJoin')}
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={submitApplication}
                  disabled={applicationClosed}
                  className={`sp-btn-glass w-full flex items-center justify-center gap-2 ${applicationClosed ? 'opacity-60 cursor-not-allowed hover:translate-y-0' : ''}`}
                >
                  {opportunity.applicationLink ? t('opportunitiesPage.actions.openApplicationLink') : t('opportunitiesPage.actions.submitApplication')}
                  {opportunity.applicationLink ? <ExternalLink size={16} /> : <Shield size={16} />}
                </button>
                <button onClick={() => navigate('/contact')} className="sp-btn-glass w-full">
                  {t('opportunitiesPage.actions.partnerWithUs')}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 lg:gap-8 mt-8 sm:mt-10">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('opportunitiesPage.modal.projectSeeking')}</h2>
                <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed break-words">{opportunity.description}</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('opportunitiesPage.modal.requirements')}</h2>
                <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)]">
                  {opportunity.requirements.length > 0
                    ? opportunity.requirements.map((requirement, index) => <li key={`${requirement}-${index}`}>{requirement}</li>)
                    : <li>{t('opportunitiesPage.modal.noRequirements')}</li>}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-light rounded-3xl p-5">
                <h3 className="font-bold text-[var(--text-primary)] mb-3">{t('opportunitiesPage.modal.leading')}</h3>
                <p className="text-[var(--text-secondary)] break-words">{opportunity.organization}</p>
              </div>
              <div className="glass-light rounded-3xl p-5">
                <h3 className="font-bold text-[var(--text-primary)] mb-3">{t('opportunitiesPage.modal.when')}</h3>
                <p className="text-[var(--text-secondary)] break-words">{t('opportunitiesPage.labels.deadline', { value: formatDeadline() })}</p>
              </div>
              {opportunity.tags.length > 0 && (
                <div className="glass-light rounded-3xl p-5">
                  <h3 className="font-bold text-[var(--text-primary)] mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded-full bg-white/5 text-[var(--text-secondary)] text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {opportunity.applicationLink && (
                <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-5">
                  <p className="text-sm font-semibold text-blue-300">{t('opportunitiesPage.modal.externalTitle')}</p>
                  <p className="mt-2 text-sm text-blue-100/80">{t('opportunitiesPage.modal.externalBody')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesDetailPage;
