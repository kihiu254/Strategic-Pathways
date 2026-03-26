-- ==============================================================================
-- Strategic Pathways - Admin Dashboard V2 Module Schema
-- Run this once in Supabase SQL Editor to enable the new admin pages.
-- ==============================================================================

-- Impact stories: ensure table exists and default publishes to false
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
ALTER TABLE public.impact_stories ALTER COLUMN is_published SET DEFAULT false;

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
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Referrals tables for admin dashboards
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  referred_email text,
  referred_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  referral_code text,
  status text DEFAULT 'clicked' CHECK (status IN ('clicked', 'signed_up', 'active', 'verified', 'expired')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at timestamp with time zone
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
CREATE POLICY "Users can view own referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

DROP POLICY IF EXISTS "Users can insert referrals" ON public.referrals;
CREATE POLICY "Users can insert referrals"
ON public.referrals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

DROP POLICY IF EXISTS "Admins can manage referrals" ON public.referrals;
CREATE POLICY "Admins can manage referrals"
ON public.referrals FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_type text,
  earned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  referral_count integer DEFAULT 0
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own referral rewards" ON public.referral_rewards;
CREATE POLICY "Users can view own referral rewards"
ON public.referral_rewards FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage referral rewards" ON public.referral_rewards;
CREATE POLICY "Admins can manage referral rewards"
ON public.referral_rewards FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Portfolio projects: add tags for moderation and allow admin reads/updates
ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS project_url text;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all projects" ON public.user_projects;
CREATE POLICY "Admins can view all projects"
ON public.user_projects FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all projects" ON public.user_projects;
CREATE POLICY "Admins can update all projects"
ON public.user_projects FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Opportunity applications: notes + admin access
ALTER TABLE public.opportunity_applications ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all opportunity applications" ON public.opportunity_applications;
CREATE POLICY "Admins can view all opportunity applications"
ON public.opportunity_applications FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all opportunity applications" ON public.opportunity_applications;
CREATE POLICY "Admins can update all opportunity applications"
ON public.opportunity_applications FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Community activation events for user dashboard milestones
CREATE TABLE IF NOT EXISTS public.community_activation_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  sent_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.community_activation_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own community activation events" ON public.community_activation_events;
CREATE POLICY "Users can view own community activation events"
ON public.community_activation_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own community activation events" ON public.community_activation_events;
CREATE POLICY "Users can insert own community activation events"
ON public.community_activation_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage community activation events" ON public.community_activation_events;
CREATE POLICY "Admins can manage community activation events"
ON public.community_activation_events FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
