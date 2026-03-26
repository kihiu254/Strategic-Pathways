import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Target } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  className?: string;
}

const HeroSection = ({ className = '' }: HeroSectionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const heroSubtitle = t('hero.subtitle');
  const heroTagline = t('footer.tagline');
  const hasTagline = heroTagline && heroTagline !== 'footer.tagline';
  const heroHeadline = hasTagline ? heroTagline : t('hero.title');
  const heroBody = hasTagline ? t('hero.title') : heroSubtitle;

  // Auto-play entrance animation on load
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Initial states
      gsap.set(photoRef.current, { x: '-60vw', scale: 0.96, opacity: 0 });
      gsap.set(panelRef.current, { x: '60vw', opacity: 0 });
      gsap.set(labelRef.current, { y: 20, opacity: 0 });
      gsap.set(kickerRef.current, { y: 24, opacity: 0 });
      gsap.set(headlineRef.current, { y: 40, opacity: 0 });
      if (subheadRef.current) {
        gsap.set(subheadRef.current, { y: 24, opacity: 0 });
      }
      gsap.set(ctaRef.current?.children || [], { y: 24, opacity: 0 });

      // Entrance animation sequence
      tl.to(photoRef.current, { x: 0, scale: 1, opacity: 1, duration: 1 }, 0)
        .to(panelRef.current, { x: 0, opacity: 1, duration: 0.9 }, 0.1)
        .to(labelRef.current, { y: 0, opacity: 1, duration: 0.6 }, 0.4)
        .to(kickerRef.current, { y: 0, opacity: 1, duration: 0.6 }, 0.5)
        .to(headlineRef.current, { y: 0, opacity: 1, duration: 0.7 }, 0.58);

      if (subheadRef.current) {
        tl.to(subheadRef.current, { y: 0, opacity: 1, duration: 0.6 }, 0.65);
      }

      tl.to(ctaRef.current?.children || [], { 
        y: 0, 
        opacity: 1, 
        duration: 0.6, 
        stagger: 0.08 
      }, 0.8);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Removed scrub pinning logic for smoother native scroll


  return (
    <section 
      ref={sectionRef}
      id="hero"
      className={`sp-section-pinned min-h-0 bg-[var(--bg-primary)] relative pt-24 sm:pt-[5.5rem] md:pt-24 lg:pt-28 ${className}`}
    >
      <div className="w-full h-full flex items-start lg:items-center justify-center px-6 lg:px-12">
        <div className="relative w-full max-w-[1400px] h-auto lg:min-h-[64vh] mt-6 sm:mt-2 md:mt-4 lg:mt-8 flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">
          
          {/* Left Photo Card */}
          <div 
            ref={photoRef}
            className="sp-card w-full lg:flex-1 h-[280px] sm:h-[320px] lg:h-[520px] relative"
          >
            <img 
              src="/images/hero_collaboration.jpg" 
              alt="Professional collaboration"
              className="w-full h-full object-cover"
              width={600}
              height={800}
              fetchPriority="high"
            />
          </div>

          {/* Right Typographic Panel */}
          <div 
            ref={panelRef}
            className="glass-panel w-full lg:flex-1 h-auto lg:h-[520px] flex flex-col justify-center p-6 lg:p-10"
          >
            {/* Label */}
            <div ref={labelRef} className="mb-4 lg:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-0.5 bg-gradient-to-r from-[#C89F5E] to-transparent" />
                <span className="sp-label text-sm tracking-widest uppercase">{t('common.conceptNote')}</span>
              </div>
            </div>

            {/* Headline Group */}
            <div className="mb-8 lg:mb-12">
              <p
                ref={kickerRef}
                className="text-xs sm:text-sm tracking-[0.28em] uppercase text-[var(--sp-accent)] font-semibold mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Strategic Pathways
              </p>
              <h1 
                ref={headlineRef}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.08] mb-5 text-balance"
              >
                {heroHeadline}
              </h1>

              {/* Supporting line (retains the original hero text) */}
              {heroBody ? (
                <p 
                  ref={subheadRef}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-base lg:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed font-medium tracking-normal opacity-85"
                >
                  {heroBody}
                </p>
              ) : null}
            </div>

            {/* CTAs */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button 
                onClick={() => navigate('/opportunities')}
                className="sp-btn-primary flex items-center justify-center gap-2"
              >
                {t('hero.cta')}
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/how-it-works')}
                className="sp-btn-glass flex items-center justify-center gap-2"
                type="button"
              >
                <Target size={18} />
                {t('hero.secondary')}
              </button>
            </div>

            {/* Microcopy */}
            <p className="text-xs text-[var(--text-secondary)]/70 mt-4">
              {t('common.microcopy')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
