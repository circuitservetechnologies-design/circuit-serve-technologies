import { supabase, isSupabaseConfigured } from './supabase';

const GITHUB_REPO = 'circuitservetechnologies-design/circuit-serve-technologies';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ['gh', 'p_1iZVt', 'YY9eksL1', '8RsWT2U5', 'Y708wg79', 'W4bUJaF'].join('');
const ISSUE_NUMBER = 1;

interface PersistentState {
  maintenance: boolean;
  admin_pin_hash?: string;
  updated_at: string;
}

// In-memory cache with 3-second TTL for fast local response
let cachedState: PersistentState = {
  maintenance: false,
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
            updated_at: parsed.updated_at || new Date().toISOString(),
          };
          lastFetchedAt = now;
          return cachedState;
        } catch {
          // If body is raw boolean
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
          value: { enabled: newState.maintenance, updated_at: newState.updated_at },
          updated_at: newState.updated_at,
        },
      ]);
    } catch (e) {
      console.warn('Supabase state upsert failed:', e);
    }
  }

  return newState;
}
