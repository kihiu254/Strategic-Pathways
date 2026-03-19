import { useState, useEffect } from 'react';
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

const SECTOR_OPTIONS = [
  'All',
  'Agriculture',
  'Technology',
  'Energy',
  'Health',
  'Transport',
  'Manufacturing',
  'Education',
  'Tourism',
  'Finance',
  'Real Estate',
  'Mining',
  'Trade',
  'Creatives',
  'Others',
];

const TYPE_OPTIONS = ['All', 'Full-time', 'Part-time', 'Contract', 'Advisory', 'Consulting', 'Project-based'];
const OWNERSHIP_OPTIONS = ['All', 'Private', 'Public', 'NGOs'];
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

const parseOpportunity = (row: Record<string, any>): Opportunity => {
  const rawTags = Array.isArray(row.tags) ? row.tags : [];
  const ownershipTag = rawTags.find((tag) => tag.toLowerCase().startsWith(OWNERSHIP_PREFIX));
  const applyLinkTag = rawTags.find((tag) => tag.toLowerCase().startsWith(APPLY_LINK_PREFIX));
  const rollingDeadline = rawTags.some((tag) => tag.toLowerCase() === ROLLING_TAG) || String(row.deadline || '').startsWith(ROLLING_DEADLINE_DATE);

  return {
    id: row.id,
    title: row.title || '',
    organization: row.organization || '',
    location: row.location || '',
    type: row.type || 'Project-based',
    duration: row.duration || '',
    description: row.description || '',
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    compensation: row.compensation || '',
    sector: row.sector || 'Others',
    tags: rawTags.filter(
      (tag) =>
        !tag.toLowerCase().startsWith(OWNERSHIP_PREFIX) &&
        !tag.toLowerCase().startsWith(APPLY_LINK_PREFIX) &&
        tag.toLowerCase() !== ROLLING_TAG
    ),
    deadline: row.deadline || '',
    status: row.status === 'closed' ? 'closed' : 'active',
    created_at: row.created_at || '',
    match_score: row.match_score,
    ownership: ownershipTag ? ownershipTag.slice(OWNERSHIP_PREFIX.length) : 'Private',
    applicationLink: applyLinkTag ? applyLinkTag.slice(APPLY_LINK_PREFIX.length) : '',
    rollingDeadline,
  };
};

const formatDeadline = (opportunity: Opportunity) => {
  if (opportunity.rollingDeadline) return 'Rolling';
  if (!opportunity.deadline) return 'TBD';
  return new Date(opportunity.deadline).toLocaleDateString();
};

const OpportunitiesPageRedesigned = () => {
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

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOpportunities((data || []).map((row) => parseOpportunity(row)));
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        toast.error('Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

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
      fetchProfile();
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

  const requireEligibleMember = () => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return false;
    }
    if (isProfileLoading || !profile) {
      toast.error('Loading your profile. Please try again in a moment.');
      return false;
    }
    if (['Community', 'Standard (MVP)', 'Standard Member'].includes(profile.tier)) {
      toast.error('Upgrade to apply for opportunities.', {
        action: {
          label: 'Membership',
          onClick: () => navigate('/pricing')
        }
      });
      return false;
    }
    if (!profile.onboarding_completed) {
      toast.error('Complete your onboarding to apply for opportunities.');
      navigate('/onboarding/full');
      return false;
    }
    return true;
  };

  const handleApply = (opportunity: Opportunity) => {
    if (!requireEligibleMember()) return;
    setSelectedOpp(opportunity);
  };

  const submitApplication = async () => {
    if (!selectedOpp || !user) return;
    if (!requireEligibleMember()) return;

    if (selectedOpp.applicationLink) {
      window.open(selectedOpp.applicationLink, '_blank', 'noopener,noreferrer');
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
        title: 'Application received',
        message: `Your application for "${selectedOpp.title}" has been submitted and is now under review.`,
        type: 'opportunity',
        data: { action: 'application_submitted', opportunityId: selectedOpp.id, opportunityTitle: selectedOpp.title },
      }).catch((notificationError) => console.warn('Notification failed:', notificationError));
      toast.success('Application submitted successfully!');
      setSelectedOpp(null);
    } catch (error) {
      toast.error(`Failed to submit application: ${(error as Error).message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--sp-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
      <SEO title="Opportunities" />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-32 w-80 h-80 rounded-full bg-[var(--sp-accent)]/10 blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[420px] h-[320px] rounded-full bg-[#0b2a3c]/40 blur-[160px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card p-8 lg:p-10 rounded-3xl border border-white/10 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/0 to-white/0" />
            <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1 space-y-3">
                <p className="sp-label">Opportunities</p>
                <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] leading-tight">
                  Discover vetted projects shaping Kenya's impact economy.
                </h1>
                <p className="text-[var(--text-secondary)] max-w-2xl">
                  Free to join. Explore consulting, advisory, and venture-building opportunities curated for vetted members and trusted partners.
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-secondary)]">
                    {opportunities.length} active opportunities
                  </span>
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-secondary)]">
                    {new Set(opportunities.map((item) => item.organization)).size} organizations
                  </span>
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-secondary)]">
                    {new Set(opportunities.map((item) => item.sector)).size} sectors
                  </span>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => navigate('/pricing')} className="sp-btn-primary px-6 py-3 whitespace-nowrap">
                  View membership options
                </button>
                <button onClick={() => navigate('/contact')} className="sp-btn-glass px-6 py-3 whitespace-nowrap">
                  Partner with us
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1">
              <div className="glass-card p-6 rounded-3xl border border-white/10 sticky top-28">
                <div className="flex items-center gap-2 mb-4">
                  <Filter size={16} className="text-[var(--sp-accent)]" />
                  <h3 className="text-[var(--text-primary)] font-semibold">Refine search</h3>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input type="text" placeholder="Search by title, organization, or location" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-glass w-full pl-10 pr-3 py-3" />
                  </div>
                  <div>
                    <p className="text-[12px] text-[var(--text-secondary)] mb-2 uppercase tracking-[0.2em]">Sector</p>
                    <div className="space-y-2 max-h-56 overflow-auto pr-1">
                      {SECTOR_OPTIONS.map((sector) => (
                        <button
                          key={sector}
                          onClick={() => setSelectedSector(sector)}
                          className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${selectedSector === sector ? 'border-[var(--sp-accent)] text-[var(--text-primary)] bg-[var(--sp-accent)]/10' : 'border-white/10 text-[var(--text-secondary)] hover:border-[var(--sp-accent)]/40'}`}
                        >
                          {sector}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[12px] text-[var(--text-secondary)] mb-2 uppercase tracking-[0.2em]">Type</p>
                    <div className="grid grid-cols-2 gap-2">
                      {TYPE_OPTIONS.map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${selectedType === type ? 'border-[var(--sp-accent)] text-[var(--text-primary)] bg-[var(--sp-accent)]/10' : 'border-white/10 text-[var(--text-secondary)] hover:border-[var(--sp-accent)]/40'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[12px] text-[var(--text-secondary)] mb-2 uppercase tracking-[0.2em]">Ownership</p>
                    <div className="grid grid-cols-2 gap-2">
                      {OWNERSHIP_OPTIONS.map((ownership) => (
                        <button
                          key={ownership}
                          onClick={() => setSelectedOwnership(ownership)}
                          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${selectedOwnership === ownership ? 'border-[var(--sp-accent)] text-[var(--text-primary)] bg-[var(--sp-accent)]/10' : 'border-white/10 text-[var(--text-secondary)] hover:border-[var(--sp-accent)]/40'}`}
                        >
                          {ownership}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSector('All');
                      setSelectedType('All');
                      setSelectedOwnership('All');
                    }}
                    className="sp-btn-glass w-full"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            </aside>

            <section className="lg:col-span-3 space-y-4">
              {filteredOpps.length === 0 && (
                <div className="glass-card p-12 text-center rounded-3xl border border-white/10">
                  <p className="text-[var(--text-secondary)] mb-4">No opportunities found matching your criteria</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSector('All');
                      setSelectedType('All');
                      setSelectedOwnership('All');
                    }}
                    className="sp-btn-primary"
                  >
                    Reset filters
                  </button>
                </div>
              )}

              {filteredOpps.map((opportunity) => (
                <div key={opportunity.id} className="glass-card rounded-3xl border border-white/10 p-6 hover:border-[var(--sp-accent)]/40 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--sp-accent)] transition-colors">
                          {opportunity.title}
                        </h3>
                        {opportunity.match_score && (
                          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold flex items-center gap-1">
                            <Star size={12} className="fill-green-400" />
                            {opportunity.match_score}% Match
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-[var(--text-secondary)] mb-3 text-sm">
                        <span className="flex items-center gap-2"><Building2 size={14} className="text-[var(--sp-accent)]" />{opportunity.organization}</span>
                        <span className="flex items-center gap-2"><MapPin size={14} className="text-[var(--sp-accent)]" />{opportunity.location}</span>
                        <span className="flex items-center gap-2"><Briefcase size={14} className="text-[var(--sp-accent)]" />{opportunity.type}</span>
                        <span className="flex items-center gap-2"><Clock size={14} className="text-[var(--sp-accent)]" />{opportunity.duration}</span>
                        <span className="flex items-center gap-2"><DollarSign size={14} className="text-[var(--sp-accent)]" />{opportunity.compensation}</span>
                        <span className="flex items-center gap-2"><Calendar size={14} className="text-[var(--sp-accent)]" />Deadline: {formatDeadline(opportunity)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-xs">{opportunity.sector}</span>
                        <span className="px-2 py-1 rounded-full bg-white/5 text-[var(--text-secondary)] text-xs">{opportunity.ownership}</span>
                        {opportunity.applicationLink && (
                          <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs">External application link</span>
                        )}
                        {opportunity.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 rounded-full bg-white/5 text-[var(--text-secondary)] text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-[var(--text-secondary)]">{opportunity.description}</p>
                    </div>
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                      <button onClick={() => handleApply(opportunity)} className="sp-btn-primary flex items-center justify-center gap-2 w-full">
                        Apply <ArrowRight size={16} />
                      </button>
                      <button onClick={() => setSelectedOpp(opportunity)} className="sp-btn-glass flex items-center justify-center gap-2 w-full">
                        View details
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[var(--bg-card)] border-b border-white/10 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">{selectedOpp.title}</h3>
              <button onClick={() => setSelectedOpp(null)} className="p-2 hover:bg-white/5 rounded-lg" aria-label="Close" title="Close">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-light rounded-2xl p-4">
                  <h4 className="font-bold text-[var(--text-primary)] mb-2">Who is leading this?</h4>
                  <p className="text-[var(--text-secondary)]">{selectedOpp.organization}</p>
                </div>
                <div className="glass-light rounded-2xl p-4">
                  <h4 className="font-bold text-[var(--text-primary)] mb-2">Where?</h4>
                  <p className="text-[var(--text-secondary)]">{selectedOpp.location}</p>
                </div>
                <div className="glass-light rounded-2xl p-4">
                  <h4 className="font-bold text-[var(--text-primary)] mb-2">How long?</h4>
                  <p className="text-[var(--text-secondary)]">{selectedOpp.duration}</p>
                </div>
                <div className="glass-light rounded-2xl p-4">
                  <h4 className="font-bold text-[var(--text-primary)] mb-2">When?</h4>
                  <p className="text-[var(--text-secondary)]">Deadline: {formatDeadline(selectedOpp)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[var(--text-primary)] mb-2">What is the project seeking?</h4>
                <p className="text-[var(--text-secondary)]">{selectedOpp.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-[var(--text-primary)] mb-2">Requirements</h4>
                <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
                  {selectedOpp.requirements.length > 0 ? selectedOpp.requirements.map((requirement, index) => <li key={`${requirement}-${index}`}>{requirement}</li>) : <li>No specific requirements listed.</li>}
                </ul>
              </div>

              {selectedOpp.applicationLink && (
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <ExternalLink className="text-blue-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-blue-300">Applications for this opportunity are handled through an external link.</p>
                      <p className="mt-1 text-sm text-blue-100/80">Use the button below to open the application form provided by the opportunity owner.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 flex-wrap">
                <button onClick={submitApplication} className="sp-btn-primary flex-1 flex items-center justify-center gap-2">
                  {selectedOpp.applicationLink ? 'Open application link' : 'Submit Application'}
                  {selectedOpp.applicationLink ? <ExternalLink size={16} /> : <ArrowRight size={16} />}
                </button>
                {!selectedOpp.applicationLink && ['Community', 'Standard (MVP)', 'Standard Member'].includes(profile?.tier || '') && (
                  <button onClick={() => navigate('/pricing')} className="sp-btn-glass flex items-center gap-2">
                    <Shield size={16} />
                    View membership options
                  </button>
                )}
                <button onClick={() => setSelectedOpp(null)} className="sp-btn-glass">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPageRedesigned;
