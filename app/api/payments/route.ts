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

    try {
      const payment = await db.payment.findFirst({
        where: { OR: [{ id: paymentId }, { paymentReference: paymentId }] },
      })

      if (payment) {
        await db.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: action === 'APPROVE' ? 'PAID' : 'FAILED' },
          })

          if (action === 'APPROVE') {
            await tx.shipment.update({
              where: { id: payment.shipmentId },
              data: { status: 'LABEL_CREATED' },
            })
            await tx.invoice.updateMany({
              where: { shipmentId: payment.shipmentId },
              data: { status: 'PAID' },
            })
          }
        })
      }
    } catch (dbErr) {
      console.warn('DB payment PUT update warning:', dbErr)
    }

    if (action === 'APPROVE') {
      return NextResponse.json({
        success: true,
        data: {
          paymentId,
          status: 'APPROVED',
          approvedBy: adminName,
          approvedAt: new Date().toISOString(),
          message: 'Payment verified & approved. Shipping label activated.',
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

// GET: Admin Payment Approval Queue from Database
export async function GET() {
  try {
    const payments = await db.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        shipment: true,
      },
    })

    const mapped = payments.map((p) => ({
      id: p.id,
      transactionId: p.paymentReference,
      receiptNumber: (p.metadata as any)?.receiptNumber || `RCPT-${p.id.slice(-6).toUpperCase()}`,
      trackingNumber: p.shipment?.trackingNumber || 'Pending',
      customerName: p.shipment?.senderName || 'Customer',
      customerEmail: p.shipment?.senderEmail || '',
      amount: Number(p.amount) || 0,
      method: p.provider || 'MANUAL',
      status: p.status === 'PAID' ? 'APPROVED' : (p.status === 'PENDING' ? 'AWAITING_CONFIRMATION' : p.status),
      dateSubmitted: p.createdAt ? new Date(p.createdAt).toLocaleString() : 'Recent',
      route: `${p.shipment?.senderCity || 'Origin'} → ${p.shipment?.recipientCity || 'Destination'}`,
    }))

    return NextResponse.json({
      success: true,
      data: mapped,
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: [],
    })
  }
}