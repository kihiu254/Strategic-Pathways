import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { onboardingSchema } from './schema';
import type { OnboardingData } from './schema';
import { 
  ProfileTypeSelection, UserCategorySelection, BasicInfo, Education, ProfessionalExperience, 
  AreasOfInterest, PremiumDetails, ContributionValue, IncomeVenture, 
  VerificationCredits, CommunityVisibility 
} from './OnboardingSteps';
import { ChevronRight, ChevronLeft, Check, Star } from 'lucide-react';
import SEO from '../../components/SEO';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

const getSteps = (profileType: string) => {
  const baseSteps = [
    { id: 'profileType', title: 'Profile Type', component: ProfileTypeSelection },
  ];

  if (profileType === 'Standard (MVP)') {
    return [
      ...baseSteps,
      { id: 'basic', title: 'Basic Info', component: BasicInfo },
      { id: 'experience', title: 'Professional Snapshot', component: ProfessionalExperience },
      { id: 'interest', title: 'Engagement Intent', component: AreasOfInterest },
      { id: 'contribution', title: 'Short Narrative', component: ContributionValue },
      { id: 'visibility', title: 'Consent & Community', component: CommunityVisibility },
    ];
  }

  return [
    ...baseSteps,
    { id: 'category', title: 'User Category', component: UserCategorySelection },
    { id: 'basic', title: 'Basic Info', component: BasicInfo },
    { id: 'education', title: 'Education & Global', component: Education },
    { id: 'experience', title: 'Professional Experience', component: ProfessionalExperience },
    { id: 'interest', title: 'Areas of Interest', component: AreasOfInterest },
    { id: 'premium', title: 'Premium Details', component: PremiumDetails },
    { id: 'contribution', title: 'Contribution & Value', component: ContributionValue },
    { id: 'income', title: 'Income & Venture', component: IncomeVenture },
    { id: 'verification', title: 'Verification', component: VerificationCredits },
    { id: 'visibility', title: 'Community & Visibility', component: CommunityVisibility },
  ];
};

const ProfileOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
    trigger,
  } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange',
    defaultValues: {
      profileType: 'Standard (MVP)',
      email: user?.email || '',
      fullName: user?.user_metadata?.full_name || '',
      professionalTitle: '',
      linkedinUrl: '',
      websiteUrl: '',
      countryOfResidence: '',
      nationality: '',
      userCategory: 'Study-Abroad Returnee (Recent Graduate)',
      functionalExpertise: [],
      engagementTypes: [],
      languagesSpoken: [],
      sdgAlignment: [],
      preferredProjectType: [],
      workedWithSmes: false,
      crossSectorCollaboration: true,
      openToSpotlight: true,
      wouldLikeToMentor: false,
      consentToVerification: false,
      verificationTier: 'Tier 1 – Self-Declared',
      communityAmbassador: 'Maybe',
    }
  });

  const profileType = useWatch({ control, name: 'profileType' });
  const steps = getSteps(profileType);

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStepId(steps[currentStep].id);
    const isStepValid = await trigger(fieldsToValidate as any);
    
    if (isStepValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      toast.error('Please fix the errors before continuing.');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onSubmit = async (data: OnboardingData) => {
    setIsSubmitting(true);
    try {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          profile_type: data.profileType,
          full_name: data.fullName,
          professional_title: data.professionalTitle,
          email: data.email,
          phone: data.phone,
          linkedin_url: data.linkedinUrl,
          website_url: data.websiteUrl,
          location: data.countryOfResidence,
          nationality: data.nationality,
          user_category: data.userCategory,
          verification_tier: data.verificationTier,
          verification_docs: {
            academic: data.academicProofUrl,
            identity: data.identityProofUrl,
            employment: data.employmentProofUrl,
            residency: data.residencyProofUrl,
            professional: data.professionalProofUrl,
          },
          education: {
            level: data.highestEducation,
            country: data.studyCountry,
            institutions: data.institutions,
            field: data.fieldOfStudy,
            other_countries: data.otherCountriesWorked,
            languages: data.languagesSpoken,
          },
          years_of_experience: data.yearsOfExperience,
          sector: data.primarySector,
          expertise: data.functionalExpertise,
          employment_status: data.employmentStatus,
          organisation: data.currentOrganisation,
          bio: data.bio,
          engagement_types: data.engagementTypes,
          availability: data.availability,
          preferred_format: data.preferredFormat,
          skills: data.specificSkills,
          passions: data.passionateProblems,
          worked_with_smes: data.workedWithSmes,
          sme_experience: data.smeDescription,
          cross_sector: data.crossSectorCollaboration,
          seeking_income: data.seekingIncome,
          venture_interest: data.ventureInterest,
          investor_interest: data.investorInterest,
          professional_references: data.references,
          visibility_settings: {
            spotlight: data.openToSpotlight,
            mentor: data.wouldLikeToMentor,
            ambassador: data.communityAmbassador,
          },
          // Premium Extra Fields
          industry_sub_spec: data.industrySubSpecialization,
          key_achievements: data.keyAchievements,
          preferred_project_types: data.preferredProjectType,
          compensation_expectation: data.compensationExpectation,
          sdg_alignment: data.sdgAlignment,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Onboarding complete! Welcome to the network.');
      navigate('/profile');
    } catch (error: any) {
      toast.error('Failed to save profile: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldsForStepId = (stepId: string) => {
    switch (stepId) {
      case 'profileType': return ['profileType'];
      case 'category': return ['userCategory'];
      case 'basic': return ['fullName', 'professionalTitle', 'email', 'linkedinUrl', 'websiteUrl', 'countryOfResidence', 'nationality'];
      case 'education': return ['highestEducation', 'studyCountry', 'institutions', 'fieldOfStudy'];
      case 'experience': return ['yearsOfExperience', 'primarySector', 'functionalExpertise', 'employmentStatus', 'bio'];
      case 'interest': return ['engagementTypes', 'availability', 'preferredFormat'];
      case 'premium': return ['keyAchievements', 'industrySubSpecialization', 'compensationExpectation', 'preferredProjectType'];
      case 'contribution': return ['specificSkills', 'passionateProblems', 'sdgAlignment'];
      case 'income': return ['seekingIncome', 'ventureInterest', 'investorInterest'];
      case 'verification': return ['consentToVerification', 'identityProofUrl', 'academicProofUrl', 'employmentProofUrl', 'residencyProofUrl', 'professionalProofUrl'];
      case 'visibility': return ['openToSpotlight', 'wouldLikeToMentor', 'communityAmbassador'];
      default: return [];
    }
  };

  const ActiveComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 relative overflow-hidden">
      <SEO title="Member Onboarding" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[var(--sp-accent)]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#8B7355]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="grain-overlay" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--sp-accent)]/20 flex items-center justify-center border border-[var(--sp-accent)]/30">
              <Star className="text-[var(--sp-accent)] animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Strategic Onboarding</h1>
              <p className="text-[var(--text-secondary)]">Let's build your professional presence on the platform.</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 mb-2">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--sp-accent)]/50 to-[var(--sp-accent)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{steps[currentStep].title}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        <div className="glass-card p-8 lg:p-10 mb-8 border border-[var(--sp-accent)]/10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[var(--sp-accent)] text-[var(--text-inverse)] flex items-center justify-center text-sm">
                  {currentStep + 1}
                </span>
                {steps[currentStep].title}
              </h2>
              <div className="h-px w-full bg-gradient-to-r from-[var(--sp-accent)]/30 to-transparent" />
            </div>

            <ActiveComponent register={register} errors={errors} control={control} />

            <div className="mt-12 flex justify-between gap-4 pt-8 border-t border-[var(--sp-accent)]/10">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="sp-btn-glass flex items-center gap-2 disabled:opacity-0"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="sp-btn-primary flex items-center gap-2 group"
                >
                  Save & Continue
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="sp-btn-primary flex items-center gap-2 shadow-[0_0_20px_rgba(200,159,94,0.3)] hover:shadow-[0_0_30px_rgba(200,159,94,0.5)] transition-all"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-[var(--text-inverse)]/30 border-t-[var(--text-inverse)] rounded-full animate-spin" />
                  ) : (
                    <>
                      Complete Profile
                      <Check size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Profile Strength Indicator */}
        <div className="glass-light p-6 rounded-2xl border border-[var(--sp-accent)]/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isValid ? 'bg-green-500/20 text-green-400' : 'bg-[var(--sp-accent)]/10 text-[var(--sp-accent)]'}`}>
              <CheckCircle size={24} className={isValid ? 'animate-bounce' : ''} />
            </div>
            <div>
              <h4 className="text-[var(--text-primary)] font-medium">Profile Strength</h4>
              <p className="text-[var(--text-secondary)] text-sm">{isValid ? 'Collaboration Ready!' : 'Complete all sections to become visible.'}</p>
            </div>
          </div>
          <div className="text-right">
             <div className="text-2xl font-bold text-[var(--sp-accent)]">{Math.round(progress)}%</div>
             {isValid && <span className="text-[10px] bg-[var(--sp-accent)] text-[var(--text-inverse)] px-2 py-0.5 rounded-full font-bold">READY</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOnboarding;

const CheckCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
