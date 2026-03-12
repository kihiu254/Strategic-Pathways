export const calculateProfileCompletion = (data: any) => {
  let filledFields = 0;
  const totalFields = 20;

  // Handles both OnboardingData (camelCase) and DB Row (snake_case)
  const isFilled = (val1: any, val2?: any) => {
    if (val1 && (typeof val1 === 'string' ? val1.trim() !== '' : true)) return 1;
    if (val2 && (typeof val2 === 'string' ? val2.trim() !== '' : true)) return 1;
    return 0;
  };

  const isArrayFilled = (arr1: any, arr2?: any) => {
    if (Array.isArray(arr1) && arr1.length > 0) return 1;
    if (Array.isArray(arr2) && arr2.length > 0) return 1;
    return 0;
  };

  filledFields += isFilled(data.fullName, data.full_name);
  filledFields += isFilled(data.professionalTitle, data.professional_title);
  filledFields += isFilled(data.email);
  filledFields += isFilled(data.phone, data.country_code ? 'hasPhone' : null);
  filledFields += isFilled(data.linkedinUrl, data.linkedin_url);
  filledFields += isFilled(data.countryOfResidence, data.location);
  filledFields += isFilled(data.nationality);
  filledFields += isFilled(data.bio);
  filledFields += isFilled(data.highestEducation, data.education?.level);
  filledFields += isFilled(data.yearsOfExperience, data.years_of_experience);
  filledFields += isFilled(data.primarySector, data.sector);
  filledFields += isArrayFilled(data.functionalExpertise, data.expertise);
  filledFields += isFilled(data.employmentStatus, data.employment_status);
  filledFields += isArrayFilled(data.engagementTypes, data.engagement_types);
  filledFields += isFilled(data.availability);
  filledFields += isFilled(data.specificSkills, data.skills);
  filledFields += isFilled(data.passionateProblems, data.passions);
  filledFields += isFilled(data.seekingIncome, data.seeking_income);
  filledFields += isFilled(data.ventureInterest, data.venture_interest);
  filledFields += isFilled(data.websiteUrl, data.website_url);

  return Math.round((filledFields / totalFields) * 100);
};
