import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM ?? 'noreply@sourcedeliverypro.com'
const FROM_NAME = process.env.EMAIL_FROM_NAME ?? 'SourceDeliveryPro'
const FROM = `${FROM_NAME} <${FROM_EMAIL}>`

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  cc?: string[]
  bcc?: string[]
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send an email via Resend
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    if (process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY) {
      console.log('[Email] Simulated send:', {
        to: options.to,
        subject: options.subject,
      })
      return { success: true, messageId: 'dev-' + Date.now() }
    }

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
    })

    if (error) {
      console.error('[Email] Send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error'
    console.error('[Email] Exception:', message)
    return { success: false, error: message }
  }
}

// ===========================
// HTML Email Templates
// ===========================

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SourceDeliveryPro</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #1B2A4A; padding: 32px 40px; text-align: center; }
    .header .logo { color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header .logo span { color: #A85060; }
    .header .tagline { color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 4px; }
    .body { padding: 40px; }
    .h1 { color: #1B2A4A; font-size: 24px; font-weight: 700; margin: 0 0 16px; }
    .p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #6B2737; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .tracking-box { background: #F3F4F6; border-left: 4px solid #6B2737; padding: 20px; border-radius: 8px; margin: 24px 0; }
    .tracking-number { font-size: 22px; font-weight: 800; color: #1B2A4A; letter-spacing: 2px; }
    .footer { background: #F9FAFB; padding: 24px 40px; text-align: center; border-top: 1px solid #E5E7EB; }
    .footer p { color: #9CA3AF; font-size: 12px; margin: 4px 0; }
    .divider { border: none; border-top: 1px solid #E5E7EB; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SourceDelivery<span>Pro</span></div>
      <div class="tagline">Ship smarter. Deliver faster. Move the world.</div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SourceDeliveryPro. All rights reserved.</p>
      <p>You're receiving this email because you have an account with SourceDeliveryPro.</p>
    </div>
  </div>
</body>
</html>`
}

export async function sendWelcomeEmail(to: string, name: string): Promise<EmailResult> {
  const html = baseTemplate(`
    <h1 class="h1">Welcome to SourceDeliveryPro, ${name}! 🚀</h1>
    <p class="p">Your account has been created. You can now create shipments, track packages, and manage your deliveries all in one place.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Go to Dashboard</a>
    <hr class="divider">
    <p class="p" style="font-size:13px;color:#6B7280;">If you didn't create this account, please ignore this email or contact our support team.</p>
  `)
  return sendEmail({ to, subject: 'Welcome to SourceDeliveryPro!', html })
}

export async function sendShipmentConfirmationEmail(
  to: string,
  trackingNumber: string,
  shipmentNumber: string,
  recipientName: string,
  estimatedDelivery: string
): Promise<EmailResult> {
  const html = baseTemplate(`
    <h1 class="h1">Your shipment is confirmed! 📦</h1>
    <p class="p">Great news! Your shipment has been created and is ready to go.</p>
    <div class="tracking-box">
      <div style="font-size:12px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Tracking Number</div>
      <div class="tracking-number">${trackingNumber}</div>
      <div style="margin-top:8px;font-size:14px;color:#374151;">Shipment: ${shipmentNumber}</div>
      <div style="font-size:14px;color:#374151;">To: ${recipientName}</div>
      <div style="font-size:14px;color:#374151;">Est. Delivery: ${estimatedDelivery}</div>
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/track/${trackingNumber}" class="btn">Track Your Shipment</a>
  `)
  return sendEmail({ to, subject: `Shipment Confirmed — ${trackingNumber}`, html })
}

export async function sendDeliveryConfirmationEmail(
  to: string,
  trackingNumber: string,
  deliveredAt: string
): Promise<EmailResult> {
  const html = baseTemplate(`
    <h1 class="h1">Your package has been delivered! ✅</h1>
    <p class="p">Your shipment has been successfully delivered.</p>
    <div class="tracking-box">
      <div style="font-size:12px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Tracking Number</div>
      <div class="tracking-number">${trackingNumber}</div>
      <div style="margin-top:8px;font-size:14px;color:#374151;">Delivered at: ${deliveredAt}</div>
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">View Your Dashboard</a>
  `)
  return sendEmail({ to, subject: `Package Delivered — ${trackingNumber}`, html })
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  name: string
): Promise<EmailResult> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
  const html = baseTemplate(`
    <h1 class="h1">Reset your password</h1>
    <p class="p">Hi ${name}, we received a request to reset your password. Click the button below to continue. This link expires in 1 hour.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <hr class="divider">
    <p class="p" style="font-size:13px;color:#6B7280;">If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.</p>
  `)
  return sendEmail({ to, subject: 'Reset your SourceDeliveryPro password', html })
}

export async function sendSupportTicketEmail(
  to: string,
  ticketNumber: string,
  subject: string
): Promise<EmailResult> {
  const html = baseTemplate(`
    <h1 class="h1">We received your support request</h1>
    <p class="p">Your ticket has been created and our team will respond shortly.</p>
    <div class="tracking-box">
      <div style="font-size:12px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Ticket Number</div>
      <div class="tracking-number" style="font-size:18px;">${ticketNumber}</div>
      <div style="margin-top:8px;font-size:14px;color:#374151;">Subject: ${subject}</div>
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/support" class="btn">View Ticket</a>
  `)
  return sendEmail({ to, subject: `Support Ticket Created — ${ticketNumber}`, html })
}