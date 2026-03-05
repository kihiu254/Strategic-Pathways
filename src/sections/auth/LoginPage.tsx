import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight, Linkedin, KeyRound, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const session = useAuthStore((state) => state.session);
  
  useEffect(() => {
    // Handle OAuth callback and redirect
    const handleOAuthCallback = async () => {
      // Check if we're coming back from OAuth (hash or code in URL)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);
      
      console.log('OAuth Check:', {
        hash: window.location.hash,
        search: window.location.search,
        hasAccessToken: !!hashParams.get('access_token'),
        hasCode: !!searchParams.get('code')
      });
      
      if (hashParams.get('access_token') || searchParams.get('code')) {
        console.log('OAuth callback detected, getting session...');
        // OAuth callback detected, wait for session to be set
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session after OAuth:', session ? 'Found' : 'Not found');
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // Sync profile and redirect
          try {
            const metadata = session.user.user_metadata;
            if (metadata?.full_name || metadata?.avatar_url || metadata?.picture) {
              await supabase.from('profiles').upsert({
                id: session.user.id,
                full_name: metadata.full_name || metadata.name,
                avatar_url: metadata.avatar_url || metadata.picture,
                email: session.user.email,
                updated_at: new Date().toISOString()
              });
            }

            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', session.user.id)
              .single();

            if (session.user.email?.includes('admin') || session.user.email?.includes('joinstrategicpathways')) {
              navigate('/admin');
            } else if (profile?.onboarding_completed) {
              navigate('/profile');
            } else {
              navigate('/onboarding');
            }
          } catch (error) {
            console.error('Error syncing profile:', error);
            navigate('/profile');
          }
        }
        return;
      }
      
      // Regular session check (not OAuth callback)
      if (session) {
        const syncProfile = async () => {
          try {
            const metadata = session.user.user_metadata;
            if (metadata?.full_name || metadata?.avatar_url || metadata?.picture) {
              await supabase.from('profiles').upsert({
                id: session.user.id,
                full_name: metadata.full_name || metadata.name,
                avatar_url: metadata.avatar_url || metadata.picture,
                email: session.user.email,
                updated_at: new Date().toISOString()
              });
            }

            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', session.user.id)
              .single();

            if (session.user.email?.includes('admin') || session.user.email?.includes('joinstrategicpathways')) {
              navigate('/admin');
            } else if (profile?.onboarding_completed) {
              navigate('/profile');
            } else {
              navigate('/onboarding');
            }
          } catch (error) {
            console.error('Error syncing profile:', error);
            navigate('/profile');
          }
        };

        syncProfile();
      }
    };
    
    handleOAuthCallback();
  }, [session, navigate, setSession, setUser]);

  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [accountExists, setAccountExists] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    token: ''
  });

  const handleOAuth = async (provider: 'google' | 'linkedin_oidc') => {
    try {
      setLoading(true);
      
      if (provider === 'linkedin_oidc') {
        const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
        if (!clientId) {
          throw new Error('LinkedIn client ID not configured');
        }
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/login`,
          scopes: provider === 'linkedin_oidc' ? 'openid profile email' : undefined
        }
      });
      
      if (error) {
        console.error(`${provider} OAuth error:`, error);
        throw error;
      }
    } catch (error: any) {
      console.error(`OAuth ${provider} error:`, error);
      toast.error(error.message || `Failed to sign in with ${provider === 'linkedin_oidc' ? 'LinkedIn' : 'Google'}`);
      setLoading(false);
    }
  };

  const checkAccountExists = async () => {
    if (!formData.email) return;
    setLoading(true);
    try {
      const { data } = await supabase.rpc('check_user_exists', { user_email: formData.email });
      const exists = data || false;
      setAccountExists(exists);
      setIsSignUp(!exists);
      if (!exists && !formData.name) {
        toast.info(t('auth.toast.newUser'));
      }
    } catch (error) {
      setAccountExists(false);
      setIsSignUp(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (isSignUp && !formData.name) {
      toast.error('Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
          shouldCreateUser: isSignUp,
          data: isSignUp ? { full_name: formData.name } : undefined
        }
      });

      if (error) throw error;
      
      setOtpSent(true);
      toast.success(isSignUp ? t('auth.toast.sentVerify') : t('auth.toast.sentLogin'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address first.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/profile`,
      });
      if (error) throw error;
      toast.success('Password reset instructions sent to your email!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify the 8-digit Token
  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: formData.token,
        type: 'email' // Specifying we are verifying an email OTP
      });

      if (error || !data.user) throw error || new Error('Verification failed');
      
      setSession(data.session);
      setUser(data.user);
      toast.success(t('auth.toast.success'));

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single();

      if (formData.email.includes('admin') || formData.email.includes('joinstrategicpathways')) {
        navigate('/admin');
      } else if (profile?.onboarding_completed) {
        navigate('/profile');
      } else {
        navigate('/onboarding');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[var(--sp-accent)]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#8B7355]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="grain-overlay" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate('/')}
            className="inline-block mb-6 hover:scale-105 transition-transform"
          >
            <img src="/logo.png" alt="Strategic Pathways" className="h-12 w-auto mx-auto rounded-lg" />
          </button>
          
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            {otpSent ? t('auth.login.submitCheck') : (isSignUp ? t('auth.login.submitSignUp') : t('auth.login.submitSignIn'))}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {otpSent 
              ? `${t('auth.login.submitCheck')} ${formData.email}` 
              : (isSignUp ? t('auth.login.subtitle') : t('auth.login.subtitle'))}
          </p>
        </div>

        <div className="glass-card p-8">
          {!otpSent ? (
            <>
              {/* OAuth Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  disabled={loading}
                  className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 rounded-xl font-medium transition-colors border border-gray-200 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  {t('auth.login.google')}
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('linkedin_oidc')}
                  disabled={loading}
                  className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  <Linkedin className="w-5 h-5" />
                  {t('auth.login.linkedin')}
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-[var(--text-inverse)]/10"></div>
                <span className="text-[var(--text-secondary)] text-sm">{t('auth.login.or')}</span>
                <div className="flex-1 h-px bg-[var(--text-inverse)]/10"></div>
              </div>

              <form onSubmit={handleSendToken} className="space-y-5">
                <div>
                  <label className="text-[var(--text-secondary)] text-sm block mb-2">{t('auth.login.emailLabel')}</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onBlur={checkAccountExists}
                      className="input-glass w-full pl-10 pr-4 py-3 text-[var(--text-primary)]"
                      placeholder={t('auth.login.emailPlaceholder')}
                    />
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  </div>
                  {accountExists === false && (
                    <p className="text-[var(--sp-accent)] text-xs mt-2">New account will be created</p>
                  )}
                  {accountExists === true && (
                    <p className="text-green-400 text-xs mt-2">Account found</p>
                  )}
                </div>

                {isSignUp && accountExists === false && (
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm block mb-2">{t('auth.login.nameLabel')}</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-glass w-full pl-10 pr-4 py-3 text-[var(--text-primary)]"
                        placeholder={t('auth.login.namePlaceholder')}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                        <div className="w-4 h-4 rounded-full border border-current" />
                      </div>
                    </div>
                  </div>
                )}

                {!isSignUp && (
                  <div className="flex justify-end mt-2">
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="text-sm text-[var(--sp-accent)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !formData.email}
                  className="w-full sp-btn-primary py-3 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-[var(--text-inverse)]/30 border-t-[#0B2A3C] rounded-full animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? t('auth.login.submitSignUp') : t('auth.login.submitSignIn')}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            // ==================
            // VERIFY OTP STATE
            // ==================
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[var(--sp-accent)]/20 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-[var(--sp-accent)]" />
                </div>
              </div>
              
              <form onSubmit={handleVerifyToken} className="space-y-5">
                <div>
                  <label className="text-[var(--text-secondary)] text-sm block mb-2 text-center">
                    {t('auth.login.submitCheck')}
                  </label>
                  <div className="relative mt-4">
                    <input
                      type="text"
                      required
                      maxLength={8}
                      value={formData.token}
                      onChange={(e) => setFormData({ ...formData, token: e.target.value.replace(/\D/g, '') })}
                      className="input-glass w-full pl-10 pr-4 py-4 text-center text-2xl tracking-[0.5em] text-[var(--text-primary)] uppercase font-mono"
                      placeholder="00000000"
                    />
                    <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || formData.token.length < 8}
                  className="w-full sp-btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-[var(--text-inverse)]/30 border-t-[#0B2A3C] rounded-full animate-spin" />
                  ) : (
                    t('auth.login.submitCheck')
                  )}
                </button>
              </form>
              
              <div className="flex flex-col items-center gap-3 mt-4">
                <button 
                  onClick={() => handleSendToken()} 
                  disabled={loading}
                  className="text-sm text-[var(--sp-accent)] hover:text-[var(--text-primary)] transition-colors font-medium"
                >
                  Resend Code
                </button>
                <button 
                  onClick={() => setOtpSent(false)} 
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--sp-accent)] transition-colors"
                >
                  Try a different email
                </button>
              </div>
            </div>
          )}
          
          {!otpSent && accountExists !== null && (
            <div className="mt-6 text-center text-[var(--text-secondary)] text-sm">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAccountExists(null);
                  setFormData({ ...formData, name: '' });
                }}
                className="text-[var(--sp-accent)] font-medium hover:text-[var(--text-primary)] transition-colors"
              >
                {isSignUp ? t('auth.login.logIn') : t('auth.login.signUp')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
