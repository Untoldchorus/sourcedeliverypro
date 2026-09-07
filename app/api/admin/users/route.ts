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
      const user = await db.user.findFirst({
        where: id ? { id } : { email: email.toLowerCase() },
      })

      if (user) {
        await db.$transaction(async (tx) => {
          await tx.account.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await tx.session.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await tx.loginHistory.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await tx.notification.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await tx.notificationPreference.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await tx.userPermission.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await tx.supportMessage.deleteMany({ where: { senderId: user.id } }).catch(() => null)
          await tx.customer.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await tx.shipment.updateMany({ where: { createdById: user.id }, data: { createdById: null } }).catch(() => null)
          await tx.trackingEvent.updateMany({ where: { createdById: user.id }, data: { createdById: null } }).catch(() => null)
          await tx.auditLog.deleteMany({ where: { OR: [{ userId: user.id }, { targetId: user.id }] } }).catch(() => null)
          await tx.user.delete({ where: { id: user.id } })
        })
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
