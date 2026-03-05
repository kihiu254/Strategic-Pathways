import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ContactSection from './ContactSection';
import SEO from '../components/SEO';

const ContactPage = () => {
  const { t } = useTranslation();
  const pageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen pt-32 pb-20 bg-[var(--bg-primary)]">
      <SEO title={t('footer.contact')} />
      <div className="w-full px-6 lg:px-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-6">
            Get in Touch
          </h1>
          <p className="text-[var(--text-secondary)] text-xl max-w-2xl mx-auto leading-relaxed">
            Have questions about Strategic Pathways? Our team is here to help you navigate your journey.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <ContactSection className="!bg-transparent !py-0" />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
