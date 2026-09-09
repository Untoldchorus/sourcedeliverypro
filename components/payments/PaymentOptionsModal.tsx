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
  ArrowRight,
  Upload,
  X,
  Loader2,
  Image as ImageIcon
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
  const [isSwitchingMethod, setIsSwitchingMethod] = useState(false)
  const [pendingMethodName, setPendingMethodName] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [payerName, setPayerName] = useState(shipment.senderName || '')
  const [payerEmail, setPayerEmail] = useState(shipment.senderEmail || shipment.recipientEmail || '')
  const [transactionId, setTransactionId] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [proofFileName, setProofFileName] = useState<string>('')
  const [proofFileSize, setProofFileSize] = useState<string>('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const paymentLink = `${originUrl}/pay/${shipment.id || shipment.trackingNumber}`

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleSubmitPayNow = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transactionId.trim()) return

    setSubmitting(true)

    // 1. Dispatch payment proof and details to support email
    try {
      await fetch('/api/payments/proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentId: shipment.id,
          trackingNumber: shipment.trackingNumber,
          amount: shipment.amount,
          paymentMethod: selectedMethod.name,
          payerName: payerName.trim() || shipment.senderName || 'Customer',
          payerEmail: payerEmail.trim() || shipment.senderEmail || '',
          transactionId: transactionId.trim(),
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
      paymentMethod: selectedMethod.name,
      paymentTxId: transactionId.trim(),
      paymentPayer: payerName.trim() || shipment.senderName || 'Customer',
      payerEmail: payerEmail.trim() || shipment.senderEmail || '',
      paymentPayerEmail: payerEmail.trim() || shipment.senderEmail || '',
      paymentProof: proofPreview,
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
          payerEmail: payerEmail.trim() || shipment.senderEmail || '',
          paymentPayerEmail: payerEmail.trim() || shipment.senderEmail || '',
          remark: `Payment of ${formatCurrency(shipment.amount)} submitted via ${selectedMethod.name} (Txn Ref: ${transactionId.trim()}) awaiting verification. Payer Email: ${payerEmail.trim() || shipment.senderEmail || 'N/A'}. ${proofPreview ? 'Proof attached.' : ''}`,
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
                  Your transaction reference <strong className="text-white font-mono">{transactionId}</strong> and proof have been received. 
                  A verification alert has been dispatched to our auditing desk at <span className="text-sky-400 font-mono">support@sourcedeliverypro.com</span>. 
                  {payerEmail && (
                    <span className="block mt-1.5 text-emerald-300 font-medium">
                      Your official payment receipt will be delivered automatically to <strong className="font-mono text-white underline">{payerEmail}</strong> once approved.
                    </span>
                  )}
                  <span className="block mt-1">Status is now <span className="text-amber-400 font-bold">Awaiting Confirmation</span>.</span>
                </p>

                {proofPreview && (
                  <div className="max-w-xs mx-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                    <p className="text-[11px] text-slate-400 mb-1 font-semibold">Uploaded Proof of Payment:</p>
                    <img
                      src={proofPreview}
                      alt="Uploaded proof"
                      className="w-full h-32 object-cover rounded-lg border border-slate-800"
                    />
                  </div>
                )}

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
                    {MANUAL_PAYMENT_METHODS.map((method) => {
                      const isPendingThis = isSwitchingMethod && pendingMethodName === method.name
                      const isCurrent = selectedMethodId === method.id && !isSwitchingMethod

                      return (
                        <button
                          key={method.id}
                          type="button"
                          disabled={isSwitchingMethod}
                          onClick={() => handleMethodSelect(method)}
                          className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                            isCurrent
                              ? 'bg-[#1B2A4A] border-amber-500/60 text-white shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          } ${isPendingThis ? 'border-amber-400 bg-slate-900' : ''}`}
                        >
                          {isPendingThis ? (
                            <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                          ) : (
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isCurrent ? 'bg-amber-400' : 'bg-slate-600'}`} />
                          )}
                          <span className="text-xs font-bold truncate">{method.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Selected Method Details Box (With Realistic Gateway Connecting Animation) */}
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
                ) : (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          {selectedMethod.name} Instructions
                        </span>
                      </div>
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
                )}

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
                      <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                        <span>Payer Email Address</span>
                        <span className="text-[10px] text-emerald-400 font-normal">Auto-receives receipt</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={payerEmail}
                        onChange={(e) => setPayerEmail(e.target.value)}
                        placeholder="payer@example.com (for receipt delivery)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#6B2737]"
                      />
                    </div>
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
                      placeholder="e.g. #TXN-982189 / Wire Reference / CashApp Hash"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#6B2737]"
                    />
                  </div>

                  {/* Prominent Upload Payment Proof Component */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border-2 border-dashed border-amber-500/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Upload Proof of Payment / Transfer Receipt</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-normal">PNG, JPG, PDF (Up to 15MB)</span>
                    </div>

                    {proofPreview ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/60 flex items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          {proofPreview.startsWith('data:image/') ? (
                            <img
                              src={proofPreview}
                              alt="Payment proof preview"
                              className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0 shadow"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-amber-400">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{proofFileName || 'Receipt'}</p>
                            <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold mt-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Proof Attached ({proofFileSize})
                            </p>
                            <span className="text-[10px] text-slate-400">Sent to support@sourcedeliverypro.com</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveProof}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition text-xs shrink-0"
                          title="Remove attachment"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border border-dashed border-slate-700 hover:border-amber-400 bg-slate-900/60 hover:bg-slate-900 transition rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer text-center group">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition mb-2">
                          <Upload className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                          Click to browse or drop transfer screenshot / receipt
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Bank confirmation screenshot, Zelle/CashApp receipt, or wire slip
                        </p>
                        <span className="text-[10px] text-emerald-400 mt-1.5 font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Auto-dispatched to support@sourcedeliverypro.com
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>256-Bit SSL Secured & Protected Connection</span>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting || !transactionId.trim() || isSwitchingMethod}
                      className="w-full sm:w-auto px-8 bg-[#6B2737] hover:bg-[#541b27] text-white font-bold text-xs h-11 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                          <span>Uploading Proof & Notifying Support...</span>
                        </>
                      ) : (
                        <span>Submit Payment Proof</span>
                      )}
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
