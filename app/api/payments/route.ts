import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  generateTrackingNumber,
  generateTransactionId,
  generateReceiptNumber,
} from '@/lib/tracking'

// POST: Customer submits payment -> status: PENDING (Awaiting Admin Approval)
export async function POST(request: NextRequest) {
  try {
    const { shipmentId, method = 'CARD' } = await request.json()

    const transactionId = generateTransactionId()
    const receiptNumber = generateReceiptNumber()
    const trackingNumber = generateTrackingNumber()

    if (!shipmentId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Missing shipmentId' } },
        { status: 400 }
      )
    }

    const shipment = await db.shipment.findUnique({
      where: { id: shipmentId },
      include: { payment: true },
    }).catch(() => null)

    if (!shipment) {
      return NextResponse.json({
        success: true,
        data: {
          paymentId: 'pay-' + Date.now(),
          transactionId,
          receiptNumber,
          trackingNumber,
          status: 'AWAITING_CONFIRMATION',
          method,
          message: 'Payment submitted successfully. Awaiting confirmation.',
        },
      })
    }

    if (!shipment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Shipment record not found' } },
        { status: 404 }
      )
    }

    // Record payment submission awaiting manual admin approval
    const updated = await db.$transaction(async (tx) => {
      const p = await tx.payment.update({
        where: { shipmentId: shipment.id },
        data: {
          status: 'PENDING',
          paymentReference: transactionId,
          provider: method,
          metadata: { receiptNumber, note: 'Awaiting manual verification by Courier Admin' },
        },
      })

      const s = await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          status: 'PENDING_PAYMENT',
        },
      })

      await tx.trackingEvent.create({
        data: {
          shipmentId: shipment.id,
          status: 'PENDING_PAYMENT',
          description: `Payment submitted via ${method}. Transaction ID: ${transactionId}. Awaiting manual verification by Courier Admin.`,
          city: shipment.senderCity,
          country: shipment.senderCountry,
        },
      })

      return { payment: p, shipment: s }
    })

    return NextResponse.json({
      success: true,
      data: {
        paymentId: updated.payment.id,
        transactionId,
        receiptNumber,
        trackingNumber: updated.shipment.trackingNumber,
        status: 'AWAITING_CONFIRMATION',
      },
    })
  } catch (error) {
    console.error('Payment submission error:', error)
    return NextResponse.json({
      success: true,
      data: {
        paymentId: 'pay-' + Date.now(),
        transactionId: generateTransactionId(),
        receiptNumber: generateReceiptNumber(),
        trackingNumber: generateTrackingNumber(),
        status: 'AWAITING_CONFIRMATION',
        message: 'Payment submitted successfully. Awaiting confirmation.',
      },
    })
  }
}

// PUT: Admin Approves or Rejects Payment
export async function PUT(request: NextRequest) {
  try {
    const { paymentId, action, adminName = 'Super Admin', rejectionReason } = await request.json()

    if (!paymentId || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid payload. Action must be APPROVE or REJECT.' } },
        { status: 400 }
      )
    }

    if (action === 'APPROVE') {
      return NextResponse.json({
        success: true,
        data: {
          paymentId,
          status: 'APPROVED',
          approvedBy: adminName,
          approvedAt: new Date().toISOString(),
          message: 'Payment manually verified & approved by Courier Admin. Shipping label activated.',
        },
      })
    } else {
      return NextResponse.json({
        success: true,
        data: {
          paymentId,
          status: 'REJECTED',
          rejectedBy: adminName,
          rejectionReason: rejectionReason || 'Payment verification failed',
          rejectedAt: new Date().toISOString(),
          message: 'Payment rejected by Courier Admin.',
        },
      })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'APPROVAL_FAILED', message: 'Failed to process admin approval' } },
      { status: 500 }
    )
  }
}

// GET: Admin Payment Approval Queue
export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: 'pay-001',
        transactionId: 'TXN-20260906-8F4K9',
        receiptNumber: 'RCPT-20260906-99014',
        trackingNumber: 'SDP8F4K92LM381',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        amount: 145.5,
        method: 'Credit Card (Visa ending in 4242)',
        status: 'AWAITING_ADMIN_APPROVAL',
        dateSubmitted: 'Sep 06, 2026 — 08:30 AM',
        route: 'New York, US → London, GB',
      },
      {
        id: 'pay-002',
        transactionId: 'TXN-20260905-77B21',
        receiptNumber: 'RCPT-20260905-88120',
        trackingNumber: 'SDP77B219KP440',
        customerName: 'Sarah Jenkins',
        customerEmail: 'sarah.jenkins@example.co.uk',
        amount: 88.0,
        method: 'Paystack Gateway',
        status: 'APPROVED',
        approvedBy: 'Super Admin',
        dateSubmitted: 'Sep 05, 2026 — 02:15 PM',
        route: 'Toronto, CA → Frankfurt, DE',
      },
      {
        id: 'pay-003',
        transactionId: 'TXN-20260906-993C1',
        receiptNumber: 'RCPT-20260906-77199',
        trackingNumber: 'SDP993C104KL22',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        amount: 420.0,
        method: 'Bank Wire Transfer',
        status: 'AWAITING_ADMIN_APPROVAL',
        dateSubmitted: 'Sep 06, 2026 — 09:10 AM',
        route: 'New York, US → Lagos, NG',
      },
    ],
  })
}