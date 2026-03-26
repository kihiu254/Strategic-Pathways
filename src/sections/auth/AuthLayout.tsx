import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { clearSupabaseAuthStorage, isInvalidRefreshTokenError, supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

const AuthLayout = () => {
  const { setSession, setUser, setLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        if (isInvalidRefreshTokenError(error)) {
          clearSupabaseAuthStorage();
          await supabase.auth.signOut({ scope: 'local' });
          setSession(null);
          setUser(null);
          console.warn('Cleared stale Supabase session after invalid refresh token.');
          return;
        }

        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only redirect to login on explicit SIGN_OUT, not during loading states
        if (event === 'SIGNED_OUT' && (location.pathname.startsWith('/admin') || location.pathname.startsWith('/profile'))) {
             navigate('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, setSession, setUser, setLoading]);

  return <Outlet />;
};

export default AuthLayout;
