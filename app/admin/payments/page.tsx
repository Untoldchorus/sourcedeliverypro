'use client'

import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ShieldCheck,
  Download,
  Eye,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Printer,
  ExternalLink,
  User,
  Mail,
  Send,
  Loader2,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  getLocalShipments,
  saveLocalShipment,
  saveLocalReceipt,
  getUnifiedShipments,
  deleteLocalShipment,
  addDeletedShipment
} from '@/lib/payments/manualOptions'

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PAYMENT_SUBMITTED' | 'PENDING_PAYMENT' | 'APPROVED' | 'REJECTED'>('ALL')
  const [search, setSearch] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectingPayment, setRejectingPayment] = useState<any | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null)
  const [viewingProof, setViewingProof] = useState<any | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [autoSendReceipt, setAutoSendReceipt] = useState(true)
  const [receiptSending, setReceiptSending] = useState<string | null>(null)
  const [receiptSendSuccess, setReceiptSendSuccess] = useState<string | null>(null)
  const [customRecipientEmail, setCustomRecipientEmail] = useState('')

  const loadData = async () => {
    try {
      const list = await getUnifiedShipments()
      setPayments(list)
    } catch {
      setPayments(getLocalShipments())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sdp_auto_send_receipt')
      if (saved !== null) {
        setAutoSendReceipt(saved === 'true')
      }
    }
    loadData()
  }, [])

  const handleToggleAutoReceipt = (val: boolean) => {
    setAutoSendReceipt(val)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sdp_auto_send_receipt', String(val))
    }
  }

  const sendReceiptToCustomer = async (receiptData: any, targetEmail?: string) => {
    const recipient = (targetEmail || customRecipientEmail || receiptData.customerEmail || receiptData.payerEmail || '').trim()
    if (!recipient || !recipient.includes('@')) {
      alert('Please enter a valid email address to send the receipt.')
      return false
    }

    setReceiptSending(receiptData.receiptNumber || 'active')
    try {
      const res = await fetch('/api/payments/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          customerName: receiptData.customerName || 'Customer',
          receiptNumber: receiptData.receiptNumber,
          trackingNumber: receiptData.trackingNumber,
          amount: receiptData.total || receiptData.amount,
          subtotal: receiptData.subtotal,
          tax: receiptData.tax,
          paymentMethod: receiptData.paymentMethod,
          paymentRef: receiptData.paymentRef,
          createdDate: receiptData.createdDate,
          origin: receiptData.origin,
          destination: receiptData.destination,
          serviceType: receiptData.serviceType,
          status: receiptData.status || 'PAID',
          items: receiptData.items || undefined,
          notes: receiptData.notes || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setReceiptSendSuccess(`Official receipt ${receiptData.receiptNumber} successfully emailed to ${recipient}`)
        setTimeout(() => setReceiptSendSuccess(null), 5000)
        setViewingReceipt((prev: any) => prev ? { ...prev, receiptEmailed: true, receiptEmailedTo: recipient } : prev)
        return true
      } else {
        alert(`Failed to send receipt: ${data.error || 'Server error'}`)
        return false
      }
    } catch (err: any) {
      console.error('Error sending receipt:', err)
      alert('Network error while dispatching receipt email.')
      return false
    } finally {
      setReceiptSending(null)
    }
  }

  const handleApprove = async (pay: any) => {
    setProcessingId(pay.id)

    const amount = Number(pay.amount) || (Number(pay.weight) || 3.5) * 25 + 40
    const subtotal = Math.round((amount / 1.08) * 100) / 100
    const tax = Math.round((amount - subtotal) * 100) / 100

    // Keep or generate SDP tracking number
    const tracking =
      pay.trackingNumber && pay.trackingNumber.startsWith('SDP') && !pay.trackingNumber.includes('Pending')
        ? pay.trackingNumber
        : 'SDP' + Math.random().toString(36).substring(2, 13).toUpperCase()

    const receiptNumber = 'RCPT-2026-' + Math.floor(10000 + Math.random() * 90000)

    // Resolve customer and payer email
    const targetEmail = (
      pay.payerEmail ||
      pay.paymentPayerEmail ||
      pay.senderEmail ||
      pay.customerEmail ||
      pay.userEmail ||
      pay.createdBy?.email ||
      ''
    ).trim()

    const customerName = pay.paymentPayer || pay.senderName || pay.customerName || 'Customer'

    const generatedReceipt: any = {
      id: 'rcpt-' + Date.now(),
      receiptNumber,
      version: 1,
      customerName,
      customerEmail: targetEmail || 'customer@sourcedeliverypro.com',
      payerEmail: targetEmail,
      trackingNumber: tracking,
      paymentRef: pay.paymentTxId || pay.transactionId || ('TXN-' + Date.now()),
      paymentMethod: pay.paymentMethod || 'Manual Payment (Verified)',
      subtotal,
      tax,
      total: amount,
      status: 'PAID',
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      origin: pay.origin || pay.senderCity || 'Origin Hub',
      destination: pay.destination || pay.recipientCity || 'Destination Hub',
      serviceType: pay.serviceType || 'Express Courier',
      receiptEmailed: false,
      receiptEmailedTo: '',
    }

    // Auto-send receipt to payer if toggle is enabled
    if (autoSendReceipt && targetEmail && targetEmail.includes('@')) {
      try {
        const emailRes = await fetch('/api/payments/receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: targetEmail,
            customerName: generatedReceipt.customerName,
            receiptNumber: generatedReceipt.receiptNumber,
            trackingNumber: generatedReceipt.trackingNumber,
            amount: generatedReceipt.total,
            subtotal: generatedReceipt.subtotal,
            tax: generatedReceipt.tax,
            paymentMethod: generatedReceipt.paymentMethod,
            paymentRef: generatedReceipt.paymentRef,
            createdDate: generatedReceipt.createdDate,
            origin: generatedReceipt.origin,
            destination: generatedReceipt.destination,
            serviceType: generatedReceipt.serviceType,
            status: generatedReceipt.status || 'PAID',
            items: generatedReceipt.items || undefined,
            notes: generatedReceipt.notes || undefined,
          }),
        })
        const emailData = await emailRes.json()
        if (emailData.success) {
          generatedReceipt.receiptEmailed = true
          generatedReceipt.receiptEmailedTo = targetEmail
          setReceiptSendSuccess(`Official receipt automatically sent to payer (${targetEmail})`)
          setTimeout(() => setReceiptSendSuccess(null), 5000)
        }
      } catch (emailErr) {
        console.warn('Auto send receipt error:', emailErr)
      }
    }

    // 1. Save receipt to local receipts
    saveLocalReceipt(generatedReceipt)

    // 2. Update shipment in local cache
    const updatedShipment = {
      ...pay,
      status: 'LABEL_CREATED',
      trackingNumber: tracking,
      receiptGenerated: true,
      receiptNumber,
      receipt: generatedReceipt,
      receiptEmailed: generatedReceipt.receiptEmailed,
      receiptEmailedTo: generatedReceipt.receiptEmailedTo,
      payerEmail: targetEmail || pay.payerEmail,
    }
    saveLocalShipment(updatedShipment)

    // 3. Sync approval directly to database
    try {
      await fetch('/api/shipments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pay.id,
          trackingNumber: tracking,
          status: 'LABEL_CREATED',
          receiptNumber,
          receiptEmailed: generatedReceipt.receiptEmailed,
          receiptEmailedTo: generatedReceipt.receiptEmailedTo,
          payerEmail: targetEmail || pay.payerEmail,
          remark: `Payment verified & approved by Courier Operations. Shipping label issued. Tracking: ${tracking}.${generatedReceipt.receiptEmailed ? ` Receipt automatically emailed to ${generatedReceipt.receiptEmailedTo}.` : ''}`,
        }),
      })
    } catch (err) {
      console.warn('DB patch failed for approval:', err)
    }

    // Immediate in-memory state update
    setPayments((prev) =>
      prev.map((item) =>
        item.id === pay.id || (pay.trackingNumber && item.trackingNumber === pay.trackingNumber)
          ? {
              ...item,
              status: 'LABEL_CREATED',
              trackingNumber: tracking,
              receiptGenerated: true,
              receiptNumber,
              receipt: generatedReceipt,
              receiptEmailed: generatedReceipt.receiptEmailed,
              receiptEmailedTo: generatedReceipt.receiptEmailedTo,
              payerEmail: targetEmail || item.payerEmail,
            }
          : item
      )
    )

    // Reload unified data
    await loadData()
    setProcessingId(null)

    // Show receipt modal automatically upon approval
    setCustomRecipientEmail(targetEmail)
    setViewingReceipt(generatedReceipt)
  }

  const handleConfirmReject = async () => {
    if (!rejectingPayment) return
    setProcessingId(rejectingPayment.id)

    const updated = {
      ...rejectingPayment,
      status: 'PAYMENT_REJECTED',
      rejectionReason,
    }
    saveLocalShipment(updated)

    // Immediate in-memory state update
    setPayments((prev) =>
      prev.map((item) =>
        item.id === rejectingPayment.id || (rejectingPayment.trackingNumber && item.trackingNumber === rejectingPayment.trackingNumber)
          ? { ...item, status: 'PAYMENT_REJECTED', rejectionReason }
          : item
      )
    )

    try {
      await fetch('/api/shipments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rejectingPayment.id,
          trackingNumber: rejectingPayment.trackingNumber,
          status: 'PAYMENT_REJECTED',
          rejectionReason,
          remark: `Payment rejected by Courier Operations: ${rejectionReason || 'Transaction verification unsuccessful.'}`,
        }),
      })
    } catch (err) {
      console.warn('DB patch failed for rejection:', err)
    }

    await loadData()
    setProcessingId(null)
    setRejectingPayment(null)
    setRejectionReason('')
  }

  const handleCopyLink = (shipmentId: string) => {
    const rawOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const origin =
      rawOrigin && !rawOrigin.includes('vercel.app') && !rawOrigin.includes('localhost')
        ? rawOrigin
        : 'https://www.sourcedeliverypro.com'
    const link = `${origin}/pay/${shipmentId}`
    navigator.clipboard.writeText(link)
    setCopiedLink(shipmentId)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  // Delete Payment & Consignment Record
  const handleDeletePayment = async (p: any) => {
    const trk = p.trackingNumber || p.id || 'this record'
    if (!confirm(`Are you sure you want to permanently delete payment and shipment record for ${trk}?`)) {
      return
    }

    const id = p.id
    const trackingNumber = p.trackingNumber
    const shpNum = p.shipmentNumber

    if (id) {
      deleteLocalShipment(id)
      addDeletedShipment(id)
    }
    if (trackingNumber) {
      deleteLocalShipment(trackingNumber)
      addDeletedShipment(trackingNumber)
    }
    if (shpNum) {
      deleteLocalShipment(shpNum)
      addDeletedShipment(shpNum)
    }

    try {
      await fetch(
        `/api/shipments?id=${encodeURIComponent(id || '')}&trackingNumber=${encodeURIComponent(trackingNumber || '')}`,
        { method: 'DELETE' }
      )
    } catch (err) {
      console.warn('API delete error:', err)
    }

    setPayments((prev) =>
      prev.filter(
        (item) =>
          item.id !== id &&
          item.trackingNumber !== trackingNumber &&
          item.shipmentNumber !== shpNum
      )
    )
  }

  // Helper status checkers
  const isPendingApproval = (p: any) =>
    p.status === 'PAYMENT_SUBMITTED' ||
    p.status === 'AWAITING_ADMIN_APPROVAL' ||
    p.status === 'AWAITING_CONFIRMATION' ||
    p.status === 'PROCESSING' ||
    Boolean(p.paymentTxId && p.status !== 'LABEL_CREATED' && p.status !== 'APPROVED' && p.status !== 'PAYMENT_REJECTED' && p.status !== 'REJECTED')
  const isPendingPayment = (p: any) =>
    (p.status === 'PENDING_PAYMENT' || p.status === 'DRAFT') && !p.paymentTxId
  const isApproved = (p: any) => p.status === 'LABEL_CREATED' || p.status === 'APPROVED' || p.status === 'IN_TRANSIT' || p.status === 'DELIVERED' || p.receiptGenerated
  const isRejected = (p: any) => p.status === 'PAYMENT_REJECTED' || p.status === 'REJECTED'

  const filtered = payments.filter((p) => {
    let matchFilter = true
    if (filter === 'PAYMENT_SUBMITTED') matchFilter = isPendingApproval(p)
    if (filter === 'PENDING_PAYMENT') matchFilter = isPendingPayment(p)
    if (filter === 'APPROVED') matchFilter = isApproved(p)
    if (filter === 'REJECTED') matchFilter = isRejected(p)

    const txnId = p.paymentTxId || p.transactionId || ''
    const tracking = p.trackingNumber || ''
    const customer = p.senderName || p.customerName || ''

    const matchSearch =
      txnId.toLowerCase().includes(search.toLowerCase()) ||
      tracking.toLowerCase().includes(search.toLowerCase()) ||
      customer.toLowerCase().includes(search.toLowerCase())

    return matchFilter && matchSearch
  })

  const pendingApprovalCount = payments.filter(isPendingApproval).length
  const pendingPaymentCount = payments.filter(isPendingPayment).length
  const approvedCount = payments.filter(isApproved).length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#6B2737]" />
            Manual Payment Approval &amp; Receipt Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review customer transactions, approve payments to generate official receipts, or share payment links.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Auto-Send Receipt Toggle */}
          <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <Mail className={`w-4 h-4 ${autoSendReceipt ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div className="text-left">
                <span className="text-xs font-bold text-white block leading-tight">
                  Auto-Email Receipt
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Send to payer on approval
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggleAutoReceipt(!autoSendReceipt)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoSendReceipt ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
              title={autoSendReceipt ? 'Receipts are automatically emailed to payers upon approval' : 'Receipt auto-sending is disabled'}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoSendReceipt ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-[11px] font-black w-7 text-center ${autoSendReceipt ? 'text-emerald-400' : 'text-slate-500'}`}>
              {autoSendReceipt ? 'ON' : 'OFF'}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Txn ID, Receipt, or AWB..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* Real-time Receipt Notification Toast Banner */}
      {receiptSendSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{receiptSendSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setReceiptSendSuccess(null)}
            className="text-emerald-400 hover:text-white px-2 py-0.5 rounded text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Awaiting Confirmation
          </span>
          <div className="text-3xl font-black text-amber-400 mt-1">{pendingApprovalCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Proof submitted by payer</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
            Pending Payment Links
          </span>
          <div className="text-3xl font-black text-sky-400 mt-1">{pendingPaymentCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Awaiting payment by client</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            Approved &amp; Receipts Issued
          </span>
          <div className="text-3xl font-black text-emerald-400 mt-1">{approvedCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Official receipts generated</span>
        </div>
      </div>

      {/* Filter Tabs & Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4 text-xs font-bold">
          {[
            { key: 'ALL', label: 'All Transactions' },
            { key: 'PAYMENT_SUBMITTED', label: `Awaiting Confirmation (${pendingApprovalCount})` },
            { key: 'PENDING_PAYMENT', label: `Pending Payment (${pendingPaymentCount})` },
            { key: 'APPROVED', label: `Approved & Receipts (${approvedCount})` },
            { key: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl transition ${
                filter === tab.key
                  ? 'bg-[#6B2737] text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white bg-slate-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Reference / Txn ID</th>
                <th className="p-3">AWB / Tracking #</th>
                <th className="p-3">Customer &amp; Route</th>
                <th className="p-3">Payment Channel</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((p, idx) => {
                const amount = Number(p.amount) || (Number(p.weight) || 3.5) * 25 + 40
                const paymentMethodDisplay = p.paymentMethod || 'Manual Transfer'

                return (
                  <tr key={p.id || idx} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-white">
                      {p.paymentTxId || p.transactionId || 'Unsubmitted'}
                      {p.receiptNumber && (
                        <span className="block text-[10px] text-emerald-400 font-normal">
                          {p.receiptNumber}
                        </span>
                      )}
                      {p.paymentProof && (
                        <button
                          type="button"
                          onClick={() => setViewingProof(p)}
                          className="mt-1 flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg transition"
                        >
                          <Eye className="w-3 h-3" /> View Proof
                        </button>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-400">
                      {p.trackingNumber || 'Pending AWB'}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-white block">
                        {p.paymentPayer || p.senderName || p.customerName || 'Customer'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {p.origin || p.senderCity || 'Origin'} → {p.destination || p.recipientCity || 'Destination'}
                      </span>
                      {(p.payerEmail || p.paymentPayerEmail || p.senderEmail) && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">Receipt to: {p.payerEmail || p.paymentPayerEmail || p.senderEmail}</span>
                        </div>
                      )}
                      {(p.userName || p.userEmail || p.createdBy) && (
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-sky-400">
                          <User className="w-3 h-3 shrink-0" />
                          <span>Booked by: <strong>{p.userName || p.createdBy?.name || 'Customer'}</strong> ({p.userEmail || p.createdBy?.email || p.senderEmail})</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-slate-300 font-medium block">{paymentMethodDisplay}</span>
                      {p.paymentPayer && (
                        <span className="text-[10px] text-slate-500 block">Payer: {p.paymentPayer}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-emerald-400">{formatCurrency(amount)}</span>
                    </td>
                    <td className="p-3">
                      {isPendingApproval(p) && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-max">
                          <Clock className="w-3 h-3" /> Awaiting Approval
                        </span>
                      )}
                      {isPendingPayment(p) && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1 w-max">
                          <Clock className="w-3 h-3" /> Pending Payment
                        </span>
                      )}
                      {isApproved(p) && (
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> Paid &amp; Approved
                          </span>
                          {p.receiptEmailed && (
                            <span className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                              <Check className="w-2.5 h-2.5" /> Receipt Emailed
                            </span>
                          )}
                        </div>
                      )}
                      {isRejected(p) && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-max">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Action for Awaiting Approval */}
                        {isPendingApproval(p) && (
                          <>
                            {p.paymentProof && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewingProof(p)}
                                className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 font-bold text-xs"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" /> View Proof
                              </Button>
                            )}
                            <Button
                              size="sm"
                              disabled={processingId === p.id}
                              onClick={() => handleApprove(p)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                            >
                              {processingId === p.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve &amp; Generate Receipt
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={processingId === p.id}
                              onClick={() => setRejectingPayment(p)}
                              className="border-red-500/40 text-red-400 hover:bg-red-500/10 font-bold text-xs"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        )}

                        {/* Action for Pending Payment Link */}
                        {isPendingPayment(p) && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open('/pay/' + (p.id || p.trackingNumber), '_blank')}
                              className="border-slate-700 text-sky-400 hover:bg-slate-800 text-xs"
                              title="Open Universal Pay Link in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Pay Portal
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyLink(p.id || p.trackingNumber)}
                              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                            >
                              {copiedLink === (p.id || p.trackingNumber) ? (
                                <>
                                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(p)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                            >
                              Approve &amp; Issue Receipt
                            </Button>
                          </>
                        )}

                        {/* Action for Approved: View Generated Receipt */}
                        {isApproved(p) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const recipientToUse = (p.payerEmail || p.paymentPayerEmail || p.senderEmail || p.customerEmail || '').trim()
                              setCustomRecipientEmail(recipientToUse)
                              if (p.receipt) {
                                setViewingReceipt({
                                  ...p.receipt,
                                  payerEmail: recipientToUse || p.receipt.payerEmail,
                                  customerEmail: recipientToUse || p.receipt.customerEmail,
                                  receiptEmailed: p.receipt.receiptEmailed || Boolean(p.receiptEmailed),
                                  receiptEmailedTo: p.receipt.receiptEmailedTo || p.receiptEmailedTo || recipientToUse,
                                })
                              } else {
                                // Synthetic receipt preview
                                setViewingReceipt({
                                  receiptNumber: p.receiptNumber || 'RCPT-2026-' + Math.floor(10000 + Math.random() * 90000),
                                  customerName: p.paymentPayer || p.senderName || p.customerName || 'Customer',
                                  customerEmail: recipientToUse || 'customer@sourcedeliverypro.com',
                                  payerEmail: recipientToUse,
                                  trackingNumber: p.trackingNumber,
                                  paymentRef: p.paymentTxId || p.transactionId || 'PAY-VERIFIED',
                                  paymentMethod: p.paymentMethod || 'Manual Verified Payment',
                                  subtotal: Math.round((amount / 1.08) * 100) / 100,
                                  tax: Math.round((amount - amount / 1.08) * 100) / 100,
                                  total: amount,
                                  status: 'PAID',
                                  createdDate: 'Approved',
                                  origin: p.origin || p.senderCity,
                                  destination: p.destination || p.recipientCity,
                                  receiptEmailed: Boolean(p.receiptEmailed),
                                  receiptEmailedTo: p.receiptEmailedTo || recipientToUse,
                                })
                              }
                            }}
                            className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" /> View Receipt
                          </Button>
                        )}

                        {/* Delete Button (Always available for admin) */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePayment(p)}
                          className="border-red-500/40 text-red-400 hover:bg-red-500/15 hover:text-red-300 font-bold text-xs"
                          title="Permanently Delete Transaction & Consignment"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No transactions found matching the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingPayment && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white">
            <h2 className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Reject Payment Confirmation
            </h2>
            <p className="text-xs text-slate-400">
              You are rejecting the transaction record for <strong className="font-mono text-white">{rejectingPayment.paymentTxId || rejectingPayment.transactionId || 'Payment'}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Reason for Rejection</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Unverified bank transfer reference or missing funds..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setRejectingPayment(null)} className="text-slate-400 text-xs">
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReject}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Proof of Payment Review Modal */}
      {viewingProof && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-white my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Proof of Payment Verification</h3>
                  <p className="text-xs text-slate-400">
                    AWB: <span className="font-mono text-amber-400 font-bold">{viewingProof.trackingNumber || viewingProof.id}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingProof(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Payment Summary Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Payer</span>
                <span className="font-bold text-white truncate block">{viewingProof.paymentPayer || viewingProof.senderName || 'Customer'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Channel</span>
                <span className="text-amber-400 font-bold block truncate">{viewingProof.paymentMethod || 'Manual Transfer'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Txn Reference</span>
                <span className="font-mono text-white font-bold block truncate">{viewingProof.paymentTxId || viewingProof.transactionId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Amount Due</span>
                <span className="font-bold text-emerald-400 block">{formatCurrency(Number(viewingProof.amount) || 145)}</span>
              </div>
            </div>

            {/* Payer Email & Auto-Receipt Delivery Target */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Payer Receipt Destination</span>
                  <span className="font-mono font-bold text-white text-xs">
                    {viewingProof.payerEmail || viewingProof.paymentPayerEmail || viewingProof.senderEmail || 'No email provided'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {autoSendReceipt ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Auto-receipt is ON (Will email upon approval)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" /> Auto-receipt is OFF
                  </span>
                )}
              </div>
            </div>

            {/* Proof Preview Display */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Uploaded Transfer Receipt / Screenshot:</span>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[260px] max-h-[480px] overflow-auto">
                {viewingProof.paymentProof ? (
                  viewingProof.paymentProof.startsWith('data:image/') || viewingProof.paymentProof.startsWith('http') ? (
                    <img
                      src={viewingProof.paymentProof}
                      alt="Customer payment proof"
                      className="max-h-[420px] w-auto max-w-full object-contain rounded-xl border border-slate-800 shadow"
                    />
                  ) : (
                    <div className="p-8 text-center space-y-3">
                      <FileText className="w-12 h-12 text-amber-400 mx-auto" />
                      <p className="text-xs text-slate-300 font-mono break-all">{viewingProof.paymentProof.slice(0, 80)}...</p>
                    </div>
                  )
                ) : (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    No image preview attached. Please check support email inbox (support@sourcedeliverypro.com).
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              {viewingProof.paymentProof && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const w = window.open('')
                    w?.document.write(`<img src="${viewingProof.paymentProof}" style="max-width:100%; height:auto;" />`)
                  }}
                  className="border-slate-700 text-slate-300 text-xs hover:bg-slate-800"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open Full Image
                </Button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const target = viewingProof
                    setViewingProof(null)
                    setRejectingPayment(target)
                  }}
                  className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-bold"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    const target = viewingProof
                    setViewingProof(null)
                    handleApprove(target)
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve & Issue Receipt
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formal Receipt Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 my-8 border border-slate-200">
            
            {/* Modal Actions Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#6B2737]" />
                <span className="font-bold text-sm text-slate-800">Official Payment Receipt</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                  className="text-xs"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" /> Print / PDF
                </Button>
                <button
                  onClick={() => setViewingReceipt(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 font-bold text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Receipt Card */}
            <div className="border rounded-2xl p-6 bg-slate-50 space-y-6">
              
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-[#1B2A4A] tracking-tight">SourceDeliveryPro</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Global Freight &amp; Logistics Logistics LLC</p>
                  <p className="text-[11px] text-slate-400">support@sourcedeliverypro.com</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs rounded-full uppercase tracking-wider">
                    PAID &amp; VERIFIED
                  </span>
                  <div className="mt-2 text-xs font-mono text-slate-600">
                    <span className="block font-bold text-slate-800">{viewingReceipt.receiptNumber}</span>
                    <span>Date: {viewingReceipt.createdDate}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b py-4 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Billed To</span>
                  <p className="font-bold text-slate-800">{viewingReceipt.customerName}</p>
                  <p className="text-slate-500">{viewingReceipt.customerEmail}</p>
                  {viewingReceipt.origin && (
                    <p className="text-slate-500 mt-1">Route: {viewingReceipt.origin} → {viewingReceipt.destination}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Shipment &amp; Payment</span>
                  <p className="font-mono font-bold text-[#6B2737]">{viewingReceipt.trackingNumber}</p>
                  <p className="text-slate-600">Ref: {viewingReceipt.paymentRef}</p>
                  <p className="text-slate-500">Method: {viewingReceipt.paymentMethod}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400 uppercase text-[10px]">
                    <th className="text-left py-2">Description &amp; Freight Breakdown</th>
                    <th className="text-right py-2 w-28">Amount (USD)</th>
                    <th className="text-center py-2 w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2.5 font-medium text-slate-800">
                      Consignment Freight Charge &amp; Handling
                      <span className="block text-[10px] text-slate-400">AWB: {viewingReceipt.trackingNumber}</span>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(viewingReceipt.subtotal)}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Paid
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-600">Customs Clearance, Handling &amp; Insurance Tax</td>
                    <td className="py-2 text-right font-mono text-slate-600">
                      {formatCurrency(viewingReceipt.tax)}
                    </td>
                    <td className="py-2 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Paid
                      </span>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t font-black text-sm">
                    <td className="pt-3 text-[#1B2A4A]">Total Paid</td>
                    <td className="pt-3 text-right text-emerald-600 font-mono">
                      {formatCurrency(viewingReceipt.total)}
                    </td>
                    <td className="pt-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        PAID
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="text-center pt-2 text-[11px] text-slate-400 border-t">
                Thank you for choosing SourceDeliveryPro. This document constitutes an official receipt.
              </div>

            </div>

            {/* Email Dispatch & Resend Control */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#6B2737]" />
                  <span>Deliver Official Receipt to Customer Email</span>
                </span>
                {viewingReceipt.receiptEmailed && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 w-max">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Delivered to {viewingReceipt.receiptEmailedTo || viewingReceipt.customerEmail}
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="email"
                  value={customRecipientEmail || viewingReceipt.payerEmail || viewingReceipt.customerEmail || ''}
                  onChange={(e) => setCustomRecipientEmail(e.target.value)}
                  placeholder="Enter payer email address..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#6B2737]"
                />
                <Button
                  size="sm"
                  disabled={Boolean(receiptSending) || !(customRecipientEmail || viewingReceipt.payerEmail || viewingReceipt.customerEmail)}
                  onClick={() => sendReceiptToCustomer(viewingReceipt, customRecipientEmail || viewingReceipt.payerEmail || viewingReceipt.customerEmail)}
                  className="bg-[#6B2737] hover:bg-[#541b27] text-white font-bold text-xs h-9 px-4 shrink-0 flex items-center justify-center gap-1.5"
                >
                  {receiptSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                      <span>Dispatching Receipt...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{viewingReceipt.receiptEmailed ? 'Resend Receipt' : 'Email Receipt to Customer'}</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-slate-500">
                Payer receives the official commercial receipt statement with itemized freight breakdown and digital ledger authentication.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setViewingReceipt(null)}
                className="bg-[#1B2A4A] hover:bg-[#243660] text-white text-xs font-bold px-6"
              >
                Close Receipt
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
