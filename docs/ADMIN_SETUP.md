# Admin Dashboard Setup Guide

## 1. Make Yourself Admin

Run this SQL in Supabase SQL Editor:

```sql
-- Replace with your email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'kihiu254@gmail.com';

-- Verify
SELECT id, email, full_name, role 
FROM public.profiles 
WHERE role = 'admin';
```

## 2. What Works Now

✅ **Members Page**: Shows all users from `profiles` table
✅ **Projects Page**: Shows all projects from `user_projects` table  
✅ **Applications Page**: Shows verification documents from `verification_documents` table
✅ **Stats**: Real counts from database
✅ **Approve/Reject**: Updates verification_documents status

## 3. What Needs Implementation

❌ **Add Member Button**: Currently placeholder
❌ **Create Opportunity**: OpportunitiesPage uses mock data
❌ **Edit/Delete Actions**: Not connected to database

## 4. Fix Opportunities Page

The opportunities page needs to be updated to use the `opportunities` table instead of mock data. The database schema already has the table ready.

## 5. Quick Fixes Needed

1. Update OpportunitiesPage to fetch from `opportunities` table
2. Add create/edit/delete functionality for opportunities
3. Connect member add/edit/delete buttons to database
4. Add project creation form
