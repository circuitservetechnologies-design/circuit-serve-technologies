import { supabase, isSupabaseConfigured } from './supabase';
import { Project, Inquiry, ClientProject } from '@/types';

const LOCAL_STORAGE_KEY_PROJECTS = 'cst_projects_store_v1';
const LOCAL_STORAGE_KEY_INQUIRIES = 'cst_inquiries_store_v1';
const LOCAL_STORAGE_KEY_CLIENT_PROJECTS = 'cst_client_projects_v1';

// Initial state is strictly empty as requested: "don't give any demo projects in project section"
export async function getProjects(): Promise<Project[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching from Supabase, falling back to local storage:', error.message);
      } else if (data) {
        return data as Project[];
      }
    } catch (err) {
      console.error('Supabase query failed:', err);
    }
  }

  // Fallback to localStorage in browser environment
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
      if (stored) {
        return JSON.parse(stored) as Project[];
      }
    } catch (e) {
      console.error('Local storage read error:', e);
    }
  }

  return [];
}

export async function addProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
  const newProject: Project = {
    ...project,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `proj_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            title: newProject.title,
            slug: newProject.slug || newProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category: newProject.category,
            summary: newProject.summary,
            description: newProject.description,
            client: newProject.client,
            technologies: newProject.technologies,
            features: newProject.features,
            image_url: newProject.image_url,
            status: newProject.status,
            featured: newProject.featured || false,
            completion_date: newProject.completion_date,
            demo_url: newProject.demo_url,
          }
        ])
        .select()
        .single();

      if (!error && data) {
        return data as Project;
      }
      if (error) {
        console.warn('Supabase insert failed, saving to local store:', error.message);
      }
    } catch (err) {
      console.error('Supabase insert exception:', err);
    }
  }

  // Save to localStorage
  if (typeof window !== 'undefined') {
    const existing = await getProjects();
    const updated = [newProject, ...existing];
    localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(updated));
  }

  return newProject;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return data as Project;
      }
    } catch (err) {
      console.error('Supabase update failed:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const existing = await getProjects();
    const idx = existing.findIndex(p => p.id === id);
    if (idx !== -1) {
      existing[idx] = { ...existing[idx], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(existing));
      return existing[idx];
    }
  }

  return null;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (!error) return true;
    } catch (err) {
      console.error('Supabase delete failed:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const existing = await getProjects();
    const filtered = existing.filter(p => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(filtered));
    return true;
  }

  return false;
}

// ====================================================================
// CLIENT COLLABORATION PROJECT PROPOSALS & REQUESTS
// ====================================================================

export async function submitClientProject(
  proposal: Omit<ClientProject, 'id' | 'created_at' | 'updated_at' | 'status' | 'is_published_to_portfolio'>
): Promise<ClientProject> {
  const newClientProject: ClientProject = {
    ...proposal,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `clproj_${Date.now()}`,
    status: 'Under Review',
    is_published_to_portfolio: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('client_projects')
        .insert([newClientProject])
        .select()
        .single();

      if (!error && data) {
        return data as ClientProject;
      }
    } catch (err) {
      console.warn('Supabase client project insert exception:', err);
    }
  }

  // Save to local storage
  if (typeof window !== 'undefined') {
    const existing: ClientProject[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CLIENT_PROJECTS) || '[]');
    const updated = [newClientProject, ...existing];
    localStorage.setItem(LOCAL_STORAGE_KEY_CLIENT_PROJECTS, JSON.stringify(updated));
  }

  return newClientProject;
}

export async function getClientProjects(userId?: string): Promise<ClientProject[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('client_projects').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as ClientProject[];
      }
    } catch (err) {
      console.warn('Supabase get client projects failed:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const list: ClientProject[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CLIENT_PROJECTS) || '[]');
    if (userId) {
      return list.filter((p) => p.user_id === userId);
    }
    return list;
  }

  return [];
}

export async function updateClientProject(id: string, updates: Partial<ClientProject>): Promise<ClientProject | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('client_projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return data as ClientProject;
      }
    } catch (err) {
      console.warn(err);
    }
  }

  if (typeof window !== 'undefined') {
    const list: ClientProject[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CLIENT_PROJECTS) || '[]');
    const idx = list.findIndex((p) => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem(LOCAL_STORAGE_KEY_CLIENT_PROJECTS, JSON.stringify(list));
      return list[idx];
    }
  }

  return null;
}

export async function deleteClientProject(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('client_projects').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn(err);
    }
  }

  if (typeof window !== 'undefined') {
    const list: ClientProject[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CLIENT_PROJECTS) || '[]');
    const filtered = list.filter((p) => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY_CLIENT_PROJECTS, JSON.stringify(filtered));
    return true;
  }

  return false;
}

// Allows Admin to promote an approved client project directly to the Public Portfolio Showcase!
export async function publishClientProjectToPublicPortfolio(
  clientProjectId: string,
  projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>
): Promise<Project> {
  const publishedProject = await addProject(projectData);
  await updateClientProject(clientProjectId, {
    is_published_to_portfolio: true,
    status: 'Completed',
  });
  return publishedProject;
}

// ====================================================================
// CONTACT INQUIRIES
// ====================================================================

export async function submitInquiry(inquiry: Omit<Inquiry, 'id' | 'created_at' | 'status'>): Promise<Inquiry> {
  const newInquiry: Inquiry = {
    ...inquiry,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `inq_${Date.now()}`,
    status: 'New',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert([newInquiry])
        .select()
        .single();

      if (!error && data) {
        return data as Inquiry;
      }
    } catch (err) {
      console.error('Supabase inquiry insert failed:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const existing: Inquiry[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_INQUIRIES) || '[]');
    const updated = [newInquiry, ...existing];
    localStorage.setItem(LOCAL_STORAGE_KEY_INQUIRIES, JSON.stringify(updated));
  }

  return newInquiry;
}

export async function getInquiries(): Promise<Inquiry[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Inquiry[];
      }
    } catch (err) {
      console.error('Supabase get inquiries failed:', err);
    }
  }

  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_INQUIRIES) || '[]');
  }

  return [];
}
