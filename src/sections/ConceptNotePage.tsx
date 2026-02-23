import { useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Globe, Lightbulb, Users, Target, Briefcase, TrendingUp, Building2, Zap, LayoutDashboard, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.title = "About Us | Strategic Pathways";
    
    const ctx = gsap.context(() => {
      // Setup scroll animations for all sections with class .animate-section
      const sections = document.querySelectorAll('.animate-section');
      sections.forEach((section) => {
        gsap.fromTo(section,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
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
        gsap.fromTo(grid.children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: grid,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen bg-[var(--bg-primary)] pt-28 pb-20 selection:bg-[var(--sp-accent)] selection:text-[var(--text-primary)]">
      {/* Navigation Top Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-12 animate-section">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>
      </div>

      {/* 1. Hero Title */}
      <section className="max-w-5xl mx-auto px-6 lg:px-12 mb-24 animate-section text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-12 h-0.5 bg-[var(--sp-accent)]" />
          <span className="sp-label text-[var(--sp-accent)] text-sm tracking-widest uppercase font-semibold">Our Mission</span>
          <div className="w-12 h-0.5 bg-[var(--sp-accent)]" />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[var(--text-primary)] leading-tight mb-8">
          Where Global Skills <br className="hidden lg:block"/>
          <span className="text-[var(--sp-accent)] relative inline-block group">
            Come Full Circle
            <span className="absolute -bottom-2 lg:-bottom-4 left-0 w-full h-1 lg:h-2 bg-[var(--sp-accent)]/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 rounded-full" />
          </span>
        </h1>
        <p className="text-lg lg:text-2xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
          Mobilising study-abroad returnees and diaspora professionals into collaborative projects, consultancy engagements, and venture-building initiatives that strengthen local economies.
        </p>
      </section>

      {/* 2. Problem Statement (Dark Section) */}
      <section className="bg-[var(--bg-primary)] text-[var(--text-primary)] py-24 mb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #C89F5E 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative animate-section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">The Missing Link in Kenyan Talent.</h2>
              <p className="text-[var(--text-secondary)] text-lg lg:text-xl leading-relaxed mb-6">
                Each year, thousands of Kenyans study and work abroad, gaining advanced education and global exposure. However, returning home often means encountering <span className="text-[var(--text-primary)] font-semibold">fragmented networks</span> and <span className="text-[var(--text-primary)] font-semibold">underutilisation of skills</span>.
              </p>
              <p className="text-[var(--sp-accent)] text-lg lg:text-xl italic font-medium">
                "This disconnect reinforces patterns of brain drain rather than enabling sustainable brain circulation."
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-grid">
              <div className="bg-[var(--bg-card)]/5/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <Globe className="w-10 h-10 text-[var(--sp-accent)] mb-6" />
                <h3 className="text-xl font-bold mb-3">Global Expertise</h3>
                <p className="text-[var(--text-secondary)] text-sm">Remains disconnected from local economic opportunities upon return.</p>
              </div>
              <div className="bg-[var(--bg-card)]/5/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <Building2 className="w-10 h-10 text-[var(--sp-accent)] mb-6" />
                <h3 className="text-xl font-bold mb-3">Local Gaps</h3>
                <p className="text-[var(--text-secondary)] text-sm">SMEs, NGOs, and counties face challenges accessing reliable execution-ready talent.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Solution (Bento Grid) */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-32">
        <div className="text-center mb-16 animate-section">
          <h2 className="text-3xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">The Proposed Solution</h2>
          <p className="text-[var(--text-secondary)] text-lg lg:text-xl max-w-2xl mx-auto">
            A digital-enabled platform operating as a talent execution and venture-building ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-grid">
          {[
            { icon: LayoutDashboard, title: 'Digital Onboarding', desc: 'Seamless profile management and verified credential tracking.' },
            { icon: Users, title: 'Team Assembly', desc: 'Structured cross-functional team formation for specific projects.' },
            { icon: Briefcase, title: 'Project Coordination', desc: 'Managing consultancy engagements and local economic initiatives.' },
            { icon: Lightbulb, title: 'Venture Incubation', desc: 'Supporting new enterprise development and scaling innovations.' },
            { icon: Target, title: 'Institutional Partnering', desc: 'Bridging talent direct to counties, universities, NGOs, and donors.' },
            { icon: ShieldCheck, title: 'Execution Focus', desc: 'Not a job board—a platform for executing high-impact, coordinated work.' }
          ].map((item, i) => (
            <div key={i} className="bg-[var(--bg-card)]/5 border border-[var(--text-primary)]/10 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] flex items-center justify-center mb-6">
                <item.icon className="w-6 h-6 text-[var(--sp-accent)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{item.title}</h3>
              <p className="text-[var(--text-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Project Goals Layout */}
      <section className="bg-[var(--bg-primary)]/5 py-24 mb-24 relative">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 animate-section">
          <h2 className="text-3xl lg:text-5xl font-bold text-[var(--text-primary)] mb-12 text-center">Initial 12-Month Objectives</h2>
          
          <div className="space-y-4">
            {[
              "Develop and launch a functional MVP digital platform.",
              "Onboard at least 500 globally trained and locally skilled professionals.",
              "Establish partnerships with 5–7 institutions (universities, counties, NGOs).",
              "Deliver 5–8 pilot projects or consultancy engagements.",
              "Create at least 50 short-term or project-based income opportunities."
            ].map((goal, i) => (
              <div key={i} className="bg-[var(--bg-card)]/5 p-6 rounded-2xl flex items-center gap-6 border border-[var(--text-primary)]/5 shadow-sm">
                <div className="text-4xl font-bold text-[var(--sp-accent)]/30 shrink-0 select-none">0{i + 1}</div>
                <p className="text-lg lg:text-xl font-medium text-[var(--text-primary)]">{goal}</p>
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
              <div className="bg-[var(--sp-accent)] rounded-3xl p-8 text-[var(--text-primary)]">
                <h3 className="text-2xl font-bold mb-4">Primary</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3"><Zap className="w-5 h-5 shrink-0" /> Study-abroad returnees</li>
                  <li className="flex items-center gap-3"><Zap className="w-5 h-5 shrink-0" /> Diaspora professionals seeking structured engagement</li>
                </ul>
              </div>
              <div className="bg-[var(--bg-card)]/5 border border-[var(--text-primary)]/10 rounded-3xl p-8 text-[var(--text-primary)]">
                <h3 className="text-xl font-bold mb-4">Secondary</h3>
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[var(--sp-accent)] shrink-0" /> County governments</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[var(--sp-accent)] shrink-0" /> Universities and alumni networks</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[var(--sp-accent)] shrink-0" /> NGOs and development agencies</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[var(--sp-accent)] shrink-0" /> SMEs and emerging ventures</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Expected Results */}
          <div className="animate-section">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-8">Expected Impact</h2>
            <div className="relative pl-8 border-l-2 border-[var(--sp-accent)]/30 space-y-12 pb-6">
              
              <div className="relative">
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[var(--bg-primary)] border-4 border-[var(--sp-accent)]" />
                <h3 className="text-lg font-bold text-[var(--sp-accent)] tracking-widest uppercase mb-3">Short-Term</h3>
                <p className="text-[var(--text-secondary)] font-medium">Increased engagement of globally trained professionals. Structured collaboration pathways established.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[var(--bg-primary)] border-4 border-[var(--sp-accent)]" />
                <h3 className="text-lg font-bold text-[var(--sp-accent)] tracking-widest uppercase mb-3">Medium-Term</h3>
                <p className="text-[var(--text-secondary)] font-medium">Job/income creation through project-based work. Launch of new ventures supported by cross-functional teams.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[var(--sp-accent)] border-4 border-[var(--sp-accent)] shadow-[0_0_15px_rgba(200,159,94,0.5)]" />
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">Long-Term Vision</h3>
                <p className="text-[var(--text-secondary)] font-medium text-lg">Transitioning from Brain Drain to Brain Circulation.</p>
                <p className="text-[var(--text-secondary)] font-medium text-lg mt-2">Sustainable local economic growth driven by globally informed expertise.</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer Conclusion */}
      <section className="max-w-5xl mx-auto px-6 lg:px-12 mt-32 text-center animate-section pb-12">
        <TrendingUp className="w-16 h-16 text-[var(--sp-accent)] mx-auto mb-8 opacity-80" />
        <h2 className="text-2xl lg:text-4xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
          Strategic Pathways ensures that global skills do not remain abroad or unused.
        </h2>
        <div className="w-24 h-1 bg-[var(--sp-accent)] mx-auto rounded-full" />
      </section>

    </div>
  );
};

export default AboutPage;
