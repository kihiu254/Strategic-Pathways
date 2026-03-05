-- ==============================================================================
-- FIX USER PROJECTS TABLE AND ADD ADMIN COMPREHENSIVE VIEW
-- ==============================================================================

-- 1. Add missing tags column to user_projects
ALTER TABLE public.user_projects 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[];

-- 2. Add connections and rating columns to profiles if they don't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS connections integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating numeric(3,2) DEFAULT 0.0;

-- 3. Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_projects' 
AND column_name = 'tags';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('connections', 'rating');

-- ==============================================================================
-- ADMIN COMPREHENSIVE USER VIEW
-- This view shows ALL onboarding data for admin review
-- ==============================================================================

-- Drop the existing view first
DROP VIEW IF EXISTS public.admin_user_comprehensive_view;

-- Create the view with all fields including connections and rating
CREATE VIEW public.admin_user_comprehensive_view AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.professional_title,
  p.phone,
  p.country_code,
  p.linkedin_url,
  p.website_url,
  p.location as country_of_residence,
  p.nationality,
  p.profile_type,
  p.user_category,
  p.verification_tier,
  p.verification_status,
  p.verification_docs,
  p.education,
  p.years_of_experience,
  p.sector as primary_sector,
  p.expertise as functional_expertise,
  p.employment_status,
  p.organisation as current_organisation,
  p.bio,
  p.engagement_types,
  p.availability,
  p.preferred_format,
  p.skills as specific_skills,
  p.passions as passionate_problems,
  p.worked_with_smes,
  p.sme_experience,
  p.cross_sector as cross_sector_collaboration,
  p.seeking_income,
  p.venture_interest,
  p.investor_interest,
  p.professional_references,
  p.visibility_settings,
  p.industry_sub_spec,
  p.key_achievements,
  p.preferred_project_types,
  p.compensation_expectation,
  p.sdg_alignment,
  p.onboarding_completed,
  p.profile_completion_percentage,
  p.tier,
  p.role,
  p.avatar_url,
  p.connections,
  p.rating,
  p.created_at,
  p.updated_at,
  -- Count related data
  (SELECT COUNT(*) FROM public.user_projects WHERE user_id = p.id) as total_projects,
  (SELECT COUNT(*) FROM public.user_skills WHERE user_id = p.id) as total_skills,
  (SELECT COUNT(*) FROM public.verification_documents WHERE user_id = p.id) as total_verification_docs
FROM public.profiles p
ORDER BY p.created_at DESC;

-- Grant access to authenticated users (admins will see via RLS)
GRANT SELECT ON public.admin_user_comprehensive_view TO authenticated;

-- ==============================================================================
-- VERIFICATION
-- ==============================================================================

-- Check if view was created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'admin_user_comprehensive_view';

-- Test the view (run as admin)
SELECT id, email, full_name, profile_type, onboarding_completed, total_projects
FROM public.admin_user_comprehensive_view
LIMIT 5;
