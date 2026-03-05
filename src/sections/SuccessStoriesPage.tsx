import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, Quote } from 'lucide-react';
import SEO from '../components/SEO';

gsap.registerPlugin(ScrollTrigger);

const SuccessStoriesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current?.children || [],
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const stats = [
    { value: '500+', label: t('impact.stats.professionals') },
    { value: '5–7', label: t('impact.stats.partners') },
    { value: '5–8', label: t('impact.stats.projects') },
    { value: '50+', label: t('impact.stats.opportunities') }
  ];

  const stories = [
    {
      name: "Sarah Mwangi",
      role: "Strategy Consultant",
      content: "Strategic Pathways connected me with a high-impact infrastructure project that perfectly matched my expertise in sustainable development.",
      image: "/images/impact_mentorship.jpg"
    },
    {
      name: "John Kamau",
      role: "Financial Analyst",
      content: "The platform's verification system gave me the credibility I needed to win contracts with institutional partners across East Africa.",
      image: "/images/impact_mentorship.jpg"
    }
  ];

  return (
    <div ref={pageRef} className="min-h-screen pt-32 pb-20 bg-[var(--bg-primary)]">
      <SEO title={t('footer.successStories')} />
      <div className="w-full px-6 lg:px-12 max-w-7xl mx-auto">
        <div ref={contentRef} className="space-y-20">
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] mb-6">
              {t('impact.headline')}
            </h1>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-xl leading-relaxed">
              Discover how Strategic Pathways is transforming professional collaboration and local impact.
            </p>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/5">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-[var(--sp-accent)] mb-2">
                  {stat.value}
                </div>
                <div className="text-[var(--text-secondary)] text-sm lg:text-base uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {stories.map((story, index) => (
              <div key={index} className="glass-card p-10 rounded-3xl relative">
                <Quote className="absolute top-8 right-8 text-[var(--sp-accent)]/20 w-16 h-16" />
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[var(--sp-accent)]/30">
                    <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">{story.name}</h3>
                    <p className="text-[var(--sp-accent)]">{story.role}</p>
                  </div>
                </div>
                <p className="text-[var(--text-secondary)] text-lg italic leading-relaxed">
                  "{story.content}"
                </p>
              </div>
            ))}
          </div>

          {/* Download CTA */}
          <div className="glass-card p-12 rounded-3xl text-center bg-gradient-to-br from-[var(--bg-card)]/10 to-transparent">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Ready to make your own impact?</h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
               <a 
                href="/docs/Strategic_Pathways_Brief.pdf"
                download="Strategic_Pathways_Brief.pdf"
                className="sp-btn-primary flex items-center gap-3 px-8 py-4"
              >
                <Download size={20} />
                {t('impact.cta')}
              </a>
              <button 
                onClick={() => navigate('/signup')}
                className="sp-btn-secondary px-8 py-4"
              >
                {t('nav.register')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessStoriesPage;
