import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface PricingSectionProps {
  className?: string;
}

const PricingSection = ({ className = '' }: PricingSectionProps) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const ensureProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, tier')
        .eq('id', user.id)
        .single();

      if (!data) {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          tier: 'Community',
          profile_type: 'Standard Member',
          updated_at: new Date().toISOString(),
        });
        setCurrentTier('Community');
        return;
      }
      if (data?.tier) {
        setCurrentTier(data.tier);
      }
    };
    ensureProfile();
  }, [user]);

  const tiers = [
    {
      id: 'community',
      name: 'Community (3)',
      price: 'Free',
      period: '',
      description: 'Core profile features/Community access/Learning & insights',
      cta: 'Free to Join',
      featured: false
    },
    {
      id: 'professional',
      name: 'Professional (6)',
      price: '$100/year',
      period: '(or $10/month)',
      description: 'Advanced professional profile/Opportunity access/Collaboration tools/Income opportunities/Professional development/Analytics & personal insights',
      cta: 'Choose Professional (Coming Soon)',
      featured: true
    },
    {
      id: 'firm',
      name: 'Partners (7)',
      price: 'Custom',
      period: '',
      description: 'Talent access/Opportunity posting/Team assembly/Project execution support/Branding & visibility/Ecosystem intelligence/Custom programs',
      cta: 'Contact Us (Coming Soon)',
      featured: false
    }
  ];

  const getPoints = (text: string) =>
    text
      .split('/')
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSelectTier = async (tierId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsProcessing(tierId);

    try {
      if (tierId === 'community') {
        const { error } = await supabase
          .from('profiles')
          .update({
            tier: 'Community',
            profile_type: 'Standard Member',
            onboarding_completed: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;
        navigate('/onboarding/basic');
        return;
      }

      if (tierId === 'professional' || tierId === 'firm') {
        toast.info('Paystack integration is coming soon. Please contact the team for manual payment support.');
        return;
      }

      const targetTier = tierId === 'professional' ? 'professional' : 'firm';
      navigate(`/payment?tier=${targetTier}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to select plan.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <section
      id="pricing"
      className={`bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-72 h-72 bg-[var(--sp-accent)]/12 blur-3xl rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-[#0b2a3c]/40 blur-3xl rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20 relative z-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Membership that fits
          </h2>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl mx-auto">
            Start free. Upgrade when you are ready to win, work and grow.
          </p>
        </div>

        <div className="mt-10 lg:mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3 items-stretch">
          {tiers.map((tier) => {
            const isCurrent =
              !!user &&
              !!currentTier &&
              ((tier.id === 'community' && currentTier === 'Community') ||
                (tier.id === 'professional' && currentTier === 'Professional') ||
                (tier.id === 'firm' && (currentTier === 'Firm' || currentTier === 'Custom')));

            return (
            <div
              key={tier.id}
              className={`rounded-2xl border shadow-md transition-transform duration-200 hover:-translate-y-1 ${
                tier.featured
                  ? 'border-[var(--sp-accent)]/60 glass-card backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.25)]'
                  : 'glass-light border-transparent shadow-none'
              }`}
            >
              {tier.featured && (
                <div className="flex items-center justify-center gap-2 text-[var(--sp-accent)] font-semibold text-xs uppercase tracking-wide bg-[var(--sp-accent)]/10 border-b border-[var(--sp-accent)]/40 rounded-t-2xl px-4 py-2">
                  <Star size={14} className="fill-current" />
                  Vetted Membership
                </div>
              )}

              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className={`text-xl font-semibold ${tier.featured ? 'text-[var(--sp-accent)]' : 'text-[var(--text-primary)]'}`}>
                    {tier.name}
                  </h3>
                  {isCurrent && (
                    <span className="mt-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--sp-accent)] bg-[var(--sp-accent)]/10 border border-[var(--sp-accent)]/30 px-2.5 py-1 rounded-full">
                      Current plan
                    </span>
                  )}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-[var(--text-secondary)] text-sm">{tier.period}</span>}
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-[var(--text-secondary)] flex-1">
                  {getPoints(tier.description).map((point, index) => (
                    <li key={`${tier.id}-${index}`} className="flex items-start gap-3">
                      <span className="mt-[2px] rounded-full bg-[var(--sp-accent)]/15 text-[var(--sp-accent)] p-1">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </span>
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectTier(tier.id)}
                  disabled={isProcessing === tier.id || isCurrent}
                  className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-colors disabled:opacity-60 ${
                    tier.featured
                      ? 'bg-[var(--sp-accent)] text-[var(--bg-primary)] hover:bg-[#e5c285]'
                      : 'sp-btn-secondary border-transparent'
                  }`}
                >
                  {isCurrent ? 'Current plan' : tier.cta}
                  {tier.featured && <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          )})}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
