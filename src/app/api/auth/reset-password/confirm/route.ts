import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyPasswordResetToken, clearPasswordResetToken } from '@/lib/serverState';

export const dynamic = 'force-dynamic';

function hashPassword(password: string): string {
  const salted = `cst_salt_2026::${password}::circuit_serve`;
  let hash = 0;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Buffer.from(`${hash}_${salted.length}_${password.length}`).toString('base64');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email?.trim().toLowerCase();
    const token = body?.token?.trim();
    const newPassword = body?.newPassword?.trim();

    if (!email || !token || !newPassword) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Verify token
    const isValid = await verifyPasswordResetToken(email, token);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'This password reset link is invalid or has expired (valid for 1 hour). Please request a new link.',
        },
        { status: 400 }
      );
    }

    const newHash = hashPassword(newPassword);

    // Update in Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('users')
          .update({ password_hash: newHash })
          .eq('email', email);
      } catch (e) {
        console.warn('Supabase password update notice:', e);
      }
    }

    // Invalidate reset token
    await clearPasswordResetToken(email);

    return NextResponse.json({
      success: true,
      newHash,
      email,
      message: 'Your password has been successfully reset! You can now log in with your new credentials.',
    });
  } catch (error: any) {
    console.error('Password reset confirm error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
