-- ==============================================================================
-- OPPORTUNITIES TABLE MIGRATION - Add Missing Columns
-- Run this to update the existing opportunities table
-- ==============================================================================

-- Add missing columns to opportunities table
ALTER TABLE public.opportunities 
  ADD COLUMN IF NOT EXISTS compensation TEXT,
  ADD COLUMN IF NOT EXISTS sector TEXT,
  ADD COLUMN IF NOT EXISTS deadline TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Update status check constraint to match new values
ALTER TABLE public.opportunities DROP CONSTRAINT IF EXISTS opportunities_status_check;
ALTER TABLE public.opportunities 
  ADD CONSTRAINT opportunities_status_check 
  CHECK (status IN ('active', 'closed', 'open', 'draft'));

-- Add sector column to profiles table if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sector TEXT;

-- Create opportunity_applications table (separate from applications)
CREATE TABLE IF NOT EXISTS public.opportunity_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  UNIQUE(opportunity_id, user_id)
);

-- Enable RLS on opportunity_applications
ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for opportunity_applications
CREATE POLICY "Users can view own applications"
ON public.opportunity_applications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create applications"
ON public.opportunity_applications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all applications"
ON public.opportunity_applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update applications"
ON public.opportunity_applications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_sector ON public.opportunities(sector);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON public.opportunities(deadline);

CREATE INDEX IF NOT EXISTS idx_opp_applications_opportunity ON public.opportunity_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opp_applications_user ON public.opportunity_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_opp_applications_status ON public.opportunity_applications(status);

-- Update existing opportunities RLS policies to use 'active' status
DROP POLICY IF EXISTS "Anyone can view open opportunities." ON public.opportunities;
CREATE POLICY "Anyone can view active opportunities"
ON public.opportunities FOR SELECT
USING (status IN ('active', 'open'));

-- Insert sample opportunities
INSERT INTO public.opportunities (
  title, organization, location, type, duration, description, 
  requirements, compensation, sector, tags, deadline, status
)
VALUES
  (
    'Digital Transformation Consultant',
    'Nairobi County Government',
    'Nairobi, Kenya',
    'Contract',
    '6 months',
    'Lead the digital transformation strategy for county service delivery systems.',
    ARRAY['5+ years in digital transformation', 'Experience with government systems'],
    'Competitive',
    'Technology',
    ARRAY['Digital', 'Government', 'Strategy'],
    NOW() + INTERVAL '30 days',
    'active'
  ),
  (
    'AgriTech Value Chain Expert',
    'Green Innovations NGO',
    'Nakuru, Kenya',
    'Full-time',
    '12 months',
    'Design and implement supply chain optimizations for local farmers.',
    ARRAY['Agricultural economics background', 'Supply chain expertise'],
    'KSh 150,000 - 200,000/month',
    'Agriculture',
    ARRAY['AgriTech', 'Supply Chain'],
    NOW() + INTERVAL '45 days',
    'active'
  ),
  (
    'Venture Builder In-Residence',
    'Kenya Innovation Hub',
    'Remote',
    'Part-time',
    '9 months',
    'Mentor early-stage startups and help build viable financial models.',
    ARRAY['Startup experience', 'Financial modeling'],
    'Equity + Stipend',
    'Finance',
    ARRAY['Startups', 'Venture'],
    NOW() + INTERVAL '60 days',
    'active'
  )
ON CONFLICT DO NOTHING;

-- Verify the migration
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'opportunities'
ORDER BY ordinal_position;

SELECT COUNT(*) as total_opportunities FROM public.opportunities;
