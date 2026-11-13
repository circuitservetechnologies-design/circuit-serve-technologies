import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_MAINTENANCE_KEY = 'cst_maintenance_mode_v1';
const MAINTENANCE_SETTING_KEY = 'maintenance_mode';

export async function getMaintenanceStatus(): Promise<boolean> {
  // 1. Try server API route (works across all devices connecting to same server)
  try {
    const res = await fetch('/api/maintenance', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (typeof json.maintenance === 'boolean') {
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_MAINTENANCE_KEY, String(json.maintenance));
        }
        return json.maintenance;
      }
    }
  } catch (e) {
    // network or offline, fallback to Supabase or local storage
  }

  // 2. If Supabase is configured, check database
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', MAINTENANCE_SETTING_KEY)
        .maybeSingle();

      if (!error && data && typeof data.value?.enabled === 'boolean') {
        const remoteStatus = data.value.enabled;
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_MAINTENANCE_KEY, String(remoteStatus));
        }
        return remoteStatus;
      }
    } catch (err) {
      console.warn('Supabase maintenance fetch notice:', err);
    }
  }

  // 3. Check local storage fallback
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_MAINTENANCE_KEY);
      return stored === 'true';
    } catch (e) {
      console.warn(e);
    }
  }

  return false;
}

export async function setMaintenanceStatus(enabled: boolean): Promise<boolean> {
  // 1. Save to server API route
  try {
    await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
  } catch (e) {
    console.warn('Server API maintenance toggle notice:', e);
  }

  // 2. Save to local storage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_MAINTENANCE_KEY, String(enabled));
      window.dispatchEvent(new CustomEvent('cst_maintenance_toggle', { detail: { enabled } }));
    } catch (e) {
      console.warn(e);
    }
  }

  // 3. Save to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('site_settings').upsert([
        {
          key: MAINTENANCE_SETTING_KEY,
          value: { enabled, updated_at: new Date().toISOString() },
          updated_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.warn('Supabase maintenance save notice:', err);
    }
  }

  return enabled;
}
