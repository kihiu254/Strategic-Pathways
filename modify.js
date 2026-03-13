const fs = require('fs');
const path = 'c:/Users/evince/Downloads/Kimi_Agent_Strategic Pathways Onboarding Video/app/src/sections/onboarding/ProfileOnboarding.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('calculateProfileCompletion')) {
  content = content.replace(
    "import { useAuthStore } from '../../store/authStore';",
    "import { useAuthStore } from '../../store/authStore';\nimport { calculateProfileCompletion } from '../../utils/profileScoring';"
  );
}

const startStr = `  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
    trigger,
  } = useForm<OnboardingData>({`;
  
const useFormReplacement = `
  const loadDraft = () => {
    try {
      if (!user?.id) return null;
      const draft = localStorage.getItem(\`onboarding_draft_\${user.id}\`);
      if (draft) return JSON.parse(draft) as Partial<OnboardingData>;
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
    return null;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
    trigger,
  } = useForm<OnboardingData>({`;

if (!content.includes('loadDraft')) {
  content = content.replace(startStr, useFormReplacement);
}

const defaultValuesStr = `    defaultValues: {
      profileType: 'Standard Member',`;
const defaultValuesReplacement = `    defaultValues: loadDraft() || {
      profileType: 'Standard Member',`;
if (!content.includes('loadDraft() || {')) {
  content = content.replace(defaultValuesStr, defaultValuesReplacement);
}

const stepsStr = `  const steps = getSteps(profileType);`;
const autoSaveStr = `  const steps = getSteps(profileType);
  const allFormData = useWatch({ control });

  // Auto-save draft
  useEffect(() => {
    if (user?.id && allFormData) {
      const timer = setTimeout(() => {
        localStorage.setItem(\`onboarding_draft_\${user.id}\`, JSON.stringify(allFormData));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [allFormData, user?.id]);`;

if (!content.includes('allFormData = useWatch')) {
  content = content.replace(stepsStr, autoSaveStr);
}

const calcFuncStr = `      // Calculate completion percentage based on filled fields
      const calculateCompletion = () => {
        let filledFields = 0;
        const totalFields = 20;
        
        if (data.fullName) filledFields++;
        if (data.professionalTitle) filledFields++;
        if (data.email) filledFields++;
        if (data.phone) filledFields++;
        if (data.linkedinUrl) filledFields++;
        if (data.countryOfResidence) filledFields++;
        if (data.nationality) filledFields++;
        if (data.bio) filledFields++;
        if (data.highestEducation) filledFields++;
        if (data.yearsOfExperience) filledFields++;
        if (data.primarySector) filledFields++;
        if (data.functionalExpertise?.length) filledFields++;
        if (data.employmentStatus) filledFields++;
        if (data.engagementTypes?.length) filledFields++;
        if (data.availability) filledFields++;
        if (data.specificSkills) filledFields++;
        if (data.passionateProblems) filledFields++;
        if (data.seekingIncome) filledFields++;
        if (data.ventureInterest) filledFields++;
        if (data.websiteUrl) filledFields++;
        
        return Math.round((filledFields / totalFields) * 100);
      };

`;

content = content.replace(calcFuncStr, "");
content = content.replace("profile_completion_percentage: calculateCompletion(),", "profile_completion_percentage: calculateProfileCompletion(data),");
content = content.replace("toast.success('Onboarding complete!", "localStorage.removeItem(`onboarding_draft_${user.id}`);\n      toast.success('Onboarding complete!");

fs.writeFileSync(path, content, 'utf8');
console.log('Modifications applied successfully.');
