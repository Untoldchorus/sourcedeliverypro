'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Box, Search, Edit3, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

const ALL_STATUSES = [
  'DRAFT',
  'PENDING_PAYMENT',
  'LABEL_CREATED',
  'PICKUP_SCHEDULED',
  'PICKED_UP',
  'IN_TRANSIT',
  'ARRIVED_AT_FACILITY',
  'DEPARTED_FACILITY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'EXCEPTION',
  'RETURNED',
  'CANCELLED',
]

const statusColors: Record<string, string> = {
  IN_TRANSIT: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  DELIVERED: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  PENDING_PAYMENT: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  PENDING: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  OUT_FOR_DELIVERY: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  EXCEPTION: 'text-red-400 border-red-500/30 bg-red-500/10',
  CANCELLED: 'text-slate-400 border-slate-600/30 bg-slate-800/30',
  RETURNED: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  PICKUP_SCHEDULED: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
  PICKED_UP: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
  LABEL_CREATED: 'text-slate-300 border-slate-600/30 bg-slate-800/30',
  ARRIVED_AT_FACILITY: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
  DEPARTED_FACILITY: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
  DRAFT: 'text-slate-500 border-slate-700/30 bg-slate-900/30',
}

const defaultShipments: any[] = []

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState(defaultShipments)
  const [search, setSearch] = useState('')
  const [statusSaved, setStatusSaved] = useState<string | null>(null)

  // Load any previously persisted shipment edits and newly created shipments from localStorage
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem('sourcedeliverypro_admin_shipments') || localStorage.getItem('swiftship_admin_shipments')
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw)
        const localList: any[] = Array.isArray(parsed) ? parsed : Object.values(parsed)

        setShipments((prev) => {
          const map = new Map<string, any>()
          // 1. Put defaults first
          prev.forEach((s) => map.set(s.id, s))
          // 2. Override or add from local storage
          localList.forEach((s: any) => {
            const key = s.id || s.trackingNumber
            if (key) {
              const existing = map.get(key) || {}
              map.set(key, {
                ...existing,
                ...s,
                id: key,
                trackingNumber: s.trackingNumber || existing.trackingNumber || key,
                sender: s.sender || `${s.senderName || 'Sender'} (${s.senderCity || 'Origin'})`,
                recipient: s.recipient || `${s.recipientName || 'Recipient'} (${s.recipientCity || 'Destination'})`,
                service: s.service || s.serviceType || 'Express Courier',
                status: s.status || 'PENDING_PAYMENT',
                amount: Number(s.amount) || 145.5,
              })
            }
          })
          return Array.from(map.values())
        })
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleStatusChange = (id: string, newStatus: string) => {
    const updated = shipments.map((s) =>
      s.id === id ? { ...s, status: newStatus } : s
    )
    setShipments(updated)

    // Persist to localStorage
    try {
      const savedRaw = localStorage.getItem('sourcedeliverypro_admin_shipments') || localStorage.getItem('swiftship_admin_shipments')
      const savedMap = savedRaw ? JSON.parse(savedRaw) : {}
      savedMap[id] = { ...(savedMap[id] || {}), status: newStatus }
      localStorage.setItem('sourcedeliverypro_admin_shipments', JSON.stringify(savedMap))
      localStorage.setItem('swiftship_admin_shipments', JSON.stringify(savedMap))
    } catch (e) {
      console.error(e)
    }

    setStatusSaved(id)
    setTimeout(() => setStatusSaved(null), 2000)
  }

  const filtered = shipments.filter(
    (s) =>
      s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.recipient.toLowerCase().includes(search.toLowerCase()) ||
      s.sender.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Box className="w-6 h-6 text-[#6B2737]" />
            Master Shipment Control &amp; Editor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quick status override inline, or open full editor for sender/recipient/financial controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search AWB, sender, or recipient..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
            />
          </div>
          <Button asChild className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
            <Link href="/admin/tracking-generator">+ Create New AWB</Link>
          </Button>
        </div>
      </div>

      {/* Master Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">AWB / Tracking #</th>
                <th className="p-3">Sender → Recipient</th>
                <th className="p-3">Service</th>
                <th className="p-3">Driver &amp; Facility</th>
                <th className="p-3 min-w-[200px]">Status Override</th>
                <th className="p-3">Freight Price</th>
                <th className="p-3 text-right">Full Editor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((s) => {
                const colorClass = statusColors[s.status] || 'text-slate-300 border-slate-600/30 bg-slate-800/20'
                return (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#6B2737]">{s.trackingNumber}</td>
                    <td className="p-3">
                      <span className="font-bold text-white block">{s.recipient}</span>
                      <span className="text-[10px] text-slate-400">From: {s.sender}</span>
                    </td>
                    <td className="p-3 font-medium text-slate-300">{s.service}</td>
                    <td className="p-3">
                      <span className="font-semibold text-amber-400 block">{s.driver}</span>
                      <span className="text-[10px] text-slate-500">{s.facility}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={s.status}
                          onChange={(e) => handleStatusChange(s.id, e.target.value)}
                          className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-[#6B2737] bg-slate-950 cursor-pointer ${colorClass}`}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st} className="bg-slate-900 text-slate-200">
                              {st.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                        {statusSaved === s.id && (
                          <span title="Status saved"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /></span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">{formatCurrency(s.amount)}</td>
                    <td className="p-3 text-right">
                      <Button asChild size="sm" className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
                        <Link href={`/admin/shipments/${s.id}`}>
                          <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit All
                        </Link>
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No shipments registered yet. Shipments booked by customers or created by admins will appear here.
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
