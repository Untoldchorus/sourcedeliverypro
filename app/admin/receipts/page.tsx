'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText, Plus, Search, Download, Printer, ShieldCheck, History,
  X, CheckCircle2, Edit3, Trash2, Eye, AlertCircle, Save, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { getLocalReceipts, saveLocalReceipt, deleteLocalReceipt, getDeletedReceipts, addDeletedReceipt } from '@/lib/payments/manualOptions'

export type ItemStatus = 'PAID' | 'NOT_PAID'

export interface ReceiptLineItem {
  id: string
  description: string
  amount: number
  status: ItemStatus
  enabled: boolean
}

export interface AdminReceipt {
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
}

export const AVAILABLE_DESCRIPTIONS = [
  'Consignment Freight Charge & Handling',
  'Customs Clearance, Handling & Insurance Tax',
  'Standard Courier Service',
  'Usual Courier Service',
  'Over Night Express Service',
] as const

export const DEFAULT_DESCRIPTION_AMOUNTS: Record<string, number> = {
  'Consignment Freight Charge & Handling': 120.00,
  'Customs Clearance, Handling & Insurance Tax': 12.00,
  'Standard Courier Service': 45.00,
  'Usual Courier Service': 65.00,
  'Over Night Express Service': 95.00,
}

export function getReceiptItems(rcpt: Partial<AdminReceipt> | null | undefined): ReceiptLineItem[] {
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

  // Inline amount edit for viewing receipt
  const [editingAmountItemId, setEditingAmountItemId] = useState<string | null>(null)
  const [inlineAmountValue, setInlineAmountValue] = useState<string>('')

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

  // Create Receipt
  const handleGenerateReceipt = (e: React.FormEvent) => {
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
    }

    saveLocalReceipt(newRcpt)
    setReceipts((prev) => [newRcpt, ...prev])
    setShowCreateModal(false)
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

  // Toggle line item ON or OFF in viewing modal
  const handleToggleViewingItem = (desc: string) => {
    if (!viewingReceipt) return
    const currentItems = getReceiptItems(viewingReceipt)
    const newItems = currentItems.map((it) => {
      if (it.description === desc) {
        return { ...it, enabled: !it.enabled }
      }
      return it
    })

    const enabled = newItems.filter((it) => it.enabled)
    const newTotal = enabled.reduce((acc, it) => acc + (Number(it.amount) || 0), 0)
    const allPaid = enabled.length > 0 && enabled.every((it) => it.status === 'PAID')
    const nonePaid = enabled.length > 0 && enabled.every((it) => it.status === 'NOT_PAID')

    const updated: AdminReceipt = {
      ...viewingReceipt,
      items: newItems,
      total: Math.round(newTotal * 100) / 100,
      subtotal: Number(enabled[0]?.amount) || 0,
      tax: Number(enabled[1]?.amount) || 0,
      status: nonePaid ? 'DRAFT' : allPaid ? 'PAID' : 'PARTIALLY_PAID',
    }

    setViewingReceipt(updated)
    setReceipts((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    saveLocalReceipt(updated)
  }

  // Toggle item status between PAID and NOT_PAID in viewing modal
  const handleToggleItemStatus = (itemId: string) => {
    if (!viewingReceipt) return
    const currentItems = getReceiptItems(viewingReceipt)
    const newItems = currentItems.map((it) => {
      if (it.id === itemId || it.description === itemId) {
        const nextStatus: ItemStatus = it.status === 'PAID' ? 'NOT_PAID' : 'PAID'
        return { ...it, status: nextStatus }
      }
      return it
    })

    const enabled = newItems.filter((it) => it.enabled)
    const allPaid = enabled.length > 0 && enabled.every((it) => it.status === 'PAID')
    const nonePaid = enabled.length > 0 && enabled.every((it) => it.status === 'NOT_PAID')

    const updated: AdminReceipt = {
      ...viewingReceipt,
      items: newItems,
      status: nonePaid ? 'DRAFT' : allPaid ? 'PAID' : 'PARTIALLY_PAID',
    }

    setViewingReceipt(updated)
    setReceipts((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    saveLocalReceipt(updated)
  }

  // Switch line item description in viewing modal
  const handleChangeItemDescription = (itemId: string, newDesc: string) => {
    if (!viewingReceipt) return
    const currentItems = getReceiptItems(viewingReceipt)
    const newItems = currentItems.map((it) => {
      if (it.id === itemId) {
        return { ...it, description: newDesc }
      }
      return it
    })

    const updated: AdminReceipt = {
      ...viewingReceipt,
      items: newItems,
    }

    setViewingReceipt(updated)
    setReceipts((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    saveLocalReceipt(updated)
  }

  // Save inline edited amount in viewing modal
  const handleSaveInlineAmount = (itemId: string) => {
    if (!viewingReceipt) return
    const num = Math.max(0, parseFloat(inlineAmountValue) || 0)
    const currentItems = getReceiptItems(viewingReceipt)
    const newItems = currentItems.map((it) => {
      if (it.id === itemId) {
        return { ...it, amount: num }
      }
      return it
    })

    const enabled = newItems.filter((it) => it.enabled)
    const newTotal = enabled.reduce((acc, it) => acc + (Number(it.amount) || 0), 0)

    const updated: AdminReceipt = {
      ...viewingReceipt,
      items: newItems,
      total: Math.round(newTotal * 100) / 100,
      subtotal: Number(enabled[0]?.amount) || 0,
      tax: Number(enabled[1]?.amount) || 0,
    }

    setViewingReceipt(updated)
    setReceipts((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    saveLocalReceipt(updated)
    setEditingAmountItemId(null)
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

  // Filtered list
  const filtered = receipts.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus
    const term = search.toLowerCase()
    const matchesSearch =
      r.receiptNumber.toLowerCase().includes(term) ||
      r.customerName.toLowerCase().includes(term) ||
      r.customerEmail.toLowerCase().includes(term) ||
      r.trackingNumber.toLowerCase().includes(term) ||
      r.paymentRef.toLowerCase().includes(term)
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
                <th className="p-3">Associated AWB</th>
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
                    {r.receiptNumber}
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-white block text-sm">{r.customerName}</span>
                    <span className="text-[10px] text-slate-400">{r.customerEmail}</span>
                  </td>
                  <td className="p-3 font-mono text-[#6B2737] font-bold">{r.trackingNumber}</td>
                  <td className="p-3">
                    <span className="font-mono text-slate-300 block">{r.paymentRef}</span>
                    <span className="text-[10px] text-slate-500">{r.paymentMethod}</span>
                  </td>
                  <td className="p-3 font-bold text-white">{formatCurrency(r.total)}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        statusBadges[r.status] || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
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
      {viewingReceipt && (() => {
        const currentViewingItems = getReceiptItems(viewingReceipt)
        const enabledViewingItems = currentViewingItems.filter((it) => it.enabled)
        const computedViewingTotal = enabledViewingItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0)
        const viewingAllPaid = enabledViewingItems.length > 0 && enabledViewingItems.every((it) => it.status === 'PAID')
        const viewingAnyPaid = enabledViewingItems.some((it) => it.status === 'PAID')

        return (
          <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl relative border border-slate-200">
              <button
                onClick={() => setViewingReceipt(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
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
                    Associated AWB: <strong className="font-mono text-[#6B2737]">{viewingReceipt.trackingNumber}</strong>
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

              {/* Description & Freight Breakdown Section */}
              <div className="space-y-3 text-xs">
                {/* Description Toggle Controls (Admin Toolbar under Description Column, hidden when printing) */}
                <div className="print:hidden bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      Toggle Descriptions in Freight Breakdown
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Click any item to toggle ON / OFF
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_DESCRIPTIONS.map((desc) => {
                      const active = currentViewingItems.some(
                        (it) => it.description === desc && it.enabled
                      )
                      return (
                        <button
                          key={desc}
                          type="button"
                          onClick={() => handleToggleViewingItem(desc)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
                            active
                              ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-xs hover:bg-[#243660]'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              active ? 'bg-emerald-400' : 'bg-slate-300'
                            }`}
                          />
                          <span>{desc}</span>
                          <span
                            className={`text-[9px] px-1 rounded font-bold ${
                              active ? 'bg-emerald-400/20 text-emerald-300' : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {active ? 'ON' : 'OFF'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Table with 3 columns: DESCRIPTION & FREIGHT BREAKDOWN | AMOUNT (USD) | STATUS */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 font-bold text-slate-500 uppercase text-[10px]">
                        <th className="text-left px-3.5 py-2.5">Description &amp; Freight Breakdown</th>
                        <th className="text-right px-3.5 py-2.5 w-32">Amount (USD)</th>
                        <th className="text-center px-3.5 py-2.5 w-28">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {enabledViewingItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-3.5 py-2.5 text-slate-700">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">{item.description}</span>
                              {/* Admin switcher dropdown between descriptions (hidden on print) */}
                              <select
                                value={item.description}
                                onChange={(e) => handleChangeItemDescription(item.id, e.target.value)}
                                className="print:hidden text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-500 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-[#6B2737]"
                                title="Switch description"
                              >
                                {AVAILABLE_DESCRIPTIONS.map((d) => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono font-medium text-slate-800">
                            {editingAmountItemId === item.id ? (
                              <div className="flex items-center justify-end gap-1 print:hidden">
                                <span className="text-slate-400 font-mono text-xs">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  autoFocus
                                  value={inlineAmountValue}
                                  onChange={(e) => setInlineAmountValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveInlineAmount(item.id)
                                    if (e.key === 'Escape') setEditingAmountItemId(null)
                                  }}
                                  className="w-20 px-1.5 py-0.5 text-right border border-[#6B2737] rounded font-mono text-xs focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveInlineAmount(item.id)}
                                  className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                                  title="Save"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1 group">
                                <span>{formatCurrency(item.amount)}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAmountItemId(item.id)
                                    setInlineAmountValue(String(item.amount))
                                  }}
                                  className="print:hidden opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700 p-0.5 rounded hover:bg-slate-100"
                                  title="Click to edit amount"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 text-center">
                            {/* Admin toggle: Click to toggle Paid / Not Paid */}
                            <button
                              type="button"
                              onClick={() => handleToggleItemStatus(item.id)}
                              className={`print:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide cursor-pointer transition-all border shadow-xs ${
                                item.status === 'PAID'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                              }`}
                              title="Click to toggle Paid / Not Paid"
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.status === 'PAID' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              />
                              {item.status === 'PAID' ? 'Paid' : 'Not Paid'}
                            </button>
                            {/* Clean print badge */}
                            <span
                              className={`hidden print:inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                item.status === 'PAID' ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {item.status === 'PAID' ? 'PAID' : 'NOT PAID'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {enabledViewingItems.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-3.5 py-6 text-center text-slate-400 text-xs italic">
                            No items enabled. Click the toggle buttons above to add descriptions to the breakdown.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300 font-black text-sm text-[#1B2A4A] bg-slate-50/40">
                        <td className="px-3.5 py-3">Total Amount</td>
                        <td className="px-3.5 py-3 text-right font-mono text-emerald-600 text-base">
                          {formatCurrency(computedViewingTotal)}
                        </td>
                        <td className="px-3.5 py-3 text-center">
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                              viewingAllPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : viewingAnyPaid
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {viewingAllPaid ? 'PAID' : viewingAnyPaid ? 'PARTIAL' : 'NOT PAID'}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
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

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" /> Print Statement
                  </Button>
                  <Button
                    onClick={() => alert(`Downloading signed PDF receipt ${viewingReceipt.receiptNumber}...`)}
                    className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

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
                  <label className="block text-slate-400 font-bold mb-1">Associated AWB / Tracking #</label>
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

