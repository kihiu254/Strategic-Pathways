# Database Setup Instructions

## Overview
This guide will help you set up the complete Strategic Pathways database schema with all onboarding and profile management features.

## Prerequisites
- Supabase project created
- Access to Supabase SQL Editor
- Access to Supabase Storage

## Step 1: Run Base Schema
1. Open your Supabase SQL Editor
2. Copy and paste the contents of `docs/database-schema.sql`
3. Click "Run" to execute
4. This creates the base tables: profiles, opportunities, applications, partner_inquiries

## Step 2: Run Comprehensive Schema Update
1. In the Supabase SQL Editor
2. Copy and paste the contents of `docs/complete-schema-update.sql`
3. Click "Run" to execute
4. This adds all onboarding fields and creates supporting tables:
   - Extended profiles table with 30+ new fields
   - verification_documents table
   - professional_references table
   - user_skills table
   - user_projects table
   - platform_social_links table (pre-populated)

## Step 3: Create Storage Buckets
Go to Supabase Storage and create these buckets:

### 1. avatars (Public)
- Name: `avatars`
- Public: ✅ Yes
- Purpose: User profile pictures

### 2. resumes (Private)
- Name: `resumes`
- Public: ❌ No
- Purpose: User CV/Resume documents

### 3. verification-documents (Private)
- Name: `verification-documents`
- Public: ❌ No
- Purpose: Verification documents (ID, degrees, etc.)

## Step 4: Verify Setup
Run these queries to verify everything is set up correctly:

```sql
-- Check profiles table has all columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Check social links are populated
SELECT * FROM platform_social_links ORDER BY display_order;
```

## Step 5: Create Admin User
After signing up with your admin email, promote yourself to admin:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your.admin@email.com';
```

## Database Schema Overview

### Profiles Table Fields

#### Basic Information
- `full_name` - User's full name
- `professional_title` - Job title/role
- `email` - Email address
- `phone` - Phone number
- `country_code` - Phone country code
- `location` - Country of residence
- `nationality` - User's nationality
- `language` - Preferred language
- `bio` - Professional biography
- `avatar_url` - Profile picture URL

#### Profile Type & Verification
- `profile_type` - 'Standard (MVP)' or 'Premium (Verified)'
- `user_category` - Study-Abroad Returnee, Diaspora Returnee, or Diaspora Expert
- `verification_tier` - Tier 1, 2, or 3
- `verification_status` - pending, approved, rejected
- `verification_docs` - JSONB with document URLs

#### Education & Experience
- `education` - JSONB with degree, institutions, field, countries
- `years_of_experience` - 0-3, 3-7, 7-12, 12+
- `sector` - Primary sector (Tech, Finance, Health, etc.)
- `expertise` - Array of functional expertise areas
- `employment_status` - Current employment status
- `organisation` - Current organization

#### Engagement & Interests
- `engagement_types` - Array of engagement preferences
- `availability` - Hours per week available
- `preferred_format` - Remote, Hybrid, In-person, Flexible
- `skills` - Text description of specific skills
- `passions` - Problems passionate about solving

#### Experience & Collaboration
- `worked_with_smes` - Boolean
- `sme_experience` - Description of SME work
- `cross_sector` - Open to cross-sector collaboration

#### Income & Ventures
- `seeking_income` - Yes actively, Yes selectively, No
- `venture_interest` - Yes, Maybe, No
- `investor_interest` - Yes, No, Possibly in future

#### Premium Fields
- `industry_sub_spec` - Industry sub-specialization
- `key_achievements` - Quantifiable achievements
- `preferred_project_types` - Array of project types
- `compensation_expectation` - Pro-bono, Market rate, Premium
- `sdg_alignment` - Array of SDG goals

#### Metadata
- `professional_references` - Professional references text
- `visibility_settings` - JSONB with spotlight, mentor, ambassador preferences
- `onboarding_completed` - Boolean
- `profile_completion_percentage` - Auto-calculated 0-100
- `role` - user or admin
- `tier` - Community, Professional, Firm
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

## Data Flow

### Onboarding Flow
1. User signs up → Profile created with basic info
2. User completes onboarding → All fields saved to profiles table
3. Profile completion percentage auto-calculated
4. User redirected to profile page

### Profile Editing Flow
1. User clicks "Edit Profile"
2. Fields become editable
3. User clicks "Save"
4. Data saved to profiles table
5. Profile completion percentage recalculated

### Document Upload Flow
1. User uploads document
2. File saved to appropriate storage bucket
3. File path/URL saved to profiles table or verification_documents table
4. Admin can review and approve/reject

## Troubleshooting

### Issue: Columns don't exist
**Solution**: Run `complete-schema-update.sql` again

### Issue: Storage policies not working
**Solution**: Check bucket names match exactly and RLS is enabled

### Issue: Profile completion not calculating
**Solution**: Run this to recalculate:
```sql
UPDATE public.profiles 
SET profile_completion_percentage = calculate_profile_completion(id);
```

### Issue: Can't upload files
**Solution**: Verify storage buckets exist and policies are created

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Users can only view/edit their own data
- Admins can view/edit all data
- Storage buckets have appropriate access policies
- Verification documents are private and only accessible to user and admins

## Next Steps

1. Test the onboarding flow at `/onboarding`
2. Test profile editing at `/profile`
3. Test document uploads
4. Test verification system at `/verification`
5. Configure email templates for notifications
6. Set up admin dashboard for document review

## Support

For issues or questions:
1. Check Supabase logs for errors
2. Verify all SQL scripts ran successfully
3. Check browser console for frontend errors
4. Ensure environment variables are set correctly
