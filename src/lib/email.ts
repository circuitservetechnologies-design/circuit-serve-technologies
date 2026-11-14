import nodemailer from 'nodemailer';
import { COMPANY_INFO } from './constants';

export async function sendOtpVerificationEmail(
  toEmail: string,
  otp: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Check if SMTP environment variables are configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS;

  if (!smtpHost && !smtpUser) {
    return { success: false, error: 'SMTP configuration not detected in environment variables.' };
  }

  try {
    const transporter = nodemailer.createTransport(
      smtpHost
        ? {
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          }
        : {
            service: 'gmail',
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          }
    );

    const displayName = userName || 'Valued Client';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Security Verification Code - Circuit Serve Technologies</title>
</head>
<body style="margin: 0; padding: 0; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #020617; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #082f49 0%, #0f172a 100%); padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #1e293b;">
              <h1 style="margin: 0; color: #38bdf8; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; font-family: monospace;">CIRCUIT SERVE TECHNOLOGIES</h1>
              <p style="margin: 6px 0 0; color: #94a3b8; font-size: 11px; font-family: monospace; letter-spacing: 1px;">CLIENT COLLABORATION HUB • SECURITY AUTHENTICATION</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 18px; font-weight: 700;">Password Reset Verification Code</h2>
              <p style="margin: 0 0 20px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                Hello <strong>${displayName}</strong>,
              </p>
              <p style="margin: 0 0 24px; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                You requested to reset your password for your Circuit Serve Technologies account. Use the following 6-digit One-Time Password (OTP) to complete the verification:
              </p>

              <!-- OTP Block -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 24px;">
                    <div style="display: inline-block; padding: 18px 36px; background-color: #020617; border: 2px solid #0284c7; border-radius: 12px; text-align: center;">
                      <span style="font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #38bdf8; font-family: monospace; padding-left: 12px;">${otp}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="background-color: #020617; border-left: 3px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <p style="margin: 0; color: #fbbf24; font-size: 12px; line-height: 1.5;">
                  <strong>Security Alert:</strong> This code is valid for <strong>10 minutes</strong>. Never share this OTP with anyone. If you did not initiate this password reset request, someone may be attempting to access your account. Please contact us immediately.
                </p>
              </div>

              <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                Need help? Contact our engineering lab at <a href="mailto:${COMPANY_INFO.contact.email}" style="color: #38bdf8; text-decoration: none;">${COMPANY_INFO.contact.email}</a> or call +91 ${COMPANY_INFO.contact.rawPhone}.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #020617; padding: 20px 32px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; color: #475569; font-size: 11px; font-family: monospace;">
                Circuit Serve Technologies • Surampalem, Andhra Pradesh, India
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const info = await transporter.sendMail({
      from: `"Circuit Serve Technologies Security" <${smtpUser || COMPANY_INFO.contact.email}>`,
      to: toEmail,
      subject: `Your Security Verification Code: ${otp} - Circuit Serve Technologies`,
      html: htmlContent,
      text: `Hello ${displayName},\n\nYour Circuit Serve Technologies password reset verification code is: ${otp}\n\nThis code expires in 10 minutes. Never share this code with anyone.\n\nCircuit Serve Technologies\nSurampalem, AP\n${COMPANY_INFO.contact.email}`,
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('Failed to send OTP email:', err);
    return { success: false, error: err.message || 'Failed to dispatch verification email' };
  }
}
