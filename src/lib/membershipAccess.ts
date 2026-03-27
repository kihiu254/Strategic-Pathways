type MembershipProfile = {
  tier?: string | null;
  profile_type?: string | null;
};

const normalizeMembershipValue = (value?: string | null) => String(value || '').trim().toLowerCase();

export const hasPaidMembershipAccess = (profile: MembershipProfile | null | undefined) => {
  const tier = normalizeMembershipValue(profile?.tier);
  const profileType = normalizeMembershipValue(profile?.profile_type);

  if (['professional', 'firm', 'partners', 'partner', 'custom', 'premium'].includes(tier)) {
    return true;
  }

  if (['premium (verified)', 'professional', 'firm', 'partners', 'partner'].includes(profileType)) {
    return true;
  }

  if (['community', 'standard member', 'standard (mvp)', 'free'].includes(tier)) {
    return false;
  }

  if (['standard member', 'standard (mvp)', 'community'].includes(profileType)) {
    return false;
  }

  return Boolean(tier && tier !== 'community');
};
