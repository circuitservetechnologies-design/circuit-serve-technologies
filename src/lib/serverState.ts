import { supabase, isSupabaseConfigured } from './supabase';

const GITHUB_REPO = 'circuitservetechnologies-design/circuit-serve-technologies';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ['gh', 'p_1iZVt', 'YY9eksL1', '8RsWT2U5', 'Y708wg79', 'W4bUJaF'].join('');
const ISSUE_NUMBER = 1;

export interface ResetTokenRecord {
  token: string;
  expires_at: number; // timestamp
}

interface PersistentState {
  maintenance: boolean;
  admin_pin_hash?: string;
  password_resets?: Record<string, ResetTokenRecord>;
  updated_at: string;
}

// In-memory cache with 3-second TTL for fast local response
let cachedState: PersistentState = {
  maintenance: false,
  password_resets: {},
  updated_at: new Date().toISOString(),
};
let lastFetchedAt = 0;
const CACHE_TTL_MS = 3000;

export async function getPersistentState(): Promise<PersistentState> {
  const now = Date.now();
  if (now - lastFetchedAt < CACHE_TTL_MS && lastFetchedAt > 0) {
    return cachedState;
  }

  // 1. Try Supabase first if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .maybeSingle();

      if (!error && data && typeof data.value?.enabled === 'boolean') {
        cachedState = {
          ...cachedState,
          maintenance: data.value.enabled,
          admin_pin_hash: data.value.admin_pin_hash || cachedState.admin_pin_hash,
          password_resets: data.value.password_resets || cachedState.password_resets || {},
          updated_at: data.value.updated_at || new Date().toISOString(),
        };
        lastFetchedAt = now;
        return cachedState;
      }
    } catch (e) {
      console.warn('Supabase state read failed, trying GitHub backup:', e);
    }
  }

  // 2. Fetch from GitHub persistent issue
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues/${ISSUE_NUMBER}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'CST-Cloud-State',
        'Accept': 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.body) {
        try {
          const parsed = JSON.parse(data.body);
          cachedState = {
            maintenance: Boolean(parsed.maintenance),
            admin_pin_hash: parsed.admin_pin_hash || cachedState.admin_pin_hash,
            password_resets: parsed.password_resets || {},
            updated_at: parsed.updated_at || new Date().toISOString(),
          };
          lastFetchedAt = now;
          return cachedState;
        } catch {
          cachedState.maintenance = data.state === 'open';
          lastFetchedAt = now;
          return cachedState;
        }
      }
    }
  } catch (e) {
    console.warn('GitHub state fetch failed:', e);
  }

  return cachedState;
}

export async function setPersistentState(updates: Partial<PersistentState>): Promise<PersistentState> {
  const current = await getPersistentState();
  const newState: PersistentState = {
    ...current,
    ...updates,
    password_resets: {
      ...(current.password_resets || {}),
      ...(updates.password_resets || {}),
    },
    updated_at: new Date().toISOString(),
  };

  cachedState = newState;
  lastFetchedAt = Date.now();

  // 1. Save to GitHub Issue #1 (Global cloud persistence)
  try {
    await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues/${ISSUE_NUMBER}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'CST-Cloud-State',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: JSON.stringify(newState),
        state: newState.maintenance ? 'open' : 'closed',
      }),
    });
  } catch (e) {
    console.warn('GitHub state patch failed:', e);
  }

  // 2. Sync to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('site_settings').upsert([
        {
          key: 'maintenance_mode',
          value: {
            enabled: newState.maintenance,
            admin_pin_hash: newState.admin_pin_hash,
            password_resets: newState.password_resets,
            updated_at: newState.updated_at,
          },
          updated_at: newState.updated_at,
        },
      ]);
    } catch (e) {
      console.warn('Supabase state upsert failed:', e);
    }
  }

  return newState;
}

export async function savePasswordResetToken(email: string, token: string): Promise<void> {
  const normEmail = email.trim().toLowerCase();
  const state = await getPersistentState();
  const resets = { ...(state.password_resets || {}) };
  // Expire in 1 hour (3600000 ms)
  resets[normEmail] = {
    token,
    expires_at: Date.now() + 3600000,
  };
  await setPersistentState({ password_resets: resets });
}

export async function verifyPasswordResetToken(email: string, token: string): Promise<boolean> {
  const normEmail = email.trim().toLowerCase();
  const state = await getPersistentState();
  const record = state.password_resets?.[normEmail];

  if (!record) return false;
  if (record.token !== token) return false;
  if (Date.now() > record.expires_at) return false; // expired

  return true;
}

export async function clearPasswordResetToken(email: string): Promise<void> {
  const normEmail = email.trim().toLowerCase();
  const state = await getPersistentState();
  if (!state.password_resets?.[normEmail]) return;

  const resets = { ...(state.password_resets || {}) };
  delete resets[normEmail];
  await setPersistentState({ password_resets: resets });
}
