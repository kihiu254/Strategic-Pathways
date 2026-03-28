-- Add fcm_token column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Optional notification channel preferences for future use
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"in_app": true, "email": true, "push": true}'::jsonb;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_fcm_token ON profiles(fcm_token);
