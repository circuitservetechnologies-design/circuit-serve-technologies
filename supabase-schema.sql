-- ====================================================================
-- Circuit Serve Technologies - Supabase Database Schema
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ====================================================================

-- 1. Create the projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT,
    client TEXT,
    technologies TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    image_url TEXT,
    status TEXT DEFAULT 'Completed',
    featured BOOLEAN DEFAULT false,
    completion_date TEXT,
    demo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast search and category filtering
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- 2. Create the contact inquiries table
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'New', -- 'New', 'Contacted', 'Closed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 4. Projects RLS Policies
-- Public can read all published projects
DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
CREATE POLICY "Public can view projects" 
ON public.projects FOR SELECT 
USING (true);

-- Allow insertions, updates, and deletions for admin operations
-- (If using anon key with Admin PIN/Password verification in the app, 
-- or using Supabase Service Key, this policy allows full control)
DROP POLICY IF EXISTS "Enable all access for projects" ON public.projects;
CREATE POLICY "Enable all access for projects" 
ON public.projects FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Inquiries RLS Policies
-- Anyone can submit an inquiry through the contact form
DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit inquiry" 
ON public.inquiries FOR INSERT 
WITH CHECK (true);

-- Admin can read and manage inquiries
DROP POLICY IF EXISTS "Enable read and manage for inquiries" ON public.inquiries;
CREATE POLICY "Enable read and manage for inquiries" 
ON public.inquiries FOR ALL 
USING (true) 
WITH CHECK (true);

-- 6. Setup Storage Bucket for Project Images (Optional)
-- Run this to create the bucket 'project-images' if not already present
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view uploaded images
DROP POLICY IF EXISTS "Public Access to Project Images" ON storage.objects;
CREATE POLICY "Public Access to Project Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

-- Allow uploads to project-images
DROP POLICY IF EXISTS "Allow uploads to Project Images" ON storage.objects;
CREATE POLICY "Allow uploads to Project Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Allow delete from Project Images" ON storage.objects;
CREATE POLICY "Allow delete from Project Images"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-images');
