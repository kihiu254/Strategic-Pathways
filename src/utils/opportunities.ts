// Mock database of opportunities for matching
export const MOCK_OPPORTUNITIES = [
  { id: 1, title: 'Digital Transformation Consultant', org: 'Nairobi County Government', location: 'Nairobi', tags: ['Tech', 'Public Sector'], description: 'Lead the digital transformation strategy for county service delivery.' },
  { id: 2, title: 'AgriTech Value Chain Expert', org: 'Green Innovations NGO', location: 'Nakuru (Hybrid)', tags: ['Agriculture', 'NGO'], description: 'Design and implement supply chain optimizations for local farmers.' },
  { id: 3, title: 'Venture Builder In-Residence', org: 'Kenya Innovation Hub', location: 'Remote', tags: ['Startups', 'Finance'], description: 'Mentor early-stage startups and help build viable financial models.' },
  { id: 4, title: 'Public Health Data Analyst', org: 'Ministry of Health Alliance', location: 'Mombasa', tags: ['Healthcare', 'Data Analysis'], description: 'Analyze returning public health data to optimize resource allocation.' },
  { id: 5, title: 'Climate Finance Specialist', org: 'Green Energy Fund', location: 'Nairobi', tags: ['Finance', 'Environment'], description: 'Assess and structure climate adaptation financing for sustainable projects.' },
  { id: 6, title: 'Education Policy Advisor', org: 'Global Education Initiative', location: 'Remote', tags: ['Education', 'Policy'], description: 'Draft and review educational policies to improve literacy outcomes in rural areas.' },
];

/**
 * Ranks opportunities based on the EXACT Match Score Algorithm.
 * Match Score = (Sector × 0.25) + (Function × 0.25) + (Geo × 0.15) + (Experience × 0.15) + (Availability × 0.10) + (Intent × 0.10)
 * Scoring: Exact match = 1, Partial match = 0.5, No match = 0
 */
export const rankOpportunities = (opportunities: any[], profile: any, profileSkills: string[]) => {
  const matches = opportunities.map(opp => {
    let score = 0;
    const oppText = (opp.tags.join(' ') + ' ' + opp.description + ' ' + opp.title).toLowerCase();
    
    // 1. Sector Match (25%)
    let sectorMatch = 0;
    const profileSector = profile?.sector || profile?.primarySector || '';
    if (profileSector) {
      if (oppText.includes(profileSector.toLowerCase())) sectorMatch = 1;
      else if (opp.tags.some((t: string) => t.toLowerCase() === profileSector.toLowerCase())) sectorMatch = 1;
    }
    score += (sectorMatch * 0.25);

    // 2. Function Match (25%)
    let functionMatch = 0;
    if (profileSkills && Array.isArray(profileSkills) && profileSkills.length > 0) {
      let matchedCount = 0;
      profileSkills.forEach(skill => {
        if (oppText.includes(skill.toLowerCase())) matchedCount++;
      });
      if (matchedCount >= 2) functionMatch = 1;
      else if (matchedCount === 1) functionMatch = 0.5;
    }
    score += (functionMatch * 0.25);

    // 3. Geo Match (15%)
    let geoMatch = 0;
    const userLoc = profile?.location || profile?.countryOfResidence || '';
    const oppLoc = opp.location?.toLowerCase() || '';
    if (oppLoc === 'remote') {
      geoMatch = 1;
    } else if (userLoc) {
      if (oppLoc.includes(userLoc.toLowerCase())) {
        geoMatch = 1;
      } else if (oppLoc.includes('hybrid')) {
        geoMatch = 0.5;
      }
    }
    score += (geoMatch * 0.15);

    // 4. Experience Match (15%)
    let expMatch = 0;
    if (profile?.years_of_experience) expMatch = 1; 
    else if (profile?.experience?.length > 0) expMatch = 1;
    else expMatch = 0.5; // Partial by default as most have basic experience
    score += (expMatch * 0.15);

    // 5. Availability Match (10%)
    let availMatch = 0;
    if (profile?.availability) availMatch = 1;
    else availMatch = 0.5;
    score += (availMatch * 0.10);

    // 6. Intent Match (10%)
    let intentMatch = 0;
    if (profile?.bio || profile?.seeking_income) intentMatch = 1;
    else intentMatch = 0.5;
    score += (intentMatch * 0.10);

    return { ...opp, score: score, matchPercentage: Math.round(score * 100) };
  })
  .filter(opp => opp.score > 0)
  .sort((a, b) => b.score - a.score);

  // If no strong matches, return the latest/general ones
  return matches.length > 0 ? matches : opportunities.slice(0, 3).map(opp => ({ ...opp, matchPercentage: 50 }));
};
