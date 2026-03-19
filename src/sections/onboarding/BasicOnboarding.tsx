import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../../components/SEO';
import { AppNotificationService } from '../../lib/appNotifications';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { basicOnboardingSchema, type BasicOnboardingData } from './basicSchema';
import { BasicInfo } from './OnboardingSteps';

const BasicOnboarding = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<BasicOnboardingData>({
    resolver: zodResolver(basicOnboardingSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      professionalTitle: '',
      email: user?.email || '',
      countryCode: '+254',
      phone: '',
      linkedinUrl: '',
      websiteUrl: '',
      countryOfResidence: '',
      nationality: '',
    }
  });

  const {
    handleSubmit,
    setValue,
  } = methods;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.email) {
      setValue('email', user.email);
    }
    if (user.user_metadata?.full_name) {
      setValue('fullName', user.user_metadata.full_name);
    }
  }, [user, navigate, setValue]);

  const onSubmit = async (data: BasicOnboardingData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          tier: 'Community',
          profile_type: 'Standard Member',
          full_name: data.fullName,
          professional_title: data.professionalTitle,
          email: data.email,
          country_code: data.countryCode,
          phone: data.phone,
          linkedin_url: data.linkedinUrl,
          website_url: data.websiteUrl,
          location: data.countryOfResidence,
          nationality: data.nationality,
          onboarding_completed: true,
          profile_completion_percentage: 25,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) throw error;
      await AppNotificationService.notifySelf({
        title: 'Welcome to Strategic Pathways',
        message: 'Your community profile is ready. Add more details anytime to unlock more opportunities.',
        type: 'success',
        data: { action: 'basic_onboarding_complete' },
      }).catch((notificationError) => console.warn('Notification failed:', notificationError));
      toast.success('Basic profile saved. Welcome!');
      navigate('/profile');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profile.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = () => {
    toast.error('Please fix the highlighted fields before continuing.');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 relative overflow-hidden">
      <SEO title="Basic Information" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[var(--sp-accent)]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="grain-overlay" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Basic Information</h1>
          <p className="text-[var(--text-secondary)]">Complete your community profile to access your dashboard.</p>
        </div>

        <div className="glass-card p-8 lg:p-10 border border-[var(--sp-accent)]/10 shadow-2xl backdrop-blur-xl">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
              <BasicInfo
                readOnlyFields={['email', ...(user?.user_metadata?.full_name ? ['fullName'] : [])]}
              />

              <div className="mt-10 flex justify-between gap-4 pt-8 border-t border-[var(--sp-accent)]/10">
                <button
                  type="button"
                  onClick={() => navigate('/pricing')}
                  className="sp-btn-glass flex items-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="sp-btn-primary flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-[var(--text-inverse)]/30 border-t-[var(--text-inverse)] rounded-full animate-spin" />
                  ) : (
                    <>
                      Save & Continue
                      <Check size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default BasicOnboarding;
