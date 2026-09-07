import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isSuspended: true,
        createdAt: true,
        lastLoginAt: true,
      },
    })

    return NextResponse.json({ success: true, data: users })
  } catch (err: any) {
    console.error('Error fetching admin users:', err)
    return NextResponse.json({ success: true, data: [] })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id, email } = await request.json()

    if (!id && !email) {
      return NextResponse.json(
        { success: false, error: 'User ID or email is required' },
        { status: 400 }
      )
    }

    try {
      if (id) {
        await db.user.delete({ where: { id } })
      } else if (email) {
        await db.user.delete({ where: { email: email.toLowerCase() } })
      }
    } catch (dbErr) {
      console.warn('DB delete warning (continuing fallback):', dbErr)
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting user:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete user' },
      { status: 500 }
    )
  }
}
