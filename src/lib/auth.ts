import { User } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_USERS_KEY = 'cst_users_v1';
const LOCAL_STORAGE_SESSION_KEY = 'cst_current_user_v1';

/** Simple deterministic hash — NOT cryptographic, but good enough for localStorage sessions */
function hashPassword(password: string): string {
  // btoa of repeated transformation to make it non-trivial to reverse from storage
  const salted = `cst_salt_2026::${password}::circuit_serve`;
  let hash = 0;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return btoa(`${hash}_${salted.length}_${password.length}`);
}

// Seed default admin in local storage if not exists
function getStoredUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

function saveStoredUsers(users: User[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const session = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    if (session) return JSON.parse(session);
  } catch (e) {
    console.error(e);
  }
  return null;
}

export function setCurrentUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
  }
}

export async function registerClient(data: {
  name: string;
  email: string;
  password?: string;
  organization?: string;
  phone?: string;
}): Promise<{ user: User | null; error?: string }> {
  const emailNorm = data.email.trim().toLowerCase();
  
  // Check if user already exists
  const users = getStoredUsers();
  if (users.some((u) => u.email.toLowerCase() === emailNorm)) {
    return { user: null, error: 'An account with this email already exists. Please sign in.' };
  }

  if (!data.password || data.password.trim().length < 6) {
    return { user: null, error: 'Password must be at least 6 characters.' };
  }

  const newUser: User = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `usr_${Date.now()}`,
    name: data.name.trim(),
    email: emailNorm,
    role: 'client',
    organization: data.organization?.trim() || '',
    phone: data.phone?.trim() || '',
    password_hash: hashPassword(data.password.trim()),
    created_at: new Date().toISOString(),
  };

  // If Supabase is configured, also sync to Supabase table
  if (isSupabaseConfigured && supabase) {
    try {
      const payload: any = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        organization: newUser.organization,
        phone: newUser.phone,
        created_at: newUser.created_at,
      };
      if (newUser.password_hash) {
        payload.password_hash = newUser.password_hash;
      }
      const { error } = await supabase.from('users').insert([payload]);
      if (error) {
        // Retry without password_hash in case Supabase table doesn't have that column
        delete payload.password_hash;
        await supabase.from('users').insert([payload]);
      }
    } catch (err) {
      console.warn('Supabase user insert notice:', err);
    }
  }

  // Save to local storage
  users.push(newUser);
  saveStoredUsers(users);
  setCurrentUser(newUser);

  return { user: newUser };
}

export async function loginUser(email: string, passOrPin: string): Promise<{ user: User | null; error?: string }> {
  const emailNorm = email.trim().toLowerCase();
  const pinInput = passOrPin.trim();

  // Check existing users in storage
  const users = getStoredUsers();
  let found = users.find((u) => u.email.toLowerCase() === emailNorm);

  // If not found in local storage, check Supabase database if configured
  if (!found && isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('email', emailNorm).maybeSingle();
      if (!error && data) {
        found = data as User;
        users.push(found);
        saveStoredUsers(users);
      }
    } catch (e) {
      console.warn('Supabase fetch user error:', e);
    }
  }

  if (!found) {
    // No account exists — do NOT auto-create. Force registration.
    return { user: null, error: 'No account found with this email. Please register first.' };
  }

  // Validate password if stored
  if (found.password_hash) {
    if (hashPassword(pinInput) !== found.password_hash) {
      return { user: null, error: 'Incorrect password. Please try again.' };
    }
  }

  setCurrentUser(found);
  return { user: found };
}

export function logoutUser() {
  setCurrentUser(null);
}

export async function getAllUsers(): Promise<User[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const supabaseUsers = data as User[];
        // Supabase is the single source of truth! Keep local storage strictly in sync with Supabase
        saveStoredUsers(supabaseUsers);
        return supabaseUsers;
      }
      if (error) {
        console.warn('Supabase getAllUsers error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase getAllUsers exception:', err);
    }
  }

  return getStoredUsers();
}

export async function deleteUser(userId: string, userEmail?: string): Promise<{ success: boolean; error?: string }> {
  const users = getStoredUsers();
  const targetUser = users.find((u) => u.id === userId || (userEmail && u.email.toLowerCase() === userEmail.toLowerCase()));
  const targetEmail = (userEmail || targetUser?.email || '').trim().toLowerCase();

  // 1. Delete from Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      if (userId) {
        await supabase.from('users').delete().eq('id', userId);
      }
      if (targetEmail) {
        await supabase.from('users').delete().eq('email', targetEmail);
        await supabase.from('client_projects').delete().eq('user_email', targetEmail);
      }
      if (userId) {
        await supabase.from('client_projects').delete().eq('user_id', userId);
      }
    } catch (err) {
      console.warn('Supabase delete exception:', err);
    }
  }

  // 2. Delete from local storage users
  const filteredUsers = users.filter((u) => u.id !== userId && (!targetEmail || u.email.toLowerCase() !== targetEmail));
  saveStoredUsers(filteredUsers);

  // 3. Delete any client project proposals created by this user in localStorage
  if (typeof window !== 'undefined') {
    try {
      const rawProposals = localStorage.getItem('cst_client_projects_v1');
      if (rawProposals) {
        const proposals = JSON.parse(rawProposals) as any[];
        const remaining = proposals.filter(
          (p) => p.user_id !== userId && (!targetEmail || p.user_email?.toLowerCase() !== targetEmail)
        );
        localStorage.setItem('cst_client_projects_v1', JSON.stringify(remaining));
      }
    } catch (e) {
      console.warn('Error cleaning client proposals for deleted user:', e);
    }
  }

  // 4. If any projects in public projects were assigned to this user, unassign them
  if (targetEmail && typeof window !== 'undefined') {
    try {
      const rawProj = localStorage.getItem('cst_projects_store_v1');
      if (rawProj) {
        const projList = JSON.parse(rawProj) as any[];
        const updatedProj = projList.map((p) => {
          if (p.assigned_client_email?.trim().toLowerCase() === targetEmail) {
            return { ...p, assigned_client_email: undefined, assigned_client_name: undefined };
          }
          return p;
        });
        localStorage.setItem('cst_projects_store_v1', JSON.stringify(updatedProj));
      }
    } catch (e) {
      console.warn('Error unassigning projects for deleted user:', e);
    }
  }

  // 5. If current active session belongs to this user, clear it immediately
  const current = getCurrentUser();
  if (current && (current.id === userId || (targetEmail && current.email.toLowerCase() === targetEmail))) {
    setCurrentUser(null);
  }

  return { success: true };
}
