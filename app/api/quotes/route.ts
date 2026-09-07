import { NextRequest, NextResponse } from 'next/server'
import { calculateShippingRate } from '@/lib/pricing'
import { quoteSchema } from '@/lib/validations/quote'
import { db } from '@/lib/db'
import { generateQuoteNumber } from '@/lib/tracking'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = quoteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid quote calculation parameters',
            details: parsed.error.format(),
          },
        },
        { status: 400 }
      )
    }

    const rateResult = calculateShippingRate({
      fromCountry: parsed.data.fromCountry,
      fromCity: parsed.data.fromCity,
      toCountry: parsed.data.toCountry,
      toCity: parsed.data.toCity,
      weight: parsed.data.weight,
      length: parsed.data.length,
      width: parsed.data.width,
      height: parsed.data.height,
      packageCount: parsed.data.packageCount,
      serviceType: parsed.data.serviceType || 'EXPRESS',
      declaredValue: parsed.data.declaredValue,
      requiresSignature: parsed.data.requiresSignature,
      requiresInsurance: parsed.data.requiresInsurance,
      isSaturdayDelivery: parsed.data.isSaturdayDelivery,
      isResidential: parsed.data.isResidential,
    })

    // Store quote in database for conversion tracking
    const quoteNumber = generateQuoteNumber()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 14) // valid for 14 days

    const quoteRecord = await db.quote.create({
      data: {
        quoteNumber,
        fromCountry: parsed.data.fromCountry,
        fromCity: parsed.data.fromCity || 'N/A',
        toCountry: parsed.data.toCountry,
        toCity: parsed.data.toCity || 'N/A',
        weight: parsed.data.weight,
        length: parsed.data.length,
        width: parsed.data.width,
        height: parsed.data.height,
        packageType: parsed.data.packageType || 'PARCEL',
        declaredValue: parsed.data.declaredValue,
        serviceType: parsed.data.serviceType as any,
        baseRate: rateResult.baseRate,
        totalAmount: rateResult.totalAmount,
        currency: rateResult.currency,
        expiresAt,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        quoteId: quoteRecord.id,
        quoteNumber: quoteRecord.quoteNumber,
        expiresAt: quoteRecord.expiresAt,
        ...rateResult,
      },
    })
  } catch (error) {
    console.error('Quote calculation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while calculating shipping quotation',
        },
      },
      { status: 500 }
    )
  }
}