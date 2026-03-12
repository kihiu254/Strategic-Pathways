import LegalLayout from '../components/LegalLayout';
import SEO from '../components/SEO';

const CookiePolicyPage = () => {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="February 23, 2026">
      <SEO title="Cookie Policy" description="Detailed information about how Strategic Pathways uses cookies and manages consent mode v2." />
      
      <div className="space-y-8 text-[var(--text-secondary)] leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">1. What are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device that help us provide a functional and secure user experience. We use them primarily to remember your preferences and analyze how our platform is being used.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">2. How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li><strong>Authentication:</strong> Keeping you logged in as you navigate the platform.</li>
            <li><strong>Preferences:</strong> Remembering settings like your language choice or cookie consent.</li>
            <li><strong>Analytics:</strong> Understanding platform usage through Google Analytics.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">3. Google Consent Mode v2</h2>
          <p>
            In compliance with EEA and international privacy standards, we have implemented <strong>Google Consent Mode v2</strong>. This means:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>By default, all non-essential tracking (analytics and ads) is <strong>denied</strong>.</li>
            <li>Tracking only begins after you provide explicit consent via our cookie banner.</li>
            <li>We respect the specific parameters of `ad_user_data` and `ad_personalization` based on your choice.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">4. Managing Your Cookies</h2>
          <p>
            You can clear your cookies in your browser settings at any time. If you wish to change your consent choice for our platform, you can clear your browser's local storage for this site, which will trigger the cookie banner again upon your next visit.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">5. Third-Party Cookies</h2>
          <p>
            We use Google Analytics to measure site traffic. Google may set its own cookies to provide these metrics. We do not control these third-party cookies directly, but we do control the consent signal sent to them.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default CookiePolicyPage;
