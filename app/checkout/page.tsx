'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  CreditCard, ShieldCheck, CheckCircle2, AlertCircle,
  RefreshCw, ArrowRight, Lock, Clock, FileText, Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, cn } from '@/lib/utils'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const shipmentId = searchParams.get('shipmentId')
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [paymentResult, setPaymentResult] = useState<{
    transactionId: string
    receiptNumber: string
    trackingNumber: string
    status: string
  } | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState('CARD')

  if (!shipmentId) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <h1 className="text-2xl font-black text-[#1B2A4A]">No Shipment Selected</h1>
        <p className="text-xs text-slate-500">
          Please select a shipment from your dashboard or create a new shipment to proceed with payment.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <Button asChild className="bg-[#1B2A4A] text-white text-xs">
            <Link href="/dashboard/shipments">View My Shipments</Link>
          </Button>
          <Button asChild className="bg-[#6B2737] text-white text-xs">
            <Link href="/dashboard/shipments/new">Create New Shipment</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handlePay = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentId, method: selectedMethod }),
      })

      const json = await res.json()
      if (!json.success) {
        setError(json.error?.message || 'Payment processing failed. Please try again.')
      } else {
        setPaymentResult({
          transactionId: json.data.transactionId,
          receiptNumber: json.data.receiptNumber,
          trackingNumber: json.data.trackingNumber,
          status: json.data.status,
        })
      }
    } catch (err) {
      setError('Unable to reach payment gateway. Please check your network.')
    } finally {
      setLoading(false)
    }
  }

  if (paymentResult) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <Clock className="w-9 h-9" />
        </div>

        <div>
          <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
            Payment Submitted — Pending Confirmation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A4A] mt-3">
            Shipment Registered Successfully!
          </h1>
          <p className="text-slate-500 text-xs mt-2">
            Your payment is now queued for verification by SourceDeliveryPro Courier Operations.
          </p>
        </div>

        {/* Transaction Summary Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left space-y-4 shadow-sm text-xs">
          <div className="flex justify-between items-center border-b pb-3 font-semibold text-slate-400 uppercase">
            <span>Transaction Details</span>
            <span className="text-amber-600 font-bold">Awaiting Confirmation</span>
          </div>

          <div className="space-y-2.5 font-mono">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-sans">Transaction ID:</span>
              <span className="font-bold text-[#1B2A4A]">{paymentResult.transactionId}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-sans">Receipt Number:</span>
              <span className="font-bold text-[#1B2A4A]">{paymentResult.receiptNumber}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-sans">AWB / Tracking Number:</span>
              <span className="font-bold text-[#6B2737] text-sm">{paymentResult.trackingNumber}</span>
            </div>
          </div>

          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed font-sans">
            📌 <strong>Notice:</strong> All payments require manual approval by an administrator before dispatch. You will receive an email once courier operations verifies your payment.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => router.push('/tracking?number=' + paymentResult.trackingNumber)}
            className="flex-1 bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold py-3 h-auto"
          >
            Track Telemetry <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/shipments')}
            className="flex-1 border-slate-300 font-bold"
          >
            Go to Customer Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-[#1B2A4A]">Secure Payment Checkout</h1>
        <p className="text-slate-500 text-sm mt-1">Review consignment breakdown and authorize transaction.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700 uppercase">256-Bit Encrypted Gateway</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Consignment ID: {shipmentId}</span>
        </div>

        {/* Method Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase text-slate-500">Choose Payment Method</label>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
              { id: 'PAYSTACK', label: 'Paystack Gateway', icon: ShieldCheck },
              { id: 'STRIPE', label: 'Stripe Gateway', icon: ShieldCheck },
              { id: 'WIRE', label: 'Bank Wire Transfer', icon: Building2 },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMethod(m.id)}
                className={cn(
                  'flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-bold transition gap-1.5',
                  selectedMethod === m.id
                    ? 'border-[#6B2737] bg-orange-50/30 text-[#6B2737]'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                )}
              >
                <m.icon className="w-5 h-5" />
                <span className="text-center">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between font-bold text-slate-800">
            <span>Manual Admin Approval Workflow:</span>
            <span className="text-amber-600 font-bold">Enabled</span>
          </div>
          <p className="text-slate-500">
            After clicking Authorize, a Transaction ID, Receipt, and AWB Number will be generated. An admin will review and approve the payment before final dispatch.
          </p>
        </div>

        <Button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold py-3.5 h-auto text-base shadow-md"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            'Authorize & Submit Payment'
          )}
        </Button>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-400">Loading checkout gateway...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}