# Admin User Data & Project Fixes

## Issues Fixed

### 1. ✅ Missing `tags` Column in `user_projects` Table
**Error:** `Could not find the 'tags' column of 'user_projects' in the schema cache`

**Solution:** Added the missing `tags` column to the database schema.

### 2. ✅ Admin Cannot View All User Onboarding Data
**Issue:** Admin dashboard only showed limited user information, not all the detailed onboarding data.

**Solution:** Created a comprehensive admin user detail page that displays ALL onboarding information.

---

## Files Created/Modified

### 1. Database Schema Fix
**File:** `app/docs/fix-user-projects-and-admin-view.sql`

**What it does:**
- Adds missing `tags` column to `user_projects` table
- Creates a comprehensive admin view (`admin_user_comprehensive_view`) that shows all user data
- Includes verification queries to test the changes

**How to apply:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of this file
4. Run the script

### 2. New Admin User Detail Page
**File:** `app/src/sections/AdminUserDetailPage.tsx`

**Features:**
- Displays ALL onboarding data in organized sections:
  - Basic Information (name, email, phone, LinkedIn, etc.)
  - Profile & Verification status
  - Education details
  - Professional Experience
  - Professional Bio
  - Engagement Preferences
  - Skills & Passions
  - Experience & Interests (SME, ventures, investments)
  - Premium Details (achievements, specialization)
  - Visibility & Community settings
  - Professional References
  - Verification Documents (with view links)
  - Timestamps
- Approve/Reject buttons for verification
- Back button to return to admin dashboard

### 3. Updated App Routes
**File:** `app/src/App.tsx`

**Changes:**
- Added lazy-loaded import for `AdminUserDetailPage`
- Added route: `/admin/user/:userId`

### 4. Updated Admin Dashboard
**File:** `app/src/sections/AdminDashboard.tsx`

**Changes:**
- Added "View Full Profile" button (User icon) to each application
- Button navigates to `/admin/user/{userId}` to show complete user data
- Reorganized action buttons with better colors:
  - Blue = View Full Profile
  - Purple = View Documents
  - Green = Approve
  - Red = Reject

---

## How to Use

### For Admins:

1. **Apply Database Fix First:**
   ```sql
   -- Run this in Supabase SQL Editor
   -- File: app/docs/fix-user-projects-and-admin-view.sql
   ```

2. **View User Details:**
   - Go to Admin Dashboard
   - In the Applications section, click the **User icon** (blue button) next to any application
   - You'll see a comprehensive page with ALL user onboarding data organized in sections

3. **View Documents:**
   - Click the **Eye icon** (purple button) to see verification documents in a modal
   - Each document has View and Download buttons

4. **Approve/Reject:**
   - Click the **Check icon** (green) to approve
   - Click the **X icon** (red) to reject

### For Users Creating Projects:

The `tags` column is now available in the `user_projects` table, so users can add tags to their projects without errors.

---

## Data Displayed in Admin User Detail Page

### Basic Information
- Full Name
- Professional Title
- Email
- Phone (with country code)
- LinkedIn URL
- Website URL
- Country of Residence
- Nationality

### Profile & Verification
- Profile Type (Standard/Premium)
- User Category (Returnee type)
- Verification Tier
- Verification Status
- Onboarding Completed
- Profile Completion %
- Membership Tier
- Role

### Education
- Highest Education Level
- Study Country
- Institutions
- Field of Study
- Other Countries Worked
- Languages Spoken (with proficiency levels)

### Professional Experience
- Years of Experience
- Primary Sector
- Functional Expertise (up to 5)
- Employment Status
- Current Organisation
- Professional Bio

### Engagement Preferences
- Engagement Types
- Availability
- Preferred Format
- Compensation Expectation
- Preferred Project Types

### Skills & Passions
- Specific Skills (detailed list)
- Passionate Problems (what they want to solve)
- SDG Alignment

### Experience & Interests
- Worked with SMEs (Yes/No + description)
- Cross-Sector Collaboration
- Seeking Income
- Venture Interest
- Investor Interest

### Premium Details
- Key Achievements
- Industry Sub-Specialization

### Visibility & Community
- Open to Spotlight
- Would Like to Mentor
- Community Ambassador Interest

### Verification Documents
- All uploaded documents with direct view links
- Academic Proof
- Identity Proof
- Employment Proof
- Residency Proof
- Professional Proof

### Professional References
- Full text of references provided

### Timestamps
- Account Created Date
- Last Updated Date

---

## Database Schema Changes

### user_projects Table
```sql
ALTER TABLE public.user_projects 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[];
```

### New View: admin_user_comprehensive_view
A database view that joins all user data for easy admin access. Includes:
- All profile fields
- Counts of related data (projects, skills, verification docs)
- Ordered by creation date (newest first)

---

## Testing

### Test Database Fix:
```sql
-- Verify tags column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_projects' 
AND column_name = 'tags';

-- Test the admin view
SELECT id, email, full_name, profile_type, onboarding_completed, total_projects
FROM public.admin_user_comprehensive_view
LIMIT 5;
```

### Test User Detail Page:
1. Log in as admin
2. Go to Admin Dashboard
3. Click User icon on any application
4. Verify all sections display correctly
5. Test Approve/Reject buttons
6. Test Back button

---

## Benefits

✅ **Complete Data Visibility** - Admins can now see EVERYTHING users filled in during onboarding
✅ **Better Organization** - Data is organized in logical sections for easy review
✅ **Quick Actions** - Approve/Reject directly from detail page
✅ **Document Access** - Direct links to view all verification documents
✅ **No More Errors** - Fixed the tags column issue for project creation
✅ **Scalable** - Database view makes it easy to add more fields in the future

---

## Future Enhancements

Consider adding:
- [ ] Edit user data directly from admin panel
- [ ] Export user data to CSV/PDF
- [ ] Bulk approve/reject functionality
- [ ] User activity timeline
- [ ] Notes/comments on user profiles
- [ ] Email user directly from admin panel
- [ ] Search and filter users by various criteria

---

**Status:** ✅ COMPLETE
**Last Updated:** 2024
**Tested:** Pending admin verification
