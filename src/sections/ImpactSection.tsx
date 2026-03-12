import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ImpactSectionProps {
  className?: string;
}

const ImpactSection = ({ className = '' }: ImpactSectionProps) => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

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
        .fromTo(photoRef.current,
          { y: 60, scale: 0.95, opacity: 0, filter: 'blur(10px)' },
          { y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' },
          0
        )
        .fromTo(panelRef.current,
          { y: 60, opacity: 0, filter: 'blur(8px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' },
          0.2
        )
        .fromTo(labelRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          0.4
        )
        .fromTo(headlineRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          0.5
        )
        .fromTo(statsRef.current?.children || [],
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
          0.6
        )
        .fromTo(ctaRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
          0.8
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { value: '500+', label: t('impact.stats.professionals') },
    { value: '5–7', label: t('impact.stats.partners') },
    { value: '5–8', label: t('impact.stats.projects') },
    { value: '50+', label: t('impact.stats.opportunities') }
  ];

  return (
    <section 
      ref={sectionRef}
      className={`sp-section-pinned bg-[var(--bg-primary)] ${className}`}
    >
      <div className="w-full h-full flex items-center justify-center px-6 lg:px-12">
        <div className="relative w-full max-w-[1400px] h-auto lg:h-[64vh] flex flex-col lg:flex-row gap-6 lg:gap-8 py-12 lg:py-0">
          
          {/* Left Photo Card */}
          <div 
            ref={photoRef}
            className="sp-card w-full lg:w-[38vw] h-[40vh] lg:h-full relative"
          >
            <img 
              src="/images/impact_mentorship.jpg" 
              alt="Mentorship"
              className="w-full h-full object-cover"
              width={800}
              height={600}
              loading="lazy"
            />
          </div>

          {/* Right Stats Panel */}
          <div 
            ref={panelRef}
            className="sp-panel w-full lg:w-[48vw] h-auto lg:h-full flex flex-col justify-center p-6 lg:p-10"
          >
            {/* Label */}
            <div ref={labelRef} className="mb-4 lg:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-0.5 bg-[var(--sp-accent)]" />
                <span className="sp-label">{t('impact.label')}</span>
              </div>
            </div>

            {/* Headline */}
            <h2 
              ref={headlineRef}
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--text-primary)] mb-6 lg:mb-8"
            >
              {t('impact.headline')}
            </h2>

            {/* Stats Grid */}
            <div 
              ref={statsRef}
              className="grid grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-left">
                  <div className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--sp-accent)] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-[var(--text-secondary)] text-sm lg:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a 
              href="/docs/Strategic_Pathways_Brief.pdf"
              download="Strategic_Pathways_Brief.pdf"
              className="sp-btn-secondary w-fit flex items-center gap-2"
              ref={ctaRef as any}
            >
              <Download size={18} />
              {t('impact.cta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
