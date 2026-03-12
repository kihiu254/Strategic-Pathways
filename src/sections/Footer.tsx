import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Send, Globe, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';
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
    navigate('/signup');
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
        { label: t('footer.successStories'), href: '/impact' }
      ]
    },
    resources: {
      title: t('footer.resources'),
      links: [
        { label: t('footer.privacy'), href: '/privacy' },
        { label: t('footer.terms'), href: '/terms' },
        { label: t('footer.cookies'), href: '/cookies' }
      ]
    }
  };

  return (
    <footer className="relative bg-[var(--bg-primary)] border-t border-white/5 py-16">
      <div className="w-full px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand & Social */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <img 
              src="/logo.png" 
              alt="Strategic Pathways" 
              width={160} 
              height={40} 
              className="h-10 w-auto mb-6 rounded-lg cursor-pointer grayscale hover:grayscale-0 transition-all duration-500" 
              onClick={() => navigate('/')}
            />
            <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed max-w-sm">
              {t('footer.brandDesc')}
            </p>
            
            <div className="flex flex-wrap gap-3">
              {[
                { platform: 'X', url: 'https://x.com/SPathways_' },
                { platform: 'LinkedIn', url: 'https://www.linkedin.com/company/join-strategicpathways/' },
                { platform: 'TikTok', url: 'https://www.tiktok.com/@joinstrategicpathways' },
                { platform: 'Threads', url: 'https://www.threads.net/@joinstrategicpathways' },
                { platform: 'YouTube', url: 'https://www.youtube.com/@joinstrategicpathways' },
              ].map((social, i) => (
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
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
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
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 text-[var(--text-secondary)] text-xs font-medium order-2 md:order-1 text-center md:text-left">
            <span>© 2026 {t('footer.rights')}</span>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <a href="mailto:hello@joinstrategicpathways.com" className="hover:text-[var(--sp-accent)] transition-colors">
                hello@joinstrategicpathways.com
              </a>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8 order-1 md:order-2">
            <p className="text-[var(--text-secondary)] text-sm md:text-md leading-relaxed max-w-sm text-center md:text-right opacity-60">
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
