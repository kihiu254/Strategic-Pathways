import { z } from 'zod';

export const onboardingSchema = z.object({
  // Step 0: Profile Type
  profileType: z.enum(['Standard (MVP)', 'Premium (Verified)']),

  // SECTION 1: Basic Information
  fullName: z.string().min(2, 'Full name is required'),
  professionalTitle: z.string().min(2, 'Professional title is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').or(z.literal('')),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  countryOfResidence: z.string().min(2, 'Country is required'),
  nationality: z.string().min(2, 'Nationality is required'),

  // SECTION 2: Education & Global Exposure
  highestEducation: z.enum(['Bachelor’s', 'Master’s', 'PhD', 'Professional Certification', 'Other']).optional(),
  studyCountry: z.string().min(2, 'Country of study is required').optional(),
  institutions: z.string().min(2, 'Institution name is required').optional(),
  fieldOfStudy: z.string().min(2, 'Field of study is required').optional(),
  otherCountriesWorked: z.string().optional(),
  
  // Premium-only Global Info
  countriesWorkedIn: z.array(z.string()).optional(),
  languagesSpoken: z.array(z.object({
    lang: z.string(),
    level: z.enum(['Basic', 'Intermediate', 'Fluent', 'Native'])
  })).optional(),

  // SECTION 3: Professional Experience
  yearsOfExperience: z.enum(['0–3', '3–7', '7–12', '12+']),
  primarySector: z.enum([
    'Technology', 'Finance', 'Health', 'Policy & Governance', 'Education', 
    'Development', 'Entrepreneurship', 'Energy', 'Agriculture', 'Creative Industries', 'Other'
  ]),
  functionalExpertise: z.array(z.string()).min(1, 'Select at least one expertise').max(10, 'Select up to 10'),
  employmentStatus: z.enum([
    'Employed (Full-time)', 'Employed (Part-time)', 'Entrepreneur', 'Consultant', 'In Transition', 'Other'
  ]),
  currentOrganisation: z.string().optional(),
  bio: z.string().min(50, 'Bio must be at least 50 words').max(2000),
  
  // Premium-only Experience
  detailedSkillTags: z.array(z.string()).optional(),
  industrySubSpecialization: z.string().optional(),
  keyAchievements: z.string().optional(),

  // SECTION 4: Areas of Interest
  engagementTypes: z.array(z.string()).min(1, 'Select at least one engagement type'),
  availability: z.enum(['5 hours/week', '5–10 hours/week', '10+ hours/week', 'Full time', 'Project-based only']),
  preferredFormat: z.enum(['Remote', 'Hybrid', 'In-person', 'Flexible']),
  
  // Premium-only Intent
  preferredProjectType: z.array(z.string()).optional(),
  compensationExpectation: z.enum(['Pro-bono', 'Below market (impact driven)', 'Market rate', 'Premium rate']).optional(),

  // SECTION 5: Contribution & Value
  specificSkills: z.string().min(10, 'Please list some specific skills'),
  passionateProblems: z.string().min(10, 'Please describe what problems you are passionate about'),
  sdgAlignment: z.array(z.string()).optional(),
  workedWithSmes: z.boolean(),
  smeDescription: z.string().optional(),
  crossSectorCollaboration: z.boolean(),

  // SECTION 6: Income & Venture Interest
  seekingIncome: z.enum(['Yes actively', 'Yes selectively', 'No']).optional(),
  ventureInterest: z.enum(['Yes', 'Maybe', 'No']).optional(),
  investorInterest: z.enum(['Yes', 'No', 'Possibly in future']).optional(),

  // SECTION 7: Verification & Credibility
  userCategory: z.enum([
    'Study-Abroad Returnee (Recent Graduate)',
    'Diaspora Returnee (Professional)',
    'Diaspora Expert (Still Abroad)'
  ]).optional(),
  verificationTier: z.enum([
    'Tier 1 – Self-Declared',
    'Tier 2 – Verified Professional',
    'Tier 3 – Institutional Ready'
  ]),
  
  // Document Uploads (URLs stored after upload)
  academicProofUrl: z.string().optional(),
  identityProofUrl: z.string().optional(),
  employmentProofUrl: z.string().optional(),
  residencyProofUrl: z.string().optional(),
  professionalProofUrl: z.string().optional(),

  cvUrl: z.string().optional(),
  certificationUrls: z.array(z.string()).optional(),
  references: z.string().optional(),
  consentToVerification: z.boolean(),

  // SECTION 8: Community & Visibility
  openToSpotlight: z.boolean(),
  wouldLikeToMentor: z.boolean(),
  communityAmbassador: z.enum(['Yes', 'Maybe', 'No']).optional(),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
