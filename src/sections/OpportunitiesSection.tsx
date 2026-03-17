import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Building2, Briefcase } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface OpportunitiesSectionProps {
  className?: string;
}

const OpportunitiesSection = ({ className = '' }: OpportunitiesSectionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        }
      });

      scrollTl
        .fromTo(panelRef.current,
          { y: 60, opacity: 0, filter: 'blur(8px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' },
          0
        )
        .fromTo(photoRef.current,
          { y: 60, scale: 0.95, opacity: 0, filter: 'blur(10px)' },
          { y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' },
          0.2
        )
        .fromTo(headlineRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          0.4
        )
        .fromTo(chipsRef.current?.children || [],
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
          0.5
        )
        .fromTo(bodyRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          0.7
        )
        .fromTo(ctaRef.current?.children || [],
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
          0.8
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);


  return (
    <section 
      ref={sectionRef}
      className={`sp-section-pinned bg-[var(--bg-primary)] ${className}`}
    >
      <div className="w-full h-full flex items-center justify-center px-6 lg:px-12">
        <div className="relative w-full max-w-[1400px] h-auto lg:min-h-[520px] flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">
          
          {/* Left Typographic Panel */}
          <div 
            ref={panelRef}
            className="sp-panel w-full lg:flex-1 h-auto lg:h-[520px] flex flex-col justify-center p-6 lg:p-10 order-2 lg:order-1"
          >
            {/* Headline */}
            <h2 
              ref={headlineRef}
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--text-primary)] mb-4 lg:mb-6"
            >
              {t('opportunities.headline')}
            </h2>

            {/* Chips */}
            <div ref={chipsRef} className="flex flex-wrap gap-2 mb-4 lg:mb-6">
              <span className="px-4 py-2 rounded-full border border-[var(--sp-accent)] text-[var(--sp-accent)] text-sm font-medium flex items-center gap-2">
                <Briefcase size={16} />
                {t('opportunities.chips.consultancies')}
              </span>
              <span className="px-4 py-2 rounded-full border border-[var(--sp-accent)] text-[var(--sp-accent)] text-sm font-medium flex items-center gap-2">
                <Building2 size={16} />
                {t('opportunities.chips.research')}
              </span>
            </div>

            {/* Body */}
            <p 
              ref={bodyRef}
              className="text-[var(--text-secondary)] text-sm lg:text-base mb-6 lg:mb-8"
            >
              {t('opportunities.body')}
            </p>

            {/* CTAs */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button 
                onClick={() => alert('Opportunities list coming soon!')}
                className="sp-btn-primary flex items-center justify-center gap-2"
              >
                {t('opportunities.viewCTA')}
                <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="sp-btn-secondary flex items-center justify-center gap-2"
              >
                {t('opportunities.partnerCTA')}
              </button>
            </div>
          </div>

          {/* Right Photo Card */}
          <div 
            ref={photoRef}
            className="sp-card w-full lg:flex-1 h-[30vh] lg:h-[520px] relative order-1 lg:order-2"
          >
            <img 
              src="/images/opportunities_workspace.jpg" 
              alt="Workspace"
              className="w-full h-full object-cover"
              width={800}
              height={600}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OpportunitiesSection;
