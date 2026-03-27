import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../../components/SEO';
import { AppNotificationService } from '../../lib/appNotifications';
import { EmailAutomationService } from '../../lib/emailAutomation';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { basicOnboardingSchema, type BasicOnboardingData } from './basicSchema';
import { BasicInfo } from './OnboardingSteps';

const BasicEditOnboarding = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.isLoading);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const methods = useForm<BasicOnboardingData>({
    resolver: zodResolver(basicOnboardingSchema),
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
  } = methods;

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        reset({
          fullName: data?.full_name || user.user_metadata?.full_name || '',
          professionalTitle: data?.professional_title || '',
          email: data?.email || user.email || '',
          countryCode: data?.country_code || '+254',
          phone: data?.phone || '',
          linkedinUrl: data?.linkedin_url || '',
          websiteUrl: data?.website_url || '',
          countryOfResidence: data?.location || '',
          nationality: data?.nationality || '',
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load profile.';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [authLoading, user, navigate, reset]);

  const onSubmit = async (data: BasicOnboardingData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          professional_title: data.professionalTitle,
          email: data.email,
          country_code: data.countryCode,
          phone: data.phone,
          linkedin_url: data.linkedinUrl,
          website_url: data.websiteUrl,
          location: data.countryOfResidence,
          nationality: data.nationality,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      await AppNotificationService.notifySelf({
        title: 'Profile updated',
        message: 'Your basic profile details were updated successfully.',
        type: 'success',
        data: { action: 'profile_updated' },
      }).catch((notificationError) => console.warn('Notification failed:', notificationError));
      await EmailAutomationService.onProfileUpdated(data.email, data.fullName);
      toast.success('Profile updated.');
      navigate('/profile');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = () => {
    toast.error('Please fix the highlighted fields before saving.');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[var(--sp-accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 relative overflow-hidden">
      <SEO title="Edit Basic Information" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[var(--sp-accent)]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="grain-overlay" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="mb-6">
          <button
            onClick={() => navigate('/profile')}
            className="sp-btn-glass mb-4 flex items-center gap-2"
          >
            <ChevronLeft size={18} />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Edit Basic Information</h1>
          <p className="text-[var(--text-secondary)]">Review and update your saved basic profile details here.</p>
        </div>

        <div className="glass-card p-8 lg:p-10 border border-[var(--sp-accent)]/10 shadow-2xl backdrop-blur-xl">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
              <BasicInfo
                readOnlyFields={['email']}
                showProfileTypeSelection={false}
              />

              <div className="mt-10 flex justify-end gap-4 pt-8 border-t border-[var(--sp-accent)]/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="sp-btn-primary flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-[var(--text-inverse)]/30 border-t-[var(--text-inverse)] rounded-full animate-spin" />
                  ) : (
                    <>
                      Save Changes
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

export default BasicEditOnboarding;
