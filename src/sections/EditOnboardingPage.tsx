import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, Check, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { onboardingSchema, type OnboardingData } from './onboarding/schema';
import * as Steps from './onboarding/OnboardingSteps';

const getSteps = () => [
  { id: 'profileType', title: 'Profile Type', component: Steps.ProfileTypeSelection },
  { id: 'basic', title: 'Basic Information', component: Steps.BasicInfo },
  { id: 'education', title: 'Education & Global', component: Steps.EducationEnhanced },
  { id: 'experience', title: 'Professional Experience', component: Steps.ProfessionalExperience },
  { id: 'interest', title: 'Areas of Interest', component: Steps.AreasOfInterest },
  { id: 'premium', title: 'Recommended: Professional Details', component: Steps.PremiumDetails },
  { id: 'contribution', title: 'Contribution & Value', component: Steps.ContributionValue },
  { id: 'income', title: 'Income & Venture', component: Steps.IncomeVenture },
  { id: 'category', title: 'User Category', component: Steps.UserCategorySelection },
  { id: 'verification', title: 'Verification Documents', component: Steps.VerificationCredits },
  { id: 'visibility', title: 'Community Visibility', component: Steps.CommunityVisibility },
];

const getFieldsForStepId = (stepId: string) => {
  switch (stepId) {
    case 'profileType': return ['profileType'];
    case 'basic': return ['fullName', 'professionalTitle', 'email', 'linkedinUrl', 'websiteUrl', 'countryOfResidence', 'nationality'];
    case 'education': return ['highestEducation', 'studyCountry', 'institutions', 'fieldOfStudy', 'otherCountriesWorked', 'countriesWorkedIn', 'languagesSpoken'];
    case 'experience': return ['yearsOfExperience', 'primarySector', 'functionalExpertise', 'employmentStatus', 'bio'];
    case 'interest': return ['engagementTypes', 'availability', 'preferredFormat'];
    case 'premium': return ['keyAchievements', 'industrySubSpecialization', 'compensationExpectation', 'preferredProjectType'];
    case 'contribution': return ['specificSkills', 'passionateProblems', 'sdgAlignment'];
    case 'income': return ['seekingIncome', 'ventureInterest', 'investorInterest'];
    case 'category': return ['userCategory'];
    case 'verification': return ['consentToVerification', 'identityProofUrl', 'academicProofUrl', 'employmentProofUrl', 'residencyProofUrl', 'professionalProofUrl'];
    case 'visibility': return ['openToSpotlight', 'wouldLikeToMentor', 'communityAmbassador'];
    default: return [];
  }
};

const EditOnboardingPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    trigger,
    setValue,
  } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange'
  });

  const profileType = useWatch({ control, name: 'profileType' }) || 'Standard Member';
  const steps = getSteps();
  const ActiveComponent = steps[currentStep].component as any;
  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOnboardingData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          const formData: Partial<OnboardingData> = {
            profileType: data.profile_type || 'Standard Member',
            fullName: data.full_name || '',
            professionalTitle: data.professional_title || '',
            email: data.email || '',
            phone: data.phone || '',
            countryCode: data.country_code || '+254',
            linkedinUrl: data.linkedin_url || '',
            websiteUrl: data.website_url || '',
            countryOfResidence: data.location || '',
            nationality: data.nationality || '',
            highestEducation: data.education?.level || "Bachelor's",
            studyCountry: data.education?.country || '',
            institutions: data.education?.institutions || '',
            fieldOfStudy: data.education?.field || '',
            countriesWorkedIn: data.education?.worked_countries || [],
            languagesSpoken: data.education?.languages || [],
            otherCountriesWorked: data.education?.other_countries || '',
            yearsOfExperience: data.years_of_experience || '0–3',
            primarySector: data.sector || 'Technology',
            functionalExpertise: data.expertise || [],
            employmentStatus: data.employment_status || 'Employed (Full-time)',
            currentOrganisation: data.organisation || '',
            bio: data.bio || '',
            engagementTypes: data.engagement_types || [],
            availability: data.availability || '5 hours/week',
            preferredFormat: data.preferred_format || 'Remote',
            specificSkills: data.skills || '',
            passionateProblems: data.passions || '',
            workedWithSmes: data.worked_with_smes || false,
            smeDescription: data.sme_experience || '',
            crossSectorCollaboration: data.cross_sector || false,
            seekingIncome: data.seeking_income || 'Yes selectively',
            ventureInterest: data.venture_interest || 'Maybe',
            investorInterest: data.investor_interest || 'No',
            userCategory: data.user_category || 'Study-Abroad Returnee (Recent Graduate)',
            identityProofUrl: data.verification_docs?.identity_proof || '',
            academicProofUrl: data.verification_docs?.academic_proof || '',
            employmentProofUrl: data.verification_docs?.employment_proof || '',
            residencyProofUrl: data.verification_docs?.residency_proof || '',
            professionalProofUrl: data.verification_docs?.professional_proof || '',
            consentToVerification: true,
            references: data.professional_references || '',
            openToSpotlight: data.visibility_settings?.spotlight || false,
            wouldLikeToMentor: data.visibility_settings?.mentor || false,
            communityAmbassador: data.visibility_settings?.ambassador || 'Maybe',
            keyAchievements: data.key_achievements || '',
            industrySubSpecialization: data.industry_sub_spec || '',
            compensationExpectation: data.compensation_expectation || 'Market rate',
            preferredProjectType: data.preferred_project_types || [],
            sdgAlignment: data.sdg_alignment || []
          };

          reset(formData as OnboardingData);
        }
      } catch (error) {
        console.error('Error fetching onboarding data:', error);
        toast.error('Failed to load your profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnboardingData();
  }, [user, navigate, reset]);

  const normalize = (v?: string | null) => {
    if (v === undefined || v === null) return null;
    if (typeof v === 'string') {
      const trimmed = v.trim();
      return trimmed === '' ? null : trimmed;
    }
    return v as any;
  };

  const normalizeRange = (v?: string | null) => {
    const val = normalize(v);
    if (!val) return val;
    return val.replace('–', '-');
  };

  const persistProfile = async (data: OnboardingData) => {
    if (!user) throw new Error('Not authenticated');

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          profile_type: data.profileType,
          full_name: normalize(data.fullName),
          professional_title: normalize(data.professionalTitle),
          email: data.email,
          phone: normalize(data.phone),
          country_code: data.countryCode,
          linkedin_url: normalize(data.linkedinUrl),
          website_url: normalize(data.websiteUrl),
          location: normalize(data.countryOfResidence),
          nationality: normalize(data.nationality),
          education: {
            level: normalize(data.highestEducation),
            country: normalize(data.studyCountry),
            institutions: normalize(data.institutions),
            field: normalize(data.fieldOfStudy),
            other_countries: normalize(data.otherCountriesWorked),
            languages: data.languagesSpoken || []
          },
          years_of_experience: normalizeRange(data.yearsOfExperience),
          sector: data.primarySector,
          expertise: data.functionalExpertise,
          employment_status: data.employmentStatus,
          organisation: normalize(data.currentOrganisation),
          bio: normalize(data.bio),
          engagement_types: data.engagementTypes,
          availability: data.availability,
          preferred_format: data.preferredFormat,
          skills: normalize(data.specificSkills),
          passions: normalize(data.passionateProblems),
          worked_with_smes: data.workedWithSmes,
          sme_experience: normalize(data.smeDescription),
          cross_sector: data.crossSectorCollaboration,
          seeking_income: data.seekingIncome,
          venture_interest: data.ventureInterest,
          investor_interest: data.investorInterest,
          user_category: data.userCategory,
          verification_docs: {
            identity_proof: normalize(data.identityProofUrl),
            academic_proof: normalize(data.academicProofUrl),
            employment_proof: normalize(data.employmentProofUrl),
            residency_proof: normalize(data.residencyProofUrl),
            professional_proof: normalize(data.professionalProofUrl)
          },
          professional_references: normalize(data.references),
          visibility_settings: {
            spotlight: data.openToSpotlight,
            mentor: data.wouldLikeToMentor,
            ambassador: data.communityAmbassador
          },
          key_achievements: normalize(data.keyAchievements),
          industry_sub_spec: normalize(data.industrySubSpecialization),
          compensation_expectation: data.compensationExpectation,
          preferred_project_types: data.preferredProjectType,
          sdg_alignment: data.sdgAlignment || [],
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;
    } catch (error: any) {
      throw error;
    }
  };

  const onSubmit = async (data: OnboardingData) => {
    if (!user) return;

    setIsSaving(true);
    try {
      await persistProfile(data);
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const saveDraft = async () => {
    if (!user) return;
    setIsDraftSaving(true);
    try {
      const data = (await trigger()) ? undefined : undefined; // no-op to satisfy type
      const payload = (control as any)._formValues as OnboardingData;
      await persistProfile(payload);
      toast.success('Draft saved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save draft');
    } finally {
      setIsDraftSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[var(--sp-accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={() => navigate('/profile')}
          className="sp-btn-glass mb-6 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Profile
        </button>

        <div className="glass-card p-8 mb-6">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Edit Your Profile
          </h1>
          <p className="text-[var(--text-secondary)]">
            Update your onboarding information. Progress is saved on completion.
          </p>
          <div className="mt-4 w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--sp-accent)]/60 to-[var(--sp-accent)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] mt-2">
            <span>Step {currentStep + 1} / {steps.length}</span>
            <span>{steps[currentStep].title}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">{steps[currentStep].title}</h2>
            <ActiveComponent
              register={register}
              errors={errors}
              control={control}
              setValue={setValue}
              readOnlyFields={['fullName', 'email']}
            />
            <div className="mt-8 flex justify-between gap-4 pt-6 border-t border-white/10">
              <button
                type="button"
                disabled={currentStep === 0}
                onClick={() => {
                  setCurrentStep((s) => Math.max(0, s - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="sp-btn-glass flex items-center gap-2 disabled:opacity-40"
              >
                <ChevronLeft size={18} /> Back
              </button>
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={async () => {
                    const fields = getFieldsForStepId(steps[currentStep].id);
                    const ok = await trigger(fields as any);
                    if (ok) {
                      setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      toast.error('Please fix the errors before continuing.');
                    }
                  }}
                  className="sp-btn-primary flex items-center gap-2"
                >
                  Next <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="sp-btn-primary flex items-center gap-2"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              <button
                type="button"
                disabled={isDraftSaving}
                onClick={saveDraft}
                className="sp-btn-glass flex items-center gap-2"
              >
                {isDraftSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isDraftSaving ? 'Saving…' : 'Save Draft'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOnboardingPage;
