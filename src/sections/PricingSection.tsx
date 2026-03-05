import { useRef, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Star, ArrowRight, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

interface PricingSectionProps {
  className?: string;
}

const PricingSection = ({ className = '' }: PricingSectionProps) => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', organization: '' });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 0.6,
        }
      });

      // ENTRANCE (0-30%)
      scrollTl
        .fromTo(headlineRef.current,
          { y: '-10vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0
        );
      
      if (card1Ref.current) {
        scrollTl.fromTo(card1Ref.current,
          { y: '90vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0
        );
      }
      
      if (card2Ref.current) {
        scrollTl.fromTo(card2Ref.current,
          { y: '90vh', scale: 0.94, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, ease: 'none' },
          0.05
        );
      }
      
      if (card3Ref.current) {
        scrollTl.fromTo(card3Ref.current,
          { y: '90vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.1
        );
      }

      // SETTLE (30-70%): Hold positions

      // EXIT (70-100%)
      scrollTl
        .to(headlineRef.current,
          { y: '-6vh', opacity: 0, ease: 'power2.in' },
          0.7
        );
      
      if (card1Ref.current) {
        scrollTl.to(card1Ref.current,
          { y: '12vh', opacity: 0, ease: 'power2.in' },
          0.7
        );
      }
      
      if (card2Ref.current) {
        scrollTl.to(card2Ref.current,
          { y: '10vh', scale: 0.98, opacity: 0, ease: 'power2.in' },
          0.7
        );
      }
      
      if (card3Ref.current) {
        scrollTl.to(card3Ref.current,
          { y: '12vh', opacity: 0, ease: 'power2.in' },
          0.7
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleJoinClick = (tier: string) => {
    setSelectedTier(tier);
    setJoinDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          message: `Join Request for ${selectedTier} Tier`
        })
      });

      if (!response.ok) throw new Error('Failed to send request');

      toast.success(t('pricing.dialog.success', { tier: selectedTier }));
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
      featured: false,
      ref: card1Ref
    },
    {
      name: t('pricing.tiers.professional.name'),
      price: t('pricing.tiers.professional.price'),
      period: t('pricing.tiers.professional.period'),
      description: t('pricing.tiers.professional.description'),
      features: t('pricing.tiers.professional.features', { returnObjects: true }) as string[],
      cta: t('pricing.tiers.professional.cta'),
      featured: true,
      ref: card2Ref
    },
    {
      name: t('pricing.tiers.firm.name'),
      price: t('pricing.tiers.firm.price'),
      period: '',
      description: t('pricing.tiers.firm.description'),
      features: t('pricing.tiers.firm.features', { returnObjects: true }) as string[],
      cta: t('pricing.tiers.firm.cta'),
      featured: false,
      ref: card3Ref
    }
  ];

  return (
    <section 
      ref={sectionRef}
      id="pricing"
      className={`sp-section-pinned bg-[var(--bg-primary)] ${className}`}
    >
      <div className="w-full h-full flex flex-col items-center justify-center px-6 lg:px-12 pt-20">
        {/* Headline */}
        <div ref={headlineRef} className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--text-primary)] mb-3">
            {t('pricing.headline')}
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            {t('pricing.subheadline')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="relative w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              ref={tier.ref}
              className={`relative rounded-3xl p-6 lg:p-8 flex flex-col ${
                tier.featured 
                  ? 'bg-[var(--bg-primary)] border-2 border-[var(--sp-accent)] md:-mt-4 md:mb-4' 
                  : 'bg-[var(--bg-primary)]/60 border border-white/10'
              }`}
            >
              {/* Featured Badge */}
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[var(--sp-accent)] text-[var(--text-inverse)] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star size={12} />
                    {t('pricing.recommended')}
                  </span>
                </div>
              )}

              {/* Tier Header */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                    {tier.price}
                  </span>
                  <span className="text-[var(--text-secondary)]">{tier.period}</span>
                </div>
                <p className="text-[var(--text-secondary)] text-sm mt-1">{tier.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[var(--sp-accent)] flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button 
                onClick={() => handleJoinClick(tier.name)}
                className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  tier.featured
                    ? 'bg-[var(--sp-accent)] text-[var(--text-inverse)] hover:shadow-lg hover:shadow-[#C89F5E]/20'
                    : 'bg-white/10 text-[var(--text-primary)] hover:bg-white/15'
                }`}
              >
                {tier.cta}
                {tier.featured && <ArrowRight size={18} />}
              </button>
            </div>
          ))}
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
