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

  useEffect(() => {
    fetchOpportunities();
  }, []);

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
    setSelectedOpp(opp);
  };

  const submitApplication = async () => {
    if (!user || !selectedOpp) return;

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

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Discover Opportunities
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Connect with high-impact projects and organizations across Kenya
          </p>
        </div>

        {/* Search & Filters */}
        <div className="glass-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-glass w-full pl-12 pr-4 py-3"
              />
            </div>

            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="input-glass px-4 py-3"
            >
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-glass px-4 py-3"
            >
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSector('All');
                setSelectedType('All');
              }}
              className="sp-btn-glass"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--sp-accent)]">{opportunities.length}</div>
            <div className="text-sm text-[var(--text-secondary)]">Active Opportunities</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--sp-accent)]">{new Set(opportunities.map(o => o.organization)).size}</div>
            <div className="text-sm text-[var(--text-secondary)]">Organizations</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--sp-accent)]">{new Set(opportunities.map(o => o.sector)).size}</div>
            <div className="text-sm text-[var(--text-secondary)]">Sectors</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--sp-accent)]">{filteredOpps.length}</div>
            <div className="text-sm text-[var(--text-secondary)]">Matches</div>
          </div>
        </div>

        {/* Opportunities Grid */}
        <div className="space-y-6">
          {filteredOpps.map((opp) => (
            <div key={opp.id} className="glass-card p-6 hover:border-[var(--sp-accent)]/30 transition-all group">
              <div className="flex items-start justify-between mb-4">
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
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-3">
                    <Building2 size={16} />
                    <span className="font-medium">{opp.organization}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleApply(opp)}
                  className="sp-btn-primary flex items-center gap-2"
                >
                  Apply <ArrowRight size={16} />
                </button>
              </div>

              <p className="text-[var(--text-secondary)] mb-4 line-clamp-2">
                {opp.description}
              </p>

              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-sm">
                  <MapPin size={14} className="text-[var(--sp-accent)]" />
                  {opp.location}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-sm">
                  <Briefcase size={14} className="text-[var(--sp-accent)]" />
                  {opp.type}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-sm">
                  <Clock size={14} className="text-[var(--sp-accent)]" />
                  {opp.duration}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-sm">
                  <DollarSign size={14} className="text-[var(--sp-accent)]" />
                  {opp.compensation}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-sm">
                  <Calendar size={14} className="text-[var(--sp-accent)]" />
                  Deadline: {new Date(opp.deadline).toLocaleDateString()}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {opp.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {filteredOpps.length === 0 && (
            <div className="glass-card p-12 text-center">
              <p className="text-[var(--text-secondary)] mb-4">No opportunities found matching your criteria</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSector('All');
                  setSelectedType('All');
                }}
                className="sp-btn-primary"
              >
                Clear Filters
              </button>
            </div>
          )}
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
