-- ==============================================================================
-- Strategic Pathways - Portfolio Project Publishing + Project Applications
-- Run this once in the Supabase SQL Editor before testing the project flow.
-- ==============================================================================

-- Ensure portfolio projects support moderation metadata and links
ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS project_url text;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

-- Admin access to member-submitted portfolio projects
DROP POLICY IF EXISTS "Admins can view all projects" ON public.user_projects;
CREATE POLICY "Admins can view all projects"
ON public.user_projects FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all projects" ON public.user_projects;
CREATE POLICY "Admins can update all projects"
ON public.user_projects FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete all projects" ON public.user_projects;
CREATE POLICY "Admins can delete all projects"
ON public.user_projects FOR DELETE
TO authenticated
USING (public.is_admin());

-- Project applications for approved/published portfolio projects
CREATE TABLE IF NOT EXISTS public.project_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.user_projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  cover_letter text,
  notes text,
  applied_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_project_application UNIQUE (project_id, user_id)
);

ALTER TABLE public.project_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own project applications" ON public.project_applications;
CREATE POLICY "Users can view own project applications"
ON public.project_applications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create project applications" ON public.project_applications;
CREATE POLICY "Users can create project applications"
ON public.project_applications FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.user_projects
    WHERE user_projects.id = project_id
      AND COALESCE(user_projects.tags, ARRAY[]::text[]) @> ARRAY['admin-status:approved']::text[]
      AND NOT (COALESCE(user_projects.tags, ARRAY[]::text[]) @> ARRAY['admin-status:archived']::text[])
  )
);

DROP POLICY IF EXISTS "Admins can view all project applications" ON public.project_applications;
CREATE POLICY "Admins can view all project applications"
ON public.project_applications FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all project applications" ON public.project_applications;
CREATE POLICY "Admins can update all project applications"
ON public.project_applications FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete all project applications" ON public.project_applications;
CREATE POLICY "Admins can delete all project applications"
ON public.project_applications FOR DELETE
TO authenticated
USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_user_projects_created_at
  ON public.user_projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_applications_project_id
  ON public.project_applications(project_id);

CREATE INDEX IF NOT EXISTS idx_project_applications_user_id
  ON public.project_applications(user_id);
