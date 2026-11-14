import nodemailer from 'nodemailer';
import { COMPANY_INFO } from './constants';

export async function sendPasswordResetEmail(
  toEmail: string,
  resetLink: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Check if SMTP environment variables are configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS;

  if (!smtpHost && !smtpUser) {
    // SMTP not configured yet
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

    const displayName = userName ? userName : 'Valued Client';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password - Circuit Serve Technologies</title>
</head>
<body style="margin: 0; padding: 0; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #020617; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #082f49 0%, #0f172a 100%); padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #1e293b;">
              <h1 style="margin: 0; color: #38bdf8; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; font-family: monospace;">CIRCUIT SERVE TECHNOLOGIES</h1>
              <p style="margin: 6px 0 0; color: #94a3b8; font-size: 11px; font-family: monospace; letter-spacing: 1px;">CLIENT COLLABORATION HUB</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 18px; font-weight: 700;">Password Reset Request</h2>
              <p style="margin: 0 0 20px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                Hello <strong>${displayName}</strong>,
              </p>
              <p style="margin: 0 0 28px; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                We received a request to reset your password for your Circuit Serve Technologies Client Portal account. Click the button below to choose a new password:
              </p>

              <!-- Reset Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%); color: #020617; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; font-family: monospace; box-shadow: 0 4px 14px 0 rgba(6, 182, 212, 0.39);">
                      Reset Password Now
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="margin: 0 0 12px; color: #64748b; font-size: 12px; line-height: 1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px; color: #38bdf8; font-size: 11px; word-break: break-all; font-family: monospace; background-color: #020617; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
                ${resetLink}
              </p>

              <div style="background-color: #020617; border-left: 3px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <p style="margin: 0; color: #fbbf24; font-size: 12px; line-height: 1.5;">
                  <strong>Note:</strong> This link is valid for <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>
              </div>

              <p style="margin: 0; color: #64748b; font-size: 12px;">
                Need assistance? Contact our engineering team at <a href="mailto:${COMPANY_INFO.contact.email}" style="color: #38bdf8; text-decoration: none;">${COMPANY_INFO.contact.email}</a> or call +91 ${COMPANY_INFO.contact.rawPhone}.
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
      from: `"Circuit Serve Technologies" <${smtpUser || COMPANY_INFO.contact.email}>`,
      to: toEmail,
      subject: 'Reset Your Password - Circuit Serve Technologies Client Portal',
      html: htmlContent,
      text: `Hello ${displayName},\n\nWe received a request to reset your password for Circuit Serve Technologies Client Portal.\n\nPlease reset your password using the link below:\n${resetLink}\n\nThis link expires in 1 hour.\n\nCircuit Serve Technologies\nSurampalem, AP\n${COMPANY_INFO.contact.email}`,
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('Failed to send reset email:', err);
    return { success: false, error: err.message || 'Failed to dispatch email' };
  }
}
