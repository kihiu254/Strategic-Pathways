-- ==============================================================================
-- STRATEGIC PATHWAYS - COMPREHENSIVE PROFILE SCHEMA UPDATE
-- Run this to add all onboarding fields to the profiles table
-- ==============================================================================

-- Add all missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS professional_title text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS website_url text,
ADD COLUMN IF NOT EXISTS nationality text,
ADD COLUMN IF NOT EXISTS profile_type text DEFAULT 'Standard (MVP)',
ADD COLUMN IF NOT EXISTS user_category text,
ADD COLUMN IF NOT EXISTS verification_tier text DEFAULT 'Tier 1 – Self-Declared',
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_docs jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS years_of_experience text,
ADD COLUMN IF NOT EXISTS sector text,
ADD COLUMN IF NOT EXISTS expertise text[],
ADD COLUMN IF NOT EXISTS employment_status text,
ADD COLUMN IF NOT EXISTS organisation text,
ADD COLUMN IF NOT EXISTS engagement_types text[],
ADD COLUMN IF NOT EXISTS availability text,
ADD COLUMN IF NOT EXISTS preferred_format text,
ADD COLUMN IF NOT EXISTS skills text,
ADD COLUMN IF NOT EXISTS passions text,
ADD COLUMN IF NOT EXISTS worked_with_smes boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sme_experience text,
ADD COLUMN IF NOT EXISTS cross_sector boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS seeking_income text,
ADD COLUMN IF NOT EXISTS venture_interest text,
ADD COLUMN IF NOT EXISTS investor_interest text,
ADD COLUMN IF NOT EXISTS references text,
ADD COLUMN IF NOT EXISTS visibility_settings jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS industry_sub_spec text,
ADD COLUMN IF NOT EXISTS key_achievements text,
ADD COLUMN IF NOT EXISTS preferred_project_types text[],
ADD COLUMN IF NOT EXISTS compensation_expectation text,
ADD COLUMN IF NOT EXISTS sdg_alignment text[],
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completion_percentage integer DEFAULT 0;

-- Create verification documents table
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL,
  document_category text NOT NULL,
  file_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamp with time zone,
  admin_notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON public.verification_documents 
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own documents" ON public.verification_documents 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Admins can view all documents" ON public.verification_documents 
  FOR SELECT USING (public.is_admin());
  
CREATE POLICY "Admins can update all documents" ON public.verification_documents 
  FOR UPDATE USING (public.is_admin());

-- Create professional references table
CREATE TABLE IF NOT EXISTS public.professional_references (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reference_name text NOT NULL,
  reference_title text,
  reference_organization text,
  reference_email text,
  reference_phone text,
  relationship text,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.professional_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own references" ON public.professional_references 
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Admins can view all references" ON public.professional_references 
  FOR SELECT USING (public.is_admin());

-- Create user skills table for endorsements
CREATE TABLE IF NOT EXISTS public.user_skills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  proficiency_level text CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  years_experience integer,
  endorsed_by uuid[] DEFAULT ARRAY[]::uuid[],
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, skill_name)
);

ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own skills" ON public.user_skills 
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Anyone can view skills" ON public.user_skills 
  FOR SELECT USING (true);

-- Create user projects table
CREATE TABLE IF NOT EXISTS public.user_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_title text NOT NULL,
  project_description text,
  organization text,
  role text,
  start_date date,
  end_date date,
  is_current boolean DEFAULT false,
  tags text[],
  project_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects" ON public.user_projects 
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Anyone can view projects" ON public.user_projects 
  FOR SELECT USING (true);

-- Create platform social links table
CREATE TABLE IF NOT EXISTS public.platform_social_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  platform text NOT NULL UNIQUE,
  url text NOT NULL,
  icon_name text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.platform_social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view social links" ON public.platform_social_links 
  FOR SELECT USING (is_active = true);
  
CREATE POLICY "Admins can manage social links" ON public.platform_social_links 
  FOR ALL USING (public.is_admin());

-- Insert default social media links
INSERT INTO public.platform_social_links (platform, url, icon_name, display_order) VALUES
  ('LinkedIn', 'https://www.linkedin.com/company/join-strategicpathways', 'Linkedin', 1),
  ('Instagram', 'https://www.instagram.com/joinstrategicpathways', 'Instagram', 2),
  ('TikTok', 'https://www.tiktok.com/@joinstrategicpathways', 'TikTok', 3),
  ('X (Twitter)', 'https://x.com/SPathways_', 'Twitter', 4),
  ('Facebook', 'https://www.facebook.com/profile.php?id=61588643401308', 'Facebook', 5),
  ('Threads', 'https://www.threads.com/@joinstrategicpathways', 'Threads', 6),
  ('YouTube', 'https://www.youtube.com/@joinstrategicpathways', 'Youtube', 7)
ON CONFLICT (platform) DO NOTHING;

-- Create verification-documents storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-documents', 'verification-documents', false) 
ON CONFLICT DO NOTHING;

-- Storage policies for verification documents
CREATE POLICY "Users can upload verification docs" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'verification-documents' AND 
    (auth.uid()::text = (string_to_array(name, '/'))[1])
  );

CREATE POLICY "Users can view own verification docs" ON storage.objects 
  FOR SELECT TO authenticated USING (
    bucket_id = 'verification-documents' AND 
    (auth.uid()::text = (string_to_array(name, '/'))[1])
  );

CREATE POLICY "Admins can view all verification docs" ON storage.objects 
  FOR SELECT TO authenticated USING (
    bucket_id = 'verification-documents' AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(profile_id uuid)
RETURNS integer AS $$
DECLARE
  completion_score integer := 0;
  total_fields integer := 20;
BEGIN
  SELECT 
    (CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 ELSE 0 END) +
    (CASE WHEN professional_title IS NOT NULL AND professional_title != '' THEN 1 ELSE 0 END) +
    (CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) +
    (CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END) +
    (CASE WHEN linkedin_url IS NOT NULL AND linkedin_url != '' THEN 1 ELSE 0 END) +
    (CASE WHEN location IS NOT NULL AND location != '' THEN 1 ELSE 0 END) +
    (CASE WHEN nationality IS NOT NULL AND nationality != '' THEN 1 ELSE 0 END) +
    (CASE WHEN bio IS NOT NULL AND bio != '' THEN 1 ELSE 0 END) +
    (CASE WHEN education IS NOT NULL AND education != '{}'::jsonb THEN 1 ELSE 0 END) +
    (CASE WHEN years_of_experience IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN sector IS NOT NULL AND sector != '' THEN 1 ELSE 0 END) +
    (CASE WHEN expertise IS NOT NULL AND array_length(expertise, 1) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN employment_status IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN engagement_types IS NOT NULL AND array_length(engagement_types, 1) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN availability IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN skills IS NOT NULL AND skills != '' THEN 1 ELSE 0 END) +
    (CASE WHEN passions IS NOT NULL AND passions != '' THEN 1 ELSE 0 END) +
    (CASE WHEN seeking_income IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN venture_interest IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN avatar_url IS NOT NULL AND avatar_url != '' THEN 1 ELSE 0 END)
  INTO completion_score
  FROM public.profiles
  WHERE id = profile_id;
  
  RETURN (completion_score * 100 / total_fields);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update profile completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS trigger AS $$
BEGIN
  NEW.profile_completion_percentage := calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profile_completion ON public.profiles;
CREATE TRIGGER trigger_update_profile_completion
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- Update existing profiles to calculate completion
UPDATE public.profiles 
SET profile_completion_percentage = calculate_profile_completion(id);
