import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_MAINTENANCE_KEY = 'cst_maintenance_mode_v1';
const MAINTENANCE_SETTING_KEY = 'maintenance_mode';

export async function getMaintenanceStatus(): Promise<boolean> {
  // Check local storage first
  let localStatus = false;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_MAINTENANCE_KEY);
      localStatus = stored === 'true';
    } catch (e) {
      console.warn(e);
    }
  }

  // If Supabase is configured, check database
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

  return localStatus;
}

export async function setMaintenanceStatus(enabled: boolean): Promise<boolean> {
  // Save to local storage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_MAINTENANCE_KEY, String(enabled));
      // Dispatch custom event for real-time listener across tabs/components
      window.dispatchEvent(new CustomEvent('cst_maintenance_toggle', { detail: { enabled } }));
    } catch (e) {
      console.warn(e);
    }
  }

  // Save to Supabase if configured
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
