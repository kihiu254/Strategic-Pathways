-- ==============================================================================
-- MAKE USER ADMIN
-- Run this to promote your account to admin
-- ==============================================================================

-- Replace 'your.email@example.com' with your actual email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'kihiu254@gmail.com';

-- Verify admin status
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
WHERE role = 'admin';
