import { z } from 'zod';

export const onboardingSchema = z.object({
  // Step 0: Profile Type
  profileType: z.enum(['Standard Member', 'Premium (Verified)']),

  // SECTION 1: Basic Information
  fullName: z.string().min(2, 'Full name is required'),
  professionalTitle: z.string().min(2, 'Professional title is required'),
  email: z.string().email('Invalid email address'),
  countryCode: z.string().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').or(z.literal('')),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  countryOfResidence: z.string().min(2, 'Country is required'),
  nationality: z.string().min(2, 'Nationality is required'),

  // SECTION 2: Education & Global Exposure
  highestEducation: z.preprocess(
    (v) => typeof v === 'string' && v.trim() === '' ? undefined : v,
    z.string().min(1, 'Education level is required').optional()
  ),
  educationOther: z.preprocess(
    (v) => typeof v === 'string' && v.trim() === '' ? undefined : v,
    z.string().optional()
  ),
  studyCountry: z.preprocess(
    (v) => typeof v === 'string' && v.trim() === '' ? undefined : v,
    z.string().min(2, 'Country of study is required').optional()
  ),
  institutions: z.preprocess(
    (v) => typeof v === 'string' && v.trim() === '' ? undefined : v,
    z.string().min(2, 'Institution name is required').optional()
  ),
  institutionOther: z.preprocess(
    (v) => typeof v === 'string' && v.trim() === '' ? undefined : v,
    z.string().optional()
  ),
  fieldOfStudy: z.preprocess(
    (v) => typeof v === 'string' && v.trim() === '' ? undefined : v,
    z.string().min(2, 'Field of study is required').optional()
  ),
  otherCountriesWorked: z.preprocess(
    (v) => typeof v === 'string' && v.trim() === '' ? undefined : v,
    z.string().optional()
  ),
  
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
  sectorOther: z.preprocess(
    (v) => typeof v === 'string' && v.trim() === '' ? undefined : v,
    z.string().optional()
  ),
  functionalExpertise: z.array(z.string()).min(1, 'Select at least one expertise').max(5, 'Select up to 5'),
  employmentStatus: z.enum([
    'Employed (Full-time)', 'Employed (Part-time)', 'Entrepreneur', 'Consultant', 'In Transition', 'Unemployed', 'Other'
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
  academicProofUrl: z.string().min(1, 'Academic verification is required'),
  identityProofUrl: z.string().min(1, 'Identity verification is required'),
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
}).superRefine((data, ctx) => {
  // Identity proof always required
  if (!data.identityProofUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Identity verification is required',
      path: ['identityProofUrl'],
    });
  }

  // Category-based document requirements
  if (data.userCategory === 'Study-Abroad Returnee (Recent Graduate)' && !data.academicProofUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Academic verification is required for study-abroad returnees',
      path: ['academicProofUrl'],
    });
  }

  if (data.userCategory === 'Diaspora Returnee (Professional)') {
    if (!data.employmentProofUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Employment verification is required for diaspora returnees',
        path: ['employmentProofUrl'],
      });
    }
    if (!data.residencyProofUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Residency proof is required for diaspora returnees',
        path: ['residencyProofUrl'],
      });
    }
  }

  if (data.userCategory === 'Diaspora Expert (Still Abroad)' && !data.professionalProofUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Professional proof is required for diaspora professionals',
      path: ['professionalProofUrl'],
    });
  }

  if (!data.consentToVerification) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Consent is required to proceed with verification',
      path: ['consentToVerification'],
    });
  }
});

export type OnboardingFormInput = z.input<typeof onboardingSchema>;
export type OnboardingData = z.output<typeof onboardingSchema>;
