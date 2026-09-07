'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { FileText, Download, DollarSign, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface Invoice {
  id: string
  invoiceNumber: string
  trackingNumber: string
  amount: number
  dueDate: string
  status: 'PAID' | 'UNPAID' | 'OVERDUE'
  paidAt?: string
}

export default function InvoicesPage() {
  const [filter, setFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL')
  const [invoices, setInvoices] = useState<Invoice[]>([])

  React.useEffect(() => {
    try {
      const savedRaw = localStorage.getItem('sourcedeliverypro_admin_shipments') || localStorage.getItem('swiftship_admin_shipments')
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw)
        const list = Array.isArray(parsed) ? parsed : Object.values(parsed)
        const mapped: Invoice[] = list.map((s: any, idx: number) => ({
          id: s.id || `inv-${idx}`,
          invoiceNumber: s.invoiceNumber || `INV-2026-${Math.floor(10000 + idx * 37)}`,
          trackingNumber: s.trackingNumber || s.id || `SDP-${idx}`,
          amount: Number(s.amount) || (Number(s.weight) || 2) * 25,
          dueDate: s.estimatedDelivery || 'Net 15 Days',
          status: s.status === 'LABEL_CREATED' || s.status === 'DELIVERED' ? 'PAID' : 'UNPAID',
          paidAt: s.receipt?.createdDate || undefined,
        }))
        setInvoices(mapped)
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const filtered = invoices.filter((i) => (filter === 'ALL' ? true : i.status === filter))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1B2A4A]">Freight Invoices</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review commercial billing records, download PDF statements, and authorize payments.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {(['ALL', 'UNPAID', 'PAID'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === f ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Associated AWB</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-bold text-[#1B2A4A]">{inv.invoiceNumber}</td>
                  <td className="p-4 font-mono text-slate-600">{inv.trackingNumber}</td>
                  <td className="p-4 text-slate-500">{inv.dueDate}</td>
                  <td className="p-4 font-bold text-[#1B2A4A]">{formatCurrency(inv.amount)}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => alert(`Downloading Invoice PDF ${inv.invoiceNumber}...`)}
                      className="text-xs text-slate-600 hover:text-[#1B2A4A]"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> PDF
                    </Button>

                    {inv.status === 'UNPAID' && (
                      <Button asChild size="sm" className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
                        <Link href="/checkout">Pay Invoice</Link>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No invoices found. Invoices are generated automatically when shipments are booked.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
