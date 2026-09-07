'use client'

import React, { useState, useEffect } from 'react'
import { FileText, Plus, Search, Download, Printer, ShieldCheck, History, X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

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
}

export default function AdminReceiptsPage() {
  const [receipts, setReceipts] = useState<AdminReceipt[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sourcedeliverypro_admin_receipts') || localStorage.getItem('swiftship_admin_receipts')
      if (raw) {
        const parsed = JSON.parse(raw)
        const list = Array.isArray(parsed) ? parsed : Object.values(parsed)
        if (list.length > 0) {
          setReceipts((prev) => {
            const existingIds = new Set(prev.map((r) => r.receiptNumber || r.id))
            const fresh = list.filter((r: any) => !existingIds.has(r.receiptNumber || r.id))
            return [...fresh, ...prev]
          })
        }
      }
    } catch {}
  }, [])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState('John Doe (john@example.com)')
  const [selectedAWB, setSelectedAWB] = useState('SDP8F4K92LM381')
  const [subtotal, setSubtotal] = useState('145.50')
  const [tax, setTax] = useState('10.00')
  const [paymentMethod, setPaymentMethod] = useState('Credit Card (Visa)')

  const handleGenerateReceipt = (e: React.FormEvent) => {
    e.preventDefault()

    const newRcpt: AdminReceipt = {
      id: 'rcpt-' + Date.now(),
      receiptNumber: 'RCPT-2026-' + Math.floor(10000 + Math.random() * 90000),
      version: 1,
      customerName: selectedCustomer.split(' (')[0],
      customerEmail: selectedCustomer.includes('(') ? selectedCustomer.split('(')[1].replace(')', '') : 'customer@sourcedeliverypro.com',
      trackingNumber: selectedAWB,
      paymentRef: 'PAY-2026-' + Math.floor(10000 + Math.random() * 90000),
      paymentMethod,
      subtotal: Number(subtotal),
      tax: Number(tax),
      total: Number(subtotal) + Number(tax),
      status: 'PAID',
      createdDate: 'Today',
    }

    setReceipts([newRcpt, ...receipts])
    setShowCreateModal(false)
  }

  const handleVoidReceipt = (id: string) => {
    setReceipts(
      receipts.map((r) => {
        if (r.id === id) {
          return { ...r, status: 'VOID', version: r.version + 1 }
        }
        return r
      })
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#6B2737]" />
            Commercial Receipt Generator & Revision Engine (`receipts.*`)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate formal receipts, edit version history (Version 1, 2...), and manage receipt status lifecycle.
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)} className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
          <Plus className="w-4 h-4 mr-1.5" /> Generate Commercial Receipt
        </Button>
      </div>

      {/* Receipts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Receipt # & Version</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Associated AWB</th>
                <th className="p-3">Payment Provider & Ref</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {receipts.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-white">
                    {r.receiptNumber}
                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-400/20">
                      v{r.version}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-white block">{r.customerName}</span>
                    <span className="text-[10px] text-slate-400">{r.customerEmail}</span>
                  </td>
                  <td className="p-3 font-mono text-[#6B2737]">{r.trackingNumber}</td>
                  <td className="p-3">
                    <span className="font-mono text-slate-300 block">{r.paymentRef}</span>
                    <span className="text-[10px] text-slate-500">{r.paymentMethod}</span>
                  </td>
                  <td className="p-3 font-bold text-emerald-400">{formatCurrency(r.total)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : r.status === 'VOID'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => alert(`Downloading Receipt PDF ${r.receiptNumber} (Version ${r.version})...`)}
                      className="text-xs text-slate-300 hover:text-white"
                      title="Download PDF Receipt"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>

                    {r.status !== 'VOID' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleVoidReceipt(r.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                        title="Void Receipt (Soft audit void)"
                      >
                        Void
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {receipts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No commercial receipts issued yet. Receipts will appear here automatically when payments are approved.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Receipt Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-white">Generate Commercial Receipt</h2>

            <form onSubmit={handleGenerateReceipt} className="space-y-3 text-xs text-slate-300">
              <div>
                <label className="block font-semibold mb-1">Select Customer</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                >
                  <option value="John Doe (john@example.com)">John Doe (john@example.com)</option>
                  <option value="Sarah Jenkins (sarah.jenkins@example.co.uk)">Sarah Jenkins (sarah.jenkins@example.co.uk)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Select Shipment AWB</label>
                <select
                  value={selectedAWB}
                  onChange={(e) => setSelectedAWB(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                >
                  <option value="SDP8F4K92LM381">SDP8F4K92LM381 — International Express ($145.50)</option>
                  <option value="SDP77B219KP440">SDP77B219KP440 — Tracked Air ($88.00)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Subtotal ($)</label>
                  <input
                    type="text"
                    value={subtotal}
                    onChange={(e) => setSubtotal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tax / Duties ($)</label>
                  <input
                    type="text"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Payment Provider Method</label>
                <input
                  type="text"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="border-slate-800 text-slate-400">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold">
                  Generate Receipt PDF
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
