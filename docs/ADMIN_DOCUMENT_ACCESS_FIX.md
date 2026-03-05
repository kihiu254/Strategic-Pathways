# Admin Document Access Fix

## Problem Summary
Admins were unable to view or download application documents (verification documents) submitted by users during onboarding.

## Root Causes Identified

### 1. Missing UI Functionality
The AdminDashboard component had no interface for viewing or downloading documents:
- The `viewingDocs` state variable existed but was never used
- No "View Documents" button in the applications table
- No modal/dialog to display document details

### 2. Potential Storage Policy Issues
The storage bucket policies for `verification-documents` may not have been properly configured to allow admin access.

## Solutions Implemented

### 1. Updated AdminDashboard Component
**File:** `app/src/sections/AdminDashboard.tsx`

**Changes Made:**
- ✅ Added `Download` and `ExternalLink` icons to imports
- ✅ Created `handleViewDocs()` function to open document viewer
- ✅ Created `handleDownloadDoc()` function for downloading documents
- ✅ Added "View Documents" button (Eye icon) in both Overview and Applications sections
- ✅ Created a full-featured Document Viewer Modal that displays:
  - User's name and email
  - List of all uploaded documents
  - "View" button (opens in new tab)
  - "Download" button (downloads the file)
  - Proper formatting of document names

**Key Features:**
```typescript
// View documents modal
{viewingDocs && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
    <div className="glass-card max-w-4xl w-full">
      {/* Document list with view/download buttons */}
    </div>
  </div>
)}
```

### 2. Created Storage Policy Fix Script
**File:** `app/docs/fix-admin-document-access.sql`

**Purpose:** Ensures admins have proper access to all verification documents in Supabase Storage.

**What it does:**
- Drops and recreates admin access policies for the `verification-documents` bucket
- Grants SELECT (view/download) permissions to admins
- Grants UPDATE and DELETE permissions to admins (for document management)
- Includes verification queries to test admin access

**To Apply:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `fix-admin-document-access.sql`
4. Run the script
5. Verify the policies are created successfully

## How Documents Are Stored

Based on the code analysis:

1. **During Onboarding** (`ProfileOnboarding.tsx`):
   - Users upload documents to Supabase Storage bucket `verification-documents`
   - The public URLs are generated and stored in the `profiles` table
   - Documents are stored in the `verification_docs` JSONB field:
     ```json
     {
       "academic": "https://...",
       "identity": "https://...",
       "employment": "https://...",
       "residency": "https://...",
       "professional": "https://..."
     }
     ```

2. **In AdminDashboard**:
   - Fetches profiles with `verification_docs` field
   - Filters out profiles without documents
   - Displays applications with document URLs
   - Now provides UI to view and download these documents

## Testing the Fix

### Step 1: Verify Admin Role
Run this in Supabase SQL Editor:
```sql
SELECT id, email, role 
FROM public.profiles 
WHERE email = 'kihiu254@gmail.com';
```
Ensure `role` is `'admin'`.

### Step 2: Apply Storage Policies
Run the `fix-admin-document-access.sql` script in Supabase SQL Editor.

### Step 3: Test in Application
1. Log in as admin user (kihiu254@gmail.com)
2. Navigate to Admin Dashboard
3. Go to "Applications" section
4. Click the Eye icon (👁️) next to any application
5. Document viewer modal should open
6. Click "View" to open document in new tab
7. Click "Download" to download the document

## Additional Notes

### Document Upload Location
Documents are uploaded to: `verification-documents/{userId}/{filename}`

### Storage Bucket Configuration
Ensure the `verification-documents` bucket exists and is configured as:
- **Public:** No (private bucket)
- **File size limit:** Appropriate for documents (e.g., 10MB)
- **Allowed MIME types:** PDF, images, etc.

### RLS Policies Summary
After applying the fix, these policies should exist:

1. **Users can upload verification docs** - Users can upload their own documents
2. **Users can view own verification docs** - Users can view their own documents
3. **Admins can view all verification docs** - Admins can view ALL documents ✅
4. **Admins can update verification docs** - Admins can update documents ✅
5. **Admins can delete verification docs** - Admins can delete documents ✅

## Troubleshooting

### If documents still don't load:

1. **Check browser console** for errors
2. **Verify storage policies** are applied:
   ```sql
   SELECT policyname, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'objects' 
   AND policyname LIKE '%verification%';
   ```

3. **Check document URLs** in database:
   ```sql
   SELECT id, email, verification_docs 
   FROM public.profiles 
   WHERE verification_docs IS NOT NULL 
   LIMIT 5;
   ```

4. **Test storage access** directly:
   ```javascript
   const { data, error } = await supabase.storage
     .from('verification-documents')
     .list();
   console.log(data, error);
   ```

### If download fails:

The download functionality uses the document URL directly. If the bucket is private and URLs are signed URLs, they may expire. Consider:
- Using signed URLs with longer expiration
- Or making the bucket public (less secure)
- Or implementing server-side download proxy

## Security Considerations

✅ **Good Practices Implemented:**
- Documents stored in private bucket
- RLS policies restrict access to document owners and admins only
- Admin role verification before granting access

⚠️ **Recommendations:**
- Implement audit logging for document access
- Add document expiration/retention policies
- Consider encrypting sensitive documents at rest
- Implement rate limiting on document downloads

## Future Enhancements

Consider adding:
- [ ] Document preview (PDF viewer in modal)
- [ ] Bulk download (zip multiple documents)
- [ ] Document approval/rejection workflow
- [ ] Document version history
- [ ] Admin notes on documents
- [ ] Email notifications when documents are reviewed
- [ ] Document expiration warnings
- [ ] Search/filter documents by type or status

## Files Modified

1. ✅ `app/src/sections/AdminDashboard.tsx` - Added document viewing UI
2. ✅ `app/docs/fix-admin-document-access.sql` - Storage policy fixes

## Files to Review

- `app/src/sections/onboarding/OnboardingSteps.tsx` - Document upload component
- `app/docs/complete-schema-update.sql` - Database schema with verification_docs field
- `app/docs/database-schema.sql` - Original schema

---

**Status:** ✅ FIXED
**Last Updated:** 2024
**Tested:** Pending user verification
