import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { hasPaidMembershipAccess } from '../lib/membershipAccess';
import { calculateDynamicMatchScore } from '../utils/matchScoring';
import type { MatchScores } from '../utils/matchScoring';
import { EmailAutomationService } from '../lib/emailAutomation';
import MatchScoreBreakdown from '../components/MatchScoreBreakdown';
import { 
  Users, Calendar, Target, Briefcase, 
  CheckCircle, Star, ArrowRight, Zap, Globe, Heart, Gift, Copy, Share2,
  Settings, Upload, Shield, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

type DashboardOpportunity = {
  id: string;
  title: string;
  org: string;
  location: string;
  sector: string;
  type: string;
  description: string;
};

type UserProfile = {
  full_name?: string;
  tier?: string;
  profile_type?: string;
  created_at?: string;
  verification_tier?: string;
  expertise?: string[];
  profile_completion_percentage?: number;
  sector?: string;
  primarySector?: string;
  bio?: string;
  location?: string;
  countryOfResidence?: string;
  years_of_experience?: number;
  experience?: unknown[];
  availability?: string;
  seeking_income?: string | boolean;
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [opportunities, setOpportunities] = useState<DashboardOpportunity[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [referralStats, setReferralStats] = useState({ total: 0, active: 0, rewards: 0 });
  const [matchScores, setMatchScores] = useState<MatchScores | null>(null);
  const [actionItems, setActionItems] = useState<{title: string, reward: number, actionPath: string}[]>([]);
  const [activationEvents, setActivationEvents] = useState({
    welcome: false,
    spotlight_invite: false,
    intro_call_invite: false
  });
  const [activationLoading, setActivationLoading] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const isPaidMember = hasPaidMembershipAccess(profile);
  const membershipBadgeLabel = profile?.tier === 'Firm' ? 'Paid Partner' : 'Paid Professional';
  const editPath = isPaidMember ? '/profile/edit' : '/profile/edit/basic';

  const fetchDashboardData = useCallback(async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      setProfile(profileData);

      setProfile(profileData);

      const refId = user?.id || 'demo';
      const origin = window.location.origin;
      setReferralLink(`${origin}/signup?ref=${encodeURIComponent(refId)}`);

      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select('id, title, organization, location, type, description, sector')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      if (opportunitiesError) {
        console.error('Error fetching live opportunities:', opportunitiesError);
      } else {
        setOpportunities(
          (opportunitiesData || []).map((opportunity) => ({
            id: opportunity.id,
            title: opportunity.title || 'Untitled opportunity',
            org: opportunity.organization || 'Strategic Pathways',
            location: opportunity.location || 'Location to be confirmed',
            sector: opportunity.sector || 'General',
            type: opportunity.type || 'Project-based',
            description: opportunity.description || '',
          }))
        );
      }

      // Calculate dynamic match score
      let hasCV = false;
      let projectsCount = 0;
      let skillsCount = 0;

      if (user?.id) {
        try {
          const { data: resumes } = await supabase.storage.from('resumes').list(user.id);
          hasCV = (resumes && resumes.length > 0 && !resumes.every(f => f.name === '.emptyFolderPlaceholder')) || false;

          const { count: pCount } = await supabase.from('user_projects').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
          projectsCount = pCount || 0;

          const { data: skillsData } = await supabase.from('user_skills').select('skill_name').eq('user_id', user.id);
          skillsCount = skillsData?.length || 0;

        } catch (e) {
          console.error("Error fetching dependencies for match score:", e);
        }
      }

      setMatchScores(calculateDynamicMatchScore(profileData, skillsCount, projectsCount, hasCV));

      // Calculate Next Steps
      const items: {title: string; reward: number; actionPath: string}[] = [];
      const editRoute = hasPaidMembershipAccess(profileData) ? '/profile/edit' : '/profile/edit/basic';
      if (!hasCV) items.push({ title: 'Upload your CV', reward: 7, actionPath: editRoute });
      if (skillsCount < 3) items.push({ title: 'Add professional skills', reward: 6, actionPath: editRoute });
      if (projectsCount === 0) items.push({ title: 'Showcase past projects', reward: 5, actionPath: '/profile' });
      if (!profileData?.sector && !profileData?.primarySector) items.push({ title: 'Define your primary sector', reward: 10, actionPath: editRoute });
      if (!profileData?.bio) items.push({ title: 'Add a professional bio', reward: 5, actionPath: editRoute });
      
      setActionItems(items.slice(0, 2));

      // Referrals Fetch
      try {
        const { data: refs, error } = await supabase.from('referrals').select('*').eq('referrer_id', user?.id);
        if (!error && refs) {
          const active = refs.filter(r => r.status === 'active').length;
          setReferralStats({ total: refs.length, active, rewards: active * 50 });
        } else {
          setReferralStats({ total: 0, active: 0, rewards: 0 });
        }
      } catch {
        setReferralStats({ total: 0, active: 0, rewards: 0 });
      }

    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const loadDashboard = async () => {
      await fetchDashboardData();
    };
    void loadDashboard();
  }, [fetchDashboardData, navigate, user]);

  useEffect(() => {
    const loadActivationEvents = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('community_activation_events')
          .select('event_type')
          .eq('user_id', user.id);

        if (error) throw error;

        const events = (data || []).map((row) => row.event_type);
        setActivationEvents({
          welcome: events.includes('welcome'),
          spotlight_invite: events.includes('spotlight_invite'),
          intro_call_invite: events.includes('intro_call_invite')
        });
        setActivationError(null);
      } catch (error) {
        const err = error as Error;
        console.warn('Community activation events unavailable:', err);
        const message = err.message?.toLowerCase().includes('does not exist')
          ? 'Community activation tracking is missing. Run docs/admin-dashboard-v2.sql to enable it.'
          : err.message?.toLowerCase().includes('permission')
            ? 'Community activation tracking is blocked by RLS policies. Run docs/admin-dashboard-v2.sql.'
            : 'Community activation tracking could not be loaded.';
        setActivationError(message);
      }
    };

    void loadActivationEvents();
  }, [user]);

  const sendActivationEmail = async (eventType: 'welcome' | 'spotlight_invite' | 'intro_call_invite') => {
    if (!user || activationLoading) return;

    const displayName = profile?.full_name || user.user_metadata?.full_name || user.email || 'Member';
    const recipient = user.email || profile?.email;

    if (!recipient) {
      toast.error('An email address is required to send this invite.');
      return;
    }

    setActivationLoading(true);
    setActivationError(null);
    try {
      const result = eventType === 'welcome'
        ? await EmailAutomationService.onCommunityActivationWelcome(recipient, displayName)
        : eventType === 'spotlight_invite'
          ? await EmailAutomationService.onMemberSpotlightInvite(recipient, displayName)
          : await EmailAutomationService.onIntroCallInvite(recipient, displayName);

      if (!result?.success) {
        toast.error(result?.error ? `Invite could not be sent: ${result.error}` : 'Invite could not be sent.');
        return;
      }

      const { error } = await supabase.from('community_activation_events').insert({
        user_id: user.id,
        event_type: eventType
      });

      if (error) {
        const message = error.message?.toLowerCase().includes('does not exist')
          ? 'Activation tracking table is missing. Run docs/admin-dashboard-v2.sql to create it.'
          : error.message?.toLowerCase().includes('permission')
            ? 'Activation tracking is blocked by RLS policies. Run docs/admin-dashboard-v2.sql.'
            : 'Activation tracking could not be updated. Confirm docs/admin-dashboard-v2.sql is applied.';
        setActivationError(message);
        toast.error('Invite sent but could not be logged.');
        return;
      }

      setActivationEvents((current) => ({ ...current, [eventType]: true }));
      setActivationError(null);
      toast.success('Invite sent.');
    } catch (error) {
      console.error('Community activation email failed:', error);
      toast.error('Invite could not be sent.');
    } finally {
      setActivationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Member'}! 👋
        </h1>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
            {isPaidMember
              ? 'Your paid dashboard is unlocked with premium profile access and direct opportunity applications.'
              : 'Build your visibility, complete your profile, and unlock premium opportunities.'}
          </p>
          <div
            className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${
              isPaidMember
                ? 'border-[var(--sp-accent)]/40 bg-[var(--sp-accent)]/15 text-[var(--sp-accent)] shadow-lg shadow-[var(--sp-accent)]/10'
                : 'border-white/10 bg-white/5 text-[var(--text-secondary)]'
            }`}
          >
            <Shield size={14} className={isPaidMember ? 'text-[var(--sp-accent)]' : 'text-[var(--text-secondary)]'} />
            {isPaidMember ? membershipBadgeLabel : 'Community Member'}
          </div>
        </div>
        {/* Top-Level Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--sp-accent)]/10 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-[var(--sp-accent)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Opportunities</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{opportunities.length || 12}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Events</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">3</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Rating</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">4.8</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Recommended Opportunities */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Open Opportunities</h2>
                <button 
                  onClick={() => navigate('/opportunities')}
                  className="text-[var(--sp-accent)] hover:underline text-sm flex items-center gap-1"
                >
                  View all opportunities <ArrowRight size={16} />
                </button>
              </div>
              <div className="space-y-6">
                {opportunities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center glass-light rounded-xl border border-[var(--sp-accent)]/20 border-dashed">
                    <div className="w-16 h-16 rounded-full bg-[var(--sp-accent)]/10 flex items-center justify-center mb-4">
                       <Target size={32} className="text-[var(--sp-accent)]" />
                    </div>
                    <p className="text-lg font-bold text-[var(--text-primary)] mb-2">No live opportunities yet</p>
                    <p className="text-sm text-[var(--text-secondary)] max-w-[300px] mb-6">New projects will appear here as soon as the admin team publishes them.</p>
                    <button onClick={() => navigate('/opportunities')} className="sp-btn-primary py-2 px-6">Open Opportunities Dashboard</button>
                  </div>
                ) : (
                  opportunities.slice(0, 3).map((opp) => (
                    <div 
                      key={opp.id} 
                      className="glass-light p-6 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                      onClick={() => navigate('/opportunities')}
                    >
                      <h3 className="font-bold text-[var(--text-primary)] mb-2">{opp.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">{opp.org}</p>
                      <p className="text-xs text-[var(--text-secondary)] opacity-80 mb-4">{opp.location}</p>
                      <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{opp.description || 'Open the opportunities dashboard to see full project details.'}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-xs font-medium">
                          {opp.sector}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                          {opp.type}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {opportunities.length > 0 && (
                <p className="mt-4 text-xs text-[var(--text-secondary)]">
                  Members can browse all posted projects from the Opportunities dashboard and apply there.
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-8">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-8">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <button 
                  onClick={() => navigate(editPath)}
                  className="flex flex-col items-center gap-4 p-8 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <Upload size={24} className="text-[var(--sp-accent)]" />
                  <span className="text-sm text-[var(--text-secondary)] font-medium">Update CV</span>
                </button>
                <button 
                  onClick={() => {
                    const url = window.location.origin + '/profile/' + user?.id;
                    navigator.clipboard.writeText(url);
                    toast.success('Profile link copied!');
                  }}
                  className="flex flex-col items-center gap-4 p-8 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <Share2 size={24} className="text-[var(--sp-accent)]" />
                  <span className="text-sm text-[var(--text-secondary)] font-medium">Share Profile</span>
                </button>
                <button 
                  onClick={() => navigate('/opportunities')}
                  className="flex flex-col items-center gap-4 p-8 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <Briefcase size={24} className="text-[var(--sp-accent)]" />
                  <span className="text-sm text-[var(--text-secondary)] font-medium">Find Work</span>
                </button>
                <button 
                  onClick={() => navigate(editPath)}
                  className="flex flex-col items-center gap-4 p-8 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <Settings size={24} className="text-[var(--sp-accent)]" />
                  <span className="text-sm text-[var(--text-secondary)] font-medium">Settings</span>
                </button>
              </div>
            </div>

            {/* Next Steps / Gamification */}
            {actionItems.length > 0 ? (
              <div className="glass-card p-8 border-l-4 border-orange-500">
                <h4 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Target className="text-orange-500" size={18} />
                  Next Steps to Improve Match Score
                </h4>
                <div className="space-y-3">
                  {actionItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between glass-light p-4 rounded-xl transition-all hover:bg-white/5 cursor-pointer group" onClick={() => navigate(item.actionPath)}>
                      <div className="flex items-center gap-4">
                        <div className="w-5 h-5 rounded-full border-2 border-[var(--text-secondary)] flex-shrink-0 group-hover:border-[var(--sp-accent)] transition-colors" />
                        <div>
                           <p className="font-medium text-[var(--text-primary)] text-sm group-hover:text-[var(--sp-accent)] transition-colors">{item.title}</p>
                           <p className="text-xs text-[var(--sp-accent)] font-bold mt-1">+{item.reward}% Match Score</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--sp-accent)] group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-card p-8 border-l-4 border-[var(--sp-accent)]">
                <h4 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Zap className="text-[var(--sp-accent)]" size={18} />
                  Pro Tip
                </h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Your profile is highly optimized! Profiles with verified skills get 3x more visibility from high-value opportunities. Consider taking a skill assessment today!
                </p>
              </div>
            )}
            {/* Upcoming Events */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Upcoming Events</h2>
                <button 
                  onClick={() => toast.success('Events coming soon!')}
                  className="text-[var(--sp-accent)] hover:underline text-sm flex items-center gap-1"
                >
                  View all <ArrowRight size={16} />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Global Tech Summit', date: 'Oct 15, 2024', location: 'Remote', attendees: 120 },
                  { title: 'Founder Networking Mixer', date: 'Oct 22, 2024', location: 'Nairobi', attendees: 45 }
                ].map((event, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between glass-light p-4 rounded-xl border border-white/5 hover:border-[var(--sp-accent)]/30 transition-all">
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)] mb-1">{event.title}</h4>
                      <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {event.date}</span>
                        <span className="flex items-center gap-1"><Globe size={12} /> {event.location}</span>
                        <span className="flex items-center gap-1"><Users size={12} /> {event.attendees} attending</span>
                      </div>
                    </div>
                    <button onClick={() => toast.success(`RSVP confirmed for ${event.title}`)} className="sp-btn-glass text-xs py-2 px-4 mt-3 md:mt-0 whitespace-nowrap">
                      RSVP Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-10">
            {isPaidMember ? (
              <div className="glass-card p-6 border border-[var(--sp-accent)]/30 bg-[linear-gradient(135deg,rgba(200,159,94,0.16),rgba(8,28,40,0.92))]">
                <h4 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Shield className="text-[var(--sp-accent)]" size={18} />
                  Paid Member Access
                </h4>
                <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 w-4 h-4 text-[var(--sp-accent)] flex-shrink-0" />
                    <span>Your dashboard is now optimized for direct applications, premium visibility, and member-only tools.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 w-4 h-4 text-[var(--sp-accent)] flex-shrink-0" />
                    <span>Keep your premium profile current so match scoring and opportunity recommendations stay strong.</span>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3">
                  <button onClick={() => navigate('/opportunities')} className="sp-btn-primary w-full">
                    Browse Premium Opportunities
                  </button>
                  <button onClick={() => navigate('/profile/edit')} className="sp-btn-glass w-full">
                    Refine Premium Profile
                  </button>
                </div>
              </div>
            ) : (
             <div className="glass-card p-6 border-t-4 border-blue-500">
                <h4 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Heart className="text-blue-400" size={18} />
                  Community Activation
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {activationEvents.welcome ? (
                      <CheckCircle className="text-green-400 w-5 h-5 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--text-secondary)] flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <span className={`text-sm ${activationEvents.welcome ? 'text-[var(--text-primary)] line-through opacity-70' : 'text-[var(--text-primary)]'}`}>
                        Welcome to Strategic Pathways
                      </span>
                      {!activationEvents.welcome && (
                        <button
                          onClick={() => sendActivationEmail('welcome')}
                          disabled={activationLoading}
                          className="ml-2 text-xs text-[var(--sp-accent)] hover:underline disabled:opacity-60"
                        >
                          Send welcome email
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {activationEvents.spotlight_invite ? (
                      <CheckCircle className="text-green-400 w-5 h-5 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--text-secondary)] flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <span className={`text-sm ${activationEvents.spotlight_invite ? 'text-[var(--text-primary)] line-through opacity-70' : 'text-[var(--text-primary)]'}`}>
                        Member Spotlight Invitation
                      </span>
                      {!activationEvents.spotlight_invite && (
                        <button
                          onClick={() => sendActivationEmail('spotlight_invite')}
                          disabled={activationLoading}
                          className="ml-2 text-xs text-[var(--sp-accent)] hover:underline disabled:opacity-60"
                        >
                          Send invite
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {activationEvents.intro_call_invite ? (
                      <CheckCircle className="text-green-400 w-5 h-5 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--text-secondary)] flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <span className={`text-sm ${activationEvents.intro_call_invite ? 'text-[var(--text-primary)] line-through opacity-70' : 'text-[var(--text-primary)]'}`}>
                        Introductory Call Invite
                      </span>
                      {!activationEvents.intro_call_invite && (
                        <button
                          onClick={() => sendActivationEmail('intro_call_invite')}
                          disabled={activationLoading}
                          className="ml-2 text-xs text-[var(--sp-accent)] hover:underline disabled:opacity-60"
                        >
                          Send invite
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {activationError && (
                  <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                    <p className="text-xs text-amber-50/90">{activationError}</p>
                  </div>
                )}
             </div>
            )}

            {/* Match Score */}
            <div className="glass-card p-6">
              <MatchScoreBreakdown
                total={matchScores?.total || 0}
                items={[
                  { label: 'Sector Match (25%)', value: matchScores?.sectorMatch || 0, max: 25, tip: 'Based on your primary sector alignment with our network.' },
                  { label: 'Functional Skill (25%)', value: matchScores?.functionalSkill || 0, max: 25, tip: 'Reflects the depth and verify-status of your professional skills.' },
                  { label: 'Geo Relevance (15%)', value: matchScores?.geoRelevance || 0, max: 15, tip: 'Measures your location readiness and remote preferences.' },
                  { label: 'Experience Prep (15%)', value: matchScores?.experiencePrep || 0, max: 15, tip: 'Evaluates your years of experience and past projects.' },
                  { label: 'Intent Overlay (20%)', value: matchScores?.intentOverlay || 0, max: 20, tip: 'Your engagement style matching the market demand.' }
                ]}
              />
            </div>

            {isPaidMember ? (
              <div className="glass-card p-6 border border-emerald-500/30">
                <h4 className="font-bold text-[var(--text-primary)] mb-3">Paid Member Badge</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Your paid status is highlighted here so premium account access is clearly different from Community accounts.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  <Shield size={14} />
                  {membershipBadgeLabel}
                </div>
              </div>
            ) : (
              <div className="glass-card p-6 border border-[var(--sp-accent)]/30">
                <h4 className="font-bold text-[var(--text-primary)] mb-3">Premium Unlock</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Complete your Premium profile to unlock institutional matching and detailed skill indexing.
                </p>
                <button 
                  onClick={() => navigate('/pricing')}
                  className="sp-btn-primary w-full"
                >
                  Upgrade to Premium
                </button>
              </div>
            )}

            {/* Membership Info */}
            <div className="glass-card p-6">
              <h4 className="font-bold text-[var(--text-primary)] mb-4">Membership</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Member Since</span>
                  <span className="text-sm text-[var(--text-primary)] font-medium">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2024'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Tier</span>
                  <span className={`text-sm font-medium ${isPaidMember ? 'text-[var(--sp-accent)]' : 'text-[var(--text-primary)]'}`}>
                    {profile?.tier || 'Community'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Verification</span>
                  <span className="text-sm text-[var(--text-primary)] font-medium">{profile?.verification_tier || 'Self-Declared'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Status</span>
                  <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold">Active</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-[var(--text-primary)]">Skills</h4>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {(profile?.expertise || ['Strategy', 'Operations', 'Finance']).slice(0, 5).map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-xs flex items-center gap-1">
                    {skill}
                    {i < 2 && <CheckCircle size={12} className="text-green-400" />}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(editPath)}
                  className="sp-btn-glass text-sm w-full"
                >
                  Manage
                </button>
                <button 
                  onClick={() => toast.success('Verification requested.')}
                  className="sp-btn-primary text-sm w-full flex items-center justify-center gap-1 px-0"
                >
                  <Shield size={14} /> Verify
                </button>
              </div>
            </div>

            {/* Referrals */}
            <div className="glass-card p-6">
              <h4 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Gift className="text-[var(--sp-accent)]" size={18} />
                Refer & Earn
              </h4>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Total Referrals</span>
                  <span className="text-[var(--text-primary)] font-bold">{referralStats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Active</span>
                  <span className="text-green-400 font-bold">{referralStats.active}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  toast.success('Referral link copied!');
                }}
                className="sp-btn-primary text-sm w-full flex items-center justify-center gap-2"
              >
                <Copy size={14} />
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
