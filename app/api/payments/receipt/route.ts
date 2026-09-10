import { NextRequest, NextResponse } from 'next/server'
import { sendPaymentReceiptEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      to,
      customerName = 'Customer',
      receiptNumber,
      trackingNumber,
      amount = 0,
      subtotal,
      tax,
      paymentMethod = 'Manual Transfer',
      paymentRef = 'N/A',
      createdDate,
      origin,
      destination,
      serviceType,
      status = 'PAID',
      items,
      notes,
      pdfBase64,
    } = body

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid customer email address is required' },
        { status: 400 }
      )
    }

    if (!trackingNumber) {
      return NextResponse.json(
        { success: false, error: 'Tracking number is required' },
        { status: 400 }
      )
    }

    const rcptNum = receiptNumber || 'RCPT-2026-' + Math.floor(10000 + Math.random() * 90000)

    const attachments: { filename: string; content: string }[] = []
    if (pdfBase64 && typeof pdfBase64 === 'string') {
      const cleanBase64 = pdfBase64.includes('base64,') ? pdfBase64.split('base64,')[1] : pdfBase64
      attachments.push({
        filename: `Receipt-${rcptNum}.pdf`,
        content: cleanBase64,
      })
    } else if (Array.isArray(body.attachments)) {
      attachments.push(...body.attachments)
    }

    const result = await sendPaymentReceiptEmail({
      to: to.trim(),
      customerName,
      receiptNumber: rcptNum,
      trackingNumber,
      amount: Number(amount) || 0,
      subtotal: subtotal ? Number(subtotal) : undefined,
      tax: tax ? Number(tax) : undefined,
      paymentMethod,
      paymentRef,
      createdDate,
      origin,
      destination,
      serviceType,
      status,
      items: Array.isArray(items) ? items : undefined,
      notes,
      attachments: attachments.length > 0 ? attachments : undefined,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to deliver receipt email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Receipt ${rcptNum} successfully delivered to ${to}`,
      messageId: result.messageId,
    })
  } catch (err: any) {
    console.error('[Payment Receipt API Error]:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
