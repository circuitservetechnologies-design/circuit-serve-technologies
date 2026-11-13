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
      await supabase.from('users').insert([
        {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          organization: newUser.organization,
          phone: newUser.phone,
        }
      ]);
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
  const expectedAdminPin = process.env.NEXT_PUBLIC_ADMIN_PIN || 'CST@2026';

  // Check if admin login
  if (
    (emailNorm === 'admin' || emailNorm === 'circuitservetechnologies@gmail.com' || emailNorm === 'admin@circuitserve.com') &&
    pinInput === expectedAdminPin
  ) {
    const adminUser: User = {
      id: 'admin_cst',
      name: 'Circuit Serve Admin',
      email: 'circuitservetechnologies@gmail.com',
      role: 'admin',
      organization: 'Circuit Serve Technologies HQ',
      created_at: new Date().toISOString(),
    };
    setCurrentUser(adminUser);
    return { user: adminUser };
  }

  // Check existing users in storage
  const users = getStoredUsers();
  const found = users.find((u) => u.email.toLowerCase() === emailNorm);

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
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data && data.length > 0) return data as User[];
    } catch (err) {
      console.warn(err);
    }
  }
  return getStoredUsers();
}
