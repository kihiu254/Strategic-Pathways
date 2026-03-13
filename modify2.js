const fs = require('fs');
const path = 'c:/Users/evince/Downloads/Kimi_Agent_Strategic Pathways Onboarding Video/app/src/sections/onboarding/ProfileOnboarding.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('calculateProfileCompletion')) {
  content = content.replace(
    "import { useAuthStore } from '../../store/authStore';",
    "import { useAuthStore } from '../../store/authStore';\nimport { calculateProfileCompletion } from '../../utils/profileScoring';"
  );
}

if (!content.includes('import { useState, useEffect }')) {
  content = content.replace("import { useState }", "import { useState, useEffect }");
}

let startStr = "  const {\n" +
"    register,\n" +
"    handleSubmit,\n" +
"    formState: { errors, isValid },\n" +
"    control,\n" +
"    trigger,\n" +
"  } = useForm<OnboardingData>({";
  
let useFormReplacement = "  const loadDraft = () => {\n" +
"    try {\n" +
"      if (!user?.id) return null;\n" +
"      const draft = localStorage.getItem('onboarding_draft_' + user.id);\n" +
"      if (draft) return JSON.parse(draft) as Partial<OnboardingData>;\n" +
"    } catch (e) {\n" +
"      console.error('Failed to load draft:', e);\n" +
"    }\n" +
"    return null;\n" +
"  };\n\n" + startStr;

if (!content.includes('loadDraft')) {
  content = content.replace(startStr, useFormReplacement);
}

const defaultValuesStr = "    defaultValues: {\n" + 
"      profileType: 'Standard Member',";
const defaultValuesReplacement = "    defaultValues: loadDraft() || {\n" +
"      profileType: 'Standard Member',";
if (!content.includes('loadDraft() || {')) {
  content = content.replace(defaultValuesStr, defaultValuesReplacement);
}

const stepsStr = "  const steps = getSteps(profileType);";
const autoSaveStr = "  const steps = getSteps(profileType);\n" +
"  const allFormData = useWatch({ control });\n\n" +
"  // Auto-save draft\n" +
"  useEffect(() => {\n" +
"    if (user?.id && allFormData) {\n" +
"      const timer = setTimeout(() => {\n" +
"        localStorage.setItem('onboarding_draft_' + user.id, JSON.stringify(allFormData));\n" +
"      }, 1000);\n" +
"      return () => clearTimeout(timer);\n" +
"    }\n" +
"  }, [allFormData, user?.id]);";

if (!content.includes('allFormData = useWatch')) {
  content = content.replace(stepsStr, autoSaveStr);
}

// Remove function
const startCut = content.indexOf("      // Calculate completion percentage based on filled fields");
const endCut = content.indexOf("return Math.round((filledFields / totalFields) * 100);\n      };\n") + 66;

if (startCut !== -1 && endCut !== -1 && startCut < endCut) {
    content = content.substring(0, startCut) + content.substring(endCut);
}

content = content.replace("profile_completion_percentage: calculateCompletion(),", "profile_completion_percentage: calculateProfileCompletion(data),");
content = content.replace("toast.success('Onboarding complete!", "localStorage.removeItem('onboarding_draft_' + user.id);\n      toast.success('Onboarding complete!");

fs.writeFileSync(path, content, 'utf8');
console.log('Modifications applied successfully.');
