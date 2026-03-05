import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Building2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  className?: string;
}

const HeroSection = ({ className = '' }: HeroSectionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  // Auto-play entrance animation on load
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Initial states
      gsap.set(photoRef.current, { x: '-60vw', scale: 0.96, opacity: 0 });
      gsap.set(panelRef.current, { x: '60vw', opacity: 0 });
      gsap.set(labelRef.current, { y: 20, opacity: 0 });
      gsap.set(headlineRef.current?.querySelectorAll('.word') || [], { y: 40, opacity: 0 });
      gsap.set(subheadRef.current, { y: 24, opacity: 0 });
      gsap.set(ctaRef.current?.children || [], { y: 24, opacity: 0 });

      // Entrance animation sequence
      tl.to(photoRef.current, { x: 0, scale: 1, opacity: 1, duration: 1 }, 0)
        .to(panelRef.current, { x: 0, opacity: 1, duration: 0.9 }, 0.1)
        .to(labelRef.current, { y: 0, opacity: 1, duration: 0.6 }, 0.4)
        .to(headlineRef.current?.querySelectorAll('.word') || [], { 
          y: 0, 
          opacity: 1, 
          duration: 0.7, 
          stagger: 0.04 
        }, 0.5)
        .to(subheadRef.current, { y: 0, opacity: 1, duration: 0.6 }, 0.7)
        .to(ctaRef.current?.children || [], { 
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.08 
        }, 0.8);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Removed scrub pinning logic for smoother native scroll

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={sectionRef}
      id="hero"
      className={`sp-section-pinned bg-[var(--bg-primary)] ${className}`}
    >
      <div className="w-full h-full flex items-center justify-center px-6 lg:px-12">
        <div className="relative w-full max-w-[1400px] h-[64vh] flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Left Photo Card */}
          <div 
            ref={photoRef}
            className="sp-card w-full lg:w-[34vw] h-[30vh] lg:h-full relative"
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
            className="glass-panel w-full lg:w-[48vw] h-auto lg:h-full flex flex-col justify-center p-6 lg:p-10"
          >
            {/* Label */}
            <div ref={labelRef} className="mb-4 lg:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-0.5 bg-gradient-to-r from-[#C89F5E] to-transparent" />
                <span className="sp-label text-sm tracking-widest uppercase">{t('common.conceptNote')}</span>
              </div>
            </div>

            {/* Headline */}
            <h1 
              ref={headlineRef}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[var(--text-primary)] leading-tight mb-4 lg:mb-6"
            >
              <span className="text-[var(--sp-accent)] block mb-2 lg:mb-4 text-2xl lg:text-4xl font-normal">Strategic Pathways</span>
              {t('hero.title').split(' ').map((word, i) => (
                <span key={i} className="word inline-block mr-[0.25em]">{word}</span>
              ))}
            </h1>

            {/* Subheadline */}
            <p 
              ref={subheadRef}
              className="text-base lg:text-lg text-[var(--text-secondary)] max-w-xl mb-6 lg:mb-8"
            >
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {session ? (
                <button 
                  onClick={() => navigate('/profile')}
                  className="sp-btn-primary flex items-center justify-center gap-2"
                >
                  {t('common.dashboard')}
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="sp-btn-primary flex items-center justify-center gap-2"
                >
                  {t('hero.cta')}
                  <ArrowRight size={18} />
                </button>
              )}
              <button 
                onClick={() => scrollToSection('opportunities')}
                className="sp-btn-secondary flex items-center justify-center gap-2"
              >
                <Building2 size={18} />
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
