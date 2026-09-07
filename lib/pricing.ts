export const DIMENSIONAL_DIVISOR = 5000 // IATA standard cm3/kg

export interface QuoteInput {
  fromCountry: string
  fromCity?: string
  toCountry: string
  toCity?: string
  weight: number // kg
  length?: number // cm
  width?: number // cm
  height?: number // cm
  packageCount?: number
  serviceType: string
  declaredValue?: number
  requiresSignature?: boolean
  requiresInsurance?: boolean
  isSaturdayDelivery?: boolean
  isResidential?: boolean
}

export interface QuoteResult {
  baseRate: number
  actualWeight: number
  dimensionalWeight: number
  chargeableWeight: number
  fuelSurcharge: number
  insuranceFee: number
  residentialFee: number
  remoteFee: number
  taxAmount: number
  subtotal: number
  totalAmount: number
  currency: string
  estimatedDays: number
  estimatedDeliveryDate: string
}

export function calculateDimensionalWeight(length = 0, width = 0, height = 0, divisor = DIMENSIONAL_DIVISOR): number {
  if (!length || !width || !height) return 0
  return Number(((length * width * height) / divisor).toFixed(3))
}

export function calculateChargeableWeight(actualWeight: number, dimWeight: number): number {
  return Math.max(actualWeight, dimWeight)
}

export function calculateShippingRate(input: QuoteInput): QuoteResult {
  const actualWeight = Math.max(input.weight, 0.1)
  const dimWeight = calculateDimensionalWeight(input.length, input.width, input.height)
  const chargeableWeight = calculateChargeableWeight(actualWeight, dimWeight)

  const isDomestic = input.fromCountry.toUpperCase() === input.toCountry.toUpperCase()

  // Base rates by service type
  let baseRatePerKg = 12.50
  let transitDays = 3

  switch (input.serviceType) {
    case 'SAME_DAY':
      baseRatePerKg = isDomestic ? 35.00 : 75.00
      transitDays = 0
      break
    case 'NEXT_DAY':
      baseRatePerKg = isDomestic ? 22.00 : 55.00
      transitDays = 1
      break
    case 'EXPRESS':
      baseRatePerKg = isDomestic ? 16.00 : 40.00
      transitDays = 2
      break
    case 'PRIORITY':
      baseRatePerKg = isDomestic ? 13.00 : 32.00
      transitDays = 3
      break
    case 'STANDARD':
      baseRatePerKg = isDomestic ? 8.50 : 20.00
      transitDays = 5
      break
    case 'INTERNATIONAL_EXPRESS':
      baseRatePerKg = 45.00
      transitDays = 2
      break
    case 'INTERNATIONAL_STANDARD':
      baseRatePerKg = 24.00
      transitDays = 6
      break
    case 'FREIGHT':
      baseRatePerKg = 5.50
      transitDays = 7
      break
    case 'ECONOMY':
      baseRatePerKg = 6.00
      transitDays = 8
      break
    default:
      baseRatePerKg = 15.00
      transitDays = 4
  }

  const baseRate = Number((Math.max(15, chargeableWeight * baseRatePerKg)).toFixed(2))

  // Surcharges
  const fuelSurcharge = Number((baseRate * 0.125).toFixed(2)) // 12.5% fuel surcharge
  const insuranceFee = input.requiresInsurance && input.declaredValue
    ? Number(Math.max(5, input.declaredValue * 0.015).toFixed(2))
    : 0
  const residentialFee = input.isResidential ? 4.50 : 0
  const remoteFee = 0 // can be dynamic

  let subtotal = baseRate + fuelSurcharge + insuranceFee + residentialFee + remoteFee
  if (input.requiresSignature) subtotal += 3.50
  if (input.isSaturdayDelivery) subtotal += 15.00

  const taxAmount = Number((subtotal * 0.075).toFixed(2)) // 7.5% standard tax
  const totalAmount = Number((subtotal + taxAmount).toFixed(2))

  const estDate = new Date()
  estDate.setDate(estDate.getDate() + transitDays)

  return {
    baseRate,
    actualWeight,
    dimensionalWeight: dimWeight,
    chargeableWeight,
    fuelSurcharge,
    insuranceFee,
    residentialFee,
    remoteFee,
    taxAmount,
    subtotal: Number(subtotal.toFixed(2)),
    totalAmount,
    currency: 'USD',
    estimatedDays: transitDays,
    estimatedDeliveryDate: estDate.toISOString().slice(0, 10),
  }
}