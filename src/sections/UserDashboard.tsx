import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { calculateDynamicMatchScore } from '../utils/matchScoring';
import type { MatchScores } from '../utils/matchScoring';
import { rankOpportunities, MOCK_OPPORTUNITIES } from '../utils/opportunities';
import { 
  TrendingUp, Users, Calendar, Award, Target, Briefcase, 
  CheckCircle, Clock, Star, ArrowRight, Zap, Globe, Heart, Gift, Copy, Share2,
  FileText, Settings, Upload, ExternalLink, Shield
} from 'lucide-react';
import { toast } from 'sonner';

const UserDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [referralStats, setReferralStats] = useState({ total: 0, active: 0, rewards: 0 });
  const [matchScores, setMatchScores] = useState<MatchScores | null>(null);
  const [actionItems, setActionItems] = useState<{title: string, reward: number, actionPath: string}[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      setProfile(profileData);

      setProfile(profileData);

      const refCode = user?.id?.substring(0, 8) || 'demo';
      setReferralLink(`https://strategicpathways.co.ke/signup?ref=${refCode}`);

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
          const userSkills = skillsData?.map(s => s.skill_name) || [];

          const ranked = rankOpportunities(MOCK_OPPORTUNITIES, userSkills, profileData?.sector || profileData?.primarySector);
          setOpportunities(ranked.slice(0, 2).map((opp: any) => ({
            ...opp,
            match: opp.score ? Math.min(99, opp.score * 10) : 80,
            sector: opp.tags[0],
            type: opp.tags[1]
          })));

        } catch (e) {
          console.error("Error fetching dependencies for match score:", e);
        }
      }

      setMatchScores(calculateDynamicMatchScore(profileData, skillsCount, projectsCount, hasCV));

      // Calculate Next Steps
      const items: {title: string; reward: number; actionPath: string}[] = [];
      if (!hasCV) items.push({ title: 'Upload your CV', reward: 7, actionPath: '/profile/edit' });
      if (skillsCount < 3) items.push({ title: 'Add professional skills', reward: 6, actionPath: '/profile/edit' });
      if (projectsCount === 0) items.push({ title: 'Showcase past projects', reward: 5, actionPath: '/profile' });
      if (!profileData?.sector && !profileData?.primarySector) items.push({ title: 'Define your primary sector', reward: 10, actionPath: '/profile/edit' });
      if (!profileData?.bio) items.push({ title: 'Add a professional bio', reward: 5, actionPath: '/profile/edit' });
      
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
      } catch (e) {
        setReferralStats({ total: 0, active: 0, rewards: 0 });
      }

    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const profileCompletion = profile?.profile_completion_percentage || 0;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Member'}! 👋
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Recommended Opportunities */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Recommended for You</h2>
                <button 
                  onClick={() => navigate('/opportunities')}
                  className="text-[var(--sp-accent)] hover:underline text-sm flex items-center gap-1"
                >
                  View all matches <ArrowRight size={16} />
                </button>
              </div>
              <div className="space-y-6">
                {opportunities.map(opp => (
                  <div 
                    key={opp.id} 
                    className="glass-light p-6 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                    onClick={() => navigate('/opportunities')}
                  >
                    <h3 className="font-bold text-[var(--text-primary)] mb-2">{opp.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">{opp.org}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-xs font-medium">
                        {opp.sector}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                        {opp.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-8">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-8">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <button 
                  onClick={() => navigate('/profile/edit')}
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
                  onClick={() => navigate('/profile/edit')}
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
                    <div key={i} className="flex items-center justify-between glass-light p-4 rounded-xl transition-all hover:bg-white/5">
                      <div>
                         <p className="font-medium text-[var(--text-primary)] text-sm">{item.title}</p>
                         <p className="text-xs text-[var(--sp-accent)] font-bold mt-1">+{item.reward}% Match Score</p>
                      </div>
                      <button onClick={() => navigate(item.actionPath)} className="sp-btn-glass text-xs py-1.5 px-3 rounded-lg border border-[var(--sp-accent)]/30 hover:bg-[var(--sp-accent)]/10 text-[var(--sp-accent)]">
                        Do it now
                      </button>
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
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-10">
            {/* Match Score */}
            <div className="glass-card p-6">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-[var(--sp-accent)] mb-2">{matchScores?.total || 0}%</div>
                <p className="text-sm text-[var(--text-secondary)]">Match Score</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Sector Match (25%)', value: matchScores?.sectorMatch || 0, max: 25 },
                  { label: 'Functional Skill (25%)', value: matchScores?.functionalSkill || 0, max: 25 },
                  { label: 'Geo Relevance (15%)', value: matchScores?.geoRelevance || 0, max: 15 },
                  { label: 'Experience Prep (15%)', value: matchScores?.experiencePrep || 0, max: 15 },
                  { label: 'Intent Overlay (20%)', value: matchScores?.intentOverlay || 0, max: 20 }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--text-secondary)]">{item.label}</span>
                      <span className="text-[var(--text-primary)] font-bold">{Math.round((item.value / item.max) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--sp-accent)] rounded-full transition-all duration-1000"
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Unlock */}
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
                  <span className="text-sm text-[var(--text-primary)] font-medium">{profile?.tier || 'Community'}</span>
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
                  onClick={() => navigate('/profile/edit')}
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
