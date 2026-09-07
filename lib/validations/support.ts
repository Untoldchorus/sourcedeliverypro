import { z } from 'zod'

export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject cannot exceed 200 characters'),
  category: z.enum([
    'TRACKING',
    'BILLING',
    'DELIVERY',
    'PICKUP',
    'ACCOUNT',
    'CUSTOMS',
    'DAMAGED_GOODS',
    'LOST_PACKAGE',
    'REFUND',
    'COMPLAINT',
    'GENERAL',
  ]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  message: z
    .string()
    .min(20, 'Please provide more detail (at least 20 characters)')
    .max(5000, 'Message cannot exceed 5000 characters'),
  relatedShipment: z.string().optional(),
})

export const replyTicketSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(5000, 'Message cannot exceed 5000 characters'),
  isInternal: z.boolean().default(false),
})

export const updateTicketSchema = z.object({
  ticketId: z.string().min(1),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedToId: z.string().optional(),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type ReplyTicketInput = z.infer<typeof replyTicketSchema>
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>