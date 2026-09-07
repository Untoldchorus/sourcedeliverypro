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
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  getLocalShipments,
  saveLocalShipment,
  saveLocalReceipt
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
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  const loadData = () => {
    const list = getLocalShipments()
    setPayments(list)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

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

    const generatedReceipt = {
      id: 'rcpt-' + Date.now(),
      receiptNumber,
      version: 1,
      customerName: pay.senderName || pay.customerName || 'Customer',
      customerEmail: pay.senderEmail || pay.customerEmail || 'customer@sourcedeliverypro.com',
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
          remark: `Payment verified & approved by Courier Operations. Shipping label issued. Tracking: ${tracking}`,
        }),
      })
    } catch (err) {
      console.warn('DB patch failed for approval:', err)
    }

    // Reload local state
    loadData()
    setProcessingId(null)

    // Show receipt modal automatically upon approval
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

    try {
      await fetch('/api/shipments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rejectingPayment.id,
          trackingNumber: rejectingPayment.trackingNumber,
          status: 'PAYMENT_REJECTED',
          remark: `Payment rejected by Courier Operations: ${rejectionReason || 'Transaction verification unsuccessful.'}`,
        }),
      })
    } catch (err) {
      console.warn('DB patch failed for rejection:', err)
    }

    loadData()
    setProcessingId(null)
    setRejectingPayment(null)
    setRejectionReason('')
  }

  const handleCopyLink = (shipmentId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    const link = `${origin}/pay/${shipmentId}`
    navigator.clipboard.writeText(link)
    setCopiedLink(shipmentId)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  // Helper status checkers
  const isPendingApproval = (p: any) => p.status === 'PAYMENT_SUBMITTED' || p.status === 'AWAITING_ADMIN_APPROVAL'
  const isPendingPayment = (p: any) => p.status === 'PENDING_PAYMENT' || p.status === 'DRAFT'
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#6B2737]" />
            Manual Payment Approval &amp; Receipt Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review customer transactions, approve payments to generate official receipts, or share payment links.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Txn ID, Receipt, or AWB..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
          />
        </div>
      </div>

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
            { key: 'PAYMENT_SUBMITTED', label: `Awaiting Approval (${pendingApprovalCount})` },
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
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-400">
                      {p.trackingNumber || 'Pending AWB'}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-white block">
                        {p.senderName || p.customerName || 'Customer'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {p.origin || p.senderCity || 'Origin'} → {p.destination || p.recipientCity || 'Destination'}
                      </span>
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
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> Paid &amp; Approved
                        </span>
                      )}
                      {isRejected(p) && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-max">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {/* Action for Awaiting Approval */}
                      {isPendingApproval(p) && (
                        <>
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
                        <div className="inline-flex items-center gap-1.5">
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
                        </div>
                      )}

                      {/* Action for Approved: View Generated Receipt */}
                      {isApproved(p) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (p.receipt) {
                              setViewingReceipt(p.receipt)
                            } else {
                              // Synthetic receipt preview
                              setViewingReceipt({
                                receiptNumber: p.receiptNumber || 'RCPT-2026-' + Math.floor(10000 + Math.random() * 90000),
                                customerName: p.senderName || p.customerName || 'Customer',
                                customerEmail: p.senderEmail || 'customer@sourcedeliverypro.com',
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
                              })
                            }
                          }}
                          className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" /> View Receipt
                        </Button>
                      )}
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
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2.5 font-medium text-slate-800">
                      Freight Express Cargo &amp; Priority Air Courier
                      <span className="block text-[10px] text-slate-400">AWB: {viewingReceipt.trackingNumber}</span>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(viewingReceipt.subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-500">Customs Clearance &amp; Handling Surcharge (8%)</td>
                    <td className="py-2 text-right font-mono text-slate-500">
                      {formatCurrency(viewingReceipt.tax)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t font-black text-sm">
                    <td className="pt-3 text-[#1B2A4A]">Total Paid</td>
                    <td className="pt-3 text-right text-emerald-600 font-mono">
                      {formatCurrency(viewingReceipt.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="text-center pt-2 text-[11px] text-slate-400 border-t">
                Thank you for choosing SourceDeliveryPro. This document constitutes an official receipt.
              </div>

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
