import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { onboardingSchema, type OnboardingData } from './onboarding/schema';
import * as Steps from './onboarding/OnboardingSteps';

const EditOnboardingPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange'
  });

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
            profileType: data.profile_type || 'Standard (MVP)',
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
            languagesSpoken: data.education?.languages || [],
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

  const onSubmit = async (data: OnboardingData) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          profile_type: data.profileType,
          full_name: data.fullName,
          professional_title: data.professionalTitle,
          email: data.email,
          phone: data.phone,
          country_code: data.countryCode,
          linkedin_url: data.linkedinUrl,
          website_url: data.websiteUrl,
          location: data.countryOfResidence,
          nationality: data.nationality,
          education: {
            level: data.highestEducation,
            country: data.studyCountry,
            institutions: data.institutions,
            field: data.fieldOfStudy,
            other_countries: data.otherCountriesWorked,
            languages: data.languagesSpoken
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
          user_category: data.userCategory,
          verification_docs: {
            identity_proof: data.identityProofUrl,
            academic_proof: data.academicProofUrl,
            employment_proof: data.employmentProofUrl,
            residency_proof: data.residencyProofUrl,
            professional_proof: data.professionalProofUrl
          },
          professional_references: data.references,
          visibility_settings: {
            spotlight: data.openToSpotlight,
            mentor: data.wouldLikeToMentor,
            ambassador: data.communityAmbassador
          },
          key_achievements: data.keyAchievements,
          industry_sub_spec: data.industrySubSpecialization,
          compensation_expectation: data.compensationExpectation,
          preferred_project_types: data.preferredProjectType,
          sdg_alignment: data.sdgAlignment,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setIsSaving(false);
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
            Update your onboarding information and keep your profile current
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Profile Type</h2>
            <Steps.ProfileTypeSelection register={register} errors={errors} />
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Basic Information</h2>
            <Steps.BasicInfo register={register} errors={errors} />
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Education</h2>
            <Steps.Education register={register} errors={errors} />
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Professional Experience</h2>
            <Steps.ProfessionalExperience register={register} errors={errors} control={control} />
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Areas of Interest</h2>
            <Steps.AreasOfInterest register={register} errors={errors} />
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Premium Details</h2>
            <Steps.PremiumDetails register={register} control={control} />
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Contribution & Value</h2>
            <Steps.ContributionValue register={register} errors={errors} control={control} />
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Income & Venture</h2>
            <Steps.IncomeVenture register={register} />
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">User Category</h2>
            <Steps.UserCategorySelection register={register} errors={errors} />
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Verification Documents</h2>
            <Steps.VerificationCredits register={register} errors={errors} control={control} />
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Community Visibility</h2>
            <Steps.CommunityVisibility register={register} />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="sp-btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="sp-btn-glass"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOnboardingPage;
