import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Briefcase, Users, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ValueSectionProps {
  className?: string;
}

const ValueSection = ({ className = '' }: ValueSectionProps) => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bulletsRef = useRef<HTMLUListElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

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
        .fromTo(labelRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          0.4
        )
        .fromTo(headlineRef.current?.querySelectorAll('.word') || [],
          { y: 40, opacity: 0, rotateX: 20 },
          { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
          0.5
        )
        .fromTo(bulletsRef.current?.children || [],
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' },
          0.7
        )
        .fromTo(ctaRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
          0.9
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const benefits = [
    {
      icon: Briefcase,
      text: t('value.benefits.projects')
    },
    {
      icon: Users,
      text: t('value.benefits.mentorship')
    },
    {
      icon: Award,
      text: t('value.benefits.profile')
    }
  ];

  return (
    <section 
      ref={sectionRef}
      id="value"
      className={`sp-section-pinned bg-[var(--bg-primary)] ${className}`}
    >
      <div className="w-full h-full flex items-center justify-center px-6 lg:px-12">
        <div className="relative w-full max-w-[1400px] h-[64vh] flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Left Typographic Panel */}
          <div 
            ref={panelRef}
            className="sp-panel w-full lg:w-[44vw] h-auto lg:h-full flex flex-col justify-center p-6 lg:p-10 order-2 lg:order-1"
          >
            {/* Label */}
            <div ref={labelRef} className="mb-4 lg:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-0.5 bg-[var(--sp-accent)]" />
                <span className="sp-label">{t('value.outcomeLabel')}</span>
              </div>
            </div>

            {/* Headline */}
            <h2 
              ref={headlineRef}
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--text-primary)] leading-tight mb-6 lg:mb-8"
            >
              {t('value.headline').split(' ').map((word, i) => (
                <span key={i} className="word inline-block mr-[0.2em]">{word}</span>
              ))}
            </h2>

            {/* Benefits List */}
            <ul ref={bulletsRef} className="space-y-4 mb-6 lg:mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-[var(--sp-accent)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[var(--sp-accent)]" />
                  </div>
                  <span className="text-[var(--text-secondary)] text-sm lg:text-base">{benefit.text}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button 
              ref={ctaRef}
              onClick={() => scrollToSection('how-it-works')}
              className="sp-btn-secondary w-fit flex items-center gap-2"
            >
              {t('value.cta')}
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Right Photo Card */}
          <div 
            ref={photoRef}
            className="sp-card w-full lg:w-[42vw] h-[30vh] lg:h-full relative order-1 lg:order-2"
          >
            <img 
              src="/images/value_team_meeting.jpg" 
              alt="Team meeting"
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

export default ValueSection;
