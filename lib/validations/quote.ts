import { z } from 'zod'

export const calculateQuoteSchema = z.object({
  fromCountry: z.string().min(2, 'Origin country is required').max(100),
  fromCity: z.string().min(2, 'Origin city is required').max(100),
  toCountry: z.string().min(2, 'Destination country is required').max(100),
  toCity: z.string().min(2, 'Destination city is required').max(100),
  weight: z.coerce
    .number()
    .min(0.01, 'Weight must be at least 0.01 kg')
    .max(500, 'Maximum weight is 500 kg'),
  length: z.coerce.number().min(1).max(500).optional(),
  width: z.coerce.number().min(1).max(500).optional(),
  height: z.coerce.number().min(1).max(500).optional(),
  packageType: z
    .enum(['PARCEL', 'DOCUMENT', 'ENVELOPE', 'PALLET', 'CRATE', 'TUBE'])
    .default('PARCEL'),
  packageCount: z.coerce.number().int().min(1).max(100).default(1),
  declaredValue: z.coerce.number().min(0).max(100000).optional(),
  requiresInsurance: z.boolean().default(false),
  requiresSignature: z.boolean().default(false),
  isSaturdayDelivery: z.boolean().default(false),
  isResidential: z.boolean().default(false),
  serviceType: z
    .enum([
      'SAME_DAY', 'NEXT_DAY', 'EXPRESS', 'PRIORITY', 'STANDARD',
      'INTERNATIONAL_EXPRESS', 'INTERNATIONAL_STANDARD', 'FREIGHT', 'ECONOMY',
    ])
    .optional(),
})

export const quoteSchema = calculateQuoteSchema
export type CalculateQuoteInput = z.infer<typeof calculateQuoteSchema>