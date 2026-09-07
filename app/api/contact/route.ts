import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'All required fields must be supplied' } },
        { status: 400 }
      )
    }

    const submission = await db.contactSubmission.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
      },
    })

    return NextResponse.json({
      success: true,
      data: { id: submission.id, message: 'Message received. A support specialist will contact you shortly.' },
    })
  } catch (error) {
    console.error('Contact submission error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record message' } },
      { status: 500 }
    )
  }
}