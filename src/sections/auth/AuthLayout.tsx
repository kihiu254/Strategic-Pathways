import { useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { clearSupabaseAuthStorage, isInvalidRefreshTokenError, supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { fetchLatestRejectionNotice, storeRejectionNotice } from '../../lib/verificationStatus';
import { applyReferralAttribution } from '../../lib/referrals';

const AuthLayout = () => {
  const { user, setSession, setUser, setLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isForcingLogoutRef = useRef(false);

  useEffect(() => {
    const forceRejectedUserLogout = async (userId: string, fallbackMessage?: string) => {
      if (isForcingLogoutRef.current) return true;

      isForcingLogoutRef.current = true;
      try {
        const rejectionMessage =
          fallbackMessage || (await fetchLatestRejectionNotice(userId)) || 'Your verification submission was not approved.';

        storeRejectionNotice(rejectionMessage);
        clearSupabaseAuthStorage();
        await supabase.auth.signOut({ scope: 'local' });
        setSession(null);
        setUser(null);
        navigate('/login', { replace: true });
      } finally {
        isForcingLogoutRef.current = false;
      }

      return true;
    };

    const shouldBlockRejectedSession = async (currentSession: Session | null) => {
      if (!currentSession?.user?.id) return false;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('verification_status')
        .eq('id', currentSession.user.id)
        .single();

      if (error || profile?.verification_status !== 'rejected') {
        return false;
      }

      return forceRejectedUserLogout(currentSession.user.id);
    };

    // 1. Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session && await shouldBlockRejectedSession(session)) {
          return;
        }
        
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
        void (async () => {
          if (session && await shouldBlockRejectedSession(session)) {
            return;
          }

          setSession(session);
          setUser(session?.user ?? null);
          
          // Only redirect to login on explicit SIGN_OUT, not during loading states
          if (event === 'SIGNED_OUT' && (location.pathname.startsWith('/admin') || location.pathname.startsWith('/profile'))) {
               navigate('/login');
          }
        })();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, setSession, setUser, setLoading]);

  useEffect(() => {
    if (!user?.id) return;

    const forceRejectedUserLogout = async (fallbackMessage?: string) => {
      if (isForcingLogoutRef.current) return;

      isForcingLogoutRef.current = true;
      try {
        storeRejectionNotice(
          fallbackMessage || 'Your verification submission was not approved.'
        );
        clearSupabaseAuthStorage();
        await supabase.auth.signOut({ scope: 'local' });
        setSession(null);
        setUser(null);
        navigate('/login', { replace: true });
      } finally {
        isForcingLogoutRef.current = false;
      }
    };

    const channel = supabase
      .channel(`verification-status-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as {
            message?: string;
            data?: Record<string, unknown>;
          };

          if (
            notification.data?.action === 'verification_status_update' &&
            notification.data?.status === 'rejected'
          ) {
            void forceRejectedUserLogout(
              notification.message || 'Your verification submission was not approved.'
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate, setSession, setUser, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    void applyReferralAttribution({
      supabase,
      userId: user.id,
      email: user.email,
    });
  }, [user?.email, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const handleConsentGrant = () => {
      void applyReferralAttribution({
        supabase,
        userId: user.id,
        email: user.email,
      });
    };
    window.addEventListener('sp-referral-consent-granted', handleConsentGrant);
    return () => window.removeEventListener('sp-referral-consent-granted', handleConsentGrant);
  }, [user?.email, user?.id]);

  return <Outlet />;
};

export default AuthLayout;
