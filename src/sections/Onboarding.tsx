import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Check if user has already seen onboarding in this session
    if (sessionStorage.getItem('sp_onboarding_seen')) {
      onComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem('sp_onboarding_seen', 'true');
          onComplete();
        }
      });

      // 1. Initial State
      gsap.set(logoWrapperRef.current, { scale: 0.8, opacity: 0, y: 20 });
      gsap.set(textRef.current, { opacity: 0, letterSpacing: '0em', scale: 1.2 });
      gsap.set(sweepRef.current, { left: '-100%' });

      // 2. The Build-Up: Text fades in and spaces out
      tl.to(textRef.current, {
        opacity: 1,
        letterSpacing: '0.2em',
        duration: 1.2,
        ease: 'power2.out',
      })
      
      // 3. The Reveal: Text shrinks down and moves to subtitle position, Logo scales up
      .to(textRef.current, {
        scale: 0.6,
        y: 80,
        opacity: 0.7,
        duration: 1,
        ease: 'power3.inOut',
      }, '+=0.2')
      .to(logoWrapperRef.current, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
      }, '<0.2')

      // 4. The Sweep: A glassmorphic light sweep passes over the logo
      .to(sweepRef.current, {
        left: '200%',
        duration: 1.5,
        ease: 'power1.inOut',
      }, '-=0.4')

      // 5. Short pause to admire the logo
      .to({}, { duration: 0.5 })

      // 6. The Transition: Fade out container to reveal the app
      .to(containerRef.current, {
        opacity: 0,
        y: '-10%',
        duration: 0.8,
        ease: 'power2.inOut',
      });

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-[var(--bg-primary)] flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="relative flex flex-col items-center justify-center w-full max-w-lg">
        
        {/* Animated Logo Wrapper */}
        <div 
          ref={logoWrapperRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="relative glass-gold p-8 lg:p-12 rounded-[2rem] shadow-2xl overflow-hidden gold-glow">
            <img 
              src="/logo.png" 
              alt="Strategic Pathways" 
              className="h-24 lg:h-32 w-auto object-contain relative z-10"
            />
            
            {/* Light Sweep Element */}
            <div 
              ref={sweepRef}
              className="absolute top-0 bottom-0 w-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 z-20"
            />
          </div>
        </div>

        {/* Brand Text */}
        <h1 
          ref={textRef}
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--sp-accent)] uppercase text-center relative z-30"
          style={{ fontFamily: '"IBM Plex Sans Condensed", sans-serif' }}
        >
          Kenya Talent Network
        </h1>

      </div>
    </div>
  );
};

export default Onboarding;
