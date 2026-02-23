import LegalLayout from '../components/LegalLayout';
import SEO from '../components/SEO';

const TermsOfServicePage = () => {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="February 23, 2024">
      <SEO title="Terms of Service" description="Terms of Service for the Strategic Pathways platform." />
      
      <div className="space-y-8 text-[var(--text-secondary)] leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Strategic Pathways platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">2. The Platform Service</h2>
          <p>
            Strategic Pathways is a talent execution and venture-building platform. We provide a space for globally trained professionals and institutional partners to collaborate on projects. We are not a job board or a social network; we are an impact-driven ecosystem.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">3. User Eligibility & Vetting</h2>
          <p>
            Membership is subject to a vetting process. We reserve the right to approve or reject applications based on our criteria for "Brain Circulation" and professional standards. You must provide accurate and truthful information during registration.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Use the platform for any unlawful professional activities.</li>
            <li>Submit fraudulent credentials or identity documents.</li>
            <li>Harass other members or partners within the network.</li>
            <li>Attempt to bypass our security or matching mechanisms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">5. Intellectual Property</h2>
          <p>
            The content, structure, and "Brain Circulation" model of Strategic Pathways are protected by international copyright and intellectual property laws. Users retain ownership of their personal profiles but grant us a license to share relevant data with partners for matching purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">6. Limitation of Liability</h2>
          <p>
            While we strive for high-quality project matching, Strategic Pathways is not liable for the outcome of specific consultancy engagements or venture-building initiatives. We act as a facilitator and platform provider.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">7. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account if you violate these terms or if your professional conduct falls below our network standards.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default TermsOfServicePage;
