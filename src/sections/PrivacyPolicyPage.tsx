import LegalLayout from '../components/LegalLayout';
import SEO from '../components/SEO';

const PrivacyPolicyPage = () => {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="February 23, 2026">
      <SEO title="Privacy Policy" description="Privacy Policy for Strategic Pathways. Compliant with the Kenya Data Protection Act, 2019." />
      
      <div className="space-y-8 text-[var(--text-secondary)] leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">1. Introduction</h2>
          <p>
            Strategic Pathways ("we", "us", or "our") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information in compliance with the <strong>Kenya Data Protection Act, 2019 (DPA)</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">2. Data We Collect</h2>
          <p>We collect information that you provide directly to us when creating a profile, including:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Identity Data: Name, username, and professional titles.</li>
            <li>Contact Data: Email address and phone number.</li>
            <li>Professional Data: CVs, skills, sector expertise, and educational background.</li>
            <li>Location Data: Country and city of residence (specifically tracking diaspora status).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">3. Purpose of Processing</h2>
          <p>We process your data to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Facilitate the "Brain Circulation" model by matching skilled professionals with local Kenyan opportunities.</li>
            <li>Manage your account and provides secure access to the platform.</li>
            <li>Verify credentials for vetting purposes.</li>
            <li>Communicate platform updates and project opportunities.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">4. Legal Basis (DPA Compliance)</h2>
          <p>Under the Kenya Data Protection Act, our legal basis for processing your data includes:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li><strong>Consent:</strong> You provide explicit consent when signing up and accepting our terms.</li>
            <li><strong>Contract:</strong> Processing is necessary to provide the services requested as a member of the network.</li>
            <li><strong>Legitimate Interests:</strong> Fostering economic growth through talent mobilisation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">5. Data Sharing & International Transfers</h2>
          <p>
            We do not sell your data. We may share information with verified institutional partners (Counties, NGOs, and SMEs) for the sole purpose of matching you with projects. As some of our users are in the diaspora, data may be accessed internationally, but always under strict security protocols.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">6. Your Rights</h2>
          <p>Under the DPA, you have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Request access to your personal data.</li>
            <li>Request correction or deletion of your data.</li>
            <li>Object to or restrict the processing of your data.</li>
            <li>Withdraw consent at any time.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at: 
            <a href="mailto:info@joinstrategicpathways.com" className="text-[var(--sp-accent)] underline ml-1">info@joinstrategicpathways.com</a>
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default PrivacyPolicyPage;
