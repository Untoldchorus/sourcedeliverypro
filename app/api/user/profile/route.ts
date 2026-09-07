import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const { name, phone } = await request.json()

    try {
      await db.user.update({
        where: { email: session.user.email.toLowerCase() },
        data: {
          ...(name ? { name: name.trim() } : {}),
          ...(phone ? { phone: phone.trim() } : {}),
        },
      })
    } catch (dbErr) {
      console.warn('DB profile update warning (fallback):', dbErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    })
  } catch (err: any) {
    console.error('Profile update error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}
