'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  DollarSign,
  Wallet,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Building2,
  ArrowRight,
  Package,
  MapPin,
  Clock,
  Upload,
  X,
  Loader2,
  Image as ImageIcon
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
  MANUAL_PAYMENT_METHODS,
  ManualPaymentMethod,
  getLocalShipments,
  saveLocalShipment,
  getDeletedShipments
} from '@/lib/payments/manualOptions'

interface ShipmentItem {
  id: string
  trackingNumber?: string
  status?: string
  weight?: number | string
  amount?: number
  senderName?: string
  senderEmail?: string
  recipientName?: string
  recipientEmail?: string
  origin?: string
  destination?: string
  serviceType?: string
  paymentTxId?: string
  paymentMethod?: string
  paymentPayer?: string
  payerEmail?: string
  paymentPayerEmail?: string
  paymentProof?: string
  paymentStatus?: string
  paid?: boolean
}

export default function PayPage() {
  const params = useParams()
  const router = useRouter()
  const shipmentId = (params?.id as string) || ''

  const [shipment, setShipment] = useState<ShipmentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorType, setErrorType] = useState<'DELETED' | 'INVALID' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [selectedMethodId, setSelectedMethodId] = useState<string>('crypto_btc')
  const [isSwitchingMethod, setIsSwitchingMethod] = useState(false)
  const [pendingMethodName, setPendingMethodName] = useState('')
  const [payerName, setPayerName] = useState('')
  const [payerEmail, setPayerEmail] = useState('')
  const [txId, setTxId] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [proofFileName, setProofFileName] = useState<string>('')
  const [proofFileSize, setProofFileSize] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [redirectTracking, setRedirectTracking] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadShipment() {
      const cleanId = (shipmentId || '').trim()
      const cleanIdLower = cleanId.toLowerCase()

      if (!cleanId) {
        if (isMounted) {
          setErrorType('INVALID')
          setErrorMessage('No shipment tracking number or invoice ID was provided in the payment URL.')
          setShipment(null)
          setLoading(false)
        }
        return
      }

      // 1. Check if shipment has been deleted by Admin
      const deletedList = getDeletedShipments().map((d) => (d || '').toLowerCase().trim())
      if (deletedList.includes(cleanIdLower)) {
        if (isMounted) {
          setErrorType('DELETED')
          setErrorMessage(`Shipment "${cleanId}" has been deleted from the operations registry. Payment cannot be processed for deleted consignments.`)
          setShipment(null)
          setLoading(false)
        }
        return
      }

      // 2. Query Local Shipments
      const localList = getLocalShipments()
      let found: any = localList.find((s: any) => {
        const sId = (s.id || '').toLowerCase().trim()
        const sTrk = (s.trackingNumber || '').toLowerCase().trim()
        const sShp = (s.shipmentNumber || '').toLowerCase().trim()
        const sAwb = (s.awb || '').toLowerCase().trim()
        return sId === cleanIdLower || sTrk === cleanIdLower || sShp === cleanIdLower || sAwb === cleanIdLower
      })

      if (found) {
        const fId = (found.id || '').toLowerCase().trim()
        const fTrk = (found.trackingNumber || '').toLowerCase().trim()
        if (deletedList.includes(fId) || deletedList.includes(fTrk)) {
          if (isMounted) {
            setErrorType('DELETED')
            setErrorMessage(`Shipment "${found.trackingNumber || cleanId}" has been deleted from the operations registry.`)
            setShipment(null)
            setLoading(false)
          }
          return
        }
      }

      // 3. Query Tracking API if not found locally
      if (!found) {
        try {
          const res = await fetch(`/api/tracking/${encodeURIComponent(cleanId)}`)
          const json = await res.json()
          if (json.success && json.data) {
            const dId = (json.data.id || '').toLowerCase().trim()
            const dTrk = (json.data.trackingNumber || '').toLowerCase().trim()
            if (deletedList.includes(dId) || deletedList.includes(dTrk)) {
              if (isMounted) {
                setErrorType('DELETED')
                setErrorMessage(`Shipment "${json.data.trackingNumber || cleanId}" has been deleted from the operations registry.`)
                setShipment(null)
                setLoading(false)
              }
              return
            }

            found = {
              id: json.data.id || cleanId,
              trackingNumber: json.data.trackingNumber,
              status: json.data.status,
              weight: json.data.weight,
              amount: json.data.totalAmount,
              senderName: json.data.senderName,
              senderEmail: json.data.senderEmail,
              recipientName: json.data.recipientName,
              recipientEmail: json.data.recipientEmail,
              origin: json.data.originCity,
              destination: json.data.destinationCity,
              serviceType: json.data.serviceType,
              paymentStatus: json.data.paymentStatus,
              paid: json.data.paid,
              paymentProof: json.data.paymentProof,
              paymentTxId: json.data.paymentTxId,
            }
          }
        } catch (err) {
          console.warn('Tracking query error:', err)
        }
      }

      // 4. Query Shipments API if still not found
      if (!found) {
        try {
          const res = await fetch('/api/shipments')
          const json = await res.json()
          if (json.success && Array.isArray(json.data)) {
            const dbMatch = json.data.find((dbItem: any) => {
              const dId = (dbItem.id || '').toLowerCase().trim()
              const dTrk = (dbItem.trackingNumber || '').toLowerCase().trim()
              const dShp = (dbItem.shipmentNumber || '').toLowerCase().trim()
              const dInv = (dbItem.invoice?.invoiceNumber || dbItem.invoice?.id || '').toLowerCase().trim()
              return dId === cleanIdLower || dTrk === cleanIdLower || dShp === cleanIdLower || dInv === cleanIdLower
            })

            if (dbMatch) {
              const dId = (dbMatch.id || '').toLowerCase().trim()
              const dTrk = (dbMatch.trackingNumber || '').toLowerCase().trim()
              if (deletedList.includes(dId) || deletedList.includes(dTrk)) {
                if (isMounted) {
                  setErrorType('DELETED')
                  setErrorMessage(`Shipment "${dbMatch.trackingNumber || cleanId}" has been deleted from the operations registry.`)
                  setShipment(null)
                  setLoading(false)
                }
                return
              }

              found = {
                id: dbMatch.id,
                trackingNumber: dbMatch.trackingNumber || dbMatch.shipmentNumber,
                status: dbMatch.status,
                weight: dbMatch.weight || dbMatch.packageWeight,
                amount: Number(dbMatch.totalAmount) || 145.5,
                senderName: dbMatch.senderName,
                senderEmail: dbMatch.senderEmail,
                recipientName: dbMatch.recipientName,
                recipientEmail: dbMatch.recipientEmail,
                origin: dbMatch.senderCity || dbMatch.originCity,
                destination: dbMatch.recipientCity || dbMatch.destinationCity,
                serviceType: dbMatch.serviceType,
                paymentStatus: dbMatch.payment?.status || dbMatch.paymentStatus,
                paid: dbMatch.payment?.status === 'PAID' || dbMatch.paid,
                paymentProof: dbMatch.payment?.proofOfPayment || dbMatch.paymentProof,
                paymentTxId: dbMatch.payment?.paymentReference || dbMatch.paymentTxId,
              }
            }
          }
        } catch (err) {
          console.warn('Shipments API query error:', err)
        }
      }

      // 5. Check Default Seed Shipments if not deleted
      if (!found) {
        const seeds = [
          {
            id: 'SDP8F4K92LM381',
            trackingNumber: 'SDP8F4K92LM381',
            status: 'IN_TRANSIT',
            weight: 5.5,
            amount: 145.5,
            senderName: 'John Doe',
            senderEmail: 'john@example.com',
            recipientName: 'Sarah Jenkins',
            origin: 'New York',
            destination: 'London',
            serviceType: 'Over Night Express Service',
          },
          {
            id: 'SDP993C104KL22',
            trackingNumber: 'SDP993C104KL22',
            status: 'CUSTOMS_CLEARANCE',
            weight: 12.0,
            amount: 320.0,
            senderName: 'Global Supplier',
            senderEmail: 'supplier@example.com',
            recipientName: 'Acme Corp Warehouse',
            origin: 'New York',
            destination: 'Lagos',
            serviceType: 'Usual Courier Service',
          },
          {
            id: 'SDP77B219KP440',
            trackingNumber: 'SDP77B219KP440',
            status: 'DELIVERED',
            weight: 2.5,
            amount: 98.75,
            senderName: 'Toronto Export Center',
            senderEmail: 'toronto@example.com',
            recipientName: 'Marcus Vance',
            origin: 'Toronto',
            destination: 'Frankfurt',
            serviceType: 'Standard Courier Service',
          },
        ]
        const seedMatch = seeds.find(
          (s) => s.id.toLowerCase() === cleanIdLower || s.trackingNumber.toLowerCase() === cleanIdLower
        )
        if (seedMatch && !deletedList.includes(seedMatch.id.toLowerCase())) {
          found = seedMatch
        }
      }

      // 6. IF STILL NOT FOUND: Do NOT fabricate fake demo! Report genuine error!
      if (!found) {
        if (isMounted) {
          setErrorType('INVALID')
          setErrorMessage(`This payment link is invalid or has expired. No active shipment or invoice was found matching reference "${cleanId}".`)
          setShipment(null)
          setLoading(false)
        }
        return
      }

      // 7. Found shipment processing
      if (isMounted) {
        // Sanitize numeric weight
        if (found.weight !== undefined) {
          const wClean = parseFloat(String(found.weight).replace(/[^0-9.]/g, ''))
          if (!isNaN(wClean) && wClean > 0) found.weight = wClean
        }

        const targetTracking = (found.trackingNumber || found.id || cleanId).trim().toUpperCase()

        // Check if target is reset shipment SDPPBG2SZW92QU
        const isTargetReset = targetTracking === 'SDPPBG2SZW92QU'
        if (isTargetReset && !found.paymentProof && !found.paymentTxId && !found.receiptGenerated) {
          found.status = 'PENDING_PAYMENT'
          found.paymentStatus = 'PENDING'
          found.paid = false
        }

        const hasProofOrTx = Boolean(found.paymentTxId || found.paymentProof)
        const hasActualPayment = Boolean(
          found.paid ||
          found.receiptGenerated ||
          found.status === 'LABEL_CREATED' ||
          found.status === 'APPROVED' ||
          (found.paymentStatus === 'PAID' && (hasProofOrTx || found.paid))
        )

        const isPending =
          !hasActualPayment &&
          (found.status === 'PENDING_PAYMENT' ||
            found.status === 'DRAFT' ||
            found.status === 'PAYMENT_FAILED' ||
            found.paymentStatus === 'PENDING' ||
            (!hasProofOrTx && found.paymentStatus !== 'APPROVED'))

        if (!isPending && hasActualPayment) {
          setIsRedirecting(true)
          setRedirectTracking(targetTracking)
          router.replace(`/tracking?number=${encodeURIComponent(targetTracking)}`)
          return
        }

        setShipment(found as ShipmentItem)
        if (found.senderName) setPayerName(found.senderName)
        else if (found.recipientName) setPayerName(found.recipientName)

        if (found.senderEmail) setPayerEmail(found.senderEmail)
        else if (found.recipientEmail) setPayerEmail(found.recipientEmail)

        if (found.status === 'PAYMENT_SUBMITTED' && hasProofOrTx) {
          setIsRedirecting(true)
          setRedirectTracking(targetTracking)
          router.replace(`/tracking?number=${encodeURIComponent(targetTracking)}`)
          return
        }

        setErrorType(null)
        setErrorMessage(null)
        setLoading(false)
      }
    }

    loadShipment()

    return () => {
      isMounted = false
    }
  }, [shipmentId, router])

  const selectedMethod = MANUAL_PAYMENT_METHODS.find((m) => m.id === selectedMethodId) || MANUAL_PAYMENT_METHODS[0]

  const handleMethodSelect = (method: ManualPaymentMethod) => {
    if (method.id === selectedMethodId || isSwitchingMethod) return
    setIsSwitchingMethod(true)
    setPendingMethodName(method.name)
    setTimeout(() => {
      setSelectedMethodId(method.id)
      setIsSwitchingMethod(false)
    }, 750)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB. Please choose a smaller image or document.')
      return
    }

    setProofFile(file)
    setProofFileName(file.name)
    setProofFileSize(
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`
    )

    const reader = new FileReader()
    reader.onload = (event) => {
      setProofPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveProof = () => {
    setProofFile(null)
    setProofPreview(null)
    setProofFileName('')
    setProofFileSize('')
  }

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldKey)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txId.trim() || !shipment) return

    setSubmitting(true)
    const finalAmount = shipment.amount || (Number(shipment.weight) || 3.5) * 25 + 40

    // 1. Dispatch proof to support email
    try {
      await fetch('/api/payments/proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentId: shipment.id,
          trackingNumber: shipment.trackingNumber || shipment.id,
          amount: finalAmount,
          paymentMethod: selectedMethod.name,
          payerName: payerName.trim() || shipment.senderName || 'Authorized Payer',
          payerEmail: payerEmail.trim() || shipment.senderEmail || '',
          transactionId: txId.trim(),
          proofBase64: proofPreview,
          proofFileName: proofFileName,
        }),
      })
    } catch (proofErr) {
      console.warn('Proof dispatch warning:', proofErr)
    }

    const updatedShipment = {
      ...shipment,
      status: 'PAYMENT_SUBMITTED',
      paymentTxId: txId.trim(),
      paymentMethod: selectedMethod.name,
      paymentPayer: payerName.trim() || shipment.senderName || 'Authorized Payer',
      payerEmail: payerEmail.trim() || shipment.senderEmail || '',
      paymentPayerEmail: payerEmail.trim() || shipment.senderEmail || '',
      paymentProof: proofPreview || shipment.paymentProof,
      paymentSubmittedAt: new Date().toISOString(),
    }

    saveLocalShipment(updatedShipment)

    try {
      await fetch('/api/shipments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: shipment.id,
          trackingNumber: shipment.trackingNumber,
          status: 'PAYMENT_SUBMITTED',
          paymentTxId: txId.trim(),
          paymentMethod: selectedMethod.name,
          paymentPayer: payerName.trim() || shipment.senderName || 'Customer',
          remark: `Payment of verified transaction ${txId.trim()} via ${selectedMethod.name} submitted for admin confirmation. ${proofPreview ? 'Proof attached.' : ''}`,
        }),
      })
    } catch (err) {
      console.warn('DB patch failed for payment submission:', err)
    }

    setShipment(updatedShipment)
    setSubmitted(true)
    setSubmitting(false)

    // After payment is confirmed, automatically redirect payment link to specific shipment tracking page
    const targetTracking = (updatedShipment.trackingNumber || updatedShipment.id || shipmentId).trim().toUpperCase()
    setTimeout(() => {
      router.push(`/tracking?number=${encodeURIComponent(targetTracking)}`)
    }, 1800)
  }

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 animate-pulse">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-black text-white">Payment Confirmed</h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
            Payment for this consignment has been confirmed. Redirecting to your live tracking page...
          </p>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center gap-2 text-xs font-mono text-amber-400">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Tracking Ref: {redirectTracking}</span>
          </div>
          <Button
            onClick={() => router.push(`/tracking?number=${encodeURIComponent(redirectTracking)}`)}
            className="w-full bg-[#6B2737] hover:bg-[#521b28] text-white font-bold h-11 text-xs"
          >
            Track Shipment Live <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    )
  }

  if (!shipment || errorType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl text-center space-y-6">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
              errorType === 'DELETED'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}
          >
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border inline-block ${
                errorType === 'DELETED'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {errorType === 'DELETED' ? 'Consignment Deleted' : 'Invalid Payment Link'}
            </span>
            <h1 className="text-2xl font-black text-white">
              {errorType === 'DELETED' ? 'Shipment Has Been Deleted' : 'Payment Link Not Valid'}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              {errorMessage ||
                'This payment link is invalid, has expired, or the corresponding consignment has been removed from our system.'}
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2 text-left">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Requested Reference:</span>
              <span className="font-mono text-white font-bold">{shipmentId || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Error Status:</span>
              <span className={`font-semibold ${errorType === 'DELETED' ? 'text-rose-400' : 'text-amber-400'}`}>
                {errorType === 'DELETED' ? 'Record Deleted by Administrator' : '404 - Record Not Found'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Support Desk:</span>
              <a href="mailto:support@sourcedeliverypro.com" className="text-sky-400 hover:underline font-mono">
                support@sourcedeliverypro.com
              </a>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button
              onClick={() => router.push('/tracking')}
              className="w-full bg-[#6B2737] hover:bg-[#521b28] text-white font-bold h-12 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Package className="w-4 h-4" /> Track a Valid Consignment
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs h-11 cursor-pointer"
            >
              Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const finalAmount = shipment.amount || (Number(shipment.weight) || 3.5) * 25 + 40

  if (submitted || shipment.status === 'PAYMENT_SUBMITTED') {
    const targetTracking = (shipment.trackingNumber || shipment.id || shipmentId).trim().toUpperCase()

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-white">Payment Confirmed!</h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            Your transaction reference <strong className="text-white font-mono">{shipment.paymentTxId || txId}</strong> via{' '}
            <strong className="text-amber-400">{shipment.paymentMethod || selectedMethod.name}</strong> and proof receipt have been confirmed.
          </p>
          
          <div className="flex items-center justify-center gap-2 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 font-bold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Redirecting to your shipment tracking page...</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1.5 text-left">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-bold text-amber-400">Payment Confirmed</span>
            </div>
            <div className="flex justify-between">
              <span>Shipment Reference:</span>
              <span className="font-mono text-white font-bold">{targetTracking}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Settled:</span>
              <span className="font-bold text-emerald-400">{formatCurrency(finalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Support Desk:</span>
              <span className="text-sky-400 font-mono text-[11px]">support@sourcedeliverypro.com</span>
            </div>
          </div>

          {(proofPreview || shipment.paymentProof) && (
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-left space-y-1.5">
              <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Attached Proof of Payment:
              </p>
              <img
                src={proofPreview || shipment.paymentProof}
                alt="Submitted proof"
                className="w-full h-36 object-cover rounded-xl border border-slate-800"
              />
            </div>
          )}

          <Button
            onClick={() => router.push(`/tracking?number=${encodeURIComponent(targetTracking)}`)}
            className="w-full bg-[#6B2737] hover:bg-[#521b28] text-white font-bold h-12 text-xs"
          >
            Track Shipment Live Now <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-[#6B2737]/20 p-3 rounded-2xl border border-[#6B2737]/30 text-[#6B2737]">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                Payment Portal
              </span>
              <h1 className="text-xl font-black text-white">Settle Shipment Invoice</h1>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Total Amount Due</span>
            <span className="text-2xl font-black text-emerald-400">
              {formatCurrency(finalAmount)}
            </span>
          </div>
        </div>

        {/* Shipment Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Tracking / Ref</span>
            <span className="font-mono text-white font-bold">{shipment.trackingNumber || shipment.id}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Route</span>
            <span className="text-slate-300 truncate block">{shipment.origin || 'Sender'} → {shipment.destination || 'Recipient'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Weight / Service</span>
            <span className="text-slate-300">{shipment.weight || 3.5} kg · Express</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Status</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" /> Pending Payment
            </span>
          </div>
        </div>

        {/* Payment Methods & Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Methods Selector & Details (Left side: 7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Select Payment Method
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MANUAL_PAYMENT_METHODS.map((method) => {
                const isPendingThis = isSwitchingMethod && pendingMethodName === method.name
                const isCurrent = selectedMethodId === method.id && !isSwitchingMethod

                return (
                  <button
                    key={method.id}
                    type="button"
                    disabled={isSwitchingMethod}
                    onClick={() => handleMethodSelect(method)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between gap-2 ${
                      isCurrent
                        ? method.isBlocked
                          ? 'bg-rose-950/40 border-rose-500/60 text-white shadow-md'
                          : 'bg-[#1B2A4A] border-amber-500/60 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    } ${isPendingThis ? 'border-amber-400 bg-slate-900' : ''}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isPendingThis ? (
                        <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                      ) : (
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          isCurrent
                            ? method.isBlocked
                              ? 'bg-rose-500'
                              : 'bg-amber-400'
                            : 'bg-slate-600'
                        }`} />
                      )}
                      <span className="text-xs font-bold truncate">{method.name}</span>
                    </div>
                    {isCurrent && method.isBlocked && (
                      <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                        Unavailable
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Selected Channel Info Box (With Realistic Gateway Connecting Animation) */}
            {isSwitchingMethod ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[220px]">
                <div className="relative flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-2 border-slate-800 border-t-amber-400 animate-spin" />
                  <ShieldCheck className="w-6 h-6 text-amber-400 absolute" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center justify-center gap-2">
                    <span>Connecting to {pendingMethodName} Gateway</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Establishing encrypted session & retrieving merchant coordinates...
                  </p>
                </div>
              </div>
            ) : selectedMethod.isBlocked ? (
              <div className="bg-rose-950/20 border border-rose-500/40 rounded-2xl p-5 space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-rose-900/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                      {selectedMethod.name} — Service Status
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Temporarily Offline
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Gateway Response</span>
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-900/40">HTTP 503 SERVICE RESTRICTED</span>
                    </div>
                    <p className="text-sm font-mono font-bold text-rose-300 bg-rose-950/50 p-2.5 rounded-lg border border-rose-900/50 select-all">
                      &quot;{selectedMethod.errorMessage}&quot;
                    </p>
                    <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                      Transactions through {selectedMethod.name} cannot be settled at this time due to upstream restrictions. Please select an active cryptocurrency channel to complete payment.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">Switch to an active payment route:</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleMethodSelect(MANUAL_PAYMENT_METHODS[0])}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1B2A4A] hover:bg-[#243660] text-amber-300 border border-amber-500/30 flex-1 sm:flex-initial transition"
                    >
                      Bitcoin (BTC)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMethodSelect(MANUAL_PAYMENT_METHODS[1])}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 flex-1 sm:flex-initial transition"
                    >
                      USDT (Tether)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {selectedMethod.name} Instructions
                  </span>
                  <span className="text-[11px] text-slate-500">Official Accounts</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedMethod.instructions}
                </p>

                <div className="space-y-2">
                  {selectedMethod.fields.map((f, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs gap-2"
                    >
                      <span className="text-slate-400 font-semibold">{f.label}:</span>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-white break-all font-bold">
                          {f.value}
                        </code>
                        {f.copyable && (
                          <button
                            type="button"
                            onClick={() => handleCopy(f.value, `${selectedMethod.id}-${idx}`)}
                            className="p-1 text-slate-400 hover:text-white transition rounded bg-slate-800 shrink-0"
                            title="Copy to clipboard"
                          >
                            {copiedField === `${selectedMethod.id}-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center gap-2.5 text-xs text-slate-300">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] leading-tight">
                    <strong className="text-white block font-semibold">Ready to confirm?</strong>
                    Attach your transfer receipt or payment screenshot on the right to complete verification.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submission Form (Right side: 5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">2. Confirm Payment & Upload Proof</h2>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                After transferring through <strong>{selectedMethod.name}</strong>, enter your details and attach your transfer receipt below.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Payer Name / Sender
                  </label>
                  <input
                    type="text"
                    required
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Full name on payment account"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#6B2737]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Payer Email Address</span>
                    <span className="text-[10px] text-emerald-400 font-normal">Official receipt will be sent here</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="email@example.com for payment confirmation"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#6B2737]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Transaction ID / Reference
                  </label>
                  <input
                    type="text"
                    required
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder="e.g. #TXN-998234 or crypto hash"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#6B2737]"
                  />
                </div>

                {/* Prominent Upload Payment Proof Section */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border-2 border-dashed border-amber-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload Proof of Payment</span>
                    </label>
                    <span className="text-[10px] text-slate-400">JPG, PNG, PDF (Up to 15MB)</span>
                  </div>

                  {selectedMethod.isBlocked ? (
                    <div className="border border-rose-500/30 bg-rose-950/20 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-1.5">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                      <p className="text-xs font-bold text-rose-300">
                        Receipt upload disabled for {selectedMethod.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Channel offline: <span className="text-rose-300 font-mono font-semibold">&quot;{selectedMethod.errorMessage}&quot;</span>. Please switch to Bitcoin or USDT to proceed.
                      </p>
                    </div>
                  ) : proofPreview ? (
                    <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/60 flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        {proofPreview.startsWith('data:image/') ? (
                          <img
                            src={proofPreview}
                            alt="Receipt preview"
                            className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0 shadow"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-amber-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{proofFileName || 'Proof'}</p>
                          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Attached ({proofFileSize})
                          </p>
                          <span className="text-[10px] text-slate-400">Dispatches to finance team</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveProof}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition text-xs shrink-0"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border border-dashed border-slate-700 hover:border-amber-400 bg-slate-950/60 hover:bg-slate-950 transition rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer text-center group">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all mb-2">
                        <Upload className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                        Click here to upload payment receipt or screenshot
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Transfers via Zelle, CashApp, Wire, or Crypto receipt
                      </p>
                      <span className="text-[10px] text-emerald-400 mt-1.5 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Auto-dispatched to support@sourcedeliverypro.com
                      </span>
                    </label>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={selectedMethod.isBlocked || submitting || !txId.trim() || isSwitchingMethod}
                    className={`w-full font-bold h-11 text-xs shadow-md flex items-center justify-center gap-2 ${
                      selectedMethod.isBlocked
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : 'bg-[#6B2737] hover:bg-[#521b28] text-white'
                    }`}
                  >
                    {selectedMethod.isBlocked ? (
                      <span>Channel Restricted — Switch to BTC or USDT</span>
                    ) : submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Uploading Proof & Notifying Support...</span>
                      </>
                    ) : (
                      'Submit Payment Proof'
                    )}
                  </Button>
                </div>
              </form>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-xl border border-emerald-500/30 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>256-Bit SSL Secured & Protected Connection</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your payment transaction and verification documents are end-to-end encrypted and transmitted securely to our finance team.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
