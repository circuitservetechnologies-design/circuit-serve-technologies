-- ====================================================================
-- Circuit Serve Technologies - Supabase Database Schema
-- Includes Public Portfolio, Client Accounts, Project Collaboration, & Inquiries
-- ====================================================================

-- 1. Create the users table (for client collaborators and admin)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'client', -- 'client' or 'admin'
    organization TEXT,
    phone TEXT,
    password_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure password_hash column exists if table was previously created
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Ensure assigned client and feedback columns exist on projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS assigned_client_email TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS assigned_client_name TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS feedbacks JSONB DEFAULT '[]'::jsonb;

-- 2. Create the client project collaboration proposals table
CREATE TABLE IF NOT EXISTS public.client_projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_organization TEXT,
    user_phone TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    specifications TEXT,
    target_timeline TEXT,
    estimated_budget TEXT,
    reference_file_url TEXT,
    status TEXT DEFAULT 'Under Review', -- 'Under Review', 'Approved', 'In Development', 'Testing & Validation', 'Completed', 'Declined'
    admin_notes TEXT,
    is_published_to_portfolio BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_projects_user_id ON public.client_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_status ON public.client_projects(status);

-- 3. Create the public projects showcase table
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

CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- 4. Create the contact inquiries table
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- 5. Enable Row Level Security (RLS)
-- 5. Create site settings table (for maintenance mode, etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 6. Access Policies
DROP POLICY IF EXISTS "Enable all for users" ON public.users;
CREATE POLICY "Enable all for users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for client_projects" ON public.client_projects;
CREATE POLICY "Enable all for client_projects" ON public.client_projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
CREATE POLICY "Public can view projects" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable all access for projects" ON public.projects;
CREATE POLICY "Enable all access for projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit inquiry" ON public.inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read and manage for inquiries" ON public.inquiries;
CREATE POLICY "Enable read and manage for inquiries" ON public.inquiries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for site_settings" ON public.site_settings;
CREATE POLICY "Enable all for site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
