import { useState, useEffect } from 'react';
import { Menu, X, User, LayoutDashboard, LogOut, ChevronDown, LogIn, Bell, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import NotificationCenter from '../components/NotificationCenter';
import { useNotifications } from '../hooks/useNotifications';
import { isAvatarUrlBlocked, markAvatarUrlBlocked } from '../lib/avatarCache';
import { openSupportEmail } from '../lib/contact';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface NavigationProps {
  currentPage?: string;
}

const Navigation = ({ currentPage = 'home' }: NavigationProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, user } = useAuthStore();
  const isLoggedIn = !!session;
  const { unreadCount } = useNotifications();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check initial theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.documentElement.classList.add('light-theme');
    } else {
      setIsLightMode(false);
      document.documentElement.classList.remove('light-theme');
    }
  }, []);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url, role')
          .eq('id', user.id)
          .single();
        const avatarUrl = data?.avatar_url || null;
        setUserAvatar(avatarUrl && !isAvatarUrlBlocked(avatarUrl) ? avatarUrl : null);
        const email = user.email || '';
        const shouldPromote =
          email.includes('admin') ||
          email.includes('joinstrategicpathways') ||
          email === '1kihiupaul@gmail.com';

        if (shouldPromote && data?.role !== 'admin') {
          await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
          setUserRole('admin');
        } else {
          setUserRole(data?.role || null);
        }
      }
    };
    fetchUserAvatar();
  }, [user]);

  const roleLabel = userRole === 'admin' ? t('common.admin') : t('common.member');

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    if (!isLightMode) {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success(t('notifications.signOutSuccess'));
      navigate('/login');
    } catch {
      toast.error(t('notifications.signOutError'));
    }
  };

  const navLinks = [
    { label: t('nav.about'), path: '/concept-note' },
    { label: t('nav.howItWorks'), path: '/how-it-works' }, 
    { label: t('nav.opportunities'), path: '/opportunities' },
    { label: t('footer.projects'), path: '/projects' },
    { label: t('nav.impact'), path: '/impact' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  const renderUnreadBubble = (compact = false) =>
    unreadCount > 0 ? (
      <span
        className={`inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-5 text-white ${
          compact ? '' : 'ml-auto'
        }`}
      >
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    ) : null;

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isScrolled || currentPage !== 'home'
            ? 'nav-glass py-3' 
            : 'bg-transparent py-3 sm:py-3 md:py-4'
        }`}
      >
        <div className="w-full min-h-[64px] sm:min-h-[68px] lg:min-h-[72px] px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
          {/* Logo - Left */}
          <div className="flex-none shrink-0 flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center group"
            >
              <img 
                src="/logo.png" 
                alt="Strategic Pathways" 
                width={160}
                height={40}
                className="w-[168px] h-auto object-contain origin-left sm:w-[230px] md:w-[280px] lg:w-auto lg:h-10 lg:max-w-none lg:scale-[1.75]"
              />
            </button>
          </div>

          {/* Desktop Navigation Links (Centered) */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium tracking-wide whitespace-nowrap"
              >
                {link.label}
              </button>
            ))}
          </div>
            
          {/* Desktop Auth & Actions (Right) */}
          <div className="hidden lg:flex flex-none items-center gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-white/5"
            >
              {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Profile Dropdown */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <NotificationCenter />
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 glass-light px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C89F5E] to-[#8B7355] flex items-center justify-center overflow-hidden">
                      {userAvatar ? (
                        <img 
                          src={userAvatar} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => {
                            markAvatarUrlBlocked(userAvatar);
                            setUserAvatar(null);
                          }}
                        />
                      ) : (
                        <User size={16} className="text-[var(--text-inverse)]" />
                      )}
                    </div>
                    <ChevronDown size={16} className="text-[var(--text-secondary)]" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 glass-card p-2 z-50">
                      <div className="px-3 py-2 border-b border-white/10 mb-2">
                        <p className="text-[var(--text-primary)] font-medium truncate">{user?.user_metadata?.full_name || user?.email}</p>
                        <p className="text-[var(--text-secondary)] text-xs">{roleLabel}</p>
                      </div>
                      <button 
                        onClick={() => {
                          navigate('/profile');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors text-left"
                      >
                        <User size={16} />
                        <span className="text-sm">{t('common.profile')}</span>
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/dashboard');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors text-left"
                      >
                        <LayoutDashboard size={16} />
                        <span className="text-sm">{t('common.dashboard')}</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/notifications');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors text-left"
                      >
                        <Bell size={16} />
                        <span className="text-sm">{t('notifications.title')}</span>
                        {renderUnreadBubble()}
                      </button>
                      {userRole === 'admin' && (
                        <button 
                          onClick={() => {
                            navigate('/admin');
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors text-left"
                        >
                          <LayoutDashboard size={16} />
                          <span className="text-sm">{t('adminHeader.adminDashboard')}</span>
                        </button>
                      )}
                      <div className="border-t border-white/10 mt-2 pt-2">
                         <button 
                          onClick={() => {
                            handleSignOut();
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut size={16} />
                          <span className="text-sm">{t('common.signOut')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="sp-btn-primary text-sm flex items-center gap-2"
              >
                <LogIn size={16} />
                {t('common.signIn')}
              </button>
            )}

            {!isLoggedIn && (
              <button 
                onClick={() =>
                  openSupportEmail({
                    subject: 'Strategic Pathways membership request',
                    body: 'Hi Strategic Pathways team,\n\nI would like to join the network.\n',
                  })
                }
                className="sp-btn-glass text-sm"
              >
                {t('common.register')}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden shrink-0 text-[var(--text-primary)] p-3 md:p-3.5 ml-auto glass-light rounded-xl relative z-[101]"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[99] glass flex flex-col items-center justify-center gap-6 px-6 py-8 overflow-y-auto">
          {/* Logo in mobile menu */}
          <img 
            src="/logo.png" 
            alt="Strategic Pathways" 
            width={160}
            height={64}
            className="h-24 w-auto object-contain mb-4"
          />
          
          <div className="mb-6 flex items-center gap-4">
            <LanguageSwitcher />
          </div>
          
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setIsMobileMenuOpen(false);
              }}
              className="text-[var(--text-primary)] text-2xl font-medium hover:text-[var(--sp-accent)] transition-colors"
            >
              {link.label}
            </button>
          ))}

          {isLoggedIn ? (
            <>
              <button 
                onClick={() => {
                  navigate('/profile');
                  setIsMobileMenuOpen(false);
                }}
                className="text-[var(--text-primary)] text-2xl font-medium hover:text-[var(--sp-accent)] transition-colors flex items-center gap-2"
              >
                <User size={24} />
                {t('common.profile')}
              </button>
              
              <button 
                onClick={() => {
                  navigate('/dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="text-[var(--text-primary)] text-2xl font-medium hover:text-[var(--sp-accent)] transition-colors flex items-center gap-2"
              >
                <LayoutDashboard size={24} />
                {t('common.dashboard')}
              </button>

              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsMobileMenuOpen(false);
                }}
                className="text-[var(--text-primary)] text-2xl font-medium hover:text-[var(--sp-accent)] transition-colors flex items-center gap-2"
              >
                <Bell size={24} />
                {t('notifications.title')}
                {renderUnreadBubble(true)}
              </button>

              {userRole === 'admin' && (
                <button 
                  onClick={() => {
                    navigate('/admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-[var(--text-primary)] text-2xl font-medium hover:text-[var(--sp-accent)] transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard size={24} />
                  {t('adminHeader.adminDashboard')}
                </button>
              )}

              <button 
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="text-red-400 text-2xl font-medium hover:text-red-300 transition-colors flex items-center gap-2 mt-4"
              >
                <LogOut size={24} />
                {t('common.signOut')}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => {
                  navigate('/login');
                  setIsMobileMenuOpen(false);
                }}
                className="sp-btn-primary mt-4 w-48 text-center flex justify-center items-center gap-2"
              >
                <LogIn size={20} />
                {t('common.signIn')}
              </button>
              <button 
                onClick={() => {
                  openSupportEmail({
                    subject: 'Strategic Pathways membership request',
                    body: 'Hi Strategic Pathways team,\n\nI would like to join the network.\n',
                  });
                  setIsMobileMenuOpen(false);
                }}
                className="sp-btn-glass mt-2 w-48 text-center"
              >
                {t('common.register')}
              </button>
            </>
          )}

        </div>
      )}
    </>
  );
};

export default Navigation;
