import { NextResponse } from 'next/server';
import { getPersistentState, setPersistentState } from '@/lib/serverState';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const state = await getPersistentState();
  return NextResponse.json(
    { maintenance: state.maintenance, updated_at: state.updated_at },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const enabled = Boolean(body?.enabled);
    const updated = await setPersistentState({ maintenance: enabled });

    return NextResponse.json(
      { success: true, maintenance: updated.maintenance, updated_at: updated.updated_at },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 });
  }
}
