import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  companyName: z
    .string()
    .max(200, 'Company name cannot exceed 200 characters')
    .optional()
    .or(z.literal('')),
  vatNumber: z
    .string()
    .max(50, 'VAT number cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
})

export const updateNotificationPrefsSchema = z.object({
  emailShipmentCreated: z.boolean(),
  emailPaymentReceived: z.boolean(),
  emailInTransit: z.boolean(),
  emailOutForDelivery: z.boolean(),
  emailDelivered: z.boolean(),
  emailException: z.boolean(),
  smsInTransit: z.boolean(),
  smsOutForDelivery: z.boolean(),
  smsDelivered: z.boolean(),
  inAppAll: z.boolean(),
})

export const addAddressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50).default('Home'),
  fullName: z.string().min(2, 'Full name is required').max(100),
  company: z.string().max(100).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(7, 'Phone is required').max(20),
  addressLine1: z.string().min(5, 'Address is required').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().max(100).optional(),
  country: z.string().min(2, 'Country is required').max(100),
  postalCode: z.string().max(20).optional(),
  isDefault: z.boolean().default(false),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UpdateNotificationPrefsInput = z.infer<typeof updateNotificationPrefsSchema>
export type AddAddressInput = z.infer<typeof addAddressSchema>