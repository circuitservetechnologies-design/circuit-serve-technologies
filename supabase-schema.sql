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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

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
