import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { savePasswordResetOtp } from '@/lib/serverState';
import { sendOtpVerificationEmail } from '@/lib/email';
import { sendOtpSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email?.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    let userName: string | undefined;
    let userPhone: string | undefined;

    // Look up user in Supabase to get name and phone
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('users')
          .select('name, phone')
          .eq('email', email)
          .maybeSingle();
        if (data) {
          userName = data.name;
          userPhone = data.phone || undefined;
        }
      } catch (e) {
        console.warn('Supabase check user notice:', e);
      }
    }

    // Also check localStorage-synced users (passed from client via body) if Supabase not configured
    if (!userPhone && body?.phone) {
      userPhone = body.phone;
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await savePasswordResetOtp(email, otp);

    // Dispatch OTP strictly to the registered email address (NEVER return in HTTP response)
    const emailResult = await sendOtpVerificationEmail(email, otp, userName);

    // Also dispatch OTP via SMS if phone number is available
    let smsResult: { success: boolean; provider?: string; error?: string } = { success: false };
    let maskedPhone: string | null = null;

    if (userPhone && userPhone.trim().length >= 10) {
      smsResult = await sendOtpSms(userPhone.trim(), otp);
      if (smsResult.success) {
        // Mask phone for safe display: show last 4 digits only
        const digits = userPhone.replace(/\D/g, '');
        maskedPhone = `+91 ****${digits.slice(-4)}`;
      }
    }

    // Build delivery summary message
    let deliveryMsg = '';
    if (emailResult.success && smsResult.success) {
      deliveryMsg = `OTP dispatched to your email (${email}) and SMS to ${maskedPhone}.`;
    } else if (emailResult.success) {
      deliveryMsg = `A 6-digit verification code has been dispatched to ${email}. Please check your inbox and spam folder.`;
    } else if (smsResult.success) {
      deliveryMsg = `A 6-digit verification code has been sent via SMS to ${maskedPhone}.`;
    } else {
      deliveryMsg = `A 6-digit verification code has been generated for ${email}. Please check your email inbox.`;
    }

    // SECURITY: Never return the OTP in the HTTP response.
    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      smsSent: smsResult.success,
      maskedPhone: maskedPhone,
      email,
      message: deliveryMsg,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
