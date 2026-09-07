import { db } from './db'

export async function createAuditLog(params: {
  userId?: string
  targetUserId?: string
  action: string
  resource: string
  resourceId?: string
  previousValue?: unknown
  newValue?: unknown
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
}) {
  try {
    return await db.auditLog.create({
      data: {
        userId: params.userId,
        targetUserId: params.targetUserId,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        previousValue: params.previousValue ? JSON.parse(JSON.stringify(params.previousValue)) : undefined,
        newValue: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}