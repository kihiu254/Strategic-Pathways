import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Star, ArrowRight, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

interface PricingSectionProps {
  className?: string;
}

const PricingSection = ({ className = '' }: PricingSectionProps) => {
  const { t } = useTranslation();
  
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', organization: '' });

  const handleJoinClick = (tier: string) => {
    setSelectedTier(tier);
    setJoinDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Save to Database
      const { error: dbError } = await supabase
        .from('partner_inquiries')
        .insert([
          { 
            name: formData.name, 
            email: formData.email, 
            organization: formData.organization, 
            message: `Join Request for ${selectedTier} Tier`
          }
        ]);

      if (dbError) throw dbError;

      // 2. Trigger Email Notification (soft-fail in local/dev)
      let emailError: string | null = null;
      try {
        const response = await fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'partner_inquiry',
            data: {
              ...formData,
              message: `Join Request for ${selectedTier} Tier`
            }
          })
        });

        if (!response.ok) {
          // In local Vite dev the API route does not exist (404) – log but don't block UX.
          if (response.status !== 404) {
            const errorData = await response.json().catch(() => ({}));
            emailError = errorData.error || `Email service error (${response.status})`;
          } else {
            emailError = 'Email service unavailable in this environment.';
          }
        }
      } catch (err: any) {
        emailError = err?.message || 'Email service unreachable.';
      }

      toast.success(t('pricing.dialog.success', { tier: selectedTier }));
      if (emailError) {
        toast.warning(emailError);
        console.warn('[pricing] email send warning:', emailError);
      }
      setJoinDialogOpen(false);
      setFormData({ name: '', email: '', organization: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tiers = [
    {
      name: t('pricing.tiers.community.name'),
      price: t('pricing.tiers.community.price'),
      period: '',
      description: t('pricing.tiers.community.description'),
      features: t('pricing.tiers.community.features', { returnObjects: true }) as string[],
      cta: t('pricing.tiers.community.cta'),
      featured: false
    },
    {
      name: t('pricing.tiers.professional.name'),
      price: t('pricing.tiers.professional.price'),
      period: t('pricing.tiers.professional.period'),
      description: t('pricing.tiers.professional.description'),
      features: t('pricing.tiers.professional.features', { returnObjects: true }) as string[],
      cta: t('pricing.tiers.professional.cta'),
      featured: true
    },
    {
      name: t('pricing.tiers.firm.name'),
      price: t('pricing.tiers.firm.price'),
      period: '',
      description: t('pricing.tiers.firm.description'),
      features: t('pricing.tiers.firm.features', { returnObjects: true }) as string[],
      cta: t('pricing.tiers.firm.cta'),
      featured: false
    }
  ];

  return (
    <section
      id="pricing"
      className={`bg-[var(--bg-primary)] text-white relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-72 h-72 bg-[var(--sp-accent)]/12 blur-3xl rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-[#0b2a3c]/40 blur-3xl rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20 relative z-10">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sp-accent)] bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            {t('pricing.recommended')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {t('pricing.headline')}
          </h2>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl mx-auto">
            {t('pricing.subheadline')}
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/80">
            <Check className="w-4 h-4 text-[var(--sp-accent)]" />
            {t('pricing.tiers.professional.description')}
          </div>
        </div>

        <div className="mt-10 lg:mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border shadow-md transition-transform duration-200 hover:-translate-y-1 ${
                tier.featured
                  ? 'border-[var(--sp-accent)]/60 bg-white/10 backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.25)]'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              {tier.featured && (
                <div className="flex items-center justify-center gap-2 text-[var(--sp-accent)] font-semibold text-xs uppercase tracking-wide bg-[var(--sp-accent)]/10 border-b border-[var(--sp-accent)]/40 rounded-t-2xl px-4 py-2">
                  <Star size={14} className="fill-current" />
                  {t('pricing.recommended')}
                </div>
              )}

              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className={`text-xl font-semibold ${tier.featured ? 'text-[var(--sp-accent)]' : 'text-white'}`}>
                    {tier.name}
                  </h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-white/60 text-sm">{tier.period}</span>}
                  </div>
                  <p className="text-white/70 text-sm mt-3 leading-relaxed">{tier.description}</p>
                </div>

                <ul className="space-y-3 text-sm text-white/80 flex-1">
                  {tier.features.map((feature, index) => (
                    <li key={`${tier.name}-${index}`} className="flex items-start gap-3">
                      <span className="mt-[2px] rounded-full bg-[var(--sp-accent)]/15 text-[var(--sp-accent)] p-1">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </span>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleJoinClick(tier.name)}
                  className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-colors ${
                    tier.featured
                      ? 'bg-[var(--sp-accent)] text-gray-900 hover:bg-[#e5c285]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {tier.cta}
                  {tier.featured && <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/3 px-6 py-4 text-sm text-white/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--sp-accent)]/15 text-[var(--sp-accent)] grid place-items-center font-bold">SP</div>
            <div>
              <p className="font-semibold text-white">Need something tailored?</p>
              <p className="text-white/70">We’ll customise team onboarding, governance, and billing.</p>
            </div>
          </div>
          <button
            onClick={() => handleJoinClick(t('pricing.tiers.firm.name'))}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 border border-[var(--sp-accent)]/60 text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/10"
          >
            Talk to us
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Join Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="bg-[var(--bg-primary)] border border-white/10 text-[var(--text-primary)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="text-[var(--sp-accent)]" />
              {t('pricing.dialog.title')}
            </DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              {t('pricing.dialog.description', { tier: selectedTier })}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name" className="text-[var(--text-primary)]">{t('pricing.dialog.nameLabel')}</Label>
              <Input 
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                placeholder={t('pricing.dialog.nameLabel')}
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-[var(--text-primary)]">{t('pricing.dialog.emailLabel')}</Label>
              <Input 
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/5 border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                placeholder={t('pricing.dialog.emailLabel')}
                required
              />
            </div>
            <div>
              <Label htmlFor="organization" className="text-[var(--text-primary)]">{t('pricing.dialog.orgLabel')}</Label>
              <Input 
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="bg-white/5 border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                placeholder={t('pricing.dialog.orgLabel')}
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="sp-btn-primary w-full disabled:opacity-50">
              {isSubmitting ? t('contact.labels.submitting') : t('pricing.dialog.submit')}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PricingSection;
