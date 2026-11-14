import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPersistentState, setPersistentState } from '@/lib/serverState';

export const dynamic = 'force-dynamic';

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(`cst_admin_salt_2026_${pin.trim()}`).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, pin, currentPin, newPin, token } = body;
    const state = await getPersistentState();

    const envPin = process.env.ADMIN_PIN || process.env.NEXT_PUBLIC_ADMIN_PIN;
    const hasCustomHash = Boolean(state.admin_pin_hash);

    // Verify PIN logic
    const isValidPin = (candidatePin: string): boolean => {
      if (!candidatePin) return false;
      const trimmed = candidatePin.trim();

      if (hasCustomHash) {
        return hashPin(trimmed) === state.admin_pin_hash;
      }
      if (envPin) {
        return trimmed === envPin.trim();
      }
      return trimmed === 'CST@2026';
    };

    if (action === 'verify') {
      if (isValidPin(pin)) {
        const sessionToken = crypto
          .createHash('sha256')
          .update(`cst_session_${Date.now()}_${Math.random()}`)
          .digest('hex');

        return NextResponse.json({
          success: true,
          token: sessionToken,
        });
      } else {
        // Delay response slightly to prevent timing & brute-force attacks
        await new Promise((resolve) => setTimeout(resolve, 600));
        return NextResponse.json({ success: false, error: 'Access Denied: Invalid Security Passkey' }, { status: 401 });
      }
    }

    if (action === 'change_pin') {
      if (!isValidPin(currentPin)) {
        return NextResponse.json({ success: false, error: 'Current PIN is incorrect' }, { status: 400 });
      }

      if (!newPin || newPin.trim().length < 6) {
        return NextResponse.json({ success: false, error: 'New PIN must be at least 6 characters' }, { status: 400 });
      }

      const newHash = hashPin(newPin.trim());
      await setPersistentState({ admin_pin_hash: newHash });

      return NextResponse.json({
        success: true,
        message: 'Admin PIN updated successfully! It is now permanently saved.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
