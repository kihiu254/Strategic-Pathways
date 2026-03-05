-- ==============================================================================
-- FIX ADMIN DOCUMENT ACCESS
-- Run this to ensure admins can view and download all verification documents
-- ==============================================================================

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Admins can view all verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can download all verification docs" ON storage.objects;

-- Create improved admin access policy for verification documents
-- This policy allows admins to SELECT (view/download) all files in the verification-documents bucket
CREATE POLICY "Admins can view all verification docs" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'verification-documents' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Also ensure admins can update/delete documents if needed
DROP POLICY IF EXISTS "Admins can update verification docs" ON storage.objects;
CREATE POLICY "Admins can update verification docs" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'verification-documents' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete verification docs" ON storage.objects;
CREATE POLICY "Admins can delete verification docs" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'verification-documents' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Verify the policies are in place
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%Admin%verification%'
ORDER BY policyname;

-- Test query to check if current user is admin (run this as your admin user)
SELECT 
  id, 
  email, 
  role,
  CASE 
    WHEN role = 'admin' THEN 'You have admin access ✓'
    ELSE 'You do NOT have admin access ✗'
  END as access_status
FROM public.profiles 
WHERE id = auth.uid();
