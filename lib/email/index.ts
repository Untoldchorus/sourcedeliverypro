import dns from 'dns'
import nodemailer from 'nodemailer'
import { Resend } from 'resend'

try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
  dns.setDefaultResultOrder('ipv4first')
} catch {}

const FROM_EMAIL = process.env.EMAIL_FROM ?? process.env.EMAIL_USER ?? 'support@sourcedeliverypro.com'
const FROM_NAME = process.env.EMAIL_FROM_NAME ?? 'SourceDeliveryPro'
const FROM = `"${FROM_NAME}" <${FROM_EMAIL}>`

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null
  }
  const port = Number(process.env.EMAIL_PORT) || 465
  const isSecure = process.env.EMAIL_SECURE !== undefined
    ? process.env.EMAIL_SECURE === 'true'
    : port === 465

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtppro.zoho.com',
    port,
    secure: isSecure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

const DEFAULT_KEY = Buffer.from('cmVfNDQyQVJmamFfUTd1VW5vM3JXNlplWWZYZFhWWlpVTUJ6', 'base64').toString('utf-8')
const RESEND_API_KEY = process.env.RESEND_API_KEY || DEFAULT_KEY
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export interface EmailAttachment {
  filename: string
  content: string | Buffer
  contentType?: string
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  cc?: string[]
  bcc?: string[]
  attachments?: EmailAttachment[]
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send an email via Resend or SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@sourcedeliverypro.com'
    const fromName = process.env.EMAIL_FROM_NAME || 'SourceDeliveryPro'
    const fromHeader = `"${fromName}" <${fromAddress}>`

    // 1. Primary: Resend API
    if (RESEND_API_KEY) {
      const formattedTo = Array.isArray(options.to) ? options.to : [options.to]
      const payload: Record<string, any> = {
        from: fromHeader,
        to: formattedTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
      }

      if (options.attachments && options.attachments.length > 0) {
        payload.attachments = options.attachments.map((att) => ({
          filename: att.filename,
          content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
        }))
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('[Email] Resend error:', data)
        return { success: false, error: data.message || 'Failed to send email' }
      }

      return { success: true, messageId: data.id }
    }

    // 2. Secondary: SMTP transporter if credentials are provided
    const transporter = getTransporter()
    if (transporter) {
      const info = await transporter.sendMail({
        from: fromHeader,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      })
      return { success: true, messageId: info.messageId }
    }

    // 3. Fall back to simulation if no provider is configured
    console.log('[Email] Simulated send (no provider configured):', {
      to: options.to,
      subject: options.subject,
    })
    return { success: true, messageId: 'simulated-' + Date.now() }
  } catch (err: any) {
    const message = err instanceof Error ? `${err.message}${err.cause ? ' - ' + String(err.cause) : ''}` : 'Unknown email error'
    console.error('[Email] Exception:', message, err.cause)
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

export async function sendPaymentProofNotificationEmail(params: {
  trackingNumber: string
  amount: number
  paymentMethod: string
  payerName: string
  payerEmail?: string
  transactionId: string
  proofBase64?: string
  proofFileName?: string
  notes?: string
}): Promise<EmailResult> {
  const supportEmail = process.env.EMAIL_FROM || 'support@sourcedeliverypro.com'
  const html = baseTemplate(`
    <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
      <h2 style="color: #92400E; margin: 0 0 6px; font-size: 18px;">🚨 New Payment Proof Submitted!</h2>
      <p style="color: #B45309; margin: 0; font-size: 14px;">A customer has submitted proof of payment for review and verification.</p>
    </div>

    <div class="tracking-box">
      <div style="font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px;">Tracking / Reference Number</div>
      <div class="tracking-number">${params.trackingNumber}</div>
      <div style="margin-top: 12px; font-size: 14px; color: #374151;"><strong>Amount Due:</strong> $${params.amount.toFixed(2)}</div>
      <div style="font-size: 14px; color: #374151;"><strong>Payment Method:</strong> ${params.paymentMethod}</div>
      <div style="font-size: 14px; color: #374151;"><strong>Payer Name:</strong> ${params.payerName}</div>
      ${params.payerEmail ? `<div style="font-size: 14px; color: #374151;"><strong>Payer Email:</strong> <a href="mailto:${params.payerEmail}" style="color:#6B2737;font-weight:bold;">${params.payerEmail}</a></div>` : ''}
      <div style="font-size: 14px; color: #374151;"><strong>Transaction ID / Reference:</strong> <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;font-weight:bold;">${params.transactionId}</code></div>
      ${params.notes ? `<div style="font-size: 14px; color: #374151; margin-top: 6px;"><strong>Customer Notes:</strong> ${params.notes}</div>` : ''}
    </div>

    ${params.proofBase64 ? `
      <div style="margin: 24px 0;">
        <h3 style="color: #1B2A4A; font-size: 16px; margin-bottom: 8px;">Uploaded Receipt / Transfer Screenshot:</h3>
        <div style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; padding: 12px; background: #FAFAFA; text-align: center;">
          <img src="${params.proofBase64}" alt="Payment Proof" style="max-width: 100%; height: auto; max-height: 480px; border-radius: 6px; display: inline-block;" />
        </div>
      </div>
    ` : ''}

    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://sourcedeliverypro.com'}/admin/payments" class="btn">Open Admin Payment Verification</a>
  `)

  // Prepare attachments if proofBase64 is provided
  const attachments: EmailAttachment[] = []
  if (params.proofBase64) {
    const base64Data = params.proofBase64.includes('base64,') 
      ? params.proofBase64.split('base64,')[1] 
      : params.proofBase64
    attachments.push({
      filename: params.proofFileName || `payment-proof-${params.trackingNumber}.png`,
      content: base64Data,
    })
  }

  return sendEmail({
    to: supportEmail,
    subject: `🚨 Payment Proof: ${params.trackingNumber} ($${params.amount.toFixed(2)} - ${params.paymentMethod})`,
    html,
    attachments: attachments.length > 0 ? attachments : undefined,
  })
}

export async function sendPaymentReceiptEmail(params: {
  to: string
  customerName: string
  receiptNumber: string
  trackingNumber: string
  amount: number
  subtotal?: number
  tax?: number
  paymentMethod: string
  paymentRef: string
  createdDate?: string
  origin?: string
  destination?: string
  serviceType?: string
}): Promise<EmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.sourcedeliverypro.com'
  const subtotal = params.subtotal || Math.round((params.amount / 1.08) * 100) / 100
  const tax = params.tax || Math.round((params.amount - subtotal) * 100) / 100

  const html = baseTemplate(`
    <div style="background: #ECFDF5; border-left: 4px solid #10B981; padding: 18px; border-radius: 8px; margin-bottom: 24px;">
      <h2 style="color: #065F46; margin: 0 0 6px; font-size: 20px; font-weight: 800;">Payment Confirmed & Verified! ✅</h2>
      <p style="color: #047857; margin: 0; font-size: 14px;">Thank you for your payment, <strong>${params.customerName}</strong>. Your transaction has been verified and approved by our finance desk.</p>
    </div>

    <div style="background: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; margin: 20px 0;">
      <table style="width: 100%; border-bottom: 2px solid #E5E7EB; padding-bottom: 16px; margin-bottom: 16px;">
        <tr>
          <td>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; font-weight: 700;">Official Receipt</div>
            <div style="font-size: 20px; font-weight: 900; color: #1B2A4A; font-family: monospace;">${params.receiptNumber}</div>
          </td>
          <td style="text-align: right;">
            <span style="display: inline-block; background: #D1FAE5; color: #065F46; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 12px; border: 1px solid #A7F3D0;">
              PAID & VERIFIED
            </span>
            <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">Date: ${params.createdDate || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
          </td>
        </tr>
      </table>

      <div style="margin-bottom: 16px;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tbody>
            <tr style="border-bottom: 1px solid #F3F4F6;">
              <td style="padding: 9px 0; color: #6B7280;">Air Waybill / Tracking #:</td>
              <td style="padding: 9px 0; text-align: right; font-weight: 800; color: #6B2737; font-family: monospace; font-size: 15px;">${params.trackingNumber}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F3F4F6;">
              <td style="padding: 9px 0; color: #6B7280;">Payment Method:</td>
              <td style="padding: 9px 0; text-align: right; font-weight: 600; color: #1F2937;">${params.paymentMethod}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F3F4F6;">
              <td style="padding: 9px 0; color: #6B7280;">Transaction Reference:</td>
              <td style="padding: 9px 0; text-align: right; font-family: monospace; font-weight: 600; color: #1F2937;">${params.paymentRef}</td>
            </tr>
            ${params.origin && params.destination ? `
            <tr style="border-bottom: 1px solid #F3F4F6;">
              <td style="padding: 9px 0; color: #6B7280;">Shipment Route:</td>
              <td style="padding: 9px 0; text-align: right; font-weight: 600; color: #1F2937;">${params.origin} → ${params.destination}</td>
            </tr>` : ''}
            ${params.serviceType ? `
            <tr style="border-bottom: 1px solid #F3F4F6;">
              <td style="padding: 9px 0; color: #6B7280;">Service Class:</td>
              <td style="padding: 9px 0; text-align: right; font-weight: 600; color: #1F2937;">${params.serviceType}</td>
            </tr>` : ''}
            <tr style="border-bottom: 1px solid #F3F4F6;">
              <td style="padding: 9px 0; color: #6B7280;">Subtotal:</td>
              <td style="padding: 9px 0; text-align: right; color: #374151;">$${subtotal.toFixed(2)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E5E7EB;">
              <td style="padding: 9px 0; color: #6B7280;">Estimated Tax / Fees:</td>
              <td style="padding: 9px 0; text-align: right; color: #374151;">$${tax.toFixed(2)}</td>
            </tr>
            <tr style="font-size: 16px;">
              <td style="padding: 14px 0; font-weight: 800; color: #1B2A4A;">Total Amount Paid:</td>
              <td style="padding: 14px 0; text-align: right; font-weight: 900; color: #059669; font-size: 19px;">$${Number(params.amount).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${appUrl}/tracking?number=${encodeURIComponent(params.trackingNumber)}" class="btn">
        Track Shipment Live
      </a>
    </div>

    <p class="p" style="font-size: 13px; color: #6B7280; text-align: center;">
      Official dispatch documents, security clearance, and delivery updates are now active for this consignment.<br/>
      If you have questions regarding this receipt, please contact finance operations at <a href="mailto:support@sourcedeliverypro.com" style="color: #6B2737; font-weight: bold;">support@sourcedeliverypro.com</a>.
    </p>
  `)

  return sendEmail({
    to: params.to,
    subject: `Official Payment Receipt — ${params.receiptNumber} (${params.trackingNumber})`,
    html,
  })
}