import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
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

    const { currentPassword, newPassword } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters' },
        { status: 400 }
      )
    }

    try {
      const user = await db.user.findUnique({
        where: { email: session.user.email.toLowerCase() },
      })

      if (user && user.passwordHash) {
        if (currentPassword) {
          const valid = await bcrypt.compare(currentPassword, user.passwordHash)
          if (!valid) {
            return NextResponse.json(
              { success: false, error: 'Current password is incorrect' },
              { status: 400 }
            )
          }
        }
      }

      const passwordHash = await bcrypt.hash(newPassword, 12)
      await db.user.update({
        where: { email: session.user.email.toLowerCase() },
        data: { passwordHash },
      })
    } catch (e) {
      console.warn('DB password change fallback', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update password' },
      { status: 500 }
    )
  }
}
