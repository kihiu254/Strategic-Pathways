import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const id = '9dcb5269-6044-4d15-8840-9f9ad1f9280d';
  
  const payload = {
    id: id,
    profile_type: 'Standard Member',
    full_name: 'Test Name',
    professional_title: 'Test',
    email: 'test@example.com',
    country_code: 'US',
    phone: '1234567890',
    linkedin_url: 'http://linkedin.com',
    website_url: 'http://test.com',
    location: 'USA',
    nationality: 'American',
    user_category: 'Standard',
    verification_tier: 'Tier 1',
    verification_docs: {},
    education: {},
    years_of_experience: '5',
    sector: 'Tech',
    expertise: [],
    employment_status: 'Employed',
    organisation: 'Test Org',
    bio: 'Test bio',
    engagement_types: [],
    availability: 'Full-time',
    preferred_format: 'Remote',
    skills: 'Test skills',
    passions: 'Test passions',
    worked_with_smes: true,
    sme_experience: 'Test SME',
    cross_sector: true,
    seeking_income: true,
    venture_interest: true,
    investor_interest: true,
    professional_references: 'Test ref',
    visibility_settings: {},
    industry_sub_spec: 'Test SubSpec',
    key_achievements: 'Test Achievements',
    preferred_project_types: [],
    compensation_expectation: 'Salary',
    sdg_alignment: [],
    onboarding_completed: true,
    profile_completion_percentage: 100,
    updated_at: new Date().toISOString()
  };

  const { error: upsertError } = await supabase.from('profiles').upsert(payload);

  if (upsertError) {
    console.error('Upsert Error:', upsertError);
  } else {
    console.log('Upsert successful');
  }
}

test();
