import { supabase, isSupabaseConfigured } from './supabase';
import { Project, Inquiry, ClientProject, ProjectFeedback } from '@/types';

const LOCAL_STORAGE_KEY_PROJECTS = 'cst_projects_store_v1';
const LOCAL_STORAGE_KEY_INQUIRIES = 'cst_inquiries_store_v1';
const LOCAL_STORAGE_KEY_CLIENT_PROJECTS = 'cst_client_projects_v1';

// Internal tags to persist client review assignments and feedbacks inside Supabase features column
// even when ALTER TABLE migration columns haven't been created yet in the database.
const TAG_ASSIGNED_EMAIL = '__CST_ASSIGNED_EMAIL__:';
const TAG_ASSIGNED_NAME = '__CST_ASSIGNED_NAME__:';
const TAG_FEEDBACKS = '__CST_FEEDBACKS__:';

function packFeatures(
  features?: string[],
  assignedEmail?: string,
  assignedName?: string,
  feedbacks?: ProjectFeedback[]
): string[] {
  const clean = (features || []).filter(
    (f) =>
      typeof f === 'string' &&
      !f.startsWith(TAG_ASSIGNED_EMAIL) &&
      !f.startsWith(TAG_ASSIGNED_NAME) &&
      !f.startsWith(TAG_FEEDBACKS)
  );
  if (assignedEmail && assignedEmail.trim()) {
    clean.push(`${TAG_ASSIGNED_EMAIL}${assignedEmail.trim().toLowerCase()}`);
  }
  if (assignedName && assignedName.trim()) {
    clean.push(`${TAG_ASSIGNED_NAME}${assignedName.trim()}`);
  }
  if (feedbacks && feedbacks.length > 0) {
    clean.push(`${TAG_FEEDBACKS}${JSON.stringify(feedbacks)}`);
  }
  return clean;
}

function unpackProject(p: any): Project {
  let email = p.assigned_client_email;
  let name = p.assigned_client_name;
  let feedbacks = p.feedbacks || [];
  const rawFeatures: string[] = Array.isArray(p.features) ? p.features : [];
  const cleanFeatures: string[] = [];

  for (const item of rawFeatures) {
    if (typeof item === 'string') {
      if (item.startsWith(TAG_ASSIGNED_EMAIL)) {
        if (!email) email = item.substring(TAG_ASSIGNED_EMAIL.length).trim();
      } else if (item.startsWith(TAG_ASSIGNED_NAME)) {
        if (!name) name = item.substring(TAG_ASSIGNED_NAME.length).trim();
      } else if (item.startsWith(TAG_FEEDBACKS)) {
        if (!feedbacks || feedbacks.length === 0) {
          try {
            feedbacks = JSON.parse(item.substring(TAG_FEEDBACKS.length));
          } catch (e) {
            // ignore
          }
        }
      } else {
        cleanFeatures.push(item);
      }
    }
  }

  return {
    ...p,
    features: cleanFeatures,
    assigned_client_email: email || undefined,
    assigned_client_name: name || undefined,
    feedbacks: Array.isArray(feedbacks) ? feedbacks : [],
  };
}

// Initial state is strictly empty as requested: "don't give any demo projects in project section"
export async function getProjects(): Promise<Project[]> {
  let results: Project[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching from Supabase, falling back to local storage:', error.message);
      } else if (data && data.length > 0) {
        results = data.map(unpackProject);
      }
    } catch (err) {
      console.error('Supabase query failed:', err);
    }
  }

  // Fallback / merge with localStorage in browser environment
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
      if (stored) {
        const localProjects = (JSON.parse(stored) as any[]).map(unpackProject);
        if (results.length === 0) {
          results = localProjects;
        } else {
          // If Supabase returned results, merge any client assignment or feedback from local storage if missing in Supabase
          results = results.map((remote) => {
            const match = localProjects.find((lp) => lp.id === remote.id || lp.title === remote.title);
            if (match) {
              return {
                ...remote,
                assigned_client_email: remote.assigned_client_email || match.assigned_client_email,
                assigned_client_name: remote.assigned_client_name || match.assigned_client_name,
                feedbacks: (remote.feedbacks && remote.feedbacks.length > 0) ? remote.feedbacks : (match.feedbacks || []),
              };
            }
            return remote;
          });
        }
      }
    } catch (e) {
      console.error('Local storage read error:', e);
    }
  }

  return results;
}

export async function addProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
  const packedFeatures = packFeatures(
    project.features,
    project.assigned_client_email,
    project.assigned_client_name,
    project.feedbacks
  );

  const newProject: Project = {
    ...project,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `proj_${Date.now()}`,
    feedbacks: project.feedbacks || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let savedProject = newProject;

  if (isSupabaseConfigured && supabase) {
    try {
      const payload: any = {
        title: newProject.title,
        slug: newProject.slug || newProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: newProject.category,
        summary: newProject.summary,
        description: newProject.description,
        client: newProject.client,
        technologies: newProject.technologies,
        features: packedFeatures, // Packed with metadata tags for fallback
        image_url: newProject.image_url,
        status: newProject.status,
        featured: newProject.featured || false,
        completion_date: newProject.completion_date,
        demo_url: newProject.demo_url,
        assigned_client_email: newProject.assigned_client_email,
        assigned_client_name: newProject.assigned_client_name,
        feedbacks: newProject.feedbacks,
      };

      let { data, error } = await supabase
        .from('projects')
        .insert([payload])
        .select()
        .single();

      if (error) {
        // If assigned_client_email or feedbacks columns don't exist yet in Supabase, strip them and retry
        delete payload.assigned_client_email;
        delete payload.assigned_client_name;
        delete payload.feedbacks;
        const retry = await supabase.from('projects').insert([payload]).select().single();
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      }

      if (!error && data) {
        savedProject = unpackProject({ ...newProject, ...data });
      }
      if (error) {
        console.warn('Supabase insert failed, saving to local store:', error.message);
      }
    } catch (err) {
      console.error('Supabase insert exception:', err);
    }
  }

  // Always sync to localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
      const existing = stored ? (JSON.parse(stored) as Project[]) : [];
      const updated = [savedProject, ...existing.filter((p) => p.id !== savedProject.id)];
      localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(updated));
    } catch (e) {
      console.error('Local storage save error:', e);
    }
  }

  return savedProject;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const currentProjects = await getProjects();
  const current = currentProjects.find((p) => p.id === id);

  const finalEmail = updates.assigned_client_email !== undefined ? updates.assigned_client_email : current?.assigned_client_email;
  const finalName = updates.assigned_client_name !== undefined ? updates.assigned_client_name : current?.assigned_client_name;
  const finalFeedbacks = updates.feedbacks !== undefined ? updates.feedbacks : current?.feedbacks;
  const finalFeatures = updates.features !== undefined ? updates.features : current?.features;

  const packedFeatures = packFeatures(finalFeatures, finalEmail, finalName, finalFeedbacks);

  let updatedRecord: Project | null = current ? { ...current, ...updates, updated_at: new Date().toISOString() } : null;

  if (isSupabaseConfigured && supabase) {
    try {
      const payload: any = {
        ...updates,
        features: packedFeatures,
        updated_at: new Date().toISOString(),
      };

      let { data, error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Retry without newly added columns in case Supabase schema hasn't been migrated yet
        delete payload.assigned_client_email;
        delete payload.assigned_client_name;
        delete payload.feedbacks;
        const retry = await supabase
          .from('projects')
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      }

      if (!error && data) {
        updatedRecord = unpackProject({ ...current, ...updates, ...data });
      }
    } catch (err) {
      console.error('Supabase update failed:', err);
    }
  }

  if (typeof window !== 'undefined' && updatedRecord) {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
      const existing = stored ? (JSON.parse(stored) as Project[]) : [];
      const idx = existing.findIndex((p) => p.id === id);
      if (idx !== -1) {
        existing[idx] = updatedRecord;
      } else {
        existing.unshift(updatedRecord);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(existing));
    } catch (e) {
      console.error('Local storage update error:', e);
    }
  }

  return updatedRecord;
}

/** Submit client review & feedback for an assigned CST project */
export async function addProjectFeedback(
  projectId: string,
  feedback: Omit<ProjectFeedback, 'id' | 'created_at'>
): Promise<Project | null> {
  const newFeedback: ProjectFeedback = {
    ...feedback,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `fb_${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  const existing = await getProjects();
  const proj = existing.find(p => p.id === projectId);
  if (!proj) return null;

  const updatedFeedbacks = [newFeedback, ...(proj.feedbacks || [])];
  return await updateProject(projectId, {
    feedbacks: updatedFeedbacks,
  });
}

/** Get projects specifically assigned to a client by email */
export async function getProjectsForClient(clientEmail: string): Promise<Project[]> {
  const normalized = clientEmail.trim().toLowerCase();
  const all = await getProjects();
  return all.filter(p => p.assigned_client_email?.trim().toLowerCase() === normalized);
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase delete error:', error.message);
      }
    } catch (err) {
      console.error('Supabase delete failed:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
      if (stored) {
        const existing = JSON.parse(stored) as Project[];
        const filtered = existing.filter(p => p.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(filtered));
      }
    } catch (e) {
      console.error('Local storage delete error:', e);
    }
  }

  return true;
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
