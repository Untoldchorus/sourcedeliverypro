'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  Copy,
  Check,
  Send,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Building2,
  DollarSign,
  Zap,
  Smartphone,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  MANUAL_PAYMENT_METHODS,
  ManualPaymentMethod,
  saveLocalShipment
} from '@/lib/payments/manualOptions'

interface PaymentOptionsModalProps {
  isOpen: boolean
  onClose?: () => void
  shipment: {
    id: string
    trackingNumber: string
    senderName?: string
    senderEmail?: string
    recipientName?: string
    recipientEmail?: string
    origin?: string
    destination?: string
    serviceType?: string
    amount: number
    weight?: number | string
  }
  isAdmin?: boolean
  returnUrl?: string
}

export function PaymentOptionsModal({
  isOpen,
  onClose,
  shipment,
  isAdmin = false,
  returnUrl,
}: PaymentOptionsModalProps) {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<'pay_now' | 'payment_link' | 'pay_later'>('pay_now')
  const [selectedMethodId, setSelectedMethodId] = useState<string>('zelle')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [payerName, setPayerName] = useState(shipment.senderName || '')
  const [transactionId, setTransactionId] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const paymentLink = `${originUrl}/pay/${shipment.id || shipment.trackingNumber}`

  const selectedMethod = MANUAL_PAYMENT_METHODS.find((m) => m.id === selectedMethodId) || MANUAL_PAYMENT_METHODS[0]

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldKey)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleSubmitPayNow = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transactionId.trim()) return

    setSubmitting(true)

    const updatedShipment = {
      ...shipment,
      status: 'PAYMENT_SUBMITTED',
      paymentMethod: selectedMethod.name,
      paymentTxId: transactionId.trim(),
      paymentPayer: payerName.trim() || shipment.senderName || 'Customer',
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
          paymentTxId: transactionId.trim(),
          paymentMethod: selectedMethod.name,
          paymentPayer: payerName.trim() || shipment.senderName || 'Customer',
          remark: `Payment of ${formatCurrency(shipment.amount)} submitted via ${selectedMethod.name} (Txn Ref: ${transactionId.trim()}) awaiting verification.`,
        }),
      })
    } catch (err) {
      console.warn('DB patch failed in PaymentOptionsModal:', err)
    }

    setSubmitting(false)
    setSubmitted(true)
  }

  const handleSelectPayLater = () => {
    saveLocalShipment({
      ...shipment,
      status: 'PENDING_PAYMENT',
    })
    if (onClose) onClose()
    if (returnUrl) {
      router.push(returnUrl)
    } else if (isAdmin) {
      router.push('/admin/shipments')
    } else {
      router.push(`/tracking?number=${shipment.trackingNumber}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#1B2A4A] border-b border-[#243660] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#6B2737] text-white">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Select Payment Option</h2>
              <p className="text-xs text-slate-300">
                Shipment Reference: <span className="font-mono text-amber-300 font-bold">{shipment.trackingNumber || shipment.id}</span>
                {' · '}
                Amount Due: <span className="font-bold text-emerald-400">{formatCurrency(shipment.amount)}</span>
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* 3 Main Choice Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/60 p-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedOption('pay_now')}
            className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
              selectedOption === 'pay_now'
                ? 'bg-[#6B2737] text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>1. Pay Now</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedOption('payment_link')}
            className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
              selectedOption === 'payment_link'
                ? 'bg-[#6B2737] text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Send className="w-4 h-4 text-sky-400" />
            <span>2. Send Payment Link</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedOption('pay_later')}
            className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
              selectedOption === 'pay_later'
                ? 'bg-[#6B2737] text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-slate-400" />
            <span>3. Pay Later</span>
          </button>
        </div>

        {/* Tab 1: Pay Now */}
        {selectedOption === 'pay_now' && (
          <div className="p-6 sm:p-8 space-y-6">
            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white">Payment Proof Submitted!</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Your transaction reference <strong className="text-white font-mono">{transactionId}</strong> has been received. 
                  Status is now <span className="text-amber-400 font-bold">Awaiting Confirmation</span>. 
                  Your official receipt and tracking number will be generated immediately once verified.
                </p>
                <div className="pt-4 flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={() => {
                      if (onClose) onClose()
                      router.push(`/tracking?number=${shipment.trackingNumber}`)
                    }}
                    className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs"
                  >
                    View Shipment Tracking <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                  {returnUrl && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (onClose) onClose()
                        router.push(returnUrl)
                      }}
                      className="border-slate-700 text-slate-300 text-xs hover:bg-slate-800"
                    >
                      Back to Shipments
                    </Button>
                  )}
                  {isAdmin && !returnUrl && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (onClose) onClose()
                        router.push('/admin/payments')
                      }}
                      className="border-slate-700 text-slate-300 text-xs hover:bg-slate-800"
                    >
                      Go to Admin Approval Queue
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                    Choose Payment Method
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MANUAL_PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethodId(method.id)}
                        className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                          selectedMethodId === method.id
                            ? 'bg-[#1B2A4A] border-amber-500/60 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="text-xs font-bold truncate">{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Method Details Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {selectedMethod.name} Instructions
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Total: {formatCurrency(shipment.amount)}
                    </span>
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
                              className="p-1 text-slate-400 hover:text-white transition rounded bg-slate-800"
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

                {/* Submit Form */}
                <form onSubmit={handleSubmitPayNow} className="space-y-4 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Payer / Sender Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        placeholder="Name on payment account"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#6B2737]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Transaction ID / Reference Number
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. #TXN-982189 / Hash"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#6B2737]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={submitting || !transactionId.trim()}
                      className="w-full sm:w-auto px-8 bg-[#6B2737] hover:bg-[#541b27] text-white font-bold text-xs h-11"
                    >
                      {submitting ? 'Submitting...' : 'Submit Payment for Verification'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Send Payment Link */}
        {selectedOption === 'payment_link' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-800/40 flex items-start gap-3">
              <Send className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-sky-300 block">Universal Shareable Payment Link</span>
                <p className="text-slate-300 leading-relaxed">
                  This payment link is public and unauthenticated. You can send this link to the sender, recipient, or a third-party sponsor. Anyone who opens the link can complete the payment.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Generated Payment Link</label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={paymentLink}
                  className="w-full bg-transparent text-xs text-amber-300 font-mono focus:outline-none px-2"
                />
                <Button
                  type="button"
                  onClick={handleCopyLink}
                  className="bg-[#6B2737] hover:bg-[#521b28] text-white text-xs font-bold shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Status is set to <span className="font-bold text-amber-400">Pending Payment</span> until completed.
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(paymentLink, '_blank')}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> Test Link in New Tab
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    saveLocalShipment({
                      ...shipment,
                      status: 'PENDING_PAYMENT',
                    })
                    if (onClose) onClose()
                    if (returnUrl) {
                      router.push(returnUrl)
                    } else if (isAdmin) {
                      router.push('/admin/shipments')
                    } else {
                      router.push(`/tracking?number=${shipment.trackingNumber}`)
                    }
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Pay Later */}
        {selectedOption === 'pay_later' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Save Shipment as Pending Payment</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your shipment has been registered with reference{' '}
                <strong className="font-mono text-amber-400">{shipment.trackingNumber || shipment.id}</strong>.
                The status has entered <span className="text-amber-400 font-bold">Pending Payment</span>.
                You or your client can pay anytime from the Customer Dashboard or via the payment portal before physical dispatch.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Route:</span>
                <span className="font-bold text-white">{shipment.origin || 'Origin'} → {shipment.destination || 'Destination'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consignee:</span>
                <span className="font-bold text-white">{shipment.recipientName || 'Recipient'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount to Settle:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(shipment.amount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={handleSelectPayLater}
                className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs px-6 h-11"
              >
                Confirm &amp; Proceed with Pending Status
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
