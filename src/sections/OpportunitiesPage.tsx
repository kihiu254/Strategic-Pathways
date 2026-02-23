import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, MapPin, Briefcase, Clock, Filter, ArrowRight, Building2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const OpportunitiesPage = () => {
  const { t, i18n } = useTranslation();
  const pageRef = useRef<HTMLDivElement>(null);
  
  const [activeFilter, setActiveFilter] = useState('All');

  const opportunities = [
    {
      id: 1,
      title: 'Digital Transformation Consultant',
      org: 'Nairobi County Government',
      location: 'Nairobi, Kenya',
      type: 'Consultancy',
      duration: '6 Months',
      tags: ['Tech', 'Public Sector'],
      description: 'Lead the digital transformation strategy for county service delivery.'
    },
    {
      id: 2,
      title: 'AgriTech Value Chain Expert',
      org: 'Green Innovations NGO',
      location: 'Nakuru, Kenya (Hybrid)',
      type: 'Project Lead',
      duration: '12 Months',
      tags: ['Agriculture', 'NGO'],
      description: 'Design and implement supply chain optimizations for local farmers.'
    },
    {
      id: 3,
      title: 'Venture Builder In-Residence',
      org: 'Kenya Innovation Hub',
      location: 'Remote',
      type: 'Part-Time',
      duration: 'Ongoing',
      tags: ['Startups', 'Finance'],
      description: 'Mentor early-stage startups and help build viable financial models.'
    },
    {
      id: 4,
      title: 'Public Health Data Analyst',
      org: 'Ministry of Health Alliance',
      location: 'Mombasa, Kenya',
      type: 'Contract',
      duration: '3 Months',
      tags: ['Healthcare', 'Data'],
      description: 'Analyze returning public health data to optimize resource allocation.'
    },
  ];

  const filteredOpps = activeFilter === 'All' 
    ? opportunities 
    : opportunities.filter(opp => opp.tags.includes(activeFilter) || opp.type === activeFilter);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.title = t('oppsPage.title');
    
    const ctx = gsap.context(() => {
      gsap.fromTo('.animate-hero',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );

      gsap.fromTo('.animate-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.animate-grid',
            start: 'top 85%'
          }
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, [activeFilter, t]);

  // Sync title on language change
  useEffect(() => {
    document.title = t('oppsPage.title');
  }, [i18n.language, t]);

  return (
    <div ref={pageRef} className="min-h-screen bg-[var(--bg-primary)] pt-32 pb-20">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-16">
        <div className="max-w-3xl animate-hero">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-6">
            {i18n.language === 'sw' ? 
              <span dangerouslySetInnerHTML={{ __html: t('oppsPage.headline') }} /> : 
              <>Discover <span className="text-[var(--sp-accent)]">Local</span> Opportunities</>
            }
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            {t('oppsPage.subheadline')}
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 animate-hero">
          <div className="glass-card p-6 sticky top-24">
            <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold mb-6">
              <Filter size={18} className="text-[var(--sp-accent)]" /> 
              {t('oppsPage.filters.title')}
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">{t('oppsPage.filters.sectors')}</h4>
                <div className="space-y-2 flex flex-col items-start">
                  {[
                    { key: 'all', label: t('oppsPage.filters.all') },
                    { key: 'tech', label: t('oppsPage.filters.tech') },
                    { key: 'agri', label: t('oppsPage.filters.agri') },
                    { key: 'health', label: t('oppsPage.filters.health') },
                    { key: 'finance', label: t('oppsPage.filters.finance') },
                    { key: 'public', label: t('oppsPage.filters.public') },
                    { key: 'ngo', label: t('oppsPage.filters.ngo') }
                  ].map(filter => (
                    <button 
                      key={filter.key}
                      onClick={() => setActiveFilter(filter.key === 'all' ? 'All' : filter.label)} // Keeping match logic simple for now
                      className={`text-sm transition-colors ${activeFilter === (filter.key === 'all' ? 'All' : filter.label) ? 'text-[var(--sp-accent)] font-medium' : 'text-[var(--text-primary)] hover:text-[var(--sp-accent)]'}`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Board */}
        <div className="flex-1 animate-grid">
          {/* Search bar */}
          <div className="relative mb-8 animate-hero">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
            <input 
              type="text" 
              placeholder={t('oppsPage.search')} 
              className="w-full input-glass pl-12 pr-4 py-4 text-[var(--text-primary)]"
            />
          </div>

          {/* Grid */}
          <div className="space-y-4">
            {filteredOpps.map((opp) => (
              <div key={opp.id} className="glass border border-[var(--text-primary)]/10 rounded-2xl p-6 hover:border-[var(--sp-accent)]/40 transition-all duration-300 animate-card group">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--sp-accent)] transition-colors">{opp.title}</h3>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] mt-1">
                      <Building2 size={16} />
                      <span className="text-sm font-medium">{opp.org}</span>
                    </div>
                  </div>
                  <button className="sp-btn-glass text-sm shrink-0 flex items-center gap-2">
                    {t('oppsPage.apply')}
                    <ArrowRight size={16} />
                  </button>
                </div>
                
                <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-2xl bg-[var(--bg-card)]/5 p-4 rounded-xl border border-[var(--sp-accent)]/10">
                  {opp.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1.5 bg-[var(--bg-card)]/10 px-3 py-1 rounded-full">
                    <MapPin size={14} className="text-[var(--sp-accent)]" /> {opp.location}
                  </div>
                  <div className="flex items-center gap-1.5 bg-[var(--bg-card)]/10 px-3 py-1 rounded-full">
                    <Briefcase size={14} className="text-[var(--sp-accent)]" /> {opp.type}
                  </div>
                  <div className="flex items-center gap-1.5 bg-[var(--bg-card)]/10 px-3 py-1 rounded-full">
                    <Clock size={14} className="text-[var(--sp-accent)]" /> {opp.duration}
                  </div>
                </div>

              </div>
            ))}

            {filteredOpps.length === 0 && (
              <div className="text-center py-12 glass rounded-2xl border border-[var(--text-primary)]/10">
                <p className="text-[var(--text-secondary)]">{t('oppsPage.noResults')}</p>
                <button onClick={() => setActiveFilter('All')} className="text-[var(--sp-accent)] mt-4 hover:underline">{t('oppsPage.clearFilters')}</button>
              </div>
            )}
          </div>
        </div>

      </section>
    </div>
  );
};

export default OpportunitiesPage;
