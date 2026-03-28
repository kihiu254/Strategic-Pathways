import { useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SEO from '../components/SEO';

gsap.registerPlugin(ScrollTrigger);

const HowItWorksPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );

      const cards = cardsRef.current?.children || [];
      gsap.fromTo(cards,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.2
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const steps = (t('howItWorks.steps', { returnObjects: true }) as any[]).map((step, index) => ({
    ...step,
    number: index + 1,
    image: [`/images/step1_apply.png`, `/images/step2_connect.png`, `/images/step3_grow.png`][index]
  }));

  return (
    <div ref={pageRef} className="min-h-screen pt-32 pb-20 bg-[var(--bg-primary)]">
      <SEO title={t('footer.howItWorks')} />
      <div className="w-full px-6 lg:px-12">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[var(--text-primary)] mb-6">
            {t('howItWorks.headline')}
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg leading-relaxed">
            {t('howItWorks.subheadline')}
          </p>
        </div>

        {/* Steps Grid */}
        <div 
          ref={cardsRef}
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        >
          {steps.map((step) => (
            <div 
              key={step.number}
              className="relative group glass-card p-8 lg:p-10 transition-all duration-500 hover:-translate-y-3 hover:border-[var(--sp-accent)]/40 hover:shadow-2xl hover:shadow-[var(--sp-accent)]/10 rounded-3xl"
            >
              <div 
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at top right, rgba(200,159,94,0.1), transparent 70%)',
                }}
              />
              {/* Number Circle */}
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-[var(--sp-accent)] flex items-center justify-center mb-8">
                <span className="text-[#0b2a3c] font-bold text-xl lg:text-2xl">
                  {step.number}
                </span>
              </div>

              {/* Illustration */}
              <div className="w-full h-48 mb-8 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                <img 
                  src={step.image} 
                  alt={step.title}
                  className="w-full h-full object-cover mix-blend-screen"
                  width={400}
                  height={300}
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <h2 className="text-xl lg:text-2xl font-semibold text-[var(--text-primary)] mb-4 group-hover:text-[var(--sp-accent)] transition-colors">
                {step.title}
              </h2>
              <p className="text-[var(--text-secondary)] text-base lg:text-lg leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <button 
            className="sp-btn-primary px-10 py-4 text-lg"
            onClick={() => navigate('/login')}
          >
            {t('nav.register')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
