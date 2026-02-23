import { Linkedin, Twitter, Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation and mount before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }
    
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  interface FooterLink {
    label: string;
    id?: string;
    path?: string;
    action?: () => void;
  }

  const footerLinks: { platform: FooterLink[], community: FooterLink[], support: FooterLink[] } = {
    platform: [
      { label: 'About', id: 'value' },
      { label: 'How it Works', id: 'how-it-works' },
      { label: 'Pricing', id: 'pricing' },
    ],
    community: [
      { label: 'For Professionals', id: 'audience' },
      { label: 'For Partners', id: 'opportunities' },
      { label: 'Impact', id: 'impact' },
    ],
    support: [
      { label: 'Sitemap', path: '/sitemap' },
      { label: 'Contact', id: 'contact' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Cookie Policy', path: '/cookies' },
    ]
  };

  return (
    <footer className="bg-[var(--bg-primary)] border-t border-[var(--sp-accent)]/10 py-12 lg:py-16">
      <div className="w-full px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <button 
                onClick={() => scrollToSection('hero')}
                className="glass-gold p-3 rounded-xl mb-4 inline-block hover:bg-[var(--sp-accent)]/20 transition-colors"
              >
                <img 
                  src="/logo.png" 
                  alt="Strategic Pathways" 
                  className="h-10 w-auto"
                />
              </button>
              <p className="text-[var(--text-secondary)] text-sm mb-4 leading-relaxed">
                A Kenya-based <span className="text-[var(--sp-accent)]">talent execution platform</span> designed to mobilise diaspora professionals into local <span className="text-[var(--sp-accent)]">venture-building</span> and consultancy engagements. Transforming brain drain into <span className="text-[var(--sp-accent)]">brain circulation</span>.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert('LinkedIn coming soon!'); }}
                  className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/10 transition-colors"
                >
                  <Linkedin size={18} />
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert('Twitter coming soon!'); }}
                  className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/10 transition-colors"
                >
                  <Twitter size={18} />
                </a>
                <a 
                  href="mailto:hello@joinstrategicpathways.com"
                  className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/10 transition-colors"
                >
                  <Mail size={18} />
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="text-[var(--text-primary)] font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                {footerLinks.platform.map((link) => (
                  <li key={link.id}>
                    <button 
                      onClick={() => scrollToSection(link.id!)}
                      className="text-[var(--text-secondary)] text-sm hover:text-[var(--sp-accent)] transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Links */}
            <div>
              <h4 className="text-[var(--text-primary)] font-semibold mb-4">Community</h4>
              <ul className="space-y-2">
                {footerLinks.community.map((link) => (
                  <li key={link.id}>
                    <button 
                      onClick={() => scrollToSection(link.id!)}
                      className="text-[var(--text-secondary)] text-sm hover:text-[var(--sp-accent)] transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-[var(--text-primary)] font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    {link.id ? (
                      <button 
                        onClick={() => scrollToSection(link.id!)}
                        className="text-[var(--text-secondary)] text-sm hover:text-[var(--sp-accent)] transition-colors"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <button 
                        onClick={() => { navigate(link.path!); window.scrollTo(0, 0); }}
                        className="text-[var(--text-secondary)] text-sm hover:text-[var(--sp-accent)] transition-colors"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[var(--sp-accent)]/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[var(--text-secondary)] text-sm">
              {currentYear} Strategic Pathways. All rights reserved.
            </p>
            <p className="text-[var(--text-secondary)]/70 text-xs">
              Compliant with the Kenya Data Protection Act, 2019
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
