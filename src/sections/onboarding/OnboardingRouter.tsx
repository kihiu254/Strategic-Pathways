import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Loader2 } from 'lucide-react';

const OnboardingRouter = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const route = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('tier, onboarding_completed')
          .eq('id', user.id)
          .single();

        const tier = data?.tier || 'Community';
        const completed = !!data?.onboarding_completed;

        if (tier === 'Community') {
          navigate(completed ? '/profile' : '/onboarding/basic', { replace: true });
        } else {
          navigate(completed ? '/profile' : '/onboarding/full', { replace: true });
        }
      } catch {
        navigate('/pricing', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    route();
  }, [user, navigate]);

  if (!isLoading) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-[var(--sp-accent)] animate-spin" />
    </div>
  );
};

export default OnboardingRouter;
