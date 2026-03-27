import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Filter,
  ArrowRight,
  Building2,
  Star,
  DollarSign,
  Calendar,
  X,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { AppNotificationService } from '../lib/appNotifications';
import { EmailAutomationService } from '../lib/emailAutomation';
import { isOpportunityOpenForApplications, isOpportunityPastDeadline } from '../lib/opportunityDeadline';

const SECTOR_OPTIONS = [
  { value: 'All', labelKey: 'opportunitiesPage.filters.sectors.all' },
  { value: 'Agriculture', labelKey: 'opportunitiesPage.filters.sectors.agriculture' },
  { value: 'Technology', labelKey: 'opportunitiesPage.filters.sectors.technology' },
  { value: 'Energy', labelKey: 'opportunitiesPage.filters.sectors.energy' },
  { value: 'Health', labelKey: 'opportunitiesPage.filters.sectors.health' },
  { value: 'Transport', labelKey: 'opportunitiesPage.filters.sectors.transport' },
  { value: 'Manufacturing', labelKey: 'opportunitiesPage.filters.sectors.manufacturing' },
  { value: 'Education', labelKey: 'opportunitiesPage.filters.sectors.education' },
  { value: 'Tourism', labelKey: 'opportunitiesPage.filters.sectors.tourism' },
  { value: 'Finance', labelKey: 'opportunitiesPage.filters.sectors.finance' },
  { value: 'Real Estate', labelKey: 'opportunitiesPage.filters.sectors.realEstate' },
  { value: 'Mining', labelKey: 'opportunitiesPage.filters.sectors.mining' },
  { value: 'Trade', labelKey: 'opportunitiesPage.filters.sectors.trade' },
  { value: 'Creatives', labelKey: 'opportunitiesPage.filters.sectors.creatives' },
  { value: 'Others', labelKey: 'opportunitiesPage.filters.sectors.others' },
];

const TYPE_OPTIONS = [
  { value: 'All', labelKey: 'opportunitiesPage.filters.types.all' },
  { value: 'Full-time', labelKey: 'opportunitiesPage.filters.types.fullTime' },
  { value: 'Part-time', labelKey: 'opportunitiesPage.filters.types.partTime' },
  { value: 'Contract', labelKey: 'opportunitiesPage.filters.types.contract' },
  { value: 'Advisory', labelKey: 'opportunitiesPage.filters.types.advisory' },
  { value: 'Consulting', labelKey: 'opportunitiesPage.filters.types.consulting' },
  { value: 'Project-based', labelKey: 'opportunitiesPage.filters.types.projectBased' },
];

const OWNERSHIP_OPTIONS = [
  { value: 'All', labelKey: 'opportunitiesPage.filters.ownerships.all' },
  { value: 'Private', labelKey: 'opportunitiesPage.filters.ownerships.private' },
  { value: 'Public', labelKey: 'opportunitiesPage.filters.ownerships.public' },
  { value: 'NGOs', labelKey: 'opportunitiesPage.filters.ownerships.ngos' },
];

const OWNERSHIP_PREFIX = 'ownership:';
const APPLY_LINK_PREFIX = 'apply-link:';
const ROLLING_TAG = 'deadline:rolling';
const ROLLING_DEADLINE_DATE = '2099-12-31';

interface Opportunity {
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
}

const parseOpportunity = (row: Record<string, unknown>): Opportunity => {
  const rawTags = Array.isArray(row.tags) ? (row.tags as string[]) : [];
  const ownershipTag = rawTags.find((tag) => tag.toLowerCase().startsWith(OWNERSHIP_PREFIX));
  const applyLinkTag = rawTags.find((tag) => tag.toLowerCase().startsWith(APPLY_LINK_PREFIX));
  const rollingDeadline = rawTags.some((tag) => tag.toLowerCase() === ROLLING_TAG) || String(row.deadline || '').startsWith(ROLLING_DEADLINE_DATE);

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

const OpportunitiesPageRedesigned = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpps, setFilteredOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedOwnership, setSelectedOwnership] = useState('All');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [profile, setProfile] = useState<{ tier: string; profile_type: string; onboarding_completed: boolean } | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const formatDeadline = (opportunity: Opportunity) => {
    if (opportunity.rollingDeadline) return t('opportunitiesPage.values.rolling');
    if (!opportunity.deadline) return t('opportunitiesPage.values.tbd');
    return new Date(opportunity.deadline).toLocaleDateString();
  };

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOpportunities(
          (data || [])
            .map((row) => parseOpportunity(row))
            .filter((opportunity) => !isOpportunityPastDeadline(opportunity))
        );
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        toast.error(t('opportunitiesPage.errors.load'));
      } finally {
        setLoading(false);
      }
    };

    void fetchOpportunities();
  }, [t]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('tier, profile_type, onboarding_completed')
          .eq('id', user?.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    if (user) {
      void fetchProfile();
    } else {
      setIsProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let filtered = opportunities;

    if (searchQuery) {
      filtered = filtered.filter((opportunity) => {
        const query = searchQuery.toLowerCase();
        return (
          opportunity.title.toLowerCase().includes(query) ||
          opportunity.organization.toLowerCase().includes(query) ||
          opportunity.description.toLowerCase().includes(query) ||
          opportunity.location.toLowerCase().includes(query)
        );
      });
    }

    if (selectedSector !== 'All') {
      filtered = filtered.filter((opportunity) => opportunity.sector === selectedSector);
    }

    if (selectedType !== 'All') {
      filtered = filtered.filter((opportunity) => opportunity.type === selectedType);
    }

    if (selectedOwnership !== 'All') {
      filtered = filtered.filter((opportunity) => opportunity.ownership === selectedOwnership);
    }

    setFilteredOpps(filtered);
  }, [opportunities, searchQuery, selectedOwnership, selectedSector, selectedType]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSector('All');
    setSelectedType('All');
    setSelectedOwnership('All');
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
    if (['Community', 'Standard (MVP)', 'Standard Member'].includes(profile.tier)) {
      toast.error(t('opportunitiesPage.errors.upgradeToApply'), {
        action: {
          label: t('opportunitiesPage.actions.membership'),
          onClick: () => navigate('/pricing')
        }
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

  const handleApply = (opportunity: Opportunity) => {
    if (!isOpportunityOpenForApplications(opportunity)) {
      toast.error(
        t('opportunitiesPage.errors.deadlinePassed', {
          defaultValue: 'Applications for this opportunity are closed because the deadline has passed.',
        })
      );
      return;
    }

    if (!requireEligibleMember()) return;
    setSelectedOpp(opportunity);
  };

  const submitApplication = async () => {
    if (!selectedOpp || !user) return;
    if (!requireEligibleMember()) return;
    if (!isOpportunityOpenForApplications(selectedOpp)) {
      toast.error(
        t('opportunitiesPage.errors.deadlinePassed', {
          defaultValue: 'Applications for this opportunity are closed because the deadline has passed.',
        })
      );
      setSelectedOpp(null);
      return;
    }

    if (selectedOpp.applicationLink) {
      const { error: trackingError } = await supabase.from('opportunity_applications').insert({
        opportunity_id: selectedOpp.id,
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
        message: t('opportunitiesPage.notifications.selectedMessage', { title: selectedOpp.title }),
        type: 'opportunity',
        data: { action: 'opportunity_interest', opportunityId: selectedOpp.id, opportunityTitle: selectedOpp.title },
      }).catch((notificationError) => console.warn('Notification failed:', notificationError));
      await EmailAutomationService.onOpportunityInterest(
        user.email || '',
        user.user_metadata?.full_name || user.email || 'Member',
        selectedOpp.title,
        selectedOpp.organization,
        'external'
      );
      window.open(selectedOpp.applicationLink, '_blank', 'noopener,noreferrer');
      setSelectedOpp(null);
      return;
    }

    try {
      const { error } = await supabase.from('opportunity_applications').insert({
        opportunity_id: selectedOpp.id,
        user_id: user.id,
        status: 'pending',
        applied_at: new Date().toISOString(),
      });

      if (error) throw error;
      await AppNotificationService.notifySelf({
        title: t('opportunitiesPage.notifications.receivedTitle'),
        message: t('opportunitiesPage.notifications.receivedMessage', { title: selectedOpp.title }),
        type: 'opportunity',
        data: { action: 'application_submitted', opportunityId: selectedOpp.id, opportunityTitle: selectedOpp.title },
      }).catch((notificationError) => console.warn('Notification failed:', notificationError));
      await EmailAutomationService.onOpportunityInterest(
        user.email || '',
        user.user_metadata?.full_name || user.email || 'Member',
        selectedOpp.title,
        selectedOpp.organization,
        'internal'
      );
      toast.success(t('opportunitiesPage.notifications.submitSuccess'));
      setSelectedOpp(null);
    } catch (error) {
      toast.error(t('opportunitiesPage.errors.submitFailed', { message: (error as Error).message }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--sp-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">{t('opportunitiesPage.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
      <SEO title={t('opportunitiesPage.seoTitle')} />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-32 w-80 h-80 rounded-full bg-[var(--sp-accent)]/10 blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[420px] h-[320px] rounded-full bg-[#0b2a3c]/40 blur-[160px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-5 sm:p-6 lg:p-10 rounded-3xl border border-white/10 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/0 to-white/0" />
            <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1 space-y-3">
                <p className="sp-label">{t('nav.opportunities')}</p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] leading-tight">
                  {t('opportunitiesPage.hero.headline')}
                </h1>
                <p className="text-[var(--text-secondary)] max-w-2xl">
                  {t('opportunitiesPage.hero.body')}
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-secondary)]">
                    {t('opportunitiesPage.metrics.activeOpportunities', { count: opportunities.length })}
                  </span>
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-secondary)]">
                    {t('opportunitiesPage.metrics.organizations', { count: new Set(opportunities.map((item) => item.organization)).size })}
                  </span>
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-secondary)]">
                    {t('opportunitiesPage.metrics.sectors', { count: new Set(opportunities.map((item) => item.sector)).size })}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap w-full lg:w-auto">
                <button onClick={() => navigate('/pricing')} className="sp-btn-primary px-6 py-3 whitespace-nowrap w-full sm:w-auto">
                  {t('opportunitiesPage.actions.upgradeForEarlyAccess', { defaultValue: 'Upgrade for early access' })}
                </button>
                <button onClick={() => navigate('/contact')} className="sp-btn-glass px-6 py-3 whitespace-nowrap w-full sm:w-auto">
                  {t('opportunitiesPage.actions.partnerWithUs')}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] gap-6">
            <aside className="md:self-start">
              <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 md:sticky md:top-28 md:max-h-[calc(100vh-8rem)] md:overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Filter size={16} className="text-[var(--sp-accent)]" />
                  <h3 className="text-[var(--text-primary)] font-semibold">{t('opportunitiesPage.filters.refineSearch')}</h3>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input
                      type="text"
                      placeholder={t('opportunitiesPage.filters.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-glass w-full pl-10 pr-3 py-3"
                    />
                  </div>
                  <div>
                    <p className="text-[12px] text-[var(--text-secondary)] mb-2 uppercase tracking-[0.2em]">{t('opportunitiesPage.filters.sector')}</p>
                    <div className="space-y-2 max-h-48 sm:max-h-56 overflow-auto pr-1">
                      {SECTOR_OPTIONS.map((sector) => (
                        <button
                          key={sector.value}
                          onClick={() => setSelectedSector(sector.value)}
                          className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${selectedSector === sector.value ? 'border-[var(--sp-accent)] text-[var(--text-primary)] bg-[var(--sp-accent)]/10' : 'border-white/10 text-[var(--text-secondary)] hover:border-[var(--sp-accent)]/40'}`}
                        >
                          {t(sector.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[12px] text-[var(--text-secondary)] mb-2 uppercase tracking-[0.2em]">{t('opportunitiesPage.filters.type')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {TYPE_OPTIONS.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setSelectedType(type.value)}
                          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${selectedType === type.value ? 'border-[var(--sp-accent)] text-[var(--text-primary)] bg-[var(--sp-accent)]/10' : 'border-white/10 text-[var(--text-secondary)] hover:border-[var(--sp-accent)]/40'}`}
                        >
                          {t(type.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[12px] text-[var(--text-secondary)] mb-2 uppercase tracking-[0.2em]">{t('opportunitiesPage.filters.ownership')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {OWNERSHIP_OPTIONS.map((ownership) => (
                        <button
                          key={ownership.value}
                          onClick={() => setSelectedOwnership(ownership.value)}
                          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${selectedOwnership === ownership.value ? 'border-[var(--sp-accent)] text-[var(--text-primary)] bg-[var(--sp-accent)]/10' : 'border-white/10 text-[var(--text-secondary)] hover:border-[var(--sp-accent)]/40'}`}
                        >
                          {t(ownership.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={resetFilters} className="sp-btn-glass w-full">
                    {t('opportunitiesPage.actions.clearFilters')}
                  </button>
                </div>
              </div>
            </aside>

            <section className="min-w-0 space-y-4">
              {filteredOpps.length === 0 && (
                <div className="glass-card p-12 text-center rounded-3xl border border-white/10">
                  <p className="text-[var(--text-secondary)] mb-4">{t('opportunitiesPage.noResults')}</p>
                  <button onClick={resetFilters} className="sp-btn-primary">
                    {t('opportunitiesPage.actions.resetFilters')}
                  </button>
                </div>
              )}

              {filteredOpps.map((opportunity) => (
                <div key={opportunity.id} className="glass-card rounded-3xl border border-white/10 p-5 sm:p-6 hover:border-[var(--sp-accent)]/40 transition-all group">
                  <div className="flex flex-col xl:flex-row xl:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--sp-accent)] transition-colors break-words leading-snug">
                          {opportunity.title}
                        </h3>
                        {opportunity.match_score && (
                          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold flex items-center gap-1">
                            <Star size={12} className="fill-green-400" />
                            {t('opportunitiesPage.labels.match', { score: opportunity.match_score })}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-[var(--text-secondary)] mb-3 text-sm">
                        <span className="flex items-center gap-2"><Building2 size={14} className="text-[var(--sp-accent)]" />{opportunity.organization}</span>
                        <span className="flex items-center gap-2"><MapPin size={14} className="text-[var(--sp-accent)]" />{opportunity.location}</span>
                        <span className="flex items-center gap-2"><Briefcase size={14} className="text-[var(--sp-accent)]" />{opportunity.type}</span>
                        <span className="flex items-center gap-2"><Clock size={14} className="text-[var(--sp-accent)]" />{opportunity.duration}</span>
                        <span className="flex items-center gap-2"><DollarSign size={14} className="text-[var(--sp-accent)]" />{opportunity.compensation}</span>
                        <span className="flex items-center gap-2"><Calendar size={14} className="text-[var(--sp-accent)]" />{t('opportunitiesPage.labels.deadline', { value: formatDeadline(opportunity) })}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-xs">{opportunity.sector}</span>
                        <span className="px-2 py-1 rounded-full bg-white/5 text-[var(--text-secondary)] text-xs">{opportunity.ownership}</span>
                        {opportunity.applicationLink && (
                          <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs">{t('opportunitiesPage.labels.externalApplicationLink')}</span>
                        )}
                        {opportunity.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 rounded-full bg-white/5 text-[var(--text-secondary)] text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm sm:text-base text-[var(--text-secondary)] whitespace-pre-line break-words">{opportunity.description}</p>
                    </div>
                    <div className="flex flex-col gap-3 w-full xl:w-[220px] shrink-0">
                      <button onClick={() => navigate('/pricing')} className="sp-btn-primary flex items-center justify-center gap-2 w-full">
                        {t('opportunitiesPage.actions.freeToJoin')} <ArrowRight size={16} />
                      </button>
                      <button onClick={() => navigate(`/opportunities/${opportunity.id}`)} className="sp-btn-glass flex items-center justify-center gap-2 w-full">
                        {t('opportunitiesPage.actions.viewDetails')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>

      {selectedOpp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[var(--bg-card)] border-b border-white/10 p-4 sm:p-6 flex justify-between items-center gap-4">
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] break-words">{selectedOpp.title}</h3>
              <button onClick={() => setSelectedOpp(null)} className="p-2 hover:bg-white/5 rounded-lg" aria-label={t('opportunitiesPage.actions.close')} title={t('opportunitiesPage.actions.close')}>
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-light rounded-2xl p-4">
                  <h4 className="font-bold text-[var(--text-primary)] mb-2">{t('opportunitiesPage.modal.leading')}</h4>
                  <p className="text-[var(--text-secondary)]">{selectedOpp.organization}</p>
                </div>
                <div className="glass-light rounded-2xl p-4">
                  <h4 className="font-bold text-[var(--text-primary)] mb-2">{t('opportunitiesPage.modal.where')}</h4>
                  <p className="text-[var(--text-secondary)]">{selectedOpp.location}</p>
                </div>
                <div className="glass-light rounded-2xl p-4">
                  <h4 className="font-bold text-[var(--text-primary)] mb-2">{t('opportunitiesPage.modal.howLong')}</h4>
                  <p className="text-[var(--text-secondary)]">{selectedOpp.duration}</p>
                </div>
                <div className="glass-light rounded-2xl p-4">
                  <h4 className="font-bold text-[var(--text-primary)] mb-2">{t('opportunitiesPage.modal.when')}</h4>
                  <p className="text-[var(--text-secondary)]">{t('opportunitiesPage.labels.deadline', { value: formatDeadline(selectedOpp) })}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[var(--text-primary)] mb-2">{t('opportunitiesPage.modal.projectSeeking')}</h4>
                <p className="text-[var(--text-secondary)]">{selectedOpp.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-[var(--text-primary)] mb-2">{t('opportunitiesPage.modal.requirements')}</h4>
                <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
                  {selectedOpp.requirements.length > 0
                    ? selectedOpp.requirements.map((requirement, index) => <li key={`${requirement}-${index}`}>{requirement}</li>)
                    : <li>{t('opportunitiesPage.modal.noRequirements')}</li>}
                </ul>
              </div>

              {selectedOpp.applicationLink && (
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <ExternalLink className="text-blue-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-blue-300">{t('opportunitiesPage.modal.externalTitle')}</p>
                      <p className="mt-1 text-sm text-blue-100/80">{t('opportunitiesPage.modal.externalBody')}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={submitApplication} className="sp-btn-primary flex-1 flex items-center justify-center gap-2">
                  {selectedOpp.applicationLink ? t('opportunitiesPage.actions.openApplicationLink') : t('opportunitiesPage.actions.submitApplication')}
                  {selectedOpp.applicationLink ? <ExternalLink size={16} /> : <ArrowRight size={16} />}
                </button>
                {!selectedOpp.applicationLink && ['Community', 'Standard (MVP)', 'Standard Member'].includes(profile?.tier || '') && (
                  <button onClick={() => navigate('/pricing')} className="sp-btn-glass flex items-center justify-center gap-2">
                    <Shield size={16} />
                    {t('opportunitiesPage.actions.upgradeForEarlyAccess', { defaultValue: 'Upgrade for early access' })}
                  </button>
                )}
                <button onClick={() => setSelectedOpp(null)} className="sp-btn-glass">{t('dashboard.buttons.cancel')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPageRedesigned;
