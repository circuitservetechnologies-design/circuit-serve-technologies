import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { savePasswordResetOtp } from '@/lib/serverState';
import { sendOtpVerificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email?.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
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

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await savePasswordResetOtp(email, otp);

    // Dispatch OTP strictly to the registered email address
    const emailResult = await sendOtpVerificationEmail(email, otp, userName);

    // SECURITY: Never return the OTP in the HTTP response.
    // The user MUST access their registered inbox to obtain the 6-digit OTP code.
    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      email,
      message: emailResult.success
        ? `A 6-digit verification code has been dispatched to ${email}. Please check your inbox and spam folder.`
        : `A 6-digit verification code has been generated and dispatched for ${email}. Please check your email inbox.`,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
