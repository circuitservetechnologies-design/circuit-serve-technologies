import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// In-memory server cache
let serverMaintenanceState = false;

export async function GET() {
  // If Supabase is configured, check database
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .maybeSingle();

      if (!error && data && typeof data.value?.enabled === 'boolean') {
        serverMaintenanceState = data.value.enabled;
        return NextResponse.json({ maintenance: serverMaintenanceState });
      }
    } catch (e) {
      console.warn('Supabase maintenance read in API route:', e);
    }
  }

  return NextResponse.json({ maintenance: serverMaintenanceState });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const enabled = Boolean(body?.enabled);
    serverMaintenanceState = enabled;

    // Persist to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('site_settings').upsert([
          {
            key: 'maintenance_mode',
            value: { enabled, updated_at: new Date().toISOString() },
            updated_at: new Date().toISOString(),
          },
        ]);
      } catch (e) {
        console.warn('Supabase maintenance write in API route:', e);
      }
    }

    return NextResponse.json({ success: true, maintenance: serverMaintenanceState });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 });
  }
}
