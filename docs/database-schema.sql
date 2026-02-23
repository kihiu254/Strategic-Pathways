-- ==============================================================================
-- STRATEGIC PATHWAYS - COMPREHENSIVE DATABASE SCHEMA
-- Run this entire script in your Supabase SQL Editor.
-- It sets up all tables, roles, triggers, and Row Level Security (RLS) policies.
-- ==============================================================================

-- ==========================================
-- 1. PROFILES & AUTHENTICATION
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text default 'user' check (role in ('user', 'admin')),
  tier text default 'Community' check (tier in ('Community', 'Professional', 'Firm')),
  bio text,
  location text,
  phone text,
  country_code text,
  language text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profiles
CREATE POLICY "Users can view own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Admins can do everything
-- Helper function to prevent RLS infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE POLICY "Admins can view all profiles." ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all profiles." ON public.profiles FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete profiles." ON public.profiles FOR DELETE USING (public.is_admin());

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name',
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ==========================================
-- 2. PARTNER INQUIRIES (Contact Form)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.partner_inquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  organization text,
  message text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'contacted', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.partner_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone (even anonymous visitors) can insert an inquiry
CREATE POLICY "Anyone can submit a partner inquiry." ON public.partner_inquiries FOR INSERT WITH CHECK (true);

-- Only admins can read, update, or delete inquiries
CREATE POLICY "Admins can view inquiries." ON public.partner_inquiries FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update inquiries." ON public.partner_inquiries FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete inquiries." ON public.partner_inquiries FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- ==========================================
-- 3. OPPORTUNITIES (Job Board / Projects)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.opportunities (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  organization text not null,
  location text not null,
  type text not null, -- e.g., 'Consultancy', 'Full-time'
  duration text,
  description text not null,
  requirements text[],
  tags text[],
  status text default 'open' check (status in ('open', 'closed', 'draft')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Anyone can read open opportunities
CREATE POLICY "Anyone can view open opportunities." ON public.opportunities FOR SELECT USING (status = 'open');

-- Admins can do everything (CRUD)
CREATE POLICY "Admins can view all opportunities." ON public.opportunities FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can insert opportunities." ON public.opportunities FOR INSERT WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update opportunities." ON public.opportunities FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete opportunities." ON public.opportunities FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- ==========================================
-- 4. APPLICATIONS (Users applying to Opportunities)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.applications (
  id uuid default gen_random_uuid() primary key,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  applicant_id uuid references public.profiles(id) on delete cascade not null,
  cover_letter text,
  cv_url text, -- Link to Supabase Storage file
  status text default 'pending' check (status in ('pending', 'reviewing', 'shortlisted', 'accepted', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure a user can only apply once per opportunity
ALTER TABLE public.applications ADD CONSTRAINT unique_application UNIQUE (opportunity_id, applicant_id);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Authenticated users can apply
CREATE POLICY "Users can submit applications." ON public.applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- Users can view their own applications
CREATE POLICY "Users can view own applications." ON public.applications FOR SELECT USING (auth.uid() = applicant_id);

-- Admins can view and update all applications
CREATE POLICY "Admins can view all applications." ON public.applications FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update applications." ON public.applications FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- ==========================================
-- 5. DOCUMENTS STORAGE BUCKET (For CVs / Resumes)
-- ==========================================
-- NOTE: Please ensure you create a Storage Bucket named 'resumes' in the Supabase Dashboard.
-- These RLS policies apply to the storage.objects table for the 'resumes' bucket.

-- You can run these in the SQL editor, or configure them via the Storage UI.
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false) ON CONFLICT DO NOTHING;

-- Policy: Users can upload their own resume
CREATE POLICY "Users can upload their own resumes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'resumes' AND (auth.uid()::text = (string_to_array(name, '/'))[1])
);

-- Policy: Users can view their own resume
CREATE POLICY "Users can view their own resumes" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'resumes' AND (auth.uid()::text = (string_to_array(name, '/'))[1])
);

-- Policy: Admins can view ALL resumes
CREATE POLICY "Admins can view all resumes" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'resumes' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- ==========================================
-- 6. AVATARS STORAGE BUCKET (For Profile Pictures)
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- Policy: Anyone can view avatars (since bucket is public)
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Policy: Users can upload their own avatar
CREATE POLICY "Users can upload their own avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'avatars' AND (auth.uid()::text = (string_to_array(name, '/'))[1])
);

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'avatars' AND (auth.uid()::text = (string_to_array(name, '/'))[1])
);

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'avatars' AND (auth.uid()::text = (string_to_array(name, '/'))[1])
);


-- ==============================================================================
-- UTILITY COMMANDS (Run these manually as needed)
-- ==============================================================================

/*
-- 1. PROMOTE A USER TO ADMIN:
UPDATE public.profiles SET role = 'admin' WHERE email = 'your.email@example.com';

-- 2. DEMOTE AN ADMIN TO USER:
UPDATE public.profiles SET role = 'user' WHERE email = 'your.email@example.com';

-- 3. CHECK WHO IS AN ADMIN:
SELECT email, full_name, role FROM public.profiles WHERE role = 'admin';
*/
