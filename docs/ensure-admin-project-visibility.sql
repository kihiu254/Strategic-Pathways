-- ==============================================================================
-- ENSURE ADMIN PROJECT VISIBILITY
-- Run this in Supabase SQL Editor to allow admins to see all user projects
-- ==============================================================================

-- 1. Enable RLS on user_projects (if not already enabled)
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies if needed
-- DROP POLICY IF EXISTS "Users can view own projects" ON public.user_projects;
-- DROP POLICY IF EXISTS "Anyone can view projects" ON public.user_projects;

-- 3. Create a specific policy for admins to see ALL projects
DROP POLICY IF EXISTS "Admins can view all projects" ON public.user_projects;
CREATE POLICY "Admins can view all projects" ON public.user_projects 
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 4. Ensure users can still see their own projects
DROP POLICY IF EXISTS "Users can manage own projects" ON public.user_projects;
CREATE POLICY "Users can manage own projects" ON public.user_projects 
  FOR ALL USING (auth.uid() = user_id);

-- Optional: If you want ANY authenticated user to see projects (e.g. for a public directory)
-- DROP POLICY IF EXISTS "Anyone can view projects" ON public.user_projects;
-- CREATE POLICY "Anyone can view projects" ON public.user_projects 
--   FOR SELECT USING (true);
