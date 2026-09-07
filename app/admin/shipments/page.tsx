'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Box, Search, Edit3, CheckCircle2, Globe, MessageSquare, ExternalLink, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { getLocalShipments, saveLocalShipment } from '@/lib/payments/manualOptions'

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

const DEFAULT_SEED_SHIPMENTS = [
  {
    id: 'SDP8F4K92LM381',
    trackingNumber: 'SDP8F4K92LM381',
    recipient: 'Sarah Jenkins (London)',
    sender: 'John Doe (New York)',
    service: 'International Express Air',
    driver: 'Marcus Vance',
    facility: 'JFK Dispatch Hub',
    status: 'IN_TRANSIT',
    amount: 145.5,
    currentLocation: 'JFK International Airport Hub, New York, US',
    mapQuery: 'JFK+Airport+New+York',
    showMap: true,
    remarks: [{ id: '1', text: 'Cleared export security screening.', category: 'Operational Update', timestamp: '2026-09-05T12:30:00Z', author: 'Admin', public: true }],
  },
  {
    id: 'SDP993C104KL22',
    trackingNumber: 'SDP993C104KL22',
    recipient: 'Acme Corp Warehouse (Lagos)',
    sender: 'Global Supplier (New York)',
    service: 'Heavy Freight Ocean/Air',
    driver: 'Olamide Johnson',
    facility: 'Murtala Muhammed Freight Facility',
    status: 'CUSTOMS_CLEARANCE',
    amount: 320.0,
    currentLocation: 'Murtala Muhammed Freight Facility, Lagos, NG',
    mapQuery: 'Lagos,Nigeria',
    showMap: true,
    remarks: [{ id: '2', text: 'Customs duty inspection in progress.', category: 'Customs Note', timestamp: '2026-09-06T06:45:00Z', author: 'Admin', public: true }],
  },
  {
    id: 'SDP77B219KP440',
    trackingNumber: 'SDP77B219KP440',
    recipient: 'Marcus Vance (Frankfurt)',
    sender: 'Toronto Export Center (CA)',
    service: 'Standard Air Cargo',
    driver: 'Hans Weber',
    facility: 'Frankfurt Cargo Sorting Terminal',
    status: 'DELIVERED',
    amount: 98.75,
    currentLocation: 'Frankfurt Cargo Sorting Terminal, DE — Delivered',
    mapQuery: 'Frankfurt,Germany',
    showMap: false,
    remarks: [{ id: '3', text: 'Handed over and signed by recipient.', category: 'Transit Milestone', timestamp: '2026-09-04T14:30:00Z', author: 'Admin', public: true }],
  },
]

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusSaved, setStatusSaved] = useState<string | null>(null)

  // Load shipments from localStorage or fallback to defaults
  const loadShipments = () => {
    try {
      const localList = getLocalShipments()
      const map = new Map<string, any>()

      // 1. Put defaults first
      DEFAULT_SEED_SHIPMENTS.forEach((s) => map.set(s.id, s))

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
            service: s.service || s.serviceType || existing.service || 'Express Courier',
            driver: s.driver || s.assignedDriver || existing.driver || 'Assigned Carrier Driver',
            facility: s.facility || s.assignedFacility || existing.facility || 'Regional Hub',
            status: s.status || existing.status || 'PENDING_PAYMENT',
            amount: Number(s.amount) || Number(s.totalAmount) || existing.amount || 145.5,
            currentLocation: s.currentLocation || s.location || existing.currentLocation || 'Operations Dispatch',
            mapQuery: s.mapQuery || existing.mapQuery || '',
            showMap: s.showMap !== undefined ? Boolean(s.showMap) : existing.showMap !== undefined ? Boolean(existing.showMap) : true,
            remarks: Array.isArray(s.remarks) ? s.remarks : existing.remarks || [],
          })
        }
      })
      setShipments(Array.from(map.values()))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadShipments()
  }, [])

  const handleStatusChange = (id: string, newStatus: string) => {
    const target = shipments.find((s) => s.id === id || s.trackingNumber === id)
    if (target) {
      const updatedItem = { ...target, status: newStatus }
      saveLocalShipment(updatedItem)
    }

    const updated = shipments.map((s) =>
      s.id === id || s.trackingNumber === id ? { ...s, status: newStatus } : s
    )
    setShipments(updated)

    setStatusSaved(id)
    setTimeout(() => setStatusSaved(null), 2000)
  }

  const filtered = shipments.filter(
    (s) =>
      (s.trackingNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.recipient || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.sender || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.currentLocation || '').toLowerCase().includes(search.toLowerCase())
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
            Inline status overrides, map visibility status, consignment remarks, and complete shipment master control.
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
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]"
            />
          </div>
          <Button asChild className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs">
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
                <th className="p-3 min-w-[200px]">Live Telemetry &amp; Map</th>
                <th className="p-3">Service &amp; Driver</th>
                <th className="p-3 min-w-[190px]">Status Override</th>
                <th className="p-3">Price</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((s) => {
                const colorClass = statusColors[s.status] || 'text-slate-300 border-slate-600/30 bg-slate-800/20'
                return (
                  <tr key={s.id || s.trackingNumber} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-mono font-bold text-[#6B2737] flex items-center gap-1.5">
                        {s.trackingNumber}
                        <Link
                          href={`/tracking?number=${s.trackingNumber}`}
                          target="_blank"
                          title="View Public Tracking"
                          className="text-slate-500 hover:text-white"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-white block">{s.recipient}</span>
                      <span className="text-[10px] text-slate-400">From: {s.sender}</span>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[11px] text-white font-medium truncate max-w-[220px]">
                          <MapPin className="w-3 h-3 text-[#6B2737] shrink-0" />
                          <span className="truncate">{s.currentLocation || 'Processing Hub'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              s.showMap !== false
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {s.showMap !== false ? 'Map: ON' : 'Map: OFF'}
                          </span>
                          {s.remarks && s.remarks.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <MessageSquare className="w-2.5 h-2.5" />
                              {s.remarks.length} remark(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-slate-200 block">{s.service}</span>
                      <span className="text-[10px] text-amber-400/80">{s.driver}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={s.status}
                          onChange={(e) => handleStatusChange(s.id || s.trackingNumber, e.target.value)}
                          className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-[#6B2737] bg-slate-950 cursor-pointer ${colorClass}`}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st} className="bg-slate-900 text-slate-200">
                              {st.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                        {statusSaved === (s.id || s.trackingNumber) && (
                          <span title="Status saved"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /></span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">{formatCurrency(s.amount)}</td>
                    <td className="p-3 text-right">
                      <Button asChild size="sm" className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs">
                        <Link href={`/admin/shipments/${s.id || s.trackingNumber}`}>
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

