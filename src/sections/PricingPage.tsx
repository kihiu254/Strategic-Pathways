import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PricingSection from './PricingSection';
import SEO from '../components/SEO';

const PricingPage = () => {
  const { t } = useTranslation();
  const pageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen pt-32 pb-20 bg-[var(--bg-primary)]">
      <SEO title={t('footer.resources')} />
      <div className="w-full px-6 lg:px-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-6">
            Membership & Access
          </h1>
          <p className="text-[var(--text-secondary)] text-xl max-w-2xl mx-auto leading-relaxed">
            Choose the vetted membership path that best fits your professional or institutional goals.
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <PricingSection className="!bg-transparent !py-0" />
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
