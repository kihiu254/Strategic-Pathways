import { useRef, useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Globe, Lightbulb, Users, Target, Briefcase, TrendingUp, Building2, Zap, LayoutDashboard, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);

  const getArray = <T,>(key: string): T[] => {
    const value = t(key, { returnObjects: true });
    if (Array.isArray(value)) {
      return value as T[];
    }
    const fallback = i18n.getResource('en', 'translation', key);
    return Array.isArray(fallback) ? (fallback as T[]) : [];
  };

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.title = t('about.title');
    
    const ctx = gsap.context(() => {
      // Setup scroll animations for all sections with class .animate-section
      const sections = document.querySelectorAll('.animate-section');
      gsap.set(sections, { opacity: 1, y: 0 });
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });

      // Stagger items inside grids
      const grids = document.querySelectorAll('.animate-grid');
      grids.forEach((grid) => {
        if (grid.children?.length) {
          gsap.set(grid.children, { opacity: 1, y: 0 });
        }
        gsap.fromTo(
          grid.children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: grid,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }, pageRef);

    requestAnimationFrame(() => ScrollTrigger.refresh());
    setTimeout(() => ScrollTrigger.refresh(), 60);

    return () => ctx.revert();
  }, [t]);

  // Sync title on language change
  useEffect(() => {
    document.title = t('about.title');
  }, [i18n.language, t]);

  return (
    <div ref={pageRef} className="min-h-screen bg-[var(--bg-primary)] pt-20 pb-20 selection:bg-[var(--sp-accent)] selection:text-[var(--text-primary)] relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-24 h-80 w-80 rounded-full bg-[var(--sp-accent)]/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-40 -right-32 h-96 w-96 rounded-full bg-[#10364d]/50 blur-[140px]" />
      {/* Navigation Top Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-6 animate-section">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={20} />
          {t('about.back')}
        </button>
      </div>

      {/* 1. Hero Title */}
      <section className="max-w-6xl mx-auto px-6 lg:px-12 mb-24 animate-section">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-0.5 bg-[var(--sp-accent)]" />
              <span className="sp-label text-[var(--sp-accent)] text-sm tracking-widest uppercase font-semibold">{t('about.mission.label')}</span>
            </div>
            <h1 
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.1] text-balance"
            >
              {t('about.mission.headline').split(' ').map((word, i, arr) => (
                i >= arr.length - 3 
                  ? <span key={i} className="text-[var(--sp-accent)]">{word} </span>
                  : <span key={i}>{word} </span>
              ))}
            </h1>
          </div>
          <div className="premium-glass rounded-3xl p-8 border border-white/10 shadow-2xl">
            <p 
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="text-base lg:text-lg text-[var(--text-secondary)] leading-relaxed font-medium"
            >
              {t('about.mission.body')}
            </p>
            <div className="mt-8 h-0.5 w-16 bg-[var(--sp-accent)]/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* 2. Problem Statement (Dark Section) */}
      <section className="bg-[var(--bg-primary)] text-[var(--text-primary)] py-24 mb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #C89F5E 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative animate-section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="premium-glass rounded-3xl p-8 border border-white/10 shadow-2xl">
              <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">{t('about.problem.headline')}</h2>
              <p className="text-[var(--text-secondary)] text-lg lg:text-xl leading-relaxed mb-6">
                {t('about.problem.body1')}
              </p>
              <p className="text-[var(--sp-accent)] text-lg lg:text-xl italic font-medium">
                "{t('about.problem.quote')}"
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-grid">
              <div className="bg-[var(--bg-card)]/10 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
                <Globe className="w-10 h-10 text-[var(--sp-accent)] mb-6" />
                <h3 className="text-xl font-bold mb-3">{t('about.problem.expertise.title')}</h3>
                <p className="text-[var(--text-secondary)] text-sm">{t('about.problem.expertise.desc')}</p>
              </div>
              <div className="bg-[var(--bg-card)]/10 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
                <Building2 className="w-10 h-10 text-[var(--sp-accent)] mb-6" />
                <h3 className="text-xl font-bold mb-3">{t('about.problem.gaps.title')}</h3>
                <p className="text-[var(--text-secondary)] text-sm">{t('about.problem.gaps.desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Solution (Bento Grid) */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-32">
        <div className="text-center mb-16 animate-section">
          <h2 className="text-3xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">{t('about.solution.headline')}</h2>
          <p className="text-[var(--text-secondary)] text-lg lg:text-xl max-w-2xl mx-auto">
            {t('about.solution.subheadline')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-grid">
          {getArray<{ title: string; desc: string }>('about.solution.items').map((item, i) => {
            const icons = [LayoutDashboard, Users, Briefcase, Lightbulb, Target, ShieldCheck];
            const Icon = icons[i] ?? LayoutDashboard;
            return (
              <div key={i} className="premium-glass border border-white/10 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-2xl">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-[var(--sp-accent)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{item.title}</h3>
                <p className="text-[var(--text-secondary)]">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Project Goals Layout */}
      <section className="bg-[var(--bg-primary)]/5 py-24 mb-24 relative">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 animate-section">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold text-[var(--text-primary)]">{t('about.objectives.headline')}</h2>
            <p className="text-[var(--text-secondary)] max-w-xl text-base lg:text-lg">
              {t('about.solution.subheadline')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getArray<string>('about.objectives.list').map((goal, i) => (
              <div key={i} className="premium-glass p-6 rounded-2xl flex items-center gap-6 border border-white/10 shadow-xl">
                <div className="text-3xl font-bold text-[var(--sp-accent)]/40 shrink-0 select-none">0{i + 1}</div>
                <p className="text-lg font-semibold text-[var(--text-primary)]">{goal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Beneficiaries & Impact */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Target Beneficiaries */}
          <div className="animate-section">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-8">Who We Serve</h2>
            <div className="space-y-6">
              <div className="premium-glass rounded-3xl p-8 border border-white/10 shadow-2xl">
                <h3 className="text-2xl font-bold mb-4 text-[var(--sp-accent)]">{t('about.beneficiaries.primary.title')}</h3>
                <ul className="space-y-3 text-[var(--text-primary)]">
                  <li className="flex items-center gap-3"><Zap className="w-5 h-5 shrink-0 text-[var(--sp-accent)]" /> {t('about.beneficiaries.primary.returnees')}</li>
                  <li className="flex items-center gap-3"><Zap className="w-5 h-5 shrink-0 text-[var(--sp-accent)]" /> {t('about.beneficiaries.primary.diaspora')}</li>
                </ul>
              </div>
              <div className="premium-glass border border-white/10 rounded-3xl p-8 text-[var(--text-primary)] shadow-xl">
                <h3 className="text-xl font-bold mb-4">{t('about.beneficiaries.secondary.title')}</h3>
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[var(--sp-accent)] shrink-0" /> {t('about.beneficiaries.secondary.counties')}</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[var(--sp-accent)] shrink-0" /> {t('about.beneficiaries.secondary.universities')}</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[var(--sp-accent)] shrink-0" /> {t('about.beneficiaries.secondary.ngos')}</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[var(--sp-accent)] shrink-0" /> {t('about.beneficiaries.secondary.smes')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Expected Results */}
          <div className="animate-section">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-8">{t('about.impactAbout.headline')}</h2>
            <div className="premium-glass rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="relative pl-8 border-l-2 border-[var(--sp-accent)]/30 space-y-10 pb-2">
              
              <div className="relative">
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[var(--bg-primary)] border-4 border-[var(--sp-accent)]" />
                <h3 className="text-lg font-bold text-[var(--sp-accent)] tracking-widest uppercase mb-3">{t('about.impactAbout.short.title')}</h3>
                <p className="text-[var(--text-secondary)] font-medium">{t('about.impactAbout.short.desc')}</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[var(--bg-primary)] border-4 border-[var(--sp-accent)]" />
                <h3 className="text-lg font-bold text-[var(--sp-accent)] tracking-widest uppercase mb-3">{t('about.impactAbout.medium.title')}</h3>
                <p className="text-[var(--text-secondary)] font-medium">{t('about.impactAbout.medium.desc')}</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[var(--sp-accent)] border-4 border-[var(--sp-accent)] shadow-[0_0_15px_rgba(200,159,94,0.5)]" />
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('about.impactAbout.long.title')}</h3>
                <p className="text-[var(--text-secondary)] font-medium text-lg">{t('about.impactAbout.long.desc1')}</p>
                <p className="text-[var(--text-secondary)] font-medium text-lg mt-2">{t('about.impactAbout.long.desc2')}</p>
              </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer Conclusion */}
      <section className="max-w-5xl mx-auto px-6 lg:px-12 mt-32 text-center animate-section pb-12">
        <TrendingUp className="w-16 h-16 text-[var(--sp-accent)] mx-auto mb-8 opacity-80" />
        <h2 className="text-2xl lg:text-4xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
          {t('about.conclusion')}
        </h2>
        <div className="w-24 h-1 bg-[var(--sp-accent)] mx-auto rounded-full" />
      </section>

    </div>
  );
};

export default AboutPage;
