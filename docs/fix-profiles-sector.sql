-- ==============================================================================
-- FIX: Add missing sector column to profiles table
-- ==============================================================================

-- Add sector column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'sector'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sector TEXT;
  END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'sector';
