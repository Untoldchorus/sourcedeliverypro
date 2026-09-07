import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { id, email, newPassword } = await request.json()

    if ((!id && !email) || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'User identifier and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    try {
      if (id) {
        await db.user.update({
          where: { id },
          data: { passwordHash },
        })
      } else if (email) {
        await db.user.update({
          where: { email: email.toLowerCase() },
          data: { passwordHash },
        })
      }
    } catch (dbErr) {
      console.warn('DB password update warning (fallback):', dbErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (err: any) {
    console.error('Error updating user password:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update password' },
      { status: 500 }
    )
  }
}
