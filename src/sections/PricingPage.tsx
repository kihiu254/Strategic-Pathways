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
      <SEO title={t('nav.pricing')} />
      <div className="w-full px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <PricingSection className="!bg-transparent !py-0" />
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
