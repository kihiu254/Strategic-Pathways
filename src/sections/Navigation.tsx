import { useState, useEffect } from 'react';
import { Menu, X, User, LayoutDashboard, LogOut, ChevronDown, LogIn, Bell, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface NavigationProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

const Navigation = ({ onNavigate, currentPage = 'home' }: NavigationProps) => {
  const navigate = useNavigate();
  const { session, user } = useAuthStore();
  const isLoggedIn = !!session;
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

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

  const scrollToSection = (id: string) => {
    if (onNavigate) {
      onNavigate('home');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error('Error signing out');
    }
  };

  const navLinks = [
    { label: 'About', path: '/concept-note' },
    { label: 'For You', id: 'audience' },
    { label: 'Opportunities', path: '/opportunities' },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isScrolled || currentPage !== 'home'
            ? 'nav-glass py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="w-full px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => onNavigate ? onNavigate('home') : scrollToSection('hero')}
            className="flex items-center gap-3 group"
          >
            <img 
              src="/logo.png" 
              alt="Strategic Pathways" 
              className="h-10 w-auto object-contain transform scale-150 lg:scale-[1.75] origin-left"
            />
          </button>

          {/* Desktop Navigation Links (Centered) */}
          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <button
                key={link.id || link.path}
                onClick={() => link.path ? navigate(link.path) : scrollToSection(link.id!)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium tracking-wide"
              >
                {link.label}
              </button>
            ))}
          </div>
            
          {/* Desktop Auth & Actions (Right) */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-white/5"
            >
              {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Notifications Widget */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-white/5 relative"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-[var(--bg-primary)]"></span>
              </button>
              
              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 glass-card p-4 z-50 shadow-2xl">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Notifications</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    <div className="p-3 glass-light hover:bg-white/5 transition-colors cursor-pointer rounded-xl border border-[var(--sp-accent)]/20">
                      <p className="text-[var(--text-primary)] text-sm font-medium">New Partnership Match</p>
                      <p className="text-[var(--text-secondary)] text-xs mt-1">Nairobi County government is looking for your specific skill set.</p>
                      <span className="text-xs text-[var(--sp-accent)] mt-2 block">10 mins ago</span>
                    </div>
                    <div className="p-3 glass-light hover:bg-white/5 transition-colors cursor-pointer rounded-xl border border-[var(--sp-accent)]/20">
                      <p className="text-[var(--text-primary)] text-sm font-medium">Application Approved</p>
                      <p className="text-[var(--text-secondary)] text-xs mt-1">Your background check has been verified. Welcome aboard!</p>
                      <span className="text-xs text-[var(--sp-accent)] mt-2 block">2 hours ago</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="w-full mt-4 text-center text-sm text-[var(--text-secondary)] hover:text-[var(--sp-accent)] transition-colors py-2"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {isLoggedIn ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 glass-light px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C89F5E] to-[#8B7355] flex items-center justify-center">
                    <User size={16} className="text-[var(--text-inverse)]" />
                  </div>
                  <ChevronDown size={16} className="text-[var(--text-secondary)]" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 glass-card p-2 z-50">
                    <div className="px-3 py-2 border-b border-white/10 mb-2">
                      <p className="text-[var(--text-primary)] font-medium truncate">{user?.user_metadata?.full_name || user?.email}</p>
                      <p className="text-[var(--text-secondary)] text-xs">Member</p>
                    </div>
                    <button 
                      onClick={() => {
                        navigate('/profile');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors text-left"
                    >
                      <User size={16} />
                      <span className="text-sm">My Profile</span>
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/admin');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors text-left"
                    >
                      <LayoutDashboard size={16} />
                      <span className="text-sm">Dashboard</span>
                    </button>
                    <div className="border-t border-white/10 mt-2 pt-2">
                       <button 
                        onClick={() => {
                          handleSignOut();
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="sp-btn-primary text-sm flex items-center gap-2"
              >
                <LogIn size={16} />
                Sign In
              </button>
            )}

            {!isLoggedIn && (
              <button 
                onClick={() => scrollToSection('pricing')}
                className="sp-btn-glass text-sm"
              >
                Join the Network
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-[var(--text-primary)] p-2 glass-light rounded-lg"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[99] glass flex flex-col items-center justify-center gap-6">
          {/* Logo in mobile menu */}
          <img 
            src="/logo.png" 
            alt="Strategic Pathways" 
            className="h-24 w-auto object-contain mb-8"
          />
          
          {navLinks.map((link) => (
            <button
              key={link.id || link.path}
              onClick={() => {
                link.path ? navigate(link.path) : scrollToSection(link.id!);
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
                My Profile
              </button>
              
              <button 
                onClick={() => {
                  navigate('/admin');
                  setIsMobileMenuOpen(false);
                }}
                className="text-[var(--text-primary)] text-2xl font-medium hover:text-[var(--sp-accent)] transition-colors flex items-center gap-2"
              >
                <LayoutDashboard size={24} />
                Dashboard
              </button>

              <button 
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="text-red-400 text-2xl font-medium hover:text-red-300 transition-colors flex items-center gap-2 mt-4"
              >
                <LogOut size={24} />
                Sign Out
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
                Sign In
              </button>
              <button 
                onClick={() => {
                  scrollToSection('pricing');
                  setIsMobileMenuOpen(false);
                }}
                className="sp-btn-glass mt-2 w-48 text-center"
              >
                Join the Network
              </button>
            </>
          )}

        </div>
      )}
    </>
  );
};

export default Navigation;
