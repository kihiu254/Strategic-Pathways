import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
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
