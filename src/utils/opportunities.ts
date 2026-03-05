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
 * Ranks opportunities based on a user's skills and sector interest.
 */
export const rankOpportunities = (opportunities: any[], profileSkills: string[], primarySector?: string) => {
  const matches = opportunities.map(opp => {
    let score = 0;
    const oppText = (opp.tags.join(' ') + ' ' + opp.description + ' ' + opp.title).toLowerCase();
    
    // Skill matching (weights heavily)
    if (profileSkills && Array.isArray(profileSkills)) {
      profileSkills.forEach(skill => {
        if (oppText.includes(skill.toLowerCase())) score += 2;
        opp.tags.forEach((tag: string) => {
          if (tag.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(tag.toLowerCase())) score += 3;
        });
      });
    }

    // Sector matching
    if (primarySector) {
      if (oppText.includes(primarySector.toLowerCase())) score += 5;
    }

    return { ...opp, score };
  })
  .filter(opp => opp.score > 0)
  .sort((a, b) => b.score - a.score);

  // If no strong matches, return the latest/general ones
  return matches.length > 0 ? matches : opportunities.slice(0, 3);
};
