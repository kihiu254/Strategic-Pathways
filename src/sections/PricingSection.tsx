import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Check, Star, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  formatMembershipAmount,
  getDefaultMembershipCurrency,
  getMembershipCurrencyOptions,
  getMembershipPlanDetails,
  launchMembershipCheckout,
  type MembershipCurrency,
  type MembershipTier,
} from '../lib/membershipCheckout';
import { GENERIC_PAYMENT_ERROR, getSafeErrorMessage } from '../lib/safeFeedback';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface PricingSectionProps {
  className?: string;
}

const PricingSection = ({ className = '' }: PricingSectionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const currencyOptions = getMembershipCurrencyOptions();
  const [selectedCurrency, setSelectedCurrency] = useState<MembershipCurrency>(getDefaultMembershipCurrency());
  const professionalPlan = getMembershipPlanDetails('professional', selectedCurrency);

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
    void ensureProfile();
  }, [user]);

  const tiers = [
    {
      id: 'community',
      name: t('pricing.tiers.community.name'),
      price: t('pricing.tiers.community.price'),
      period: '',
      description: t('pricing.tiers.community.description'),
      cta: t('pricing.tiers.community.cta'),
      featured: false
    },
    {
      id: 'professional',
      name: t('pricing.tiers.professional.name'),
      price: formatMembershipAmount(professionalPlan.currency, professionalPlan.amount),
      period: t('pricing.tiers.professional.billingPeriod'),
      description: t('pricing.tiers.professional.description'),
      cta: t('pricing.tiers.professional.cta'),
      featured: true
    },
    {
      id: 'firm',
      name: t('pricing.tiers.firm.name'),
      price: t('pricing.tiers.firm.price'),
      period: '',
      description: t('pricing.tiers.firm.description'),
      cta: t('pricing.tiers.firm.cta'),
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

      const targetTier = (tierId === 'professional' ? 'professional' : 'firm') as MembershipTier;
      await launchMembershipCheckout({
        tier: targetTier,
        currency: selectedCurrency,
        user,
        session,
      });
    } catch (error: unknown) {
      const errorMessage = getSafeErrorMessage(error, GENERIC_PAYMENT_ERROR);
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
            {t('pricing.headline')}
          </h2>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl mx-auto">
            {t('pricing.subheadline')}
          </p>
        </div>

        {currencyOptions.length > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2">
              {currencyOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setSelectedCurrency(option.code)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    option.code === selectedCurrency
                      ? 'bg-[var(--sp-accent)] text-[var(--bg-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 lg:mt-12 grid gap-4 lg:gap-6 md:grid-cols-3 items-stretch">
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
                    {t('pricing.vettedMembership')}
                  </div>
                )}

                <div className="p-6 sm:p-8 flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className={`text-xl font-semibold ${tier.featured ? 'text-[var(--sp-accent)]' : 'text-[var(--text-primary)]'}`}>
                      {tier.name}
                    </h3>
                    {isCurrent && (
                      <span className="mt-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--sp-accent)] bg-[var(--sp-accent)]/10 border border-[var(--sp-accent)]/30 px-2.5 py-1 rounded-full">
                        {t('pricing.currentPlan')}
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
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      void handleSelectTier(tier.id);
                    }}
                    disabled={isProcessing === tier.id || isCurrent}
                    className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-colors disabled:opacity-60 ${
                      tier.featured
                        ? 'bg-[var(--sp-accent)] text-[var(--bg-primary)] hover:bg-[#e5c285]'
                        : 'sp-btn-secondary border-transparent'
                    }`}
                  >
                    {isCurrent ? t('pricing.currentPlan') : tier.cta}
                    {tier.featured && <ArrowRight size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
