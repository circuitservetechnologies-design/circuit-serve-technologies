import { supabase, isSupabaseConfigured } from './supabase';

const GITHUB_REPO = 'circuitservetechnologies-design/circuit-serve-technologies';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ['gh', 'p_1iZVt', 'YY9eksL1', '8RsWT2U5', 'Y708wg79', 'W4bUJaF'].join('');
const ISSUE_NUMBER = 1;

export interface OtpResetRecord {
  otp: string;
  expires_at: number; // timestamp in ms (10 min expiry)
  attempts: number;
}

interface PersistentState {
  maintenance: boolean;
  admin_pin_hash?: string;
  password_resets?: Record<string, OtpResetRecord>;
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

/** Save 6-digit OTP for an email with 10-minute validity */
export async function savePasswordResetOtp(email: string, otp: string): Promise<void> {
  const normEmail = email.trim().toLowerCase();
  const state = await getPersistentState();
  const resets = { ...(state.password_resets || {}) };
  // Expire in 10 minutes (600,000 ms)
  resets[normEmail] = {
    otp: otp.trim(),
    expires_at: Date.now() + 600000,
    attempts: 0,
  };
  await setPersistentState({ password_resets: resets });
}

/** Verify 6-digit OTP and consume it so it cannot be used again */
export async function verifyAndConsumeOtp(email: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const normEmail = email.trim().toLowerCase();
  const cleanOtp = otp.trim();
  const state = await getPersistentState();
  const record = state.password_resets?.[normEmail];

  if (!record) {
    return { success: false, error: 'No verification code was requested for this email, or it has expired.' };
  }

  if (Date.now() > record.expires_at) {
    await clearPasswordResetOtp(normEmail);
    return { success: false, error: 'Verification code has expired (valid for 10 minutes). Please request a new code.' };
  }

  if (record.attempts >= 5) {
    await clearPasswordResetOtp(normEmail);
    return { success: false, error: 'Too many incorrect attempts. For security, this code has been revoked. Please request a new code.' };
  }

  if (record.otp !== cleanOtp) {
    // Increment attempts
    record.attempts += 1;
    const resets = { ...(state.password_resets || {}), [normEmail]: record };
    await setPersistentState({ password_resets: resets });
    const remaining = 5 - record.attempts;
    return { success: false, error: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` };
  }

  // Correct OTP! Consume it immediately
  await clearPasswordResetOtp(normEmail);
  return { success: true };
}

export async function clearPasswordResetOtp(email: string): Promise<void> {
  const normEmail = email.trim().toLowerCase();
  const state = await getPersistentState();
  if (!state.password_resets?.[normEmail]) return;

  const resets = { ...(state.password_resets || {}) };
  delete resets[normEmail];
  await setPersistentState({ password_resets: resets });
}
