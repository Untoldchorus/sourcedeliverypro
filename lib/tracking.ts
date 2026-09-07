import { nanoid } from 'nanoid'

/**
 * Tracking number generator conforming to standard format:
 * SDP + 11 alphanumeric characters (uppercase)
 * Example: SDP8F4K92LM381
 */
export function generateTrackingNumber(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let id = 'SDP'
  for (let i = 0; i < 11; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}

export function generateShipmentNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = nanoid(5).toUpperCase()
  return `SHP-${dateStr}-${random}`
}

export function generateInvoiceNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = nanoid(5).toUpperCase()
  return `INV-${dateStr}-${random}`
}

export function generateReceiptNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = nanoid(5).toUpperCase()
  return `RCPT-${dateStr}-${random}`
}

export function generateTransactionId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = nanoid(6).toUpperCase()
  return `TXN-${dateStr}-${random}`
}

export function generateQuoteNumber(): string {
  return `QTE-${nanoid(8).toUpperCase()}`
}

export function generateTicketNumber(): string {
  return `TKT-${nanoid(8).toUpperCase()}`
}

export function generatePaymentReference(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = nanoid(6).toUpperCase()
  return `PAY-${dateStr}-${random}`
}

export function generateCustomerNumber(): string {
  return `CST-${nanoid(7).toUpperCase()}`
}

export function generatePickupNumber(): string {
  return `PKP-${nanoid(8).toUpperCase()}`
}

export function generateRouteNumber(): string {
  return `RTE-${nanoid(8).toUpperCase()}`
}

export function generateReturnNumber(): string {
  return `RTN-${nanoid(8).toUpperCase()}`
}