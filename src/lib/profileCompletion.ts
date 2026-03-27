type PremiumProfileSignals = {
  onboarding_completed?: boolean | null;
  profile_completion_percentage?: number | null;
  user_category?: string | null;
  verification_tier?: string | null;
  bio?: string | null;
  sector?: string | null;
  years_of_experience?: string | null;
  expertise?: string[] | null;
  profile_type?: string | null;
};

const normalizeValue = (value?: string | null) => String(value || '').trim().toLowerCase();

const hasArrayContent = (value?: string[] | null) => Array.isArray(value) && value.length > 0;

export const hasSavedPremiumProfile = (profile: PremiumProfileSignals | null | undefined) => {
  if (!profile) {
    return false;
  }

  const completionPercentage = Number(profile.profile_completion_percentage || 0);
  const profileType = normalizeValue(profile.profile_type);

  return Boolean(
    completionPercentage > 25 ||
    normalizeValue(profile.user_category) ||
    normalizeValue(profile.verification_tier) ||
    normalizeValue(profile.bio) ||
    normalizeValue(profile.sector) ||
    normalizeValue(profile.years_of_experience) ||
    hasArrayContent(profile.expertise) ||
    profileType === 'premium (verified)'
  );
};

export const hasCompletedPremiumProfile = (profile: PremiumProfileSignals | null | undefined) =>
  hasSavedPremiumProfile(profile);
