/**
 * SMS OTP Delivery — Fast2SMS (India) with optional Twilio fallback
 * Configure FAST2SMS_API_KEY in Vercel env vars for Indian SMS delivery.
 * Optionally add TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER for fallback.
 */

export interface SmsResult {
  success: boolean;
  provider?: string;
  error?: string;
}

/** Normalize Indian phone number to 10-digit format (strip +91, 0, spaces, dashes) */
function normalizeIndianPhone(phone: string): string | null {
  const stripped = phone.replace(/[\s\-().+]/g, '');
  if (/^91\d{10}$/.test(stripped)) return stripped.slice(2); // 91XXXXXXXXXX → 10 digits
  if (/^\d{10}$/.test(stripped)) return stripped;            // already 10 digits
  if (/^0\d{10}$/.test(stripped)) return stripped.slice(1);  // 0XXXXXXXXXX
  return null; // unrecognized format
}

/**
 * Send a 6-digit OTP via SMS.
 * Tries Fast2SMS first. Falls back to Twilio if Fast2SMS fails.
 */
export async function sendOtpSms(phone: string, otp: string): Promise<SmsResult> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_NUMBER;

  const normalizedPhone = normalizeIndianPhone(phone);
  if (!normalizedPhone) {
    return { success: false, error: 'Invalid phone number format.' };
  }

  // --- Fast2SMS (Primary) ---
  if (apiKey) {
    try {
      const url = new URL('https://www.fast2sms.com/dev/bulkV2');
      url.searchParams.set('authorization', apiKey);
      url.searchParams.set('route', 'otp');
      url.searchParams.set('variables_values', otp);
      url.searchParams.set('flash', '0');
      url.searchParams.set('numbers', normalizedPhone);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'cache-control': 'no-cache',
        },
      });

      const data = await response.json();

      if (data?.return === true || data?.status_code === 200) {
        console.log(`[SMS] OTP sent via Fast2SMS to ${normalizedPhone.slice(0, 4)}****${normalizedPhone.slice(-2)}`);
        return { success: true, provider: 'fast2sms' };
      } else {
        console.warn('[SMS] Fast2SMS returned error:', data?.message || JSON.stringify(data));
        // Fall through to Twilio fallback below
      }
    } catch (err: any) {
      console.warn('[SMS] Fast2SMS request failed:', err.message);
      // Fall through to Twilio fallback below
    }
  }

  // --- Twilio (Fallback) ---
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const intlPhone = `+91${normalizedPhone}`;
      const basicAuth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const body = new URLSearchParams({
        From: twilioFrom,
        To: intlPhone,
        Body: `Your Circuit Serve Technologies verification code is: ${otp}\n\nValid for 10 minutes. Do not share this OTP with anyone.`,
      });

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        }
      );

      const data = await response.json();

      if (response.ok && data?.sid) {
        console.log(`[SMS] OTP sent via Twilio to +91${normalizedPhone.slice(0, 4)}****`);
        return { success: true, provider: 'twilio' };
      } else {
        const errMsg = data?.message || 'Unknown Twilio error';
        console.warn('[SMS] Twilio error:', errMsg);
        return { success: false, provider: 'twilio', error: errMsg };
      }
    } catch (err: any) {
      console.warn('[SMS] Twilio request failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  // No SMS providers configured
  return {
    success: false,
    error: 'SMS delivery not configured. Set FAST2SMS_API_KEY in environment variables.',
  };
}
