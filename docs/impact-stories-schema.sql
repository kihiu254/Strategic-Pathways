-- ==============================================================================
-- IMPACT STORIES SCHEMA
-- Run this in the Supabase SQL Editor before using the live success stories flow.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.impact_stories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text,
  organization text,
  story text NOT NULL,
  image_url text,
  is_published boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.impact_stories ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_impact_stories_user_id
  ON public.impact_stories(user_id);

CREATE INDEX IF NOT EXISTS idx_impact_stories_published_created_at
  ON public.impact_stories(is_published, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_impact_stories_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_impact_stories_updated_at ON public.impact_stories;
CREATE TRIGGER set_impact_stories_updated_at
BEFORE UPDATE ON public.impact_stories
FOR EACH ROW
EXECUTE FUNCTION public.set_impact_stories_updated_at();

DROP POLICY IF EXISTS "Anyone can view published impact stories" ON public.impact_stories;
CREATE POLICY "Anyone can view published impact stories"
ON public.impact_stories FOR SELECT
USING (is_published = true);

DROP POLICY IF EXISTS "Users can insert own impact stories" ON public.impact_stories;
CREATE POLICY "Users can insert own impact stories"
ON public.impact_stories FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own impact stories" ON public.impact_stories;
CREATE POLICY "Users can update own impact stories"
ON public.impact_stories FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own impact stories" ON public.impact_stories;
CREATE POLICY "Users can delete own impact stories"
ON public.impact_stories FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all impact stories" ON public.impact_stories;
CREATE POLICY "Admins can manage all impact stories"
ON public.impact_stories FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.impact_stories;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

COMMENT ON TABLE public.impact_stories IS 'Member-submitted impact stories displayed on the public Impact screen.';
