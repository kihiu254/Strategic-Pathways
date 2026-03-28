import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Book, MessageCircle, Code, ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';
import { openSupportEmail } from '../lib/contact';

const HelpCenterPage = () => {
  const { t } = useTranslation();
  const pageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      question: "How do I get verified?",
      answer: "Navigate to the Verification page from your profile and upload the required professional or institutional documents. Our team reviews submissions within 3-5 business days."
    },
    {
      question: "What are the membership tiers?",
      answer: "We offer Community (Free), Professional ($100/year), and Institutional/Firm (Custom) tiers, each providing different levels of access to opportunities and verification badges."
    },
    {
      question: "Who can join Strategic Pathways?",
      answer: "The platform is designed for study-abroad returnees, diaspora returnees, diaspora professionals and development partners."
    }
  ];

  return (
    <div ref={pageRef} className="min-h-screen pt-32 pb-20 bg-[var(--bg-primary)]">
      <SEO title={t('footer.helpCenter')} />
      <div className="w-full px-6 lg:px-12 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-6">
            How can we help?
          </h1>
          <p className="text-[var(--text-secondary)] text-xl max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions or reach out to our support team.
          </p>
        </div>

        {/* Support Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="glass-card p-10 rounded-3xl border border-white/5 hover:bg-white/5 transition-all">
            <Book className="w-12 h-12 text-[var(--sp-accent)] mb-6" />
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Knowledge Base</h3>
            <p className="text-[var(--text-secondary)] mb-6">Access the latest Strategic Pathways brief while the article library is being refreshed.</p>
            <a href="/docs/Strategic_Pathways_Brief.pdf" target="_blank" rel="noopener noreferrer" className="sp-btn-glass w-full inline-flex items-center justify-center">
              Open Brief
            </a>
          </div>
          <div className="glass-card p-10 rounded-3xl border border-white/5 hover:bg-white/5 transition-all">
            <MessageCircle className="w-12 h-12 text-[var(--sp-accent)] mb-6" />
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Direct Support</h3>
            <p className="text-[var(--text-secondary)] mb-6">Can't find what you're looking for? Chat with our team or send us a message directly.</p>
            <button
              className="sp-btn-primary w-full"
              onClick={() =>
                openSupportEmail({
                  subject: 'Strategic Pathways help request',
                  body: 'Hi Strategic Pathways team,\n\nI need help with:\n',
                })
              }
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="glass-card p-8 rounded-2xl border border-white/5">
                <h4 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-3">
                  <HelpCircle className="text-[var(--sp-accent)] w-5 h-5 flex-shrink-0" />
                  {faq.question}
                </h4>
                <p className="text-[var(--text-secondary)] leading-relaxed pl-8">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Developer Section */}
        <div className="glass-card p-12 rounded-3xl border-2 border-[var(--sp-accent)]/20 bg-gradient-to-r from-[var(--sp-accent)]/5 to-transparent flex flex-col items-center text-center">
          <Code className="w-16 h-16 text-[var(--sp-accent)] mb-6" />
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Contact Support Team</h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto mb-8">
            Experience technical issues or have feedback about the website? Reach Strategic Pathways directly by email.
          </p>
          <button
            type="button"
            onClick={() =>
              openSupportEmail({
                subject: 'Strategic Pathways website support',
                body: 'Hi Strategic Pathways team,\n\nI need help with:\n',
              })
            }
            className="sp-btn-primary flex items-center gap-3 px-10 py-4 text-lg"
          >
            Email Support
            <ExternalLink size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
