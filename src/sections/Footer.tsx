import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Send, Globe } from 'lucide-react';
import { openSupportEmail } from '../lib/contact';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import SocialIcon from '../components/SocialIcon';

const Footer = () => {

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const isLoggedIn = !!session;
  
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [regEmail, setRegEmail] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail) {
      toast.error(t('auth.toast.invalidEmail'));
      return;
    }

    openSupportEmail({
      subject: 'Strategic Pathways membership request',
      body: `Hi Strategic Pathways team,\n\nI would like to join the network.\n\nEmail: ${regEmail}\n`,
    });
  };

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const { data } = await supabase
        .from('platform_social_links')
        .select('*')
        .order('display_order');
      
      if (data) setSocialLinks(data);
    } catch (error) {
      console.error('Error fetching social links:', error);
    }
  };

  const getSocialIcon = (platform: string) => {
    return (props: any) => <SocialIcon platform={platform} {...props} />;
  };

  const footerLinks = {
    platform: {
      title: t('footer.platform'),
      links: [
        { label: t('nav.about'), href: '/concept-note' },
        { label: t('nav.howItWorks'), href: '/how-it-works' },
        { label: t('footer.opportunities'), href: '/opportunities' },
        { label: t('footer.projects'), href: '/projects' },
        { label: t('footer.successStories'), href: '/impact' }
      ]
    },
    resources: {
      title: t('footer.resources'),
      links: [
        { label: t('footer.helpCenter'), href: '/help-center' },
        { label: t('footer.privacy'), href: '/privacy' },
        { label: t('footer.terms'), href: '/terms' },
        { label: t('footer.cookies'), href: '/cookies' }
      ]
    }
  };

  return (
    <footer className="relative bg-[var(--bg-primary)] border-t border-white/5 py-14 md:py-16">
      <div className="w-full max-w-[88rem] mx-auto px-6 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-10 md:gap-12 xl:gap-16 mb-14 md:mb-16">
          {/* Brand & Social */}
          <div className="flex flex-col items-start md:max-w-lg xl:pr-10">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="group text-left mb-6"
              aria-label="Strategic Pathways Home"
            >
              <span
                className="block text-2xl sm:text-3xl font-semibold tracking-[0.08em] text-[var(--text-primary)] transition-colors group-hover:text-[var(--sp-accent)]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span className="text-[var(--sp-accent)] group-hover:text-[var(--text-primary)] transition-colors">Strategic</span>{' '}
                Pathways
              </span>
              <span className="mt-2 block h-0.5 w-12 rounded-full bg-[var(--sp-accent)]/70 group-hover:bg-[var(--sp-accent)] transition-colors" />
            </button>
            <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed max-w-sm">
              {t('footer.brandDesc')}
            </p>
            
            <div className="flex flex-wrap gap-3">
              {[
                { platform: 'X', url: 'https://x.com/SPathways_' },
                { platform: 'LinkedIn', url: 'https://www.linkedin.com/company/join-strategicpathways/' },
                { platform: 'Instagram', url: 'https://www.instagram.com/joinstrategicpathways/' },
                { platform: 'TikTok', url: 'https://www.tiktok.com/@joinstrategicpathways' },
                { platform: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61588643401308' },
                { platform: 'Threads', url: 'https://www.threads.net/@joinstrategicpathways' },
                { platform: 'YouTube', url: 'https://www.youtube.com/@joinstrategicpathways' },
              ].map((social) => (
                <a 
                  key={social.platform} 
                  href={social.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl glass-light border border-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--sp-accent)] hover:border-[var(--sp-accent)]/30 hover:bg-[var(--sp-accent)]/10 transition-all duration-300 group"
                  title={social.platform}
                >
                  <SocialIcon platform={social.platform} size={18} className="group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 md:gap-10 xl:gap-14 w-full md:max-w-xl xl:max-w-2xl md:justify-self-end">
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key} className="flex flex-col">
                <h4 className="text-[var(--text-primary)] font-bold mb-6 text-xs uppercase tracking-[0.2em]">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      {link.href.startsWith('#') ? (
                         <a 
                          href={link.href}
                          className="text-[var(--text-secondary)] hover:text-[var(--sp-accent)] transition-colors inline-block group text-sm"
                        >
                          <span className="relative">
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--sp-accent)] transition-all duration-300 group-hover:w-full"></span>
                          </span>
                        </a>
                      ) : (
                        <Link 
                          to={link.href}
                          className="text-[var(--text-secondary)] hover:text-[var(--sp-accent)] transition-colors inline-block group text-sm"
                        >
                          <span className="relative">
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--sp-accent)] transition-all duration-300 group-hover:w-full"></span>
                          </span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter / CTA */}
        {!isLoggedIn && (
          <div className="premium-glass p-8 md:p-12 rounded-[2.5rem] mb-16 flex flex-col lg:flex-row items-center justify-between gap-10 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--sp-accent)]/5 blur-[80px] rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10 text-center lg:text-left">
              <h4 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
                {t('footer.connect')}
              </h4>
              <p className="text-[var(--text-secondary)] text-sm md:text-base opacity-80 max-w-md">
                {t('footer.madeWith')}
              </p>
            </div>
            <form onSubmit={handleRegister} className="relative z-10 flex flex-col sm:flex-row w-full lg:w-auto gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]/50" size={18} />
                <input 
                  type="email" 
                  placeholder="email@example.com" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="input-glass bg-white/[0.03] pl-12 pr-6 py-4 rounded-2xl outline-none text-[var(--text-primary)] w-full sm:w-80 text-sm focus:ring-2 ring-[var(--sp-accent)]/20" 
                  required
                />
              </div>
              <button 
                type="submit"
                className="sp-btn-primary px-10 py-4 rounded-2xl flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 transition-all"
              >
                {t('nav.register')}
                <Send size={18} />
              </button>
            </form>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6 md:gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-[var(--text-secondary)] text-xs font-medium order-2 lg:order-1 text-center md:text-left">
            <span>© 2026 {t('footer.rights')}</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 order-1 lg:order-2 w-full lg:w-auto">
            <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed max-w-sm text-center lg:text-right opacity-60">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-3 glass-light px-4 py-2 rounded-full border border-white/5">
              <Globe size={14} className="text-[var(--sp-accent)]" />
              <span className="text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-widest">
                {i18n.language}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
