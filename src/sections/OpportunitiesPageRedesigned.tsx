import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { 
  Search, MapPin, Briefcase, Clock, Filter, ArrowRight, Building2, 
  Star, DollarSign, Users, Calendar, Bookmark, Share2, X
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';

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
}

const OpportunitiesPageRedesigned = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpps, setFilteredOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setIsProfileLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
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

  useEffect(() => {
    filterOpportunities();
  }, [searchQuery, selectedSector, selectedType, opportunities]);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const filterOpportunities = () => {
    let filtered = opportunities;

    if (searchQuery) {
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSector !== 'All') {
      filtered = filtered.filter(opp => opp.sector === selectedSector);
    }

    if (selectedType !== 'All') {
      filtered = filtered.filter(opp => opp.type === selectedType);
    }

    setFilteredOpps(filtered);
  };

  const handleApply = (opp: Opportunity) => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }
    if (isProfileLoading || !profile) {
      toast.error('Loading your profile. Please try again in a moment.');
      return;
    }

    if (['Community', 'Standard (MVP)', 'Standard Member'].includes(profile?.tier)) {
      toast.error('Upgrade to Premium to apply for opportunities', {
        action: {
          label: 'Upgrade',
          onClick: () => navigate('/pricing')
        }
      });
      return;
    }
    if (!profile?.onboarding_completed) {
      toast.error('Complete your onboarding to apply for opportunities.');
      navigate('/onboarding/full');
      return;
    }

    setSelectedOpp(opp);
  };

  const submitApplication = async () => {
    if (!user || !selectedOpp) return;
    if (isProfileLoading || !profile) {
      toast.error('Loading your profile. Please try again in a moment.');
      return;
    }

    if (['Community', 'Standard (MVP)', 'Standard Member'].includes(profile?.tier)) {
      toast.error('Upgrade to Premium to apply');
      navigate('/pricing');
      return;
    }
    if (!profile?.onboarding_completed) {
      toast.error('Complete your onboarding to apply.');
      navigate('/onboarding/full');
      return;
    }

    try {
      const { error } = await supabase
        .from('opportunity_applications')
        .insert({
          opportunity_id: selectedOpp.id,
          user_id: user.id,
          status: 'pending',
          applied_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Application submitted successfully!');
      setSelectedOpp(null);
    } catch (error: any) {
      toast.error('Failed to submit application: ' + error.message);
    }
  };

  const sectors = ['All', 'Technology', 'Agriculture', 'Healthcare', 'Finance', 'Education', 'Public Sector', 'NGO'];
  const types = ['All', 'Full-time', 'Part-time', 'Contract', 'Advisory', 'Consulting'];

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
          {/* Hero */}
          <div className="glass-card p-8 lg:p-10 rounded-3xl border border-white/10 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/0 to-white/0" />
            <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1 space-y-3">
                <p className="sp-label">Opportunities</p>
                <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] leading-tight">
                  Discover vetted projects shaping Kenya’s impact economy.
                </h1>
                <p className="text-[var(--text-secondary)] max-w-2xl">
                  Apply to consulting, advisory, and venture-building roles curated for globally trained professionals. Premium members get priority matching and early access.
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-secondary)]">
                    {opportunities.length} active opportunities
                  </span>
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-secondary)]">
                    {new Set(opportunities.map(o => o.organization)).size} organizations
                  </span>
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-secondary)]">
                    {new Set(opportunities.map(o => o.sector)).size} sectors
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/pricing')}
                  className="sp-btn-primary px-6 py-3 whitespace-nowrap"
                >
                  Upgrade for early access
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="sp-btn-glass px-6 py-3 whitespace-nowrap"
                >
                  Partner with us
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters */}
            <aside className="lg:col-span-1">
              <div className="glass-card p-6 rounded-3xl border border-white/10 sticky top-28">
                <div className="flex items-center gap-2 mb-4">
                  <Filter size={16} className="text-[var(--sp-accent)]" />
                  <h3 className="text-[var(--text-primary)] font-semibold">Refine search</h3>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input
                      type="text"
                      placeholder="Search by title or org"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-glass w-full pl-10 pr-3 py-3"
                    />
                  </div>
                  <div>
                    <p className="text-[12px] text-[var(--text-secondary)] mb-2 uppercase tracking-[0.2em]">Sector</p>
                    <div className="space-y-2">
                      {sectors.map(sector => (
                        <button
                          key={sector}
                          onClick={() => setSelectedSector(sector)}
                          className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                            selectedSector === sector
                              ? 'border-[var(--sp-accent)] text-[var(--text-primary)] bg-[var(--sp-accent)]/10'
                              : 'border-white/10 text-[var(--text-secondary)] hover:border-[var(--sp-accent)]/40'
                          }`}
                        >
                          {sector}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[12px] text-[var(--text-secondary)] mb-2 uppercase tracking-[0.2em]">Type</p>
                    <div className="grid grid-cols-2 gap-2">
                      {types.map(type => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                            selectedType === type
                              ? 'border-[var(--sp-accent)] text-[var(--text-primary)] bg-[var(--sp-accent)]/10'
                              : 'border-white/10 text-[var(--text-secondary)] hover:border-[var(--sp-accent)]/40'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSector('All');
                      setSelectedType('All');
                    }}
                    className="sp-btn-glass w-full"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            </aside>

            {/* Opportunities */}
            <section className="lg:col-span-3 space-y-4">
              {filteredOpps.length === 0 && (
                <div className="glass-card p-12 text-center rounded-3xl border border-white/10">
                  <p className="text-[var(--text-secondary)] mb-4">No opportunities found matching your criteria</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSector('All');
                      setSelectedType('All');
                    }}
                    className="sp-btn-primary"
                  >
                    Reset filters
                  </button>
                </div>
              )}

              {filteredOpps.map((opp) => (
                <div key={opp.id} className="glass-card rounded-3xl border border-white/10 p-6 hover:border-[var(--sp-accent)]/40 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--sp-accent)] transition-colors">
                          {opp.title}
                        </h3>
                        {opp.match_score && (
                          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold flex items-center gap-1">
                            <Star size={12} className="fill-green-400" />
                            {opp.match_score}% Match
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-[var(--text-secondary)] mb-3 text-sm">
                        <span className="flex items-center gap-2"><Building2 size={14} className="text-[var(--sp-accent)]" />{opp.organization}</span>
                        <span className="flex items-center gap-2"><MapPin size={14} className="text-[var(--sp-accent)]" />{opp.location}</span>
                        <span className="flex items-center gap-2"><Briefcase size={14} className="text-[var(--sp-accent)]" />{opp.type}</span>
                        <span className="flex items-center gap-2"><Clock size={14} className="text-[var(--sp-accent)]" />{opp.duration}</span>
                        <span className="flex items-center gap-2"><DollarSign size={14} className="text-[var(--sp-accent)]" />{opp.compensation}</span>
                        <span className="flex items-center gap-2"><Calendar size={14} className="text-[var(--sp-accent)]" />Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[var(--text-secondary)] mb-4">
                        {opp.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {opp.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                      <button
                        onClick={() => handleApply(opp)}
                        className="sp-btn-primary flex items-center justify-center gap-2 w-full"
                      >
                        Apply <ArrowRight size={16} />
                      </button>
                      <button
                        onClick={() => setSelectedOpp(opp)}
                        className="sp-btn-glass flex items-center justify-center gap-2 w-full"
                      >
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

      {/* Application Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[var(--bg-card)] border-b border-white/10 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Apply for {selectedOpp.title}</h3>
              <button onClick={() => setSelectedOpp(null)} className="p-2 hover:bg-white/5 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-bold text-[var(--text-primary)] mb-2">Organization</h4>
                <p className="text-[var(--text-secondary)]">{selectedOpp.organization}</p>
              </div>

              <div>
                <h4 className="font-bold text-[var(--text-primary)] mb-2">Description</h4>
                <p className="text-[var(--text-secondary)]">{selectedOpp.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-[var(--text-primary)] mb-2">Requirements</h4>
                <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
                  {selectedOpp.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <button onClick={submitApplication} className="sp-btn-primary flex-1">
                  Submit Application
                </button>
                <button onClick={() => setSelectedOpp(null)} className="sp-btn-glass">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPageRedesigned;
