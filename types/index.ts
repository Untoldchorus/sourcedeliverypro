import type { UserRole, ShipmentStatus, ServiceType, PaymentStatus, TicketStatus, TicketPriority } from '@prisma/client'

// ===========================
// API Response Types
// ===========================

export interface ApiSuccess<T = unknown> {
  success: true
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: string
  code?: string
  fieldErrors?: Record<string, string[]>
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

// ===========================
// Auth / User Types
// ===========================

export interface SessionUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  role: UserRole
}

export interface UserBasic {
  id: string
  name: string | null
  email: string
  image: string | null
  role: UserRole
  createdAt: Date
}

export interface CustomerProfile {
  id: string
  userId: string
  customerNumber: string
  companyName: string | null
  totalShipments: number
  totalSpent: number
  loyaltyPoints: number
  user: UserBasic
}

// ===========================
// Shipment Types
// ===========================

export interface ShipmentAddress {
  fullName: string
  company?: string | null
  email?: string | null
  phone: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state?: string | null
  country: string
  postalCode?: string | null
}

export interface ShipmentListItem {
  id: string
  shipmentNumber: string
  trackingNumber: string
  status: ShipmentStatus
  serviceType: ServiceType
  senderName: string
  senderCity: string
  senderCountry: string
  recipientName: string
  recipientCity: string
  recipientCountry: string
  totalAmount: number
  currency: string
  estimatedDelivery: Date | null
  createdAt: Date
  weight: number
}

export interface ShipmentDetails extends ShipmentListItem {
  senderCompany: string | null
  senderEmail: string
  senderPhone: string
  senderAddressLine1: string
  senderAddressLine2: string | null
  senderState: string | null
  senderPostalCode: string | null
  recipientCompany: string | null
  recipientEmail: string | null
  recipientPhone: string | null
  recipientAddressLine1: string
  recipientAddressLine2: string | null
  recipientState: string | null
  recipientPostalCode: string | null
  length: number | null
  width: number | null
  height: number | null
  dimensionalWeight: number | null
  chargeableWeight: number | null
  packageCount: number
  packageType: string
  contents: string | null
  declaredValue: number | null
  isFrangile: boolean
  isDangerousGoods: boolean
  baseRate: number
  fuelSurcharge: number
  insuranceFee: number
  residentialFee: number
  remoteFee: number
  customsFee: number
  taxAmount: number
  discountAmount: number
  requiresSignature: boolean
  requiresInsurance: boolean
  specialInstructions: string | null
  labelUrl: string | null
  actualDelivery: Date | null
  updatedAt: Date
}

// ===========================
// Tracking Types
// ===========================

export interface TrackingEventItem {
  id: string
  status: ShipmentStatus
  description: string
  location: string | null
  city: string | null
  country: string | null
  facilityName: string | null
  timestamp: Date
}

export interface TrackingResult {
  trackingNumber: string
  shipmentNumber: string
  status: ShipmentStatus
  serviceType: ServiceType
  senderCity: string
  senderCountry: string
  recipientName: string
  recipientCity: string
  recipientCountry: string
  estimatedDelivery: Date | null
  actualDelivery: Date | null
  weight: number
  events: TrackingEventItem[]
}

// ===========================
// Quote / Pricing Types
// ===========================

export interface ServiceOption {
  serviceType: ServiceType
  label: string
  estimatedDays: number
  baseRate: number
  totalAmount: number
  currency: string
  features: string[]
  isRecommended?: boolean
}

// ===========================
// Payment Types
// ===========================

export interface PaymentSummary {
  id: string
  paymentReference: string
  amount: number
  currency: string
  status: PaymentStatus
  provider: string
  paidAt: Date | null
  createdAt: Date
  shipment: {
    trackingNumber: string
    shipmentNumber: string
  }
}

// ===========================
// Support Types
// ===========================

export interface TicketListItem {
  id: string
  ticketNumber: string
  subject: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  relatedShipment: string | null
  createdAt: Date
  updatedAt: Date
  _count: { messages: number }
}

export interface TicketMessage {
  id: string
  message: string
  isInternal: boolean
  isStaff: boolean
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
    role: UserRole
  }
}

// ===========================
// Dashboard Stats Types
// ===========================

export interface DashboardStats {
  totalShipments: number
  activeShipments: number
  deliveredShipments: number
  totalSpent: number
  currency: string
  openTickets: number
  loyaltyPoints: number
}

export interface AdminDashboardStats {
  totalUsers: number
  totalShipments: number
  totalRevenue: number
  activeDrivers: number
  pendingPickups: number
  openTickets: number
  todayShipments: number
  todayRevenue: number
}

// ===========================
// Navigation Types
// ===========================

export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: NavItem[]
}

// ===========================
// Table Types
// ===========================

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

// ===========================
// Form Types
// ===========================

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

// ===========================
// Status Display Types
// ===========================

export type StatusVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted'

export interface StatusConfig {
  label: string
  variant: StatusVariant
  color: string
}
