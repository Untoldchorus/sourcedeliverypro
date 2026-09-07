'use client'

import React, { useState } from 'react'
import { MapPin, Search, RefreshCw, AlertTriangle, CheckCircle2, Clock, Package, Truck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const mockTrackingEvents = [
  {
    id: 'TRK-001',
    awb: 'SDP8F4K92LM381',
    recipient: 'Sarah Jenkins',
    origin: 'New York, US',
    destination: 'London, GB',
    currentLocation: 'JFK International Airport',
    status: 'IN_TRANSIT',
    lastUpdate: '2026-09-06 08:14',
    eta: 'Sep 08, 2026',
    driver: 'Marcus Vance',
    events: [
      { time: 'Sep 05, 08:00', location: 'New York, US', event: 'Shipment picked up from sender', type: 'pickup' },
      { time: 'Sep 05, 12:30', location: 'JFK Dispatch Hub', event: 'Processed at export facility', type: 'facility' },
      { time: 'Sep 05, 18:00', location: 'JFK International Airport', event: 'Departed on flight AA101', type: 'transit' },
      { time: 'Sep 06, 08:14', location: 'In transit — Atlantic', event: 'In-flight scan', type: 'transit' },
    ],
  },
  {
    id: 'TRK-002',
    awb: 'SDP993C104KL22',
    recipient: 'Acme Corp Warehouse',
    origin: 'New York, US',
    destination: 'Lagos, NG',
    currentLocation: 'Customs Clearance — Lagos',
    status: 'CUSTOMS_CLEARANCE',
    lastUpdate: '2026-09-06 06:45',
    eta: 'Sep 10, 2026',
    driver: 'Olamide Johnson',
    events: [
      { time: 'Sep 03, 09:00', location: 'New York, US', event: 'Picked up from sender', type: 'pickup' },
      { time: 'Sep 04, 14:00', location: 'JFK Export Hub', event: 'Export customs cleared', type: 'customs' },
      { time: 'Sep 05, 22:00', location: 'Lagos, NG', event: 'Arrived at Murtala Airport', type: 'facility' },
      { time: 'Sep 06, 06:45', location: 'Lagos Customs', event: 'Under customs inspection', type: 'customs' },
    ],
  },
  {
    id: 'TRK-003',
    awb: 'SDP77B219KP440',
    recipient: 'Marcus Vance (Frankfurt)',
    origin: 'Toronto, CA',
    destination: 'Frankfurt, DE',
    currentLocation: 'Delivered',
    status: 'DELIVERED',
    lastUpdate: 'Sep 04, 14:30',
    eta: 'Delivered',
    driver: 'Hans Weber',
    events: [
      { time: 'Sep 02, 10:00', location: 'Toronto, CA', event: 'Picked up', type: 'pickup' },
      { time: 'Sep 03, 08:00', location: 'Frankfurt, DE', event: 'Arrived at Frankfurt Hub', type: 'facility' },
      { time: 'Sep 04, 14:30', location: 'Frankfurt, DE', event: 'Delivered — signed by M. Weber', type: 'delivered' },
    ],
  },
]

const statusColors: Record<string, string> = {
  IN_TRANSIT: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  CUSTOMS_CLEARANCE: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  DELIVERED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  EXCEPTION: 'text-red-400 bg-red-500/10 border-red-500/30',
  OUT_FOR_DELIVERY: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
}

const eventTypeColors: Record<string, string> = {
  pickup: 'bg-orange-500',
  facility: 'bg-blue-500',
  transit: 'bg-indigo-500',
  customs: 'bg-amber-500',
  delivered: 'bg-emerald-500',
}

export default function TrackingOverridesPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<typeof mockTrackingEvents[0] | null>(null)
  const [overrideLocation, setOverrideLocation] = useState('')
  const [overrideStatus, setOverrideStatus] = useState('')
  const [saved, setSaved] = useState(false)

  const filtered = mockTrackingEvents.filter(
    (t) =>
      t.awb.toLowerCase().includes(search.toLowerCase()) ||
      t.recipient.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase())
  )

  const handleOverride = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#6B2737]" />
            Tracking Overrides &amp; Live Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor real-time shipment positions. Force-inject location events and override tracking status.
          </p>
        </div>
        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs">
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh Feed
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Shipments', value: '2', icon: Truck, color: 'text-blue-400' },
          { label: 'In Customs', value: '1', icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'Delivered Today', value: '1', icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Avg Transit Time', value: '3.2d', icon: Clock, color: 'text-slate-300' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <div>
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500 font-semibold">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tracking List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search AWB, recipient, destination..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => { setSelected(t); setOverrideLocation(t.currentLocation); setOverrideStatus(t.status) }}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${selected?.id === t.id ? 'border-[#6B2737] bg-[#6B2737]/5' : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#6B2737]">{t.awb}</span>
                    <p className="text-xs font-semibold text-white mt-0.5">{t.recipient}</p>
                    <p className="text-[10px] text-slate-400">{t.origin} → {t.destination}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[t.status] || 'text-slate-300 bg-slate-800 border-slate-700'}`}>
                    {t.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">📍 {t.currentLocation} · Updated {t.lastUpdate}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Detail & Override Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          {selected ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Selected Shipment</span>
                  <h2 className="text-lg font-black text-white font-mono">{selected.awb}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tracking Timeline</p>
                {selected.events.map((ev, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${eventTypeColors[ev.type] || 'bg-slate-500'}`} />
                    <div>
                      <p className="text-xs text-white font-semibold">{ev.event}</p>
                      <p className="text-[10px] text-slate-500">{ev.location} · {ev.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Override Form */}
              <div className="border-t border-slate-800 pt-4">
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-3">⚡ Admin Override — Force Inject Event</p>
                {saved && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2 rounded-lg text-xs flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4" /> Override injected. Audit log created.
                  </div>
                )}
                <form onSubmit={handleOverride} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Force Location</label>
                    <input
                      type="text"
                      value={overrideLocation}
                      onChange={(e) => setOverrideLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Force Status</label>
                    <select
                      value={overrideStatus}
                      onChange={(e) => setOverrideStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs"
                    >
                      {['IN_TRANSIT','PICKED_UP','ARRIVED_AT_FACILITY','DEPARTED_FACILITY','CUSTOMS_CLEARANCE','CUSTOMS_HOLD','OUT_FOR_DELIVERY','DELIVERED','EXCEPTION','RETURNED'].map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" className="w-full bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
                    Inject Tracking Override
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 space-y-2">
              <Package className="w-10 h-10" />
              <p className="text-sm font-semibold">Select a shipment to view timeline &amp; override</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
