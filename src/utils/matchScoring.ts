export interface MatchScores {
  sectorMatch: number;      // Max 25
  functionalSkill: number;  // Max 25
  geoRelevance: number;     // Max 15
  experiencePrep: number;   // Max 15
  intentOverlay: number;    // Max 20
  total: number;            // Max 100
}

/**
 * Calculates a dynamic Match Score based on profile completion.
 * @param profile - The user's profile object from Supabase (or structured state)
 * @param skillsCount - Total number of skills the user has (from user_skills or profile.expertise)
 * @param projectsCount - Total number of projects the user has added
 * @param hasCV - Boolean indicating if the user has uploaded a CV to storage
 * @returns MatchScores object with individual weights and a total out of 100
 */
export const calculateDynamicMatchScore = (
  profile: any,
  skillsCount: number = 0,
  projectsCount: number = 0,
  hasCV: boolean = false
): MatchScores => {
  if (!profile) {
    return {
      sectorMatch: 0,
      functionalSkill: 0,
      geoRelevance: 0,
      experiencePrep: 0,
      intentOverlay: 0,
      total: 0
    };
  }

  // 1. Sector Match (Max 25%)
  // Based on primary sector, industry sub-specialization, and having an organization.
  let sectorScore = 0;
  if (profile.sector || profile.primarySector) sectorScore += 10;
  if (profile.industry_sub_spec) sectorScore += 10;
  if (profile.organisation || profile.currentOrganisation) sectorScore += 5;
  const sectorMatch = Math.min(25, sectorScore);

  // 2. Functional Skill (Max 25%)
  // Based on number of skills, projects, and professional title.
  let functionalScore = 0;
  if (profile.professional_title || profile.title) functionalScore += 5;
  
  // Up to 10 points for skills (2 points per skill)
  const actualSkillsCount = Math.max(
    skillsCount, 
    Array.isArray(profile.expertise) ? profile.expertise.length : 0,
    Array.isArray(profile.skills) ? profile.skills.length : 0
  );
  functionalScore += Math.min(10, actualSkillsCount * 2);
  
  // Up to 10 points for projects (5 points per project)
  const actualProjectsCount = Math.max(projectsCount, profile.projects || 0);
  functionalScore += Math.min(10, actualProjectsCount * 5);
  
  const functionalSkill = Math.min(25, functionalScore);

  // 3. Geo Relevance (Max 15%)
  // Based on location, nationality, and language.
  let geoScore = 0;
  if (profile.location || profile.countryOfResidence) geoScore += 5;
  if (profile.nationality) geoScore += 5;
  if (profile.language || profile.country_code) geoScore += 5;
  const geoRelevance = Math.min(15, geoScore);

  // 4. Experience Prep (Max 15%)
  // Based on years of experience, education, and having a CV uploaded.
  let prepScore = 0;
  if (hasCV) prepScore += 7;
  if (profile.years_of_experience || profile.experience) prepScore += 4;
  if (profile.education && (Array.isArray(profile.education) ? profile.education.length > 0 : Object.keys(profile.education).length > 0)) prepScore += 4;
  
  // Fallback for Experience Array in ProfilePage state
  if (Array.isArray(profile.experience) && profile.experience.length > 0) prepScore += 4;

  const experiencePrep = Math.min(15, prepScore);

  // 5. Intent Overlay (Max 20%)
  // Based on engagement types, availability, bio, and specific interests.
  let intentScore = 0;
  if (profile.bio) intentScore += 5;
  
  const hasEngagementTypes = Array.isArray(profile.engagement_types) && profile.engagement_types.length > 0;
  if (hasEngagementTypes || profile.user_category || profile.userCategory) intentScore += 5;
  
  if (profile.availability || profile.seeking_income) intentScore += 5;
  if (profile.venture_interest || profile.sdg_alignment) intentScore += 5;
  
  const intentOverlay = Math.min(20, intentScore);

  // Calculate Total (Max 100)
  const total = sectorMatch + functionalSkill + geoRelevance + experiencePrep + intentOverlay;

  return {
    sectorMatch,
    functionalSkill,
    geoRelevance,
    experiencePrep,
    intentOverlay,
    total
  };
};
