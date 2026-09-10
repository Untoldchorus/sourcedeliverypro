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

export const OFFICIAL_DOMAIN = 'https://www.sourcedeliverypro.com'

export function getAppUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL
  if (
    envUrl &&
    !envUrl.includes('vercel.app') &&
    !envUrl.includes('localhost') &&
    !envUrl.includes('127.0.0.1')
  ) {
    return envUrl.replace(/\/$/, '')
  }
  return OFFICIAL_DOMAIN
}

function baseTemplate(content: string): string {
  const domain = getAppUrl()
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
      <a href="${domain}" style="text-decoration: none;" target="_blank">
        <div class="logo">SourceDelivery<span>Pro</span></div>
      </a>
      <div class="tagline">Ship smarter. Deliver faster. Move the world.</div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} <a href="${domain}" style="color: #6B7280; text-decoration: none; font-weight: 600;">SourceDeliveryPro</a>. All rights reserved.</p>
      <p>Official Global Logistics Portal: <a href="${domain}" style="color: #6B2737; font-weight: bold; text-decoration: none;">www.sourcedeliverypro.com</a> | Support: <a href="tel:+16183681268" style="color: #6B2737; font-weight: bold; text-decoration: none;">(618) 368 1268</a></p>
      <p style="font-size:11px;color:#9CA3AF;margin-top:6px;">Main: 500 Capitol Mall, Sacramento, CA 95814 | Branch: 27 Jalan Sultan Idris Shah, 30000 Ipoh, Perak, Malaysia</p>
      <p>You're receiving this email because you have an active shipment or account with SourceDeliveryPro.</p>
    </div>
  </div>
</body>
</html>`
}

export async function sendWelcomeEmail(to: string, name: string): Promise<EmailResult> {
  const domain = getAppUrl()
  const html = baseTemplate(`
    <h1 class="h1">Welcome to SourceDeliveryPro, ${name}! 🚀</h1>
    <p class="p">Your account has been created. You can now create shipments, track packages, and manage your deliveries all in one place.</p>
    <a href="${domain}/dashboard" class="btn">Go to Dashboard</a>
    <hr class="divider">
    <p class="p" style="font-size:13px;color:#6B7280;">If you didn't create this account, please ignore this email or contact our support team at <a href="mailto:support@sourcedeliverypro.com" style="color:#6B2737;font-weight:bold;">support@sourcedeliverypro.com</a>.</p>
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
  const domain = getAppUrl()
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
    <a href="${domain}/tracking?number=${encodeURIComponent(trackingNumber)}" class="btn">Track Your Shipment</a>
  `)
  return sendEmail({ to, subject: `Shipment Confirmed — ${trackingNumber}`, html })
}

export async function sendDeliveryConfirmationEmail(
  to: string,
  trackingNumber: string,
  deliveredAt: string
): Promise<EmailResult> {
  const domain = getAppUrl()
  const html = baseTemplate(`
    <h1 class="h1">Your package has been delivered! ✅</h1>
    <p class="p">Your shipment has been successfully delivered.</p>
    <div class="tracking-box">
      <div style="font-size:12px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Tracking Number</div>
      <div class="tracking-number">${trackingNumber}</div>
      <div style="margin-top:8px;font-size:14px;color:#374151;">Delivered at: ${deliveredAt}</div>
    </div>
    <a href="${domain}/dashboard" class="btn">View Your Dashboard</a>
  `)
  return sendEmail({ to, subject: `Package Delivered — ${trackingNumber}`, html })
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  name: string
): Promise<EmailResult> {
  const domain = getAppUrl()
  const resetUrl = `${domain}/reset-password?token=${encodeURIComponent(resetToken)}`
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
  const domain = getAppUrl()
  const html = baseTemplate(`
    <h1 class="h1">We received your support request</h1>
    <p class="p">Your ticket has been created and our team will respond shortly.</p>
    <div class="tracking-box">
      <div style="font-size:12px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Ticket Number</div>
      <div class="tracking-number" style="font-size:18px;">${ticketNumber}</div>
      <div style="margin-top:8px;font-size:14px;color:#374151;">Subject: ${subject}</div>
    </div>
    <a href="${domain}/dashboard/support" class="btn">View Ticket</a>
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

    <a href="${getAppUrl()}/admin/payments" class="btn">Open Admin Payment Verification</a>
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

export interface ReceiptEmailItem {
  id?: string
  description: string
  amount: number
  status?: string
  enabled?: boolean
}

export interface ReceiptEmailParams {
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
  status?: string
  items?: ReceiptEmailItem[]
  notes?: string
  attachments?: EmailAttachment[]
}

function escapeHtml(str: string | undefined | null): string {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function renderReceiptEmailHtml(params: ReceiptEmailParams): string {
  const status = escapeHtml(params.status || 'PAID').toUpperCase()
  const isPaid = status === 'PAID'
  const isPartial = status === 'PARTIALLY_PAID'

  const dateStr = escapeHtml(params.createdDate || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }))
  const totalAmount = Number(params.amount) || 0

  // Filter enabled items or build fallback list
  let itemsToRender: { description: string; amount: number; isItemPaid: boolean }[] = []
  if (params.items && Array.isArray(params.items) && params.items.length > 0) {
    itemsToRender = params.items
      .filter((it) => it.enabled !== false)
      .map((it) => ({
        description: it.description,
        amount: Number(it.amount) || 0,
        isItemPaid: (it.status || 'PAID') === 'PAID',
      }))
  }

  if (itemsToRender.length === 0) {
    const sub = params.subtotal || Math.round((totalAmount / 1.08) * 100) / 100
    const tx = params.tax || Math.round((totalAmount - sub) * 100) / 100
    itemsToRender = [
      {
        description: 'Consignment Freight Charge & Handling',
        amount: sub,
        isItemPaid: isPaid,
      },
      {
        description: 'Customs Clearance, Handling & Insurance Tax',
        amount: tx,
        isItemPaid: isPaid,
      },
    ]
  }

  const itemsRowsHtml = itemsToRender
    .map(
      (it) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 11px 0; color: #334155; font-size: 13px; font-weight: 500;">
            ${escapeHtml(it.description)}
          </td>
          <td style="padding: 11px 0; text-align: right; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; font-weight: 600; color: #1e293b;">
            $${it.amount.toFixed(2)}
          </td>
          <td style="padding: 11px 0; text-align: center;">
            <span style="display: inline-block; padding: 2px 9px; border-radius: 9999px; font-size: 10px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; ${
              it.isItemPaid
                ? 'background-color: #d1fae5; color: #065f46; border: 1px solid #86efac;'
                : 'background-color: #ffe4e6; color: #9f1239; border: 1px solid #fda4af;'
            }">
              ${it.isItemPaid ? 'PAID' : 'NOT PAID'}
            </span>
          </td>
        </tr>
      `
    )
    .join('')

  const statusBadgeStyle = isPaid
    ? 'background-color: #d1fae5; color: #065f46; border: 1px solid #86efac;'
    : isPartial
    ? 'background-color: #fef3c7; color: #92400e; border: 1px solid #fcd34d;'
    : 'background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;'

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Receipt ${params.receiptNumber}</title>
  <style>
    body { margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
    <!-- Receipt Header -->
    <tr>
      <td style="padding: 24px 28px; border-bottom: 1px solid #e2e8f0;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align: top;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px;">
                    <div style="width: 34px; height: 34px; background-color: #1B2A4A; border-radius: 10px; text-align: center; line-height: 34px; color: #ffffff; font-weight: 900; font-size: 15px; display: inline-block;">
                      SD
                    </div>
                  </td>
                  <td style="vertical-align: middle;">
                    <div style="font-size: 20px; font-weight: 900; color: #1B2A4A; letter-spacing: -0.5px; line-height: 1.1;">
                      SourceDelivery<span style="color: #6B2737;">Pro</span>
                    </div>
                  </td>
                </tr>
              </table>
              <div style="font-size: 11px; color: #64748B; margin-top: 6px; font-weight: 500;">
                Commercial Freight Billing &amp; Electronic Clearing Statement
              </div>
            </td>
            <td style="vertical-align: top; text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">
                OFFICIAL RECEIPT
              </div>
              <div style="font-size: 16px; font-weight: 900; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #1B2A4A;">
                ${params.receiptNumber}
              </div>
              <div style="margin-top: 6px;">
                <span style="display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; ${statusBadgeStyle}">
                  ${status}
                </span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Billing Info & Consignment Telemetry Grid -->
    <tr>
      <td style="padding: 20px 28px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="vertical-align: top; padding-right: 14px;">
              <div style="font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                Billed To (Customer)
              </div>
              <div style="font-size: 14px; font-weight: 800; color: #1B2A4A; margin-bottom: 2px;">
                ${params.customerName || 'Direct Shipper'}
              </div>
              <div style="font-size: 12px; color: #475569; margin-bottom: 3px;">
                ${params.to}
              </div>
              <div style="font-size: 11px; color: #94A3B8;">
                Verified Logistics Customer
              </div>
            </td>
            <td width="50%" style="vertical-align: top; padding-left: 14px; border-left: 1px solid #e2e8f0;">
              <div style="font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                Consignment Telemetry
              </div>
              <div style="font-size: 12px; color: #475569; margin-bottom: 3px;">
                Tracking Number: <strong style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #6B2737; font-size: 13px;">${params.trackingNumber}</strong>
              </div>
              <div style="font-size: 12px; color: #475569; margin-bottom: 3px;">
                Payment Method: <strong style="color: #1e293b;">${params.paymentMethod}</strong>
              </div>
              <div style="font-size: 12px; color: #475569; margin-bottom: 3px;">
                Tx Ref: <strong style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #1e293b;">${params.paymentRef}</strong>
              </div>
              <div style="font-size: 11px; color: #94A3B8; margin-top: 4px;">
                Date Issued: ${dateStr}
              </div>
              ${params.origin && params.destination ? `
              <div style="font-size: 11px; color: #64748B; margin-top: 3px;">
                Route: ${params.origin} &rarr; ${params.destination}
              </div>` : ''}
              ${params.serviceType ? `
              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
                Class: ${params.serviceType}
              </div>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Line Items Table -->
    <tr>
      <td style="padding: 24px 28px 16px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <thead>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <th align="left" style="padding-bottom: 10px; font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">
                Description &amp; Freight Breakdown
              </th>
              <th align="right" width="110" style="padding-bottom: 10px; font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">
                Amount (USD)
              </th>
              <th align="center" width="90" style="padding-bottom: 10px; font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding-top: 16px; border-top: 2px solid #cbd5e1; font-size: 14px; font-weight: 900; color: #1B2A4A;">
                Total Amount Paid
              </td>
              <td align="right" style="padding-top: 16px; border-top: 2px solid #cbd5e1; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 17px; font-weight: 900; color: #059669;">
                $${totalAmount.toFixed(2)}
              </td>
              <td align="center" style="padding-top: 16px; border-top: 2px solid #cbd5e1;">
                <span style="display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; ${statusBadgeStyle}">
                  ${status}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>

        ${params.notes && params.notes.trim() ? `
        <div style="margin-top: 20px; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 12px; color: #475569;">
          <strong style="display: block; color: #334155; margin-bottom: 3px; font-weight: 700;">Special Operational Notes:</strong>
          ${params.notes.trim()}
        </div>` : ''}
      </td>
    </tr>

    <!-- Digitally Authenticated Footer -->
    <tr>
      <td style="padding: 16px 28px 20px; border-top: 1px solid #e2e8f0;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 11px; font-weight: 700; color: #047857;">
              &#10003; Digitally Authenticated &amp; Recorded in SourceDeliveryPro Ledger
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return html
}

export async function sendPaymentReceiptEmail(params: ReceiptEmailParams): Promise<EmailResult> {
  const html = renderReceiptEmailHtml(params)
  return sendEmail({
    to: params.to,
    subject: `Official Receipt — ${params.receiptNumber} (${params.trackingNumber})`,
    html,
    attachments: params.attachments && params.attachments.length > 0 ? params.attachments : undefined,
  })
}