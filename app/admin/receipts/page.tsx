'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText, Plus, Search, Download, Printer, ShieldCheck, History,
  X, CheckCircle2, Edit3, Trash2, Eye, AlertCircle, Save, Check, Image as ImageIcon,
  Mail, Send, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { getLocalReceipts, saveLocalReceipt, deleteLocalReceipt, getDeletedReceipts, addDeletedReceipt } from '@/lib/payments/manualOptions'
import { downloadReceiptAsImage, downloadReceiptAsPdf, generateReceiptPdfBase64 } from '@/lib/receiptDownload'

type ItemStatus = 'PAID' | 'NOT_PAID'

interface ReceiptLineItem {
  id: string
  description: string
  amount: number
  status: ItemStatus
  enabled: boolean
}

interface AdminReceipt {
  id: string
  receiptNumber: string
  version: number
  customerName: string
  customerEmail: string
  trackingNumber: string
  paymentRef: string
  paymentMethod: string
  subtotal: number
  tax: number
  total: number
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'PARTIALLY_PAID' | 'VOID' | 'REFUNDED'
  createdDate: string
  notes?: string
  items?: ReceiptLineItem[]
  receiptEmailed?: boolean
  receiptEmailedTo?: string
}

const AVAILABLE_DESCRIPTIONS = [
  'Consignment Freight Charge & Handling',
  'Customs Clearance, Handling & Insurance Tax',
  'Standard Courier Service',
  'Usual Courier Service',
  'Over Night Express Service',
] as const

const DEFAULT_DESCRIPTION_AMOUNTS: Record<string, number> = {
  'Consignment Freight Charge & Handling': 120.00,
  'Customs Clearance, Handling & Insurance Tax': 12.00,
  'Standard Courier Service': 45.00,
  'Usual Courier Service': 65.00,
  'Over Night Express Service': 95.00,
}

function getReceiptItems(rcpt: Partial<AdminReceipt> | null | undefined): ReceiptLineItem[] {
  if (rcpt?.items && Array.isArray(rcpt.items) && rcpt.items.length > 0) {
    const existingDescMap = new Map<string, ReceiptLineItem>()
    for (const it of rcpt.items) {
      existingDescMap.set(it.description, it)
    }

    const merged: ReceiptLineItem[] = []
    for (const desc of AVAILABLE_DESCRIPTIONS) {
      if (existingDescMap.has(desc)) {
        merged.push(existingDescMap.get(desc)!)
      } else {
        merged.push({
          id: 'desc-' + desc.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description: desc,
          amount: DEFAULT_DESCRIPTION_AMOUNTS[desc] || 50.00,
          status: 'PAID',
          enabled: false,
        })
      }
    }
    for (const it of rcpt.items) {
      if (!AVAILABLE_DESCRIPTIONS.includes(it.description as any) && !merged.some((m) => m.id === it.id)) {
        merged.push(it)
      }
    }
    return merged
  }

  const sub = Number(rcpt?.subtotal) || 120.00
  const tx = Number(rcpt?.tax) || 12.00
  const isPaid = rcpt?.status !== 'VOID' && rcpt?.status !== 'DRAFT'

  return [
    {
      id: 'desc-consignment',
      description: 'Consignment Freight Charge & Handling',
      amount: sub,
      status: isPaid ? 'PAID' : 'NOT_PAID',
      enabled: true,
    },
    {
      id: 'desc-customs',
      description: 'Customs Clearance, Handling & Insurance Tax',
      amount: tx,
      status: isPaid ? 'PAID' : 'NOT_PAID',
      enabled: true,
    },
    {
      id: 'desc-standard',
      description: 'Standard Courier Service',
      amount: DEFAULT_DESCRIPTION_AMOUNTS['Standard Courier Service'],
      status: 'PAID',
      enabled: false,
    },
    {
      id: 'desc-usual',
      description: 'Usual Courier Service',
      amount: DEFAULT_DESCRIPTION_AMOUNTS['Usual Courier Service'],
      status: 'PAID',
      enabled: false,
    },
    {
      id: 'desc-overnight',
      description: 'Over Night Express Service',
      amount: DEFAULT_DESCRIPTION_AMOUNTS['Over Night Express Service'],
      status: 'PAID',
      enabled: false,
    },
  ]
}

const DEFAULT_RECEIPTS: AdminReceipt[] = []

const statusBadges: Record<string, string> = {
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ISSUED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  PARTIALLY_PAID: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  VOID: 'bg-red-500/10 text-red-400 border-red-500/20',
  REFUNDED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function AdminReceiptsPage() {
  const [receipts, setReceipts] = useState<AdminReceipt[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')

  // Modals
  const [viewingReceipt, setViewingReceipt] = useState<AdminReceipt | null>(null)
  const [editingReceipt, setEditingReceipt] = useState<AdminReceipt | null>(null)
  const [deletingReceipt, setDeletingReceipt] = useState<AdminReceipt | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Email Modal State
  const [emailingReceipt, setEmailingReceipt] = useState<AdminReceipt | null>(null)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [attachPdf, setAttachPdf] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSuccessMessage, setEmailSuccessMessage] = useState<string | null>(null)
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null)
  const [autoEmailOnCreate, setAutoEmailOnCreate] = useState(true)
  const [emailNotice, setEmailNotice] = useState<string | null>(null)

  // Create Form State
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  const [newAWB, setNewAWB] = useState('')
  const [newPaymentMethod, setNewPaymentMethod] = useState('Zelle Direct Transfer')
  const [newNotes, setNewNotes] = useState('')
  const [newCreateItems, setNewCreateItems] = useState<ReceiptLineItem[]>([
    { id: 'new-1', description: 'Consignment Freight Charge & Handling', amount: 120.00, status: 'PAID', enabled: true },
    { id: 'new-2', description: 'Customs Clearance, Handling & Insurance Tax', amount: 12.00, status: 'PAID', enabled: true },
    { id: 'new-3', description: 'Standard Courier Service', amount: 45.00, status: 'PAID', enabled: false },
    { id: 'new-4', description: 'Usual Courier Service', amount: 65.00, status: 'PAID', enabled: false },
    { id: 'new-5', description: 'Over Night Express Service', amount: 95.00, status: 'PAID', enabled: false },
  ])

  // Load receipts on mount
  const loadReceipts = () => {
    try {
      const stored = getLocalReceipts()
      setReceipts(stored || [])
    } catch {
      setReceipts([])
    }
  }

  useEffect(() => {
    loadReceipts()
  }, [])

  // Open Email Modal
  const handleOpenEmailModal = (r: AdminReceipt) => {
    setEmailingReceipt({ ...r, items: getReceiptItems(r) })
    setRecipientEmail(r.customerEmail || '')
    setAttachPdf(true)
    setEmailSuccessMessage(null)
    setEmailErrorMessage(null)
  }

  // Send Email Handler
  const handleSendEmail = async (receiptToSend: AdminReceipt, targetEmail: string, includePdf: boolean) => {
    const to = (targetEmail || receiptToSend.customerEmail || '').trim()
    if (!to || !to.includes('@')) {
      setEmailErrorMessage('Please enter a valid recipient email address.')
      return false
    }

    setSendingEmail(true)
    setEmailErrorMessage(null)
    setEmailSuccessMessage(null)

    try {
      let pdfBase64: string | null = null
      if (includePdf) {
        try {
          pdfBase64 = await generateReceiptPdfBase64(receiptToSend)
        } catch (pdfErr) {
          console.warn('PDF generation for email attachment skipped/failed:', pdfErr)
        }
      }

      const items = getReceiptItems(receiptToSend)
      const res = await fetch('/api/payments/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          customerName: receiptToSend.customerName,
          receiptNumber: receiptToSend.receiptNumber,
          trackingNumber: receiptToSend.trackingNumber,
          amount: receiptToSend.total,
          subtotal: receiptToSend.subtotal,
          tax: receiptToSend.tax,
          paymentMethod: receiptToSend.paymentMethod,
          paymentRef: receiptToSend.paymentRef,
          createdDate: receiptToSend.createdDate,
          status: receiptToSend.status,
          items: items.filter((it) => it.enabled !== false),
          notes: receiptToSend.notes,
          pdfBase64: pdfBase64 || undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        const updated: AdminReceipt = {
          ...receiptToSend,
          receiptEmailed: true,
          receiptEmailedTo: to,
        }
        saveLocalReceipt(updated)
        setReceipts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        if (viewingReceipt && viewingReceipt.id === updated.id) {
          setViewingReceipt(updated)
        }
        setEmailSuccessMessage(`Receipt ${receiptToSend.receiptNumber} successfully delivered to ${to}`)
        setEmailNotice(`Receipt ${receiptToSend.receiptNumber} successfully emailed to ${to}`)
        setTimeout(() => setEmailNotice(null), 5000)
        setTimeout(() => {
          setEmailingReceipt(null)
          setEmailSuccessMessage(null)
        }, 2000)
        return true
      } else {
        setEmailErrorMessage(data.error || 'Failed to dispatch receipt email.')
        return false
      }
    } catch (err: any) {
      console.error('Email send error:', err)
      setEmailErrorMessage(err.message || 'Network error dispatching receipt email.')
      return false
    } finally {
      setSendingEmail(false)
    }
  }

  // Create Receipt
  const handleGenerateReceipt = async (e: React.FormEvent) => {
    e.preventDefault()
    const enabledItems = newCreateItems.filter((it) => it.enabled)
    const computedTotal = enabledItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0)
    const allPaid = enabledItems.length > 0 && enabledItems.every((it) => it.status === 'PAID')
    const nonePaid = enabledItems.length > 0 && enabledItems.every((it) => it.status === 'NOT_PAID')

    const newRcpt: AdminReceipt = {
      id: 'rcpt-' + Date.now(),
      receiptNumber: 'RCPT-2026-' + Math.floor(10000 + Math.random() * 90000),
      version: 1,
      customerName: newCustomerName || 'Direct Shipper',
      customerEmail: newCustomerEmail || 'customer@sourcedeliverypro.com',
      trackingNumber: newAWB || ('SDP' + Math.random().toString(36).substring(2, 11).toUpperCase()),
      paymentRef: 'PAY-2026-' + Math.floor(10000 + Math.random() * 90000),
      paymentMethod: newPaymentMethod,
      subtotal: Number(enabledItems[0]?.amount) || 120.00,
      tax: Number(enabledItems[1]?.amount) || 12.00,
      total: Math.round(computedTotal * 100) / 100,
      status: nonePaid ? 'DRAFT' : allPaid ? 'PAID' : 'PARTIALLY_PAID',
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      notes: newNotes,
      items: newCreateItems,
      receiptEmailed: false,
      receiptEmailedTo: '',
    }

    saveLocalReceipt(newRcpt)
    setReceipts((prev) => [newRcpt, ...prev])
    setShowCreateModal(false)

    // Automatically send receipt to email if option checked and email valid
    if (autoEmailOnCreate && newCustomerEmail && newCustomerEmail.includes('@')) {
      handleSendEmail(newRcpt, newCustomerEmail, true)
    }

    setNewCustomerName('')
    setNewCustomerEmail('')
    setNewAWB('')
    setNewNotes('')
    setNewCreateItems([
      { id: 'new-1', description: 'Consignment Freight Charge & Handling', amount: 120.00, status: 'PAID', enabled: true },
      { id: 'new-2', description: 'Customs Clearance, Handling & Insurance Tax', amount: 12.00, status: 'PAID', enabled: true },
      { id: 'new-3', description: 'Standard Courier Service', amount: 45.00, status: 'PAID', enabled: false },
      { id: 'new-4', description: 'Usual Courier Service', amount: 65.00, status: 'PAID', enabled: false },
      { id: 'new-5', description: 'Over Night Express Service', amount: 95.00, status: 'PAID', enabled: false },
    ])
  }

  // Save Edit Receipt
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingReceipt) return

    const items = getReceiptItems(editingReceipt)
    const enabled = items.filter((it) => it.enabled)
    const computedTotal = enabled.reduce((acc, it) => acc + (Number(it.amount) || 0), 0)
    const allPaid = enabled.length > 0 && enabled.every((it) => it.status === 'PAID')
    const nonePaid = enabled.length > 0 && enabled.every((it) => it.status === 'NOT_PAID')

    const updated: AdminReceipt = {
      ...editingReceipt,
      items,
      subtotal: Number(enabled[0]?.amount) || 0,
      tax: Number(enabled[1]?.amount) || 0,
      total: Math.round(computedTotal * 100) / 100,
      status: editingReceipt.status === 'VOID' ? 'VOID' : (nonePaid ? 'DRAFT' : allPaid ? 'PAID' : 'PARTIALLY_PAID'),
      version: (editingReceipt.version || 1) + 1,
    }

    saveLocalReceipt(updated)
    setReceipts((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    if (viewingReceipt && viewingReceipt.id === updated.id) {
      setViewingReceipt(updated)
    }
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
      setEditingReceipt(null)
    }, 1200)
  }

  // Delete Receipt
  const handleConfirmDelete = () => {
    if (!deletingReceipt) return
    deleteLocalReceipt(deletingReceipt.id)
    deleteLocalReceipt(deletingReceipt.receiptNumber)
    addDeletedReceipt(deletingReceipt.id)
    addDeletedReceipt(deletingReceipt.receiptNumber)
    setReceipts((prev) => prev.filter((r) => r.id !== deletingReceipt.id && r.receiptNumber !== deletingReceipt.receiptNumber))
    setDeletingReceipt(null)
  }

  // Quick Void
  const handleVoidReceipt = (r: AdminReceipt) => {
    const updated: AdminReceipt = {
      ...r,
      status: 'VOID',
      version: (r.version || 1) + 1,
    }
    saveLocalReceipt(updated)
    setReceipts((prev) => prev.map((item) => (item.id === r.id ? updated : item)))
  }

  // Toggle line item status in view receipt modal
  const handleToggleViewingItemStatus = (itemId: string) => {
    if (!viewingReceipt) return
    const currentItems = getReceiptItems(viewingReceipt)
    const updatedItems = currentItems.map((it) =>
      it.id === itemId
        ? { ...it, status: (((it.status || 'PAID') === 'PAID' ? 'NOT_PAID' : 'PAID') as ItemStatus) }
        : it
    )
    const enabled = updatedItems.filter((i) => i.enabled !== false)
    const allPaid = enabled.length > 0 && enabled.every((i) => i.status === 'PAID')
    const nonePaid = enabled.length > 0 && enabled.every((i) => i.status === 'NOT_PAID')
    const nextStatus = viewingReceipt.status === 'VOID'
      ? 'VOID'
      : nonePaid
      ? 'DRAFT'
      : allPaid
      ? 'PAID'
      : 'PARTIALLY_PAID'

    const updatedReceipt: AdminReceipt = {
      ...viewingReceipt,
      items: updatedItems,
      status: nextStatus,
    }
    setViewingReceipt(updatedReceipt)
    saveLocalReceipt(updatedReceipt)
    setReceipts((prev) => prev.map((r) => (r.id === updatedReceipt.id ? updatedReceipt : r)))
  }

  // Filtered list
  const filtered = receipts.filter((r) => {
    if (!r) return false
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus
    const term = (search || '').toLowerCase()
    const matchesSearch =
      (r.receiptNumber || '').toLowerCase().includes(term) ||
      (r.customerName || '').toLowerCase().includes(term) ||
      (r.customerEmail || '').toLowerCase().includes(term) ||
      (r.trackingNumber || '').toLowerCase().includes(term) ||
      (r.paymentRef || '').toLowerCase().includes(term)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#6B2737]" />
            Commercial Receipt Management (`receipts.*`)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View official commercial invoices, edit customer billing details, void records, or permanently delete receipts.
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Generate Commercial Receipt
        </Button>
      </div>

      {/* Global Email Notification Banner */}
      {emailNotice && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-2xl flex items-center justify-between gap-2 text-xs font-bold shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{emailNotice}</span>
          </div>
          <button onClick={() => setEmailNotice(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl text-xs font-bold border border-slate-800 flex-wrap">
          {(['ALL', 'PAID', 'ISSUED', 'DRAFT', 'VOID', 'REFUNDED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === s
                  ? 'bg-[#6B2737] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by receipt #, AWB, customer..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]"
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Commercial Billing Records</h2>
          <span className="text-xs font-semibold text-slate-400">{filtered.length} Receipt(s) Found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Receipt # &amp; Rev</th>
                <th className="p-3">Customer Profile</th>
                <th className="p-3">Tracking Number</th>
                <th className="p-3">Payment Provider &amp; Ref</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Master Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-white">
                    {r.receiptNumber || 'N/A'}
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-white block text-sm">{r.customerName || 'Direct Customer'}</span>
                    <span className="text-[10px] text-slate-400 block">{r.customerEmail || 'customer@sourcedeliverypro.com'}</span>
                    {r.receiptEmailed && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Emailed
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-[#6B2737] font-bold">{r.trackingNumber || 'N/A'}</td>
                  <td className="p-3">
                    <span className="font-mono text-slate-300 block">{r.paymentRef || 'N/A'}</span>
                    <span className="text-[10px] text-slate-500">{r.paymentMethod || 'Manual Transfer'}</span>
                  </td>
                  <td className="p-3 font-bold text-white">{formatCurrency(r.total || 0)}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        (statusBadges && statusBadges[r.status]) || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {r.status || 'PAID'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    {/* Send Receipt to Email */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEmailModal(r)}
                      className="text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10"
                      title="Send Receipt directly to customer email"
                    >
                      <Mail className="w-3.5 h-3.5 mr-1" /> Email
                    </Button>

                    {/* View Receipt */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setViewingReceipt({ ...r, items: getReceiptItems(r) })}
                      className="text-xs text-slate-300 hover:text-white"
                      title="View Receipt Details"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                    </Button>

                    {/* Edit Receipt */}
                    <Button
                      size="sm"
                      onClick={() => setEditingReceipt({ ...r, items: getReceiptItems(r) })}
                      className="bg-[#6B2737] hover:bg-[#521b28] text-white text-xs px-2.5 py-1"
                      title="Edit Receipt Details"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>

                    {/* Download / Print */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setViewingReceipt({ ...r, items: getReceiptItems(r) })
                        setTimeout(() => window.print(), 300)
                      }}
                      className="text-xs text-slate-300 hover:text-white"
                      title="Print / Export Receipt"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </Button>

                    {/* Void Action */}
                    {r.status !== 'VOID' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleVoidReceipt(r)}
                        className="text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                        title="Void Receipt (Soft audit void)"
                      >
                        Void
                      </Button>
                    )}

                    {/* Delete Receipt */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeletingReceipt(r)}
                      className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 text-xs p-2"
                      title="Permanently Delete Receipt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No receipts found matching criteria. Click &quot;Generate Commercial Receipt&quot; to issue a new record.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: View Receipt ──────────────────────────────────────────────── */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static print:z-auto">
          <div
            id="printable-receipt-slip"
            className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl relative border border-slate-200 print:shadow-none print:border-none print:p-2 print:max-w-none"
          >
            <button
              onClick={() => setViewingReceipt(null)}
              className="print:hidden absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#1B2A4A] text-white flex items-center justify-center font-black text-sm">
                    SD
                  </div>
                  <span className="font-black text-lg text-[#1B2A4A] tracking-tight">
                    SourceDelivery<span className="text-[#6B2737]">Pro</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Commercial Freight Billing &amp; Electronic Clearing Statement
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Official Receipt</span>
                <span className="font-mono text-base font-black text-[#1B2A4A]">{viewingReceipt.receiptNumber}</span>
                <div className="flex items-center sm:justify-end gap-2 mt-1">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                      viewingReceipt.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : viewingReceipt.status === 'VOID'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {viewingReceipt.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Billing Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Billed To (Customer)</span>
                <p className="font-bold text-[#1B2A4A] text-sm">{viewingReceipt.customerName}</p>
                <p className="text-slate-600">{viewingReceipt.customerEmail}</p>
                <p className="text-slate-500 mt-0.5">Verified Logistics Customer</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Consignment Telemetry</span>
                <p className="text-slate-600">
                  Tracking Number: <strong className="font-mono text-[#6B2737]">{viewingReceipt.trackingNumber}</strong>
                </p>
                <p className="text-slate-600 mt-0.5">
                  Payment Method: <strong className="text-slate-800">{viewingReceipt.paymentMethod}</strong>
                </p>
                <p className="text-slate-600 mt-0.5 font-mono">
                  Tx Ref: <strong className="text-slate-800">{viewingReceipt.paymentRef}</strong>
                </p>
                <p className="text-slate-500 mt-0.5">Date Issued: {viewingReceipt.createdDate}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 text-xs">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 font-bold text-slate-500 uppercase text-[10px]">
                    <th className="text-left py-2">Description &amp; Freight Breakdown</th>
                    <th className="text-right py-2 w-32">Amount (USD)</th>
                    <th className="text-center py-2 w-28">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingReceipt.items && viewingReceipt.items.filter((it) => it.enabled).length > 0 ? (
                    viewingReceipt.items
                      .filter((it) => it.enabled)
                      .map((it) => {
                        const isPaid = (it.status || 'PAID') === 'PAID'
                        return (
                          <tr key={it.id} className="border-b border-slate-100">
                            <td className="py-2 text-slate-700">{it.description}</td>
                            <td className="py-2 text-right font-mono font-medium">{formatCurrency(it.amount)}</td>
                            <td className="py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleViewingItemStatus(it.id)}
                                className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                                  isPaid
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                    : 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                                }`}
                                title="Click to toggle Paid / Not Paid"
                              >
                                {isPaid ? 'Paid' : 'Not Paid'}
                              </button>
                            </td>
                          </tr>
                        )
                      })
                  ) : (
                    <>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 text-slate-700">Consignment Freight Charge &amp; Handling</td>
                        <td className="py-2 text-right font-mono font-medium">{formatCurrency(viewingReceipt.subtotal)}</td>
                        <td className="py-2 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Paid
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 text-slate-700">Customs Clearance, Handling &amp; Insurance Tax</td>
                        <td className="py-2 text-right font-mono font-medium">{formatCurrency(viewingReceipt.tax)}</td>
                        <td className="py-2 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Paid
                          </span>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 font-black text-sm text-[#1B2A4A]">
                    <td className="py-3">Total Amount Paid</td>
                    <td className="py-3 text-right font-mono text-emerald-600 text-base">
                      {formatCurrency(viewingReceipt.total)}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          viewingReceipt.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : viewingReceipt.status === 'PARTIALLY_PAID'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {viewingReceipt.status === 'PAID'
                          ? 'PAID'
                          : viewingReceipt.status === 'PARTIALLY_PAID'
                          ? 'PARTIAL'
                          : viewingReceipt.status || 'PAID'}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {viewingReceipt.notes && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                <strong className="block text-slate-700 mb-0.5 font-semibold">Special Operational Notes:</strong>
                {viewingReceipt.notes}
              </div>
            )}

            {/* Verification Footer */}
            <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Digitally Authenticated &amp; Recorded in SourceDeliveryPro Ledger</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
                  title="Print Statement using browser printer or PDF destination"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" /> Print Statement
                </Button>
                <Button
                  onClick={() => downloadReceiptAsImage(viewingReceipt)}
                  variant="outline"
                  className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                  title="Download commercial receipt slip as PNG image"
                >
                  <ImageIcon className="w-3.5 h-3.5 mr-1 text-[#6B2737]" /> Download Image
                </Button>
                <Button
                  onClick={() => handleOpenEmailModal(viewingReceipt)}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs"
                  title="Send official receipt directly to email"
                >
                  <Mail className="w-3.5 h-3.5 mr-1" /> {viewingReceipt.receiptEmailed ? 'Resend to Email' : 'Email Receipt'}
                </Button>
                <Button
                  onClick={() => downloadReceiptAsPdf(viewingReceipt)}
                  className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs shadow-xs"
                  title="Download commercial receipt slip as official PDF document"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Email Receipt ──────────────────────────────────────────────── */}
      {emailingReceipt && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setEmailingReceipt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Send Commercial Receipt to Email</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Deliver electronic receipt <span className="font-mono text-white font-bold">{emailingReceipt.receiptNumber}</span> directly to customer inbox.
                  </p>
                </div>
              </div>
            </div>

            {/* Receipt Summary Card */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Customer / Shipper</span>
                <span className="font-bold text-white truncate block">{emailingReceipt.customerName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Amount</span>
                <span className="font-bold text-emerald-400 font-mono block">{formatCurrency(emailingReceipt.total)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Tracking #</span>
                <span className="font-mono text-[#6B2737] font-bold block">{emailingReceipt.trackingNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Status</span>
                <span className="text-white font-semibold block">{emailingReceipt.status}</span>
              </div>
            </div>

            {/* Notice: Pure Receipt Only */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Pure Receipt Delivery:</strong> The email body contains <em>only</em> the official commercial receipt statement—no promotional banners, marketing footers, or tracking buttons.
              </span>
            </div>

            {emailSuccessMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{emailSuccessMessage}</span>
              </div>
            )}

            {emailErrorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{emailErrorMessage}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendEmail(emailingReceipt, recipientEmail, attachPdf)
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Recipient Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="e.g. customer@example.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="attach-pdf-checkbox"
                  checked={attachPdf}
                  onChange={(e) => setAttachPdf(e.target.checked)}
                  className="w-4 h-4 rounded text-[#6B2737] bg-slate-950 border-slate-700 focus:ring-[#6B2737]"
                />
                <label htmlFor="attach-pdf-checkbox" className="text-slate-300 cursor-pointer font-medium">
                  Attach official PDF statement (<span className="font-mono text-slate-400">Receipt-{emailingReceipt.receiptNumber}.pdf</span>)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEmailingReceipt(null)}
                  disabled={sendingEmail}
                  className="border-slate-800 text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sendingEmail || !recipientEmail}
                  className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold flex items-center gap-1.5"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Receipt...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Receipt to Email</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Receipt ──────────────────────────────────────────────── */}
      {editingReceipt && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setEditingReceipt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Receipt Engine
              </span>
              <h2 className="text-xl font-black text-white flex items-center gap-2 mt-1">
                <Edit3 className="w-5 h-5 text-[#6B2737]" />
                Edit Receipt: {editingReceipt.receiptNumber}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Update and manage commercial receipt details.
              </p>
            </div>

            {saveSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Receipt saved successfully!
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editingReceipt.customerName}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, customerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={editingReceipt.customerEmail}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, customerEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={editingReceipt.trackingNumber}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, trackingNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={editingReceipt.paymentMethod}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, paymentMethod: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                    required
                  />
                </div>

              </div>

              {/* Line Items & Freight Breakdown */}
              <div className="space-y-2 border border-slate-800 rounded-2xl p-3 bg-slate-950/60">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider">
                    Description &amp; Freight Breakdown
                  </label>
                  <span className="text-[10px] text-slate-500">Toggle on/off, set amounts &amp; status</span>
                </div>
                <div className="space-y-2">
                  {getReceiptItems(editingReceipt).map((item) => {
                    const isEnabled = item.enabled !== false
                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isEnabled
                            ? 'bg-slate-900 border-slate-700'
                            : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={() => {
                                const current = getReceiptItems(editingReceipt)
                                const updatedItems = current.map((it) =>
                                  it.id === item.id ? { ...it, enabled: !it.enabled } : it
                                )
                                setEditingReceipt({ ...editingReceipt, items: updatedItems })
                              }}
                              className="w-4 h-4 rounded text-[#6B2737] bg-slate-950 border-slate-700 focus:ring-[#6B2737]"
                            />
                            <span className="font-bold text-white text-xs">
                              {item.description}
                            </span>
                          </label>

                          {isEnabled && (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500 text-xs font-mono">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.amount}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0
                                    const current = getReceiptItems(editingReceipt)
                                    const updatedItems = current.map((it) =>
                                      it.id === item.id ? { ...it, amount: val } : it
                                    )
                                    setEditingReceipt({ ...editingReceipt, items: updatedItems })
                                  }}
                                  className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white font-mono text-xs focus:ring-1 focus:ring-[#6B2737] focus:outline-none text-right"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const nextSt: ItemStatus = item.status === 'PAID' ? 'NOT_PAID' : 'PAID'
                                  const current = getReceiptItems(editingReceipt)
                                  const updatedItems = current.map((it) =>
                                    it.id === item.id ? { ...it, status: nextSt } : it
                                  )
                                  setEditingReceipt({ ...editingReceipt, items: updatedItems })
                                }}
                                className={`text-[10px] font-black rounded-lg px-2 py-1 border transition-colors ${
                                  item.status === 'PAID'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                                }`}
                              >
                                {item.status === 'PAID' ? 'Paid' : 'Not Paid'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Payment Reference</label>
                  <input
                    type="text"
                    value={editingReceipt.paymentRef}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, paymentRef: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Receipt Status</label>
                  <select
                    value={editingReceipt.status}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  >
                    <option value="PAID">PAID</option>
                    <option value="ISSUED">ISSUED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                    <option value="VOID">VOID</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Notes / Terms</label>
                <textarea
                  rows={2}
                  value={editingReceipt.notes || ''}
                  onChange={(e) => setEditingReceipt({ ...editingReceipt, notes: e.target.value })}
                  placeholder="Additional remarks, customs exemption details, or special handling..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingReceipt(null)}
                  className="text-slate-400 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs"
                >
                  <Save className="w-3.5 h-3.5 mr-1" /> Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Delete Receipt ────────────────────────────────────────────── */}
      {deletingReceipt && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black text-white">Permanently Delete Receipt?</h2>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete receipt <strong className="text-white font-mono">{deletingReceipt.receiptNumber}</strong> issued for{' '}
                <strong className="text-white">{deletingReceipt.customerName}</strong>?
              </p>
              <p className="text-[11px] text-red-400/80 pt-1">
                This commercial record will be permanently purged from the system.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingReceipt(null)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Yes, Delete Receipt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Generate New Commercial Receipt ───────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#6B2737]" />
                Generate Commercial Receipt
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Issue an electronic receipt for paid or verified consignments.</p>
            </div>

            <form onSubmit={handleGenerateReceipt} className="space-y-3 text-xs text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    placeholder="e.g. customer@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Shipment AWB / Tracking #</label>
                  <input
                    type="text"
                    value={newAWB}
                    onChange={(e) => setNewAWB(e.target.value)}
                    placeholder="e.g. SDP8F4K92LM381"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                    placeholder="e.g. Zelle, Wire Transfer, Crypto"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                    required
                  />
                </div>

              </div>

              {/* Line Items & Freight Breakdown */}
              <div className="space-y-2 border border-slate-800 rounded-2xl p-3 bg-slate-950/60">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider">
                    Description &amp; Freight Breakdown
                  </label>
                  <span className="text-[10px] text-slate-500">Toggle on/off, set amounts &amp; status</span>
                </div>
                <div className="space-y-2">
                  {newCreateItems.map((item) => {
                    const isEnabled = item.enabled !== false
                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isEnabled
                            ? 'bg-slate-900 border-slate-700'
                            : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={() => {
                                setNewCreateItems((prev) =>
                                  prev.map((it) => (it.id === item.id ? { ...it, enabled: !it.enabled } : it))
                                )
                              }}
                              className="w-4 h-4 rounded text-[#6B2737] bg-slate-950 border-slate-700 focus:ring-[#6B2737]"
                            />
                            <span className="font-bold text-white text-xs">
                              {item.description}
                            </span>
                          </label>

                          {isEnabled && (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500 text-xs font-mono">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.amount}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0
                                    setNewCreateItems((prev) =>
                                      prev.map((it) => (it.id === item.id ? { ...it, amount: val } : it))
                                    )
                                  }}
                                  className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white font-mono text-xs focus:ring-1 focus:ring-[#6B2737] focus:outline-none text-right"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const nextSt: ItemStatus = item.status === 'PAID' ? 'NOT_PAID' : 'PAID'
                                  setNewCreateItems((prev) =>
                                    prev.map((it) => (it.id === item.id ? { ...it, status: nextSt } : it))
                                  )
                                }}
                                className={`text-[10px] font-black rounded-lg px-2 py-1 border transition-colors ${
                                  item.status === 'PAID'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                                }`}
                              >
                                {item.status === 'PAID' ? 'Paid' : 'Not Paid'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Notes / Terms (Optional)</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Special instructions or customs declarations..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  type="checkbox"
                  id="auto-email-toggle"
                  checked={autoEmailOnCreate}
                  onChange={(e) => setAutoEmailOnCreate(e.target.checked)}
                  className="w-4 h-4 rounded text-[#6B2737] bg-slate-900 border-slate-700 focus:ring-[#6B2737]"
                />
                <label htmlFor="auto-email-toggle" className="text-slate-300 cursor-pointer text-xs font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>Send receipt to customer email immediately upon creation</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="border-slate-800 text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold"
                >
                  Generate Receipt Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

