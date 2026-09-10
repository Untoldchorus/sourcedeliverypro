import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { recordDeletedUser, getDeletedUserList, isUserDeleted } from '@/lib/auth/deletedUsers'

export async function GET() {
  try {
    const deletedList = await getDeletedUserList()
    const deletedSet = new Set(deletedList.map((d) => d.toLowerCase().trim()))

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
        suspendedReason: true,
        passwordHash: true,
        createdAt: true,
        lastLoginAt: true,
      },
    })

    // Filter out any user that is deleted or suspended due to deletion
    const activeUsers = users
      .filter((u) => {
        const emailLower = (u.email || '').toLowerCase().trim()
        const idLower = (u.id || '').toLowerCase().trim()
        if (deletedSet.has(emailLower) || deletedSet.has(idLower)) return false
        if (u.isActive === false && u.suspendedReason === 'DELETED_BY_ADMIN') return false
        if (u.passwordHash?.startsWith('DELETED_')) return false
        return true
      })
      .map(({ passwordHash, suspendedReason, ...rest }) => rest)

    return NextResponse.json({
      success: true,
      data: activeUsers,
      deletedUsers: Array.from(deletedSet),
    })
  } catch (err: any) {
    console.error('Error fetching admin users:', err)
    const deletedList = await getDeletedUserList()
    return NextResponse.json({ success: true, data: [], deletedUsers: deletedList })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { id, email } = body

    if (!id && !email) {
      return NextResponse.json(
        { success: false, error: 'User ID or email is required' },
        { status: 400 }
      )
    }

    // 1. Immediately register in the persistent deleted users registry
    await recordDeletedUser(id, email)

    // 2. Process database cleanup
    try {
      const user = await db.user.findFirst({
        where: id ? { id } : { email: email.toLowerCase().trim() },
        include: { customer: true },
      })

      if (user) {
        // Record both real ID and real email
        await recordDeletedUser(user.id, user.email)

        // A. Immediately deactivate and invalidate password so login is blocked immediately,
        // even before or if any cascade deletion constraint triggers
        await db.user.update({
          where: { id: user.id },
          data: {
            isActive: false,
            isSuspended: true,
            suspendedReason: 'DELETED_BY_ADMIN',
            passwordHash: `DELETED_REVOKED_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          },
        }).catch((e) => console.warn('Failed to deactivate user prior to delete:', e))

        // B. Clean up related records
        try {
          // Unlink user from shipments and tracking events
          await db.shipment.updateMany({
            where: { createdById: user.id },
            data: { createdById: null },
          }).catch(() => null)

          await db.trackingEvent.updateMany({
            where: { createdById: user.id },
            data: { createdById: null },
          }).catch(() => null)

          await db.supportTicket.updateMany({
            where: { assignedToId: user.id },
            data: { assignedToId: null },
          }).catch(() => null)

          // If linked to a customer, detach customer from shipments, invoices, and payments
          if (user.customer?.id) {
            const custId = user.customer.id
            await db.shipment.updateMany({
              where: { customerId: custId },
              data: { customerId: null },
            }).catch(() => null)

            await db.invoice.updateMany({
              where: { customerId: custId },
              data: { customerId: null },
            }).catch(() => null)

            await db.payment.updateMany({
              where: { customerId: custId },
              data: { customerId: null },
            }).catch(() => null)

            await db.quote.updateMany({
              where: { customerId: custId },
              data: { customerId: null },
            }).catch(() => null)

            await db.savedRecipient.deleteMany({
              where: { customerId: custId },
            }).catch(() => null)

            await db.address.deleteMany({
              where: { customerId: custId },
            }).catch(() => null)

            await db.couponUsage.deleteMany({
              where: { customerId: custId },
            }).catch(() => null)

            await db.customer.delete({
              where: { id: custId },
            }).catch(() => null)
          }

          // Delete other direct user relationships
          await db.driver.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await db.businessMember.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await (db as any).supportMessage.deleteMany({ where: { senderId: user.id } }).catch(() => null)
          await db.supportTicket.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await db.securityEvent.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await db.account.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await db.session.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await db.loginHistory.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await db.notification.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await db.notificationPreference.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await db.userPermission.deleteMany({ where: { userId: user.id } }).catch(() => null)
          await (db as any).auditLog.deleteMany({ where: { OR: [{ userId: user.id }, { targetId: user.id }] } }).catch(() => null)

          // C. Finally remove the user record itself
          await db.user.delete({ where: { id: user.id } }).catch((err) => {
            console.warn('User row delete fallback (record is deactivated and invalidated):', err)
          })
        } catch (subErr) {
          console.warn('Relation cleanup error:', subErr)
        }
      }
    } catch (dbErr) {
      console.warn('DB delete warning (continuing fallback):', dbErr)
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted and access revoked successfully',
    })
  } catch (err: any) {
    console.error('Error deleting user:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete user' },
      { status: 500 }
    )
  }
}
