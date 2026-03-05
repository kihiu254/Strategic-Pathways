import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Toaster } from 'sonner';
import Onboarding from './sections/Onboarding';
import Navigation from './sections/Navigation';
import HeroSection from './sections/HeroSection';
import ValueSection from './sections/ValueSection';
import AudienceSection from './sections/AudienceSection';
import HowItWorksSection from './sections/HowItWorksSection';
import ImpactSection from './sections/ImpactSection';
import OpportunitiesSection from './sections/OpportunitiesSection';
import PricingSection from './sections/PricingSection';
import ContactSection from './sections/ContactSection';
import Footer from './sections/Footer';
import AuthLayout from './sections/auth/AuthLayout';
import AnimatedCursor from './components/ui/AnimatedCursor';
import SEO from './components/SEO';
import { Analytics } from '@vercel/analytics/react';
import { CookieBanner } from './components/CookieBanner';

// Lazy-loaded Pages
const AdminDashboard = lazy(() => import('./sections/AdminDashboard'));
const ConceptNotePage = lazy(() => import('./sections/ConceptNotePage'));
const ProfilePage = lazy(() => import('./sections/ProfilePage'));
const LoginPage = lazy(() => import('./sections/auth/LoginPage'));
const SignupPage = lazy(() => import('./sections/auth/SignupPage'));
const AdminRoute = lazy(() => import('./sections/auth/AdminRoute'));
const OpportunitiesPage = lazy(() => import('./sections/OpportunitiesPage'));
const OnboardingFlow = lazy(() => import('./sections/onboarding/ProfileOnboarding'));
const VerificationPage = lazy(() => import('./sections/VerificationPage'));
const SitemapPage = lazy(() => import('./sections/SitemapPage'));
const PrivacyPolicyPage = lazy(() => import('./sections/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./sections/TermsOfServicePage'));
const CookiePolicyPage = lazy(() => import('./sections/CookiePolicyPage'));

gsap.registerPlugin(ScrollTrigger);

function HomeContent() {
  const mainRef = useRef<HTMLDivElement>(null); // Added mainRef here as per the provided snippet
  return (
    <main ref={mainRef} className="relative w-full overflow-hidden bg-[var(--bg-primary)]">
      <SEO title="Home" />
      {/* Sections inside the pinning container */}
      <HeroSection className="z-10" />
      <ValueSection className="z-20" />
      <AudienceSection className="z-30" />
      <HowItWorksSection className="z-40" />
      <ImpactSection className="z-50" />
      <OpportunitiesSection className="z-[60]" />
      <PricingSection className="z-[70]" />
      <ContactSection className="z-[80]" />
    </main>
  );
}

function MainLayout() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already seen onboarding this session
    const hasSeenOnboarding = sessionStorage.getItem('sp_onboarding_seen');
    if (hasSeenOnboarding) {
      setOnboardingComplete(true);
      setShowContent(true);
    }
  }, []);

  useEffect(() => {
    if (!onboardingComplete || location.pathname !== '/') return;

    // Wait for all sections to mount and create their ScrollTriggers
    const timer = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some(r => value >= r.start - 0.02 && value <= r.end + 0.02);
            if (!inPinned) return value;
            
            const target = pinnedRanges.reduce((closest, r) =>
              Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest,
              pinnedRanges[0]?.center ?? 0
            );
            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: "power2.out"
        }
      });
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [onboardingComplete, location.pathname]);

  // Cleanup ScrollTrigger when switching pages
  useEffect(() => {
    if (location.pathname !== '/') {
      ScrollTrigger.getAll().forEach(st => st.kill());
    }
  }, [location.pathname]);

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  };

  const handleNavigate = (page: string) => {
    if (page === 'home') navigate('/');
    else if (page === 'profile') navigate('/profile');
    else if (page === 'admin') navigate('/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Hash Scrolling
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // Wait for page transition and rendering
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  return (
    <div ref={mainRef} className="relative">
      <AnimatedCursor />
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'rgba(11, 42, 60, 0.95)',
            color: '#F6F4EF',
            border: '1px solid rgba(200, 159, 94, 0.3)',
          },
        }}
      />

      {/* Onboarding Video */}
      {!onboardingComplete && location.pathname === '/' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {/* Main Content */}
      {(showContent || location.pathname !== '/') && (
        <>
          {/* Grain Overlay */}
          <div className="grain-overlay" />
          
          {/* Navigation */}
          {location.pathname !== '/admin' && ( // Exclude the global nav on admin page since it has a sidebar
            <Navigation 
              onNavigate={handleNavigate} 
              currentPage={location.pathname === '/' ? 'home' : location.pathname.substring(1)} 
            />
          )}
          
          {/* Page Routing with Suspense for Lazy Loading */}
          <Suspense fallback={<div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center text-[var(--sp-accent)]">Loading...</div>}>
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/" element={<HomeContent />} />
                <Route path="/concept-note" element={<ConceptNotePage />} />
                <Route path="/opportunities" element={<OpportunitiesPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/onboarding" element={<OnboardingFlow />} />
                <Route path="/verification" element={<VerificationPage />} />
                <Route path="/sitemap" element={<SitemapPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/cookies" element={<CookiePolicyPage />} />
                
                {/* Protected Admin Route */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </>
      )}

      {/* Hide footer on admin page and opportunities page, but show everywhere else (home, profile, etc) */}
      {location.pathname !== '/admin' && location.pathname !== '/opportunities' && <Footer />}
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <MainLayout />
        <Analytics />
        <CookieBanner />
      </Router>
    </HelmetProvider>
  );
}

export default App;
