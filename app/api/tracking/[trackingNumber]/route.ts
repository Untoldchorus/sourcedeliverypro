import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await params
    const cleanNumber = trackingNumber.trim().toUpperCase()

    const shipment = await db.shipment.findFirst({
      where: {
        OR: [
          { trackingNumber: { equals: cleanNumber, mode: 'insensitive' } },
          { shipmentNumber: { equals: cleanNumber, mode: 'insensitive' } },
          { id: { equals: cleanNumber, mode: 'insensitive' } },
        ],
      },
      include: {
        trackingEvents: {
          orderBy: { timestamp: 'desc' },
        },
        proofOfDelivery: true,
      },
    }).catch(() => null)

    if (!shipment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SHIPMENT_NOT_FOUND',
            message: `No shipment found for tracking number ${cleanNumber}`,
          },
        },
        { status: 404 }
      )
    }

    // Extract showMap, currentLocation, and mapQuery if stored in metadata or model
    let showMap = true
    let mapQuery: string | undefined = undefined
    let currentLocation = shipment.senderCity ? `${shipment.senderCity}, ${shipment.senderCountry || 'US'}` : undefined

    if ((shipment as any).showMap !== undefined && (shipment as any).showMap !== null) {
      showMap = Boolean((shipment as any).showMap)
    }
    if (shipment.specialInstructions) {
      try {
        if (shipment.specialInstructions.startsWith('{')) {
          const parsed = JSON.parse(shipment.specialInstructions)
          if (parsed.showMap !== undefined) showMap = Boolean(parsed.showMap)
          if (parsed.mapQuery) mapQuery = parsed.mapQuery
          if (parsed.currentLocation) currentLocation = parsed.currentLocation
        }
      } catch {}
    }

    // Public sanitized representation
    return NextResponse.json({
      success: true,
      data: {
        id: shipment.id,
        shipmentNumber: shipment.shipmentNumber,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        serviceType: shipment.serviceType,
        senderName: shipment.senderName,
        recipientName: shipment.recipientName,
        originCity: shipment.senderCity,
        originCountry: shipment.senderCountry,
        destinationCity: shipment.recipientCity,
        destinationCountry: shipment.recipientCountry,
        weight: shipment.weight,
        totalAmount: shipment.totalAmount,
        packageCount: shipment.packageCount,
        estimatedDelivery: shipment.estimatedDelivery,
        actualDelivery: shipment.actualDelivery,
        currentLocation: currentLocation || (shipment.trackingEvents?.[0]?.city) || shipment.senderCity,
        mapQuery,
        showMap,
        events: shipment.trackingEvents.map((evt) => ({
          id: evt.id,
          status: evt.status,
          description: evt.description,
          location: evt.location || evt.city,
          city: evt.city,
          country: evt.country,
          facilityName: evt.facilityName,
          timestamp: evt.timestamp,
        })),
        hasProofOfDelivery: !!shipment.proofOfDelivery,
        proofOfDelivery: shipment.proofOfDelivery
          ? {
              recipientName: shipment.proofOfDelivery.recipientName,
              deliveredAt: shipment.proofOfDelivery.deliveredAt,
              signatureUrl: shipment.proofOfDelivery.signatureUrl,
              photoUrl: shipment.proofOfDelivery.photoUrl,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Tracking API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SHIPMENT_NOT_FOUND',
          message: 'Tracking information could not be found or retrieved at this time',
        },
      },
      { status: 404 }
    )
  }
}