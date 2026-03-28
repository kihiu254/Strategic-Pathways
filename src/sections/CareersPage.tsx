import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { Briefcase, MapPin, Search } from 'lucide-react';
import SEO from '../components/SEO';
import { openSupportEmail } from '../lib/contact';

const CareersPage = () => {
  const { t } = useTranslation();
  const pageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.fromTo(".career-item",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const jobs = [
    {
      title: "Strategy Advisor",
      department: "Consulting",
      location: "Remote / Nairobi",
      type: "Full-time"
    },
    {
      title: "Community Growth Lead",
      department: "Marketing",
      location: "Remote / Global",
      type: "Full-time"
    },
    {
      title: "Verification Analyst",
      department: "Operations",
      location: "Remote",
      type: "Contract"
    }
  ];

  return (
    <div ref={pageRef} className="min-h-screen pt-32 pb-20 bg-[var(--bg-primary)]">
      <SEO title={t('footer.careers')} />
      <div className="w-full px-6 lg:px-12 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-6">
            Join Our Mission
          </h1>
          <p className="text-[var(--text-secondary)] text-xl max-w-2xl mx-auto leading-relaxed">
            We're looking for passionate individuals to help us bridge the gap between global talent and local impact.
          </p>
        </div>

        {/* Search/Filter Bar */}
        <div className="glass-card p-6 rounded-2xl mb-12 flex flex-col md:flex-row gap-4 items-center border border-white/5">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search positions..." 
              className="w-full bg-white/5 rounded-xl py-3 pl-12 pr-4 text-[var(--text-primary)] border border-white/10 focus:border-[var(--sp-accent)]/50 transition-colors"
            />
          </div>
          <button className="sp-btn-primary px-8 py-3 w-full md:w-auto">Search</button>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {jobs.map((job, index) => (
            <div key={index} className="career-item glass-card p-8 rounded-2xl border border-white/5 hover:border-[var(--sp-accent)]/30 transition-all hover:bg-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{job.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Briefcase size={16} className="text-[var(--sp-accent)]" />
                    {job.department}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-[var(--sp-accent)]" />
                    {job.location}
                  </span>
                  <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {job.type}
                  </span>
                </div>
              </div>
              <button 
                className="sp-btn-glass px-8 py-3 whitespace-nowrap"
                onClick={() =>
                  openSupportEmail({
                    subject: `Strategic Pathways career interest: ${job.title}`,
                    body: `Hi Strategic Pathways team,\n\nI am interested in the ${job.title} role.\n`,
                  })
                }
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>

        {/* Culture/Values Brief */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-20">
          <div>
            <h4 className="text-xl font-bold text-[var(--text-primary)] mb-4">Remote First</h4>
            <p className="text-[var(--text-secondary)] leading-relaxed">We believe in results over presence. Our team works from where they are most productive.</p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-[var(--text-primary)] mb-4">Impact Driven</h4>
            <p className="text-[var(--text-secondary)] leading-relaxed">Every task we do is aimed at creating real-world change for local communities.</p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-[var(--text-primary)] mb-4">Continuous Learning</h4>
            <p className="text-[var(--text-secondary)] leading-relaxed">We offer stipends for courses and attendance at strategic conferences.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;
