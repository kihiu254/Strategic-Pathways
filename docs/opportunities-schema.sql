-- ==============================================================================
-- OPPORTUNITIES SYSTEM DATABASE SCHEMA
-- ==============================================================================

-- Create opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  duration TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  compensation TEXT NOT NULL,
  sector TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  deadline TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Create opportunity_applications table
CREATE TABLE IF NOT EXISTS opportunity_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES profiles(id),
  notes TEXT,
  UNIQUE(opportunity_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_sector ON opportunities(sector);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at);

CREATE INDEX IF NOT EXISTS idx_applications_opportunity ON opportunity_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON opportunity_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON opportunity_applications(status);

-- Enable Row Level Security
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for opportunities

-- Everyone can view active opportunities
CREATE POLICY "Anyone can view active opportunities"
ON opportunities FOR SELECT
USING (status = 'active');

-- Admins can do everything with opportunities
CREATE POLICY "Admins can manage opportunities"
ON opportunities FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- RLS Policies for opportunity_applications

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
ON opportunity_applications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can create their own applications
CREATE POLICY "Users can create applications"
ON opportunity_applications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON opportunity_applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can update applications (review, accept, reject)
CREATE POLICY "Admins can update applications"
ON opportunity_applications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for opportunities
DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
CREATE TRIGGER update_opportunities_updated_at
BEFORE UPDATE ON opportunities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample opportunities (for testing)
INSERT INTO opportunities (title, organization, location, type, duration, description, requirements, compensation, sector, tags, deadline, status)
VALUES
  (
    'Digital Transformation Consultant',
    'Nairobi County Government',
    'Nairobi, Kenya',
    'Contract',
    '6 months',
    'Lead the digital transformation strategy for county service delivery systems. Work with stakeholders to modernize government processes and implement digital solutions.',
    ARRAY['5+ years in digital transformation', 'Experience with government systems', 'Strong stakeholder management'],
    'Competitive',
    'Technology',
    ARRAY['Digital', 'Government', 'Strategy'],
    NOW() + INTERVAL '30 days',
    'active'
  ),
  (
    'AgriTech Value Chain Expert',
    'Green Innovations NGO',
    'Nakuru, Kenya (Hybrid)',
    'Full-time',
    '12 months',
    'Design and implement supply chain optimizations for local farmers. Develop technology solutions to improve agricultural productivity and market access.',
    ARRAY['Agricultural economics background', 'Supply chain expertise', 'Technology integration experience'],
    'KSh 150,000 - 200,000/month',
    'Agriculture',
    ARRAY['AgriTech', 'Supply Chain', 'Innovation'],
    NOW() + INTERVAL '45 days',
    'active'
  ),
  (
    'Venture Builder In-Residence',
    'Kenya Innovation Hub',
    'Remote',
    'Part-time',
    '9 months',
    'Mentor early-stage startups and help build viable financial models. Provide strategic guidance to founders and connect them with investors.',
    ARRAY['Startup experience', 'Financial modeling', 'Mentorship skills'],
    'Equity + Stipend',
    'Finance',
    ARRAY['Startups', 'Venture', 'Mentorship'],
    NOW() + INTERVAL '60 days',
    'active'
  ),
  (
    'Public Health Data Analyst',
    'Ministry of Health Alliance',
    'Mombasa, Kenya',
    'Contract',
    '8 months',
    'Analyze public health data to optimize resource allocation. Develop dashboards and reports for health program monitoring and evaluation.',
    ARRAY['Data analysis expertise', 'Public health knowledge', 'Visualization skills'],
    'Competitive',
    'Healthcare',
    ARRAY['Data', 'Healthcare', 'Analytics'],
    NOW() + INTERVAL '20 days',
    'active'
  ),
  (
    'Education Technology Advisor',
    'Kenya Education Board',
    'Nairobi, Kenya',
    'Advisory',
    '4 months',
    'Advise on EdTech strategy and implementation for national curriculum digitization. Evaluate technology solutions and provide recommendations.',
    ARRAY['EdTech experience', 'Curriculum development', 'Policy advisory'],
    'Advisory Fee',
    'Education',
    ARRAY['EdTech', 'Policy', 'Advisory'],
    NOW() + INTERVAL '15 days',
    'active'
  );

-- Verify the setup
SELECT 
  'Opportunities Table' as table_name,
  COUNT(*) as record_count
FROM opportunities
UNION ALL
SELECT 
  'Applications Table' as table_name,
  COUNT(*) as record_count
FROM opportunity_applications;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('opportunities', 'opportunity_applications')
ORDER BY tablename, policyname;
