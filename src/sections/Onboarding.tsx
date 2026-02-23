import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { SkipForward, Volume2, VolumeX } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showSkip, setShowSkip] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!hasStarted && introRef.current && logoRef.current) {
      gsap.fromTo(introRef.current, 
        { opacity: 0, scale: 1.05 }, 
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }
      );
      gsap.fromTo(logoRef.current, 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: 'power3.out' }
      );
    }
  }, [hasStarted]);

  useEffect(() => {
    // Check if user has already seen onboarding
    const hasSeenOnboarding = sessionStorage.getItem('sp_onboarding_seen');
    if (hasSeenOnboarding) {
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    if (hasStarted && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto-play blocked, user will need to interact
      });
      
      // Show skip button after 3 seconds
      const skipTimer = setTimeout(() => {
        setShowSkip(true);
      }, 3000);

      return () => clearTimeout(skipTimer);
    }
  }, [hasStarted]);

  // Update progress bar
  useEffect(() => {
    if (!hasStarted || !videoRef.current) return;
    
    const interval = setInterval(() => {
      if (videoRef.current) {
        const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(currentProgress || 0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [hasStarted]);

  const handleStart = () => {
    // Animate logo out
    gsap.to(logoRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in'
    });

    // Fade out intro screen
    gsap.to(introRef.current, {
      opacity: 0,
      duration: 0.6,
      delay: 0.2,
      onComplete: () => {
        setHasStarted(true);
      }
    });
  };

  const handleVideoEnd = () => {
    // Fade out video container
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.8,
      onComplete: () => {
        sessionStorage.setItem('sp_onboarding_seen', 'true');
        onComplete();
      }
    });
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        sessionStorage.setItem('sp_onboarding_seen', 'true');
        onComplete();
      }
    });
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-[var(--bg-primary)]"
    >
      {/* Intro Screen - Click to Enter */}
      {!hasStarted && (
        <div 
          ref={introRef}
          className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-primary)] cursor-pointer"
          onClick={handleStart}
        >
          {/* Animated Logo with Glassmorphism */}
          <div ref={logoRef} className="mb-8 text-center">
            <div className="glass-gold p-8 rounded-3xl mb-6 inline-block gold-glow">
              <img 
                src="/logo.png" 
                alt="Strategic Pathways" 
                className="h-32 lg:h-40 w-auto object-contain"
              />
            </div>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-[#C89F5E]" />
              <span className="sp-label text-sm tracking-widest">Kenya Talent Network</span>
              <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-[#C89F5E]" />
            </div>
          </div>

          {/* Click to Enter Button */}
          <div className="relative group">
            <div className="absolute inset-0 bg-[var(--sp-accent)] rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-[var(--sp-accent)] rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse" />
            <button className="relative sp-btn-primary text-lg px-10 py-4 rounded-full flex items-center gap-3 shimmer">
              <span>Click to Enter</span>
              <svg 
                className="w-5 h-5 animate-bounce" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                />
              </svg>
            </button>
          </div>

          <p className="text-[var(--text-secondary)] text-sm mt-8">
            Experience our story
          </p>
        </div>
      )}

      {/* Video Player */}
      {hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            ref={videoRef}
            src="/onboarding.mp4"
            className="w-full h-full object-cover"
            muted={isMuted}
            playsInline
            onEnded={handleVideoEnd}
            onError={() => {
              // If video fails, skip to main content
              handleSkip();
            }}
          />

          {/* Video Controls Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start">
              <div className="glass-gold px-4 py-2 rounded-xl">
                <img 
                  src="/logo.png" 
                  alt="Strategic Pathways" 
                  className="h-8 w-auto"
                />
              </div>

              {/* Mute Toggle */}
              <button
                onClick={toggleMute}
                className="pointer-events-auto w-12 h-12 rounded-full glass-gold flex items-center justify-center text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/30 transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>

            {/* Skip Button */}
            {showSkip && (
              <div className="absolute bottom-8 right-8">
                <button
                  onClick={handleSkip}
                  className="pointer-events-auto flex items-center gap-2 px-5 py-3 glass-gold rounded-full text-[var(--text-primary)] hover:bg-[var(--sp-accent)]/20 transition-colors"
                >
                  <span className="text-sm font-medium">Skip Intro</span>
                  <SkipForward size={18} />
                </button>
              </div>
            )}

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
              <div 
                className="h-full bg-gradient-to-r from-[#C89F5E] to-[#D4B76E] transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
