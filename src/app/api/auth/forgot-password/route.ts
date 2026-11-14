import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { savePasswordResetToken } from '@/lib/serverState';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email?.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please provide a valid email address.' }, { status: 400 });
    }

    let userName: string | undefined;

    // Check if user exists in Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('users').select('name').eq('email', email).maybeSingle();
        if (data) {
          userName = data.name;
        }
      } catch (e) {
        console.warn('Supabase check user notice:', e);
      }
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    await savePasswordResetToken(email, token);

    // Get origin
    const url = new URL(request.url);
    const origin = url.origin;
    const resetLink = `${origin}/client/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Attempt to dispatch email via SMTP if configured
    const emailResult = await sendPasswordResetEmail(email, resetLink, userName);

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      resetLink,
      message: emailResult.success
        ? `A secure password reset link has been dispatched to ${email}. Please check your inbox and spam folder.`
        : `Password reset link generated for ${email}.`,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
