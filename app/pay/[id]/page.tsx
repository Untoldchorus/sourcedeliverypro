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
  Building2,
  ArrowRight,
  Package,
  MapPin,
  Clock
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
  MANUAL_PAYMENT_METHODS,
  getLocalShipments,
  saveLocalShipment
} from '@/lib/payments/manualOptions'

interface ShipmentItem {
  id: string
  trackingNumber?: string
  status?: string
  weight?: number | string
  amount?: number
  senderName?: string
  recipientName?: string
  origin?: string
  destination?: string
  serviceType?: string
  paymentTxId?: string
  paymentMethod?: string
  paymentPayer?: string
}

export default function PayPage() {
  const params = useParams()
  const router = useRouter()
  const [shipment, setShipment] = useState<ShipmentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMethodId, setSelectedMethodId] = useState<string>('zelle')
  const [payerName, setPayerName] = useState('')
  const [txId, setTxId] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const shipmentId = params?.id as string

  useEffect(() => {
    if (!shipmentId) return

    const list = getLocalShipments()
    const found = list.find((s: any) => s.id === shipmentId || s.trackingNumber === shipmentId)
    if (found) {
      setShipment(found as ShipmentItem)
      if (found.senderName) setPayerName(found.senderName)
      if (found.status === 'PAYMENT_SUBMITTED') setSubmitted(true)
    } else {
      setShipment(null)
    }
    setLoading(false)
  }, [shipmentId])

  const selectedMethod = MANUAL_PAYMENT_METHODS.find((m) => m.id === selectedMethodId) || MANUAL_PAYMENT_METHODS[0]

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldKey)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!txId.trim() || !shipment) return

    setSubmitting(true)
    setTimeout(() => {
      const updatedShipment = {
        ...shipment,
        status: 'PAYMENT_SUBMITTED',
        paymentTxId: txId.trim(),
        paymentMethod: selectedMethod.name,
        paymentPayer: payerName.trim() || shipment.senderName || 'Authorized Payer',
        paymentSubmittedAt: new Date().toISOString(),
      }
      saveLocalShipment(updatedShipment)
      setShipment(updatedShipment)
      setSubmitted(true)
      setSubmitting(false)
    }, 800)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="text-white text-center max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <h1 className="text-2xl font-bold mb-2">Shipment Not Found</h1>
          <p className="text-slate-400 text-sm">
            The shipment link provided is invalid or has expired.
          </p>
          <Button onClick={() => router.push('/')} className="mt-6 bg-[#6B2737] hover:bg-[#521b28] text-white">
            Return to Homepage
          </Button>
        </div>
      </div>
    )
  }

  const finalAmount = shipment.amount || (Number(shipment.weight) || 3.5) * 25 + 40

  if (submitted || shipment.status === 'PAYMENT_SUBMITTED') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-white">Payment Submitted!</h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            Your transaction reference <strong className="text-white font-mono">{shipment.paymentTxId || txId}</strong> via{' '}
            <strong className="text-amber-400">{shipment.paymentMethod || selectedMethod.name}</strong> has been logged.
          </p>
          
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1.5 text-left">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-bold text-amber-400">Awaiting Confirmation</span>
            </div>
            <div className="flex justify-between">
              <span>Shipment Reference:</span>
              <span className="font-mono text-white font-bold">{shipment.trackingNumber || shipment.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Settle:</span>
              <span className="font-bold text-emerald-400">{formatCurrency(finalAmount)}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Your payment is being confirmed against bank/ledger records and your official receipt and shipping label will be issued automatically.
          </p>

          <Button
            onClick={() => router.push(`/tracking?number=${shipment.trackingNumber || shipment.id}`)}
            className="w-full bg-[#6B2737] hover:bg-[#521b28] text-white font-bold h-12 text-xs"
          >
            Track Shipment Live <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
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
                Public Payment Portal
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
              1. Select Manual Payment Channel
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MANUAL_PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethodId(method.id)}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                    selectedMethodId === method.id
                      ? 'bg-[#1B2A4A] border-amber-500/60 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${selectedMethodId === method.id ? 'bg-amber-400' : 'bg-slate-600'}`} />
                  <span className="text-xs font-bold truncate">{method.name}</span>
                </button>
              ))}
            </div>

            {/* Selected Channel Info Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
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
            </div>
          </div>

          {/* Submission Form (Right side: 5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">2. Confirm Payment Details</h2>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                After transferring through <strong>{selectedMethod.name}</strong>, enter your account details and transaction ID to submit proof.
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

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={submitting || !txId.trim()}
                    className="w-full bg-[#6B2737] hover:bg-[#521b28] text-white font-bold h-11 text-xs shadow-md"
                  >
                    {submitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      'Submit Payment Proof'
                    )}
                  </Button>
                </div>
              </form>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure Manual Verification
              </div>
              <p>Receipt and dispatch documents will be available as soon as finance approves.</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
