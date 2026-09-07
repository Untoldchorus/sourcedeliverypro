import { z } from 'zod'

const addressSchema = z.object({
  fullName: z.string().min(2, 'Name is required').max(100),
  company: z.string().max(100).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(7, 'Phone is required').max(20),
  addressLine1: z.string().min(5, 'Address is required').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().max(100).optional(),
  country: z.string().min(2, 'Country is required').max(100),
  postalCode: z.string().max(20).optional(),
})

export const createShipmentSchema = z.object({
  serviceType: z.enum([
    'SAME_DAY', 'NEXT_DAY', 'EXPRESS', 'PRIORITY', 'STANDARD',
    'INTERNATIONAL_EXPRESS', 'INTERNATIONAL_STANDARD', 'FREIGHT', 'ECONOMY'
  ]),

  sender: addressSchema,
  recipient: addressSchema.extend({
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().max(20).optional(),
  }),

  // Package details
  weight: z.coerce.number().min(0.01, 'Weight must be greater than 0').max(500, 'Weight cannot exceed 500kg'),
  length: z.coerce.number().min(1).max(500).optional(),
  width: z.coerce.number().min(1).max(500).optional(),
  height: z.coerce.number().min(1).max(500).optional(),
  packageCount: z.coerce.number().int().min(1).max(100).default(1),
  packageType: z.enum(['PARCEL', 'DOCUMENT', 'ENVELOPE', 'PALLET', 'CRATE', 'TUBE']).default('PARCEL'),
  contents: z.string().max(500).optional(),
  declaredValue: z.coerce.number().min(0).max(100000).optional(),

  // Options
  requiresSignature: z.boolean().default(false),
  requiresInsurance: z.boolean().default(false),
  isSaturdayDelivery: z.boolean().default(false),
  isResidential: z.boolean().default(false),
  hasPickupService: z.boolean().default(false),
  isFrangile: z.boolean().default(false),
  isDangerousGoods: z.boolean().default(false),
  specialInstructions: z.string().max(500).optional(),

  couponCode: z.string().max(20).optional(),
})

export const shipmentSchema = z.object({
  senderName: z.string().min(2),
  senderCompany: z.string().optional(),
  senderEmail: z.string().email().optional().or(z.literal('')),
  senderPhone: z.string().min(7),
  senderAddressLine1: z.string().min(5),
  senderAddressLine2: z.string().optional(),
  senderCity: z.string().min(2),
  senderState: z.string().optional(),
  senderCountry: z.string().min(2),
  senderPostalCode: z.string().optional(),

  recipientName: z.string().min(2),
  recipientCompany: z.string().optional(),
  recipientEmail: z.string().email().optional().or(z.literal('')),
  recipientPhone: z.string().optional(),
  recipientAddressLine1: z.string().min(5),
  recipientAddressLine2: z.string().optional(),
  recipientCity: z.string().min(2),
  recipientState: z.string().optional(),
  recipientCountry: z.string().min(2),
  recipientPostalCode: z.string().optional(),

  weight: z.coerce.number().min(0.01),
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  packageCount: z.coerce.number().int().default(1),
  packageType: z.string().default('PARCEL'),
  contents: z.string().optional(),
  declaredValue: z.coerce.number().optional(),
  serviceType: z.string().default('EXPRESS'),

  requiresSignature: z.boolean().default(false),
  requiresInsurance: z.boolean().default(false),
  isSaturdayDelivery: z.boolean().default(false),
  isResidential: z.boolean().default(false),
  hasPickupService: z.boolean().default(false),
  isFrangile: z.boolean().default(false),
  isDangerousGoods: z.boolean().default(false),
  specialInstructions: z.string().optional(),
})

export const updateShipmentStatusSchema = z.object({
  shipmentId: z.string().min(1),
  status: z.enum([
    'DRAFT', 'PENDING_PAYMENT', 'PAYMENT_FAILED', 'LABEL_CREATED',
    'PICKUP_SCHEDULED', 'PICKED_UP', 'PROCESSING', 'IN_TRANSIT',
    'ARRIVED_AT_FACILITY', 'DEPARTED_FACILITY', 'CUSTOMS_CLEARANCE',
    'CUSTOMS_HOLD', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION',
    'RETURNED', 'CANCELLED'
  ]),
  description: z.string().min(5, 'Description is required').max(500),
  location: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  facilityId: z.string().optional(),
})

export const cancelShipmentSchema = z.object({
  shipmentId: z.string().min(1),
  reason: z.string().min(10, 'Please provide a reason for cancellation').max(500),
})

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>
export type UpdateShipmentStatusInput = z.infer<typeof updateShipmentStatusSchema>
export type CancelShipmentInput = z.infer<typeof cancelShipmentSchema>