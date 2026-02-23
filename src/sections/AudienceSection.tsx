import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AudienceSectionProps {
  className?: string;
}

const AudienceSection = ({ className = '' }: AudienceSectionProps) => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const cardARef = useRef<HTMLDivElement>(null);
  const cardBRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=140%',
          pin: true,
          scrub: 0.6,
        }
      });

      // ENTRANCE (0-30%)
      scrollTl
        .fromTo(headlineRef.current,
          { y: '-12vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(captionRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.1
        )
        .fromTo(cardARef.current,
          { y: '80vh', scale: 0.92, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(cardBRef.current,
          { y: '80vh', scale: 0.92, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, ease: 'none' },
          0.05
        );

      // SETTLE (30-70%): Hold positions

      // EXIT (70-100%)
      scrollTl
        .to(headlineRef.current,
          { y: '-6vh', opacity: 0, ease: 'power2.in' },
          0.7
        )
        .to(cardARef.current,
          { x: '-18vw', y: '10vh', scale: 0.94, opacity: 0, ease: 'power2.in' },
          0.7
        )
        .to(cardBRef.current,
          { x: '18vw', y: '10vh', scale: 0.94, opacity: 0, ease: 'power2.in' },
          0.7
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="audience"
      className={`sp-section-pinned bg-[var(--bg-primary)] ${className}`}
    >
      <div className="w-full h-full flex flex-col items-center justify-center px-6 lg:px-12 pt-20">
        {/* Headline */}
        <h2 
          ref={headlineRef}
          className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--text-primary)] text-center mb-3"
        >
          {t('audience.headline')}
        </h2>

        {/* Caption */}
        <p 
          ref={captionRef}
          className="text-[var(--text-secondary)] text-center mb-8 lg:mb-12 max-w-xl"
        >
          {t('audience.caption')}
        </p>

        {/* Cards Container */}
        <div className="relative w-full max-w-[1400px] flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Card A - Returnees */}
          <div 
            ref={cardARef}
            className="sp-card w-full lg:w-[42vw] h-[35vh] lg:h-[56vh] relative group cursor-pointer"
          >
            <img 
              src="/images/audience_returnees.jpg" 
              alt="Study-abroad returnees"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Label Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-16 lg:h-20 bg-[var(--bg-primary)]/80 backdrop-blur-sm flex items-center px-6">
              <span className="text-[var(--text-primary)] font-semibold text-sm lg:text-base">
                {t('audience.returnees')}
              </span>
            </div>
          </div>

          {/* Card B - Institutions */}
          <div 
            ref={cardBRef}
            className="sp-card w-full lg:w-[42vw] h-[35vh] lg:h-[56vh] relative group cursor-pointer"
          >
            <img 
              src="/images/audience_institutions.jpg" 
              alt="Institutions"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Label Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-16 lg:h-20 bg-[var(--bg-primary)]/80 backdrop-blur-sm flex items-center px-6">
              <span className="text-[var(--text-primary)] font-semibold text-sm lg:text-base">
                {t('audience.institutions')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
