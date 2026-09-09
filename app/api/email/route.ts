import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { to, subject, trackingNumber, senderName, recipientName, origin, destination, service, estimatedDelivery, awbLink } = body

    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tracking?number=${trackingNumber}`

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
      <div style="background: #1B2A4A; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">SourceDeliveryPro</h1>
        <p style="color: #C9B8B0; margin: 8px 0 0;">Shipment Confirmation</p>
      </div>
      <div style="background: white; padding: 30px; border-left: 4px solid #6B2737;">
        <h2 style="color: #1B2A4A; margin-top: 0;">Your Shipment is Confirmed! 🎉</h2>
        <p style="color: #555;">Dear ${recipientName || 'Customer'},</p>
        <p style="color: #555;">Your shipment has been registered. Here are the details:</p>
        
        <div style="background: #f8f5f4; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Tracking Number</td><td style="padding: 8px 0; font-weight: bold; font-family: monospace; color: #6B2737; font-size: 16px;">${trackingNumber}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">From</td><td style="padding: 8px 0; font-weight: 600;">${origin || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">To</td><td style="padding: 8px 0; font-weight: 600;">${destination || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Service</td><td style="padding: 8px 0; font-weight: 600;">${service || 'Standard'}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Est. Delivery</td><td style="padding: 8px 0; font-weight: 600; color: #2d6a4f;">${estimatedDelivery || 'TBD'}</td></tr>
          </table>
        </div>

        <a href="${trackingUrl}" style="display: block; background: #6B2737; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 20px 0;">Track Your Shipment →</a>
        
        <p style="color: #888; font-size: 13px; margin-top: 20px;">If you have any questions, contact us at support@sourcedeliverypro.com or via live chat on our website.</p>
      </div>
      <div style="background: #1B2A4A; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="color: #C9B8B0; font-size: 12px; margin: 0;">© 2026 SourceDeliveryPro · All Rights Reserved</p>
      </div>
    </body>
    </html>
    `

    const fromName = process.env.EMAIL_FROM_NAME || 'SourceDeliveryPro'
    const result = await sendEmail({
      to,
      subject: subject || `${fromName}: Your Shipment ${trackingNumber} is Confirmed`,
      html,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully', messageId: result.messageId })
  } catch (err: any) {
    console.error('[Email API Error]', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
