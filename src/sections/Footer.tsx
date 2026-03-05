import { Linkedin, Instagram, Youtube, Facebook, Twitter, Globe, Github, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

const Footer = () => {

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
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
        .eq('is_active', true)
        .order('display_order');
      
      if (data) setSocialLinks(data);
    } catch (error) {
      console.error('Error fetching social links:', error);
    }
  };

  const getSocialIcon = (platform: string) => {
    const iconMap: any = {
      'LinkedIn': Linkedin,
      'Instagram': Instagram,
      'TikTok': () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      'X (Twitter)': Twitter,
      'Facebook': Facebook,
      'Threads': () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12.186 3.094c-.522.27-1.017.59-1.479.957a8.832 8.832 0 0 0-1.296 1.343 8.838 8.838 0 0 0-.957 1.479 8.832 8.832 0 0 0-.59 1.628 8.832 8.832 0 0 0-.183 1.685v.628c0 .574.061 1.144.183 1.685.122.541.3 1.067.59 1.628.27.522.59 1.017.957 1.479.367.462.783.878 1.296 1.343.462.367.957.687 1.479.957.561.29 1.087.468 1.628.59.541.122 1.111.183 1.685.183h.628c.574 0 1.144-.061 1.685-.183.541-.122 1.067-.3 1.628-.59.522-.27 1.017-.59 1.479-.957a8.832 8.832 0 0 0 1.343-1.296c.367-.462.687-.957.957-1.479.29-.561.468-1.087.59-1.628.122-.541.183-1.111.183-1.685v-.628c0-.574-.061-1.144-.183-1.685a8.832 8.832 0 0 0-.59-1.628 8.832 8.832 0 0 0-.957-1.479 8.838 8.838 0 0 0-1.343-1.296 8.832 8.832 0 0 0-1.479-.957 8.832 8.832 0 0 0-1.628-.59 8.832 8.832 0 0 0-1.685-.183h-.628c-.574 0-1.144.061-1.685.183a8.832 8.832 0 0 0-1.628.59z"/>
        </svg>
      ),
      'YouTube': Youtube
    };
    return iconMap[platform] || Globe;
  };

  const footerLinks = {
    platform: {
      title: t('footer.platform'),
      links: [
        { label: t('footer.opportunities'), href: '/opportunities' },
        { label: t('footer.profile'), href: '/profile' },
        { label: t('footer.verification'), href: '/verification' },
        { label: t('footer.about'), href: '/concept-note' }
      ]
    },
    company: {
      title: t('footer.company'),
      links: [
        { label: t('footer.howItWorks'), href: '/how-it-works' },
        { label: t('footer.successStories'), href: '/success-stories' },
        { label: t('footer.careers'), href: '/careers' },
        { label: t('footer.contact'), href: '/contact' }
      ]
    },
    resources: {
      title: t('footer.resources'),
      links: [
        { label: t('footer.privacy'), href: '/privacy' },
        { label: t('footer.terms'), href: '/terms' },
        { label: t('footer.cookies'), href: '/cookies' },
        { label: t('footer.helpCenter'), href: '/help-center' }
      ]
    }
  };

  return (
    <footer className="relative bg-[var(--bg-primary)] border-t border-white/5 py-12">
      <div className="w-full px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-4">
            <img 
              src="/logo.png" 
              alt="Strategic Pathways" 
              width={160} 
              height={40} 
              className="h-10 w-auto mb-6 rounded-lg cursor-pointer" 
              onClick={() => navigate('/')}
            />
            <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed max-w-sm">
              {t('footer.brandDesc')}
            </p>
            <div className="flex gap-4">
              {socialLinks.length > 0 ? (
                socialLinks.map((link) => {
                  const Icon = getSocialIcon(link.platform_name);
                  return (
                    <a 
                      key={link.id} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[var(--bg-card)]/10 flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--sp-accent)] hover:text-white transition-all duration-300"
                    >
                      <Icon size={18} />
                    </a>
                  );
                })
              ) : (
                [Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-[var(--bg-card)]/10 flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--sp-accent)] hover:text-white transition-all duration-300">
                    <Icon size={18} />
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key}>
                <h4 className="text-[var(--text-primary)] font-bold mb-6 text-sm uppercase tracking-widest">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      {link.href === '#' ? (
                        <span className="text-[var(--text-secondary)] transition-colors inline-block text-left opacity-50 cursor-not-allowed">
                          {link.label}
                        </span>
                      ) : (
                        <Link 
                          to={link.href}
                          className="text-[var(--text-secondary)] hover:text-[var(--sp-accent)] transition-colors inline-block group text-left"
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
        <div className="glass-card p-1 pb-1 pr-1 pl-1 md:p-8 rounded-3xl mb-16 flex flex-col md:flex-row items-center justify-between gap-8 border border-[var(--text-primary)]/5">
          <div className="p-6 md:p-0">
            <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2">{t('footer.connect')}</h4>
            <p className="text-[var(--text-secondary)] text-sm">{t('footer.madeWith')}</p>
          </div>
          <form onSubmit={handleRegister} className="flex w-full md:w-auto p-4 md:p-0">
            <input 
              type="email" 
              placeholder="email@example.com" 
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className="input-glass bg-[var(--bg-card)]/20 px-6 py-3 rounded-l-2xl outline-none text-[var(--text-primary)] w-full md:w-64" 
            />
            <button 
              type="submit"
              className="bg-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/80 text-white px-8 py-3 rounded-r-2xl font-bold transition-all shadow-lg shadow-[var(--sp-accent)]/20"
            >
              {t('nav.register')}
            </button>
          </form>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--text-primary)]/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-[var(--text-secondary)] text-sm order-2 md:order-1 text-center md:text-left">
            <span>© {new Date().getFullYear()} {t('footer.rights')}</span>
            <span className="hidden md:block text-white/20">|</span>
            <Link to="/privacy" className="hover:text-[var(--sp-accent)] transition-colors">
              {t('footer.privacy')}
            </Link>
          </div>
          <div className="flex items-center gap-6 order-1 md:order-2">
            <span className="text-[var(--text-secondary)] text-[10px] md:text-xs text-center md:text-right">
              {t('footer.compliance')}
            </span>
            <div className="flex gap-4">
              <Globe size={16} className="text-[var(--sp-accent)]" />
              <span className="text-[var(--text-primary)] text-xs font-bold uppercase tracking-widest">
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
