import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HowItWorksSectionProps {
  className?: string;
}

const HowItWorksSection = ({ className = '' }: HowItWorksSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(headingRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Timeline line animation
      gsap.fromTo(timelineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // 2D Cards animation
      const cards = cardsRef.current?.children || [];
      gsap.fromTo(cards,
        { 
          y: 60, 
          opacity: 0, 
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Number circles animation
      const numbers = document.querySelectorAll('.step-number');
      gsap.fromTo(numbers,
        { scale: 0.6, rotate: -30, opacity: 0 },
        {
          scale: 1,
          rotate: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      number: 1,
      image: '/images/step1_apply.png',
      title: 'Apply & verify',
      description: 'Share your background. We review for fit and credibility.'
    },
    {
      number: 2,
      image: '/images/step2_connect.png',
      title: 'Connect & collaborate',
      description: 'Join circles, attend briefings, and meet partners.'
    },
    {
      number: 3,
      image: '/images/step3_grow.png',
      title: 'Win work & grow',
      description: 'Bid on projects, join teams, and track your impact.'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      id="how-it-works"
      className={`relative bg-[var(--bg-primary)]/5 py-20 lg:py-28 overflow-hidden ${className}`}
    >
      <div className="w-full px-6 lg:px-12">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--text-primary)] mb-4">
            How membership works
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-lg">
            A simple, credible path from application to opportunity.
          </p>
        </div>

        {/* Timeline Line */}
        <div className="relative max-w-5xl mx-auto mb-8">
          <div 
            ref={timelineRef}
            className="hidden lg:block absolute top-[60px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-[#C89F5E] to-transparent origin-left opacity-60"
          />
        </div>

        {/* Steps Cards */}
        <div 
          ref={cardsRef}
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {steps.map((step) => (
            <div 
              key={step.number}
              className="relative group glass-card p-6 lg:p-8 transition-all duration-500 hover:-translate-y-3 hover:border-[var(--sp-accent)]/40 hover:shadow-2xl hover:shadow-[var(--sp-accent)]/10"
            >
              <div 
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at top right, rgba(200,159,94,0.1), transparent 70%)',
                }}
              />
              {/* Number Circle */}
              <div className="step-number w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[var(--sp-accent)] flex items-center justify-center mb-6">
                <span className="text-[#0b2a3c] font-bold text-lg lg:text-xl">
                  {step.number}
                </span>
              </div>

              {/* Illustration */}
              <div className="w-full h-40 mb-6 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                <img 
                  src={step.image} 
                  alt={step.title}
                  className="w-full h-full object-cover mix-blend-screen"
                />
              </div>

              {/* Content */}
              <h3 className="text-lg lg:text-xl font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--sp-accent)] transition-colors">
                {step.title}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm lg:text-base">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
