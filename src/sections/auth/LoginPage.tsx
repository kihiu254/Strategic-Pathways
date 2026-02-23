import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Linkedin } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleOAuth = async (provider: 'google' | 'linkedin_oidc') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/profile`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        setSession(data.session);
        setUser(data.user);
        toast.success('Successfully logged in!');
        
        // Simple role check for demo purposes
        // In reality, this should come from a profile query
        if (formData.email.includes('admin')) {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            }
          }
        });

        if (error) throw error;
        setSession(data.session);
        setUser(data.user);
        toast.success('Account created successfully! Please check your email.');
        navigate('/profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
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
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {isLogin 
              ? 'Enter your credentials to access your account' 
              : 'Join Strategic Pathways network today'}
          </p>
        </div>

        <div className="glass-card p-8">
          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={loading}
              className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 rounded-xl font-medium transition-colors border border-gray-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('linkedin_oidc')}
              disabled={loading}
              className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl font-medium transition-colors"
            >
              <Linkedin className="w-5 h-5" />
              Continue with LinkedIn
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[var(--text-inverse)]/10"></div>
            <span className="text-[var(--text-secondary)] text-sm">Or continue with email</span>
            <div className="flex-1 h-px bg-[var(--text-inverse)]/10"></div>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="text-[var(--text-secondary)] text-sm block mb-2">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-glass w-full pl-10 pr-4 py-3 text-[var(--text-primary)]"
                    placeholder="John Doe"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                    <div className="w-4 h-4 rounded-full border border-current" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-[var(--text-secondary)] text-sm block mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-glass w-full pl-10 pr-4 py-3 text-[var(--text-primary)]"
                  placeholder="you@example.com"
                />
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              </div>
            </div>

            <div>
              <label className="text-[var(--text-secondary)] text-sm block mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-glass w-full pl-10 pr-4 py-3 text-[var(--text-primary)]"
                  placeholder="••••••••"
                />
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-[var(--sp-accent)] hover:text-[var(--text-primary)] transition-colors">
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full sp-btn-primary py-3 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[var(--text-inverse)]/30 border-t-[#0B2A3C] rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-[var(--text-secondary)] text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[var(--sp-accent)] font-medium hover:text-[var(--text-primary)] transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
