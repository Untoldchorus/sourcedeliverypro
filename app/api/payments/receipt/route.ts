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
