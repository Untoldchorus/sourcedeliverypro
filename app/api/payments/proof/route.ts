import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendPaymentProofNotificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      shipmentId,
      trackingNumber,
      amount = 0,
      paymentMethod = 'Manual Transfer',
      payerName = 'Customer',
      transactionId = '',
      proofBase64,
      proofFileName,
      notes,
    } = body

    if (!trackingNumber && !shipmentId) {
      return NextResponse.json(
        { success: false, error: 'Tracking number or shipment ID is required' },
        { status: 400 }
      )
    }

    const refNumber = trackingNumber || shipmentId

    // 1. Try updating database if available
    try {
      const shipment = await db.shipment.findFirst({
        where: {
          OR: [
            { id: shipmentId || '' },
            { trackingNumber: refNumber },
          ],
        },
        include: { payment: true },
      })

      if (shipment) {
        await db.$transaction(async (tx) => {
          await tx.shipment.update({
            where: { id: shipment.id },
            data: { status: 'PENDING_PAYMENT' },
          })

          if (shipment.payment) {
            await tx.payment.update({
              where: { id: shipment.payment.id },
              data: {
                status: 'PENDING',
                paymentReference: transactionId,
                provider: paymentMethod,
                metadata: {
                  payerName,
                  proofFileName,
                  submittedAt: new Date().toISOString(),
                  notes,
                },
              },
            })
          }

          await tx.trackingEvent.create({
            data: {
              shipmentId: shipment.id,
              status: 'PENDING_PAYMENT',
              description: `Payment proof submitted via ${paymentMethod} (Ref: ${transactionId}). Under verification.`,
              city: shipment.senderCity,
              country: shipment.senderCountry,
            },
          })
        })
      }
    } catch (dbErr) {
      console.warn('[Payment Proof DB update skipped/failed]:', dbErr)
    }

    // 2. Dispatch real notification email to support with proof embedded & attached
    let emailResult = { success: true }
    try {
      emailResult = await sendPaymentProofNotificationEmail({
        trackingNumber: refNumber,
        amount: Number(amount) || 0,
        paymentMethod,
        payerName,
        transactionId,
        proofBase64,
        proofFileName,
        notes,
      })
    } catch (mailErr: any) {
      console.error('[Payment Proof Mail Error]:', mailErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment proof received and dispatched to support',
      emailDelivered: emailResult.success,
    })
  } catch (err: any) {
    console.error('[Payment Proof API Handler Error]:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error' },
      { status: 500 }
    )
  }
}
