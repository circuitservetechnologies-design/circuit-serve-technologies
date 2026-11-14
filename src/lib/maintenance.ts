const LOCAL_STORAGE_MAINTENANCE_KEY = 'cst_maintenance_mode_v1';

export async function getMaintenanceStatus(): Promise<boolean> {
  // Always query authoritative server API with cache-busting timestamp
  try {
    const res = await fetch(`/api/maintenance?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });

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
    console.warn('Server API maintenance check notice:', e);
  }

  // Fallback to local storage if offline
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_MAINTENANCE_KEY);
      if (stored !== null) return stored === 'true';
    } catch (e) {
      console.warn(e);
    }
  }

  return false;
}

export async function setMaintenanceStatus(enabled: boolean): Promise<boolean> {
  // 1. Save to authoritative server API route
  try {
    const res = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) {
      console.error('Failed to set maintenance mode on server');
    }
  } catch (e) {
    console.warn('Server API maintenance toggle notice:', e);
  }

  // 2. Save to local storage & trigger event in active browser tab
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_MAINTENANCE_KEY, String(enabled));
      window.dispatchEvent(new CustomEvent('cst_maintenance_toggle', { detail: { enabled } }));
    } catch (e) {
      console.warn(e);
    }
  }

  return enabled;
}
