import { db } from './db'
import { NotificationType } from '@prisma/client'

export async function createNotification(params: {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  data?: Record<string, unknown>
}) {
  try {
    return await db.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        data: params.data ? JSON.parse(JSON.stringify(params.data)) : undefined,
      },
    })
  } catch (error) {
    console.error('Failed to create in-app notification:', error)
  }
}