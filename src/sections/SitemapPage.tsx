import { useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, Users, Briefcase, Zap, FileText, LayoutDashboard, Layout } from 'lucide-react';
import SEO from '../components/SEO';

const SitemapPage = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Main Platform',
      links: [
        { name: 'Home', path: '/', icon: Globe, desc: 'Entrance to the talent execution and venture-building platform for brain circulation.' },
        { name: 'Concept Note', path: '/concept-note', icon: FileText, desc: 'Detailed background, problem statement, and proposed solution for study-abroad returnees, diaspora returnees, diaspora professionals, and partners.' },
        { name: 'Opportunities', path: '/opportunities', icon: Briefcase, desc: 'Vetted list of impactful local projects, consultancy engagements, and venture-building cohorts.' },
      ]
    },
    {
      title: 'User Experience',
      links: [
        { name: 'Onboarding', path: '/', icon: Zap, desc: 'Digital onboarding and profile management for study-abroad returnees, diaspora returnees, and diaspora professionals.' },
        { name: 'Login / Register', path: '/login', icon: Users, desc: 'Access the secure network to start collaborating on cross-functional teams.' },
        { name: 'User Dashboard', path: '/profile', icon: LayoutDashboard, desc: 'Manage your global-to-local skills profile and track your impact.' },
      ]
    },
    {
      title: 'Administrative',
      links: [
        { name: 'Admin Control Panel', path: '/admin', icon: Layout, desc: 'Strategic management of national talent infrastructure and partnership coordination.' },
      ]
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 lg:px-12 bg-[var(--bg-primary)]">
      <SEO 
        title="Sitemap" 
        description="Structured overview of the Strategic Pathways platform. Navigate pathways for study-abroad returnees, diaspora returnees, diaspora professionals, and development partners."
      />
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-0.5 bg-gradient-to-r from-[#C89F5E] to-transparent" />
            <span className="sp-label text-sm tracking-widest uppercase">Navigation Map</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-6">
            Styled <span className="text-[var(--sp-accent)]">Sitemap</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Strategic Pathways is more than a job board; it is a collaborative ecosystem designed to mobilise study-abroad returnees, diaspora returnees, and diaspora professionals into locally impactful projects. Use this map to explore our structured collaboration pathways.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, idx) => (
            <div key={idx} className="glass-panel p-8">
              <h2 className="text-xl font-bold text-[var(--sp-accent)] mb-6 border-b border-[var(--sp-accent)]/20 pb-4">
                {section.title}
              </h2>
              <div className="space-y-6">
                {section.links.map((link, lIdx) => (
                  <div 
                    key={lIdx}
                    onClick={() => handleNavigate(link.path)}
                    className="group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <link.icon size={18} className="text-[var(--sp-accent)]" />
                      <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--sp-accent)] transition-colors">
                        {link.name}
                      </h3>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[var(--sp-accent)]" />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]/80 leading-relaxed pl-7">
                      {link.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Brain Circulation Summary to satisfy keyword density */}
        <div className="mt-16 p-8 border border-[var(--sp-accent)]/10 rounded-2xl bg-[var(--bg-secondary)]/30">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Our Success Criteria</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-[var(--text-secondary)]">
            <div className="flex flex-col gap-2">
              <span className="text-[var(--sp-accent)] font-medium">Mobility</span>
              <p>Onboard at least 500 study-abroad returnees, diaspora returnees, and diaspora professionals annually into Kenya's ecosystem.</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[var(--sp-accent)] font-medium">Collaboration</span>
              <p>Establish 5-7 dedicated institutional partnerships with NGOs, counties, and universities.</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[var(--sp-accent)] font-medium">Venture Growth</span>
              <p>Launch new ventures supported by cross-functional teams and transition from brain drain.</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[var(--sp-accent)] font-medium">Economic Impact</span>
              <p>Create project-based income opportunities and strengthen county-level institutional capacity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;
