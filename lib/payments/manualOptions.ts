export interface ManualPaymentMethod {
  id: string
  name: string
  category: 'crypto' | 'zelle' | 'venmo' | 'wire' | 'paypal'
  iconName: string
  instructions: string
  fields: { label: string; value: string; copyable?: boolean }[]
}

export const MANUAL_PAYMENT_METHODS: ManualPaymentMethod[] = [
  {
    id: 'crypto_btc',
    name: 'Bitcoin (BTC)',
    category: 'crypto',
    iconName: 'Bitcoin',
    instructions: 'Send the exact USD equivalent in BTC to the wallet address below.',
    fields: [
      { label: 'Network', value: 'Bitcoin (BTC Network)' },
      { label: 'BTC Wallet Address', value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', copyable: true },
      { label: 'Memo / Note', value: 'Include your Shipment or Reference ID' },
    ],
  },
  {
    id: 'crypto_usdt',
    name: 'USDT (Tether)',
    category: 'crypto',
    iconName: 'DollarSign',
    instructions: 'Send USDT via TRC-20 (Tron) or ERC-20 (Ethereum).',
    fields: [
      { label: 'TRC-20 Address (Tron)', value: 'TX8VnL1oQWfX7hK52rPnA638gRMejB7n3J', copyable: true },
      { label: 'ERC-20 Address (Ethereum)', value: '0x71C8360f38bB32c918a24B8B9B1c905f8842149A', copyable: true },
    ],
  },
  {
    id: 'zelle',
    name: 'Zelle',
    category: 'zelle',
    iconName: 'Zap',
    instructions: 'Send instant payment via your banking app using Zelle.',
    fields: [
      { label: 'Recipient Name', value: 'SourceDeliveryPro Logistics LLC' },
      { label: 'Zelle Email / Phone', value: 'payments@sourcedeliverypro.com', copyable: true },
      { label: 'Memo', value: 'Enter Shipment ID in payment note' },
    ],
  },
  {
    id: 'venmo',
    name: 'Venmo',
    category: 'venmo',
    iconName: 'Smartphone',
    instructions: 'Send payment via Venmo app. Verification code available if prompted.',
    fields: [
      { label: 'Venmo Handle', value: '@SourceDeliveryPro', copyable: true },
      { label: 'Account Name', value: 'SourceDeliveryPro Support' },
      { label: 'Phone Last 4 Digits', value: '8291', copyable: true },
    ],
  },
  {
    id: 'wire_transfer',
    name: 'Bank Wire Transfer',
    category: 'wire',
    iconName: 'Building2',
    instructions: 'Initiate a domestic or international wire transfer via your financial institution.',
    fields: [
      { label: 'Beneficiary Name', value: 'SourceDeliveryPro Global Shipping LLC' },
      { label: 'Bank Name', value: 'JPMorgan Chase Bank, N.A.' },
      { label: 'Account Number', value: '884019284102', copyable: true },
      { label: 'Routing Number (ABA)', value: '021000021', copyable: true },
      { label: 'SWIFT / BIC Code', value: 'CHASUS33XXX', copyable: true },
      { label: 'Bank Address', value: '270 Park Ave, New York, NY 10017, USA' },
    ],
  },
  {
    id: 'paypal',
    name: 'PayPal & CashApp',
    category: 'paypal',
    iconName: 'CreditCard',
    instructions: 'Pay directly via PayPal or CashApp.',
    fields: [
      { label: 'PayPal Link', value: 'https://paypal.me/sourcedeliverypro', copyable: true },
      { label: 'PayPal Email', value: 'billing@sourcedeliverypro.com', copyable: true },
      { label: 'CashApp $Cashtag', value: '$SourceDeliveryPro', copyable: true },
    ],
  },
]

// Unified LocalStorage Shipment Helper
export function getDeletedShipments(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('sourcedeliverypro_deleted_shipments')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addDeletedShipment(idOrTracking: string) {
  if (typeof window === 'undefined' || !idOrTracking) return
  try {
    const deleted = getDeletedShipments()
    const target = idOrTracking.toLowerCase()
    if (!deleted.includes(target)) {
      deleted.push(target)
      localStorage.setItem('sourcedeliverypro_deleted_shipments', JSON.stringify(deleted))
    }
  } catch (err) {
    console.error('Failed to record deleted shipment', err)
  }
}

export function getLocalShipments(): any[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('sourcedeliverypro_admin_shipments') || localStorage.getItem('swiftship_admin_shipments')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const rawList: any[] = Array.isArray(parsed) ? parsed : Object.values(parsed)
    const deleted = getDeletedShipments()
    
    // Strictly deduplicate by id and trackingNumber and exclude deleted
    const seen = new Set<string>()
    const deduplicated: any[] = []
    for (const item of rawList) {
      if (!item) continue
      const sId = (item.id || '').toLowerCase()
      const sTrk = (item.trackingNumber || '').toLowerCase()
      if (deleted.includes(sId) || deleted.includes(sTrk)) continue

      const key = item.trackingNumber || item.id
      if (key && !seen.has(key)) {
        seen.add(key)
        if (item.id && item.id !== key) seen.add(item.id)
        if (item.trackingNumber && item.trackingNumber !== key) seen.add(item.trackingNumber)
        deduplicated.push(item)
      }
    }
    return deduplicated
  } catch {
    return []
  }
}

export function saveLocalShipment(shipment: any) {
  if (typeof window === 'undefined') return
  try {
    const existing = getLocalShipments()
    const id = shipment.id || shipment.trackingNumber
    const trk = shipment.trackingNumber || shipment.id
    const index = existing.findIndex((s) => s.id === id || s.trackingNumber === id || (trk && s.trackingNumber === trk))
    if (index >= 0) {
      existing[index] = { ...existing[index], ...shipment }
    } else {
      existing.unshift(shipment)
    }

    // Save as clean list and mapped object
    const map: Record<string, any> = {}
    existing.forEach((item) => {
      const primaryKey = item.trackingNumber || item.id
      if (primaryKey) map[primaryKey] = item
    })
    localStorage.setItem('sourcedeliverypro_admin_shipments', JSON.stringify(map))
    localStorage.setItem('swiftship_admin_shipments', JSON.stringify(map))
  } catch (err) {
    console.error('Failed to save shipment to localStorage', err)
  }
}

export function deleteLocalShipment(idOrTracking: string) {
  if (typeof window === 'undefined' || !idOrTracking) return
  try {
    const target = idOrTracking.toLowerCase()
    addDeletedShipment(idOrTracking)
    const existing = getLocalShipments().filter((s) => {
      const sId = (s.id || '').toLowerCase()
      const sTrk = (s.trackingNumber || '').toLowerCase()
      return sId !== target && sTrk !== target
    })

    const map: Record<string, any> = {}
    existing.forEach((item) => {
      const primaryKey = item.trackingNumber || item.id
      if (primaryKey) map[primaryKey] = item
    })
    localStorage.setItem('sourcedeliverypro_admin_shipments', JSON.stringify(map))
    localStorage.setItem('swiftship_admin_shipments', JSON.stringify(map))
  } catch (err) {
    console.error('Failed to delete shipment from localStorage', err)
  }
}

export function getDeletedReceipts(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('sourcedeliverypro_deleted_receipts')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addDeletedReceipt(idOrNumber: string) {
  if (typeof window === 'undefined' || !idOrNumber) return
  try {
    const deleted = getDeletedReceipts()
    const target = idOrNumber.toLowerCase()
    if (!deleted.includes(target)) {
      deleted.push(target)
      localStorage.setItem('sourcedeliverypro_deleted_receipts', JSON.stringify(deleted))
    }
  } catch (err) {
    console.error('Failed to record deleted receipt', err)
  }
}

export function getLocalReceipts(): any[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('sourcedeliverypro_admin_receipts') || localStorage.getItem('swiftship_admin_receipts')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const rawList: any[] = Array.isArray(parsed) ? parsed : Object.values(parsed)
    const deleted = getDeletedReceipts()
    
    // Deduplicate by receiptNumber or id and remove mock receipts and deleted receipts
    const seen = new Set<string>()
    const deduplicated: any[] = []
    for (const r of rawList) {
      if (!r) continue
      const rId = (r.id || '').toLowerCase()
      const rNum = (r.receiptNumber || '').toLowerCase()
      // Purge mock dummy receipts and deleted receipts
      if (rId === 'rcpt-1' || rId === 'rcpt-2' || rNum === 'rcpt-2026-89421' || rNum === 'rcpt-2026-67104') continue
      if (deleted.includes(rId) || deleted.includes(rNum)) continue

      const key = r.receiptNumber || r.id
      if (key && !seen.has(key)) {
        seen.add(key)
        deduplicated.push(r)
      }
    }
    return deduplicated
  } catch {
    return []
  }
}

export function saveLocalReceipt(receipt: any) {
  if (typeof window === 'undefined') return
  try {
    const existing = getLocalReceipts()
    const index = existing.findIndex((r) => r.id === receipt.id || r.receiptNumber === receipt.receiptNumber)
    if (index >= 0) {
      existing[index] = { ...existing[index], ...receipt }
    } else {
      existing.unshift(receipt)
    }
    localStorage.setItem('sourcedeliverypro_admin_receipts', JSON.stringify(existing))
    localStorage.setItem('swiftship_admin_receipts', JSON.stringify(existing))
  } catch (err) {
    console.error('Failed to save receipt to localStorage', err)
  }
}

export function deleteLocalReceipt(idOrNumber: string) {
  if (typeof window === 'undefined' || !idOrNumber) return
  try {
    const target = idOrNumber.toLowerCase()
    addDeletedReceipt(idOrNumber)
    const existing = getLocalReceipts().filter((r) => {
      const rId = (r.id || '').toLowerCase()
      const rNum = (r.receiptNumber || '').toLowerCase()
      return rId !== target && rNum !== target
    })
    localStorage.setItem('sourcedeliverypro_admin_receipts', JSON.stringify(existing))
    localStorage.setItem('swiftship_admin_receipts', JSON.stringify(existing))
  } catch (err) {
    console.error('Failed to delete receipt from localStorage', err)
  }
}
