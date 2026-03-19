import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Share2, Copy, Mail, Users, Gift, Award, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';

const ReferralsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [copied, setCopied] = useState(false);

  const referralCode = user?.id?.slice(0, 8).toUpperCase() || 'SPXXXXXX';
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareEmail = () => {
    const subject = 'Join Strategic Pathways - Connect with Global Professionals';
    const body = `I'm using Strategic Pathways to connect with study-abroad returnees, diaspora returnees, diaspora professionals, and high-impact opportunities. Join me using my referral link: ${referralLink}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
      <SEO title="Referral Program" />
      
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Refer & Earn Rewards
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Invite professionals to join Strategic Pathways and earn rewards when they sign up
          </p>
        </div>

        {/* Referral Link Card */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-[var(--sp-accent)]/10">
              <Share2 className="text-[var(--sp-accent)]" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Your Referral Link</h2>
              <p className="text-sm text-[var(--text-secondary)]">Share this link with your network</p>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="input-glass flex-1 px-4 py-3"
            />
            <button
              onClick={handleCopyLink}
              className="sp-btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <button
            onClick={handleShareEmail}
            className="sp-btn-glass w-full flex items-center justify-center gap-2"
          >
            <Mail size={18} />
            Share via Email
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--sp-accent)]/10 flex items-center justify-center mx-auto mb-4">
              <Users className="text-[var(--sp-accent)]" size={24} />
            </div>
            <div className="text-3xl font-bold text-[var(--text-primary)] mb-2">0</div>
            <div className="text-sm text-[var(--text-secondary)]">Referrals</div>
          </div>

          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-400" size={24} />
            </div>
            <div className="text-3xl font-bold text-[var(--text-primary)] mb-2">0</div>
            <div className="text-sm text-[var(--text-secondary)]">Successful Sign-ups</div>
          </div>

          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <Gift className="text-purple-400" size={24} />
            </div>
            <div className="text-3xl font-bold text-[var(--text-primary)] mb-2">0</div>
            <div className="text-sm text-[var(--text-secondary)]">Rewards Earned</div>
          </div>
        </div>

        {/* How It Works */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--sp-accent)]/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-[var(--sp-accent)]">
                1
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">Share Your Link</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Copy your unique referral link and share it with professionals in your network
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--sp-accent)]/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-[var(--sp-accent)]">
                2
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">They Sign Up</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                When someone joins using your link and completes their profile
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--sp-accent)]/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-[var(--sp-accent)]">
                3
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">Earn Rewards</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Get exclusive benefits and priority access to opportunities
              </p>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Award className="text-[var(--sp-accent)]" size={24} />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Referral Rewards</h2>
          </div>

          <div className="space-y-4">
            <div className="glass-light p-4 rounded-xl flex items-start gap-4">
              <CheckCircle className="text-green-400 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-[var(--text-primary)] mb-1">Priority Matching</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Get priority in opportunity matching for every 3 successful referrals
                </p>
              </div>
            </div>

            <div className="glass-light p-4 rounded-xl flex items-start gap-4">
              <CheckCircle className="text-green-400 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-[var(--text-primary)] mb-1">Premium Features</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Unlock premium features when you refer 5 verified professionals
                </p>
              </div>
            </div>

            <div className="glass-light p-4 rounded-xl flex items-start gap-4">
              <CheckCircle className="text-green-400 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-[var(--text-primary)] mb-1">Community Recognition</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Become a Strategic Pathways Ambassador with 10+ referrals
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralsPage;
