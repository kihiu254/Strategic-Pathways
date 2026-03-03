import { useNavigate } from 'react-router-dom';
import { Linkedin, Instagram, Youtube, Facebook, Twitter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const Footer = () => {
  const navigate = useNavigate();
  const [socialLinks, setSocialLinks] = useState<any[]>([]);

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

  return (
    <footer className="relative bg-[var(--bg-primary)] border-t border-white/5 py-12">
      <div className="w-full px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src="/logo.png" alt="Strategic Pathways" className="h-10 w-auto mb-4 rounded-lg" />
            <p className="text-[var(--text-secondary)] text-sm">
              Connecting globally trained African professionals with opportunities for impact.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[var(--text-primary)] font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/opportunities')} className="text-[var(--text-secondary)] hover:text-[var(--sp-accent)] transition-colors">Opportunities</button></li>
              <li><button onClick={() => navigate('/profile')} className="text-[var(--text-secondary)] hover:text-[var(--sp-accent)] transition-colors">Profile</button></li>
              <li><button onClick={() => navigate('/verification')} className="text-[var(--text-secondary)] hover:text-[var(--sp-accent)] transition-colors">Verification</button></li>
              <li><button onClick={() => navigate('/concept-note')} className="text-[var(--text-secondary)] hover:text-[var(--sp-accent)] transition-colors">About</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[var(--text-primary)] font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/privacy')} className="text-[var(--text-secondary)] hover:text-[var(--sp-accent)] transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/terms')} className="text-[var(--text-secondary)] hover:text-[var(--sp-accent)] transition-colors">Terms of Service</button></li>
              <li><button onClick={() => navigate('/cookies')} className="text-[var(--text-secondary)] hover:text-[var(--sp-accent)] transition-colors">Cookie Policy</button></li>
              <li><button onClick={() => navigate('/sitemap')} className="text-[var(--text-secondary)] hover:text-[var(--sp-accent)] transition-colors">Sitemap</button></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-[var(--text-primary)] font-semibold mb-4">Connect With Us</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.length > 0 ? (
                socialLinks.map((link) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/10 transition-colors"
                      title={link.platform}
                    >
                      {typeof Icon === 'function' ? <Icon /> : <Icon size={18} />}
                    </a>
                  );
                })
              ) : (
                <>
                  <a href="https://www.linkedin.com/company/join-strategicpathways" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/10 transition-colors">
                    <Linkedin size={18} />
                  </a>
                  <a href="https://www.instagram.com/joinstrategicpathways" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/10 transition-colors">
                    <Instagram size={18} />
                  </a>
                  <a href="https://x.com/SPathways_" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/10 transition-colors">
                    <Twitter size={18} />
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61588643401308" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/10 transition-colors">
                    <Facebook size={18} />
                  </a>
                  <a href="https://www.youtube.com/@joinstrategicpathways" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/10 transition-colors">
                    <Youtube size={18} />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[var(--text-secondary)] text-sm">
            © {new Date().getFullYear()} Strategic Pathways. All rights reserved.
          </p>
          <p className="text-[var(--text-secondary)] text-sm">
            Made with ❤️ for Africa's Global Talent
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
