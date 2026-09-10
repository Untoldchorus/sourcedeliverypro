'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  X,
  Globe,
  Eye,
  EyeOff,
  MessageSquare,
  Plus,
  Trash2,
  ExternalLink,
  Edit3,
  Save,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getLocalShipments, saveLocalShipment, getDeletedShipments } from '@/lib/payments/manualOptions'

const DEFAULT_SEED_SHIPMENTS = [
  {
    id: 'SDP8F4K92LM381',
    trackingNumber: 'SDP8F4K92LM381',
    recipient: 'Sarah Jenkins (London)',
    recipientName: 'Sarah Jenkins',
    recipientCity: 'London',
    recipientCountry: 'GB',
    sender: 'John Doe (New York)',
    senderName: 'John Doe',
    senderCity: 'New York',
    senderCountry: 'US',
    origin: 'New York, US',
    destination: 'London, GB',
    currentLocation: 'JFK International Airport Hub, New York, US',
    mapQuery: 'JFK+Airport+New+York',
    showMap: true,
    status: 'IN_TRANSIT',
    service: 'Over Night Express Service',
    serviceType: 'Over Night Express Service',
    lastUpdate: '2026-09-06 08:14',
    eta: 'Sep 08, 2026',
    estimatedDelivery: 'Sep 08, 2026',
    driver: 'Marcus Vance',
    remarks: [
      {
        id: 'rem-1',
        text: 'Cleared export security screening and manifests at JFK Dispatch.',
        category: 'Operational Update',
        timestamp: '2026-09-05T12:30:00Z',
        author: 'JFK Dispatch Operations',
        public: true,
      },
    ],
    events: [
      { id: '1', time: 'Sep 05, 08:00', location: 'New York, US', event: 'Shipment picked up from sender', type: 'pickup', timestamp: '2026-09-05T08:00:00Z' },
      { id: '2', time: 'Sep 05, 12:30', location: 'JFK Dispatch Hub', event: 'Processed at export facility', type: 'facility', timestamp: '2026-09-05T12:30:00Z' },
      { id: '3', time: 'Sep 05, 18:00', location: 'JFK International Airport', event: 'Departed on flight AA101', type: 'transit', timestamp: '2026-09-05T18:00:00Z' },
      { id: '4', time: 'Sep 06, 08:14', location: 'In transit — Atlantic', event: 'In-flight scan', type: 'transit', timestamp: '2026-09-06T08:14:00Z' },
    ],
  },
  {
    id: 'SDP993C104KL22',
    trackingNumber: 'SDP993C104KL22',
    recipient: 'Acme Corp Warehouse (Lagos)',
    recipientName: 'Acme Corp Warehouse',
    recipientCity: 'Lagos',
    recipientCountry: 'NG',
    sender: 'Global Supplier (New York)',
    senderName: 'Global Supplier',
    senderCity: 'New York',
    senderCountry: 'US',
    origin: 'New York, US',
    destination: 'Lagos, NG',
    currentLocation: 'Murtala Muhammed Freight Facility, Lagos, NG',
    mapQuery: 'Lagos,Nigeria',
    showMap: true,
    status: 'CUSTOMS_CLEARANCE',
    service: 'Usual Courier Service',
    serviceType: 'Usual Courier Service',
    lastUpdate: '2026-09-06 06:45',
    eta: 'Sep 10, 2026',
    estimatedDelivery: 'Sep 10, 2026',
    driver: 'Olamide Johnson',
    remarks: [
      {
        id: 'rem-2',
        text: 'Customs duty declaration and inspection underway at Lagos terminal.',
        category: 'Customs Note',
        timestamp: '2026-09-06T06:45:00Z',
        author: 'Lagos Customs Liaison',
        public: true,
      },
    ],
    events: [
      { id: '1', time: 'Sep 03, 09:00', location: 'New York, US', event: 'Picked up from sender', type: 'pickup', timestamp: '2026-09-03T09:00:00Z' },
      { id: '2', time: 'Sep 04, 14:00', location: 'JFK Export Hub', event: 'Export customs cleared', type: 'customs', timestamp: '2026-09-04T14:00:00Z' },
      { id: '3', time: 'Sep 05, 22:00', location: 'Lagos, NG', event: 'Arrived at Murtala Airport', type: 'facility', timestamp: '2026-09-05T22:00:00Z' },
      { id: '4', time: 'Sep 06, 06:45', location: 'Lagos Customs', event: 'Under customs inspection', type: 'customs', timestamp: '2026-09-06T06:45:00Z' },
    ],
  },
  {
    id: 'SDP77B219KP440',
    trackingNumber: 'SDP77B219KP440',
    recipient: 'Marcus Vance (Frankfurt)',
    recipientName: 'Marcus Vance',
    recipientCity: 'Frankfurt',
    recipientCountry: 'DE',
    sender: 'Toronto Export Center (CA)',
    senderName: 'Toronto Export Center',
    senderCity: 'Toronto',
    senderCountry: 'CA',
    origin: 'Toronto, CA',
    destination: 'Frankfurt, DE',
    currentLocation: 'Frankfurt Cargo Sorting Terminal, DE — Delivered',
    mapQuery: 'Frankfurt,Germany',
    showMap: false,
    status: 'DELIVERED',
    service: 'Standard Courier Service',
    serviceType: 'Standard Courier Service',
    lastUpdate: 'Sep 04, 14:30',
    eta: 'Delivered',
    estimatedDelivery: 'Sep 04, 2026',
    driver: 'Hans Weber',
    remarks: [
      {
        id: 'rem-3',
        text: 'Consignment successfully handed over and signed for by recipient.',
        category: 'Transit Milestone',
        timestamp: '2026-09-04T14:30:00Z',
        author: 'Frankfurt Delivery Agent',
        public: true,
      },
    ],
    events: [
      { id: '1', time: 'Sep 02, 10:00', location: 'Toronto, CA', event: 'Picked up', type: 'pickup', timestamp: '2026-09-02T10:00:00Z' },
      { id: '2', time: 'Sep 03, 08:00', location: 'Frankfurt, DE', event: 'Arrived at Frankfurt Hub', type: 'facility', timestamp: '2026-09-03T08:00:00Z' },
      { id: '3', time: 'Sep 04, 14:30', location: 'Frankfurt, DE', event: 'Delivered — signed by M. Weber', type: 'delivered', timestamp: '2026-09-04T14:30:00Z' },
    ],
  },
]

const statusColors: Record<string, string> = {
  IN_TRANSIT: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  CUSTOMS_CLEARANCE: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  DELIVERED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  EXCEPTION: 'text-red-400 bg-red-500/10 border-red-500/30',
  OUT_FOR_DELIVERY: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  PENDING_PAYMENT: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  LABEL_CREATED: 'text-slate-300 bg-slate-800 border-slate-700',
}

export default function TrackingOverridesPage() {
  const [shipments, setShipments] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any | null>(null)

  // Edit fields for selected shipment
  const [currentLocation, setCurrentLocation] = useState('')
  const [mapQuery, setMapQuery] = useState('')
  const [showMap, setShowMap] = useState(true)
  const [status, setStatus] = useState('IN_TRANSIT')

  // Remarks state
  const [remarks, setRemarks] = useState<any[]>([])
  const [newRemarkText, setNewRemarkText] = useState('')
  const [newRemarkCategory, setNewRemarkCategory] = useState('Operational Update')
  const [newRemarkPublic, setNewRemarkPublic] = useState(true)

  const [saved, setSaved] = useState(false)

  // Load shipments on mount (respecting deleted blacklist)
  const loadShipments = async () => {
    try {
      const deleted = getDeletedShipments()
      const local = getLocalShipments()
      const mergedMap = new Map<string, any>()

      // 1. Seed defaults ONLY if not deleted
      DEFAULT_SEED_SHIPMENTS.forEach((s) => {
        const sId = s.id.toLowerCase()
        const sTrk = (s.trackingNumber || '').toLowerCase()
        if (!deleted.includes(sId) && !deleted.includes(sTrk)) {
          mergedMap.set(s.id, s)
        }
      })

      // 2. Fetch from database API
      try {
        const res = await fetch('/api/shipments')
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          json.data.forEach((dbItem: any) => {
            const key = dbItem.trackingNumber || dbItem.id
            const dId = (dbItem.id || '').toLowerCase()
            const dTrk = (dbItem.trackingNumber || '').toLowerCase()
            if (key && !deleted.includes(dId) && !deleted.includes(dTrk)) {
              mergedMap.set(key, {
                id: dbItem.id,
                trackingNumber: dbItem.trackingNumber || key,
                currentLocation: `${dbItem.senderCity || 'Processing Hub'}, ${dbItem.senderCountry || 'US'}`,
                mapQuery: `${dbItem.senderCity || 'New York'},${dbItem.senderCountry || 'USA'}`,
                showMap: true,
                status: dbItem.status || 'PENDING_PAYMENT',
                recipient: dbItem.recipientName || 'Customer',
                origin: dbItem.senderCity || 'Origin Facility',
                destination: dbItem.recipientCity || 'Destination Hub',
                remarks: [],
                events: [],
              })
            }
          })
        }
      } catch {}

      // 3. Overlay existing stored shipments (excluding deleted)
      local.forEach((s: any) => {
        const key = s.trackingNumber || s.id
        const sId = (s.id || '').toLowerCase()
        const sTrk = (s.trackingNumber || '').toLowerCase()
        if (key && !deleted.includes(sId) && !deleted.includes(sTrk)) {
          const existing = mergedMap.get(key) || {}
          mergedMap.set(key, {
            ...existing,
            ...s,
            id: key,
            trackingNumber: key,
            currentLocation: s.currentLocation || s.location || existing.currentLocation || 'Dispatch Facility',
            mapQuery: s.mapQuery || existing.mapQuery || 'New York,USA',
            showMap: s.showMap !== undefined ? Boolean(s.showMap) : existing.showMap !== undefined ? Boolean(existing.showMap) : true,
            status: s.status || existing.status || 'IN_TRANSIT',
            recipient: s.recipient || s.recipientName || existing.recipient || 'Customer',
            origin: s.origin || s.senderCity || existing.origin || 'Origin Facility',
            destination: s.destination || s.recipientCity || existing.destination || 'Destination Hub',
            remarks: Array.isArray(s.remarks) ? s.remarks : existing.remarks || [],
            events: Array.isArray(s.events) ? s.events : existing.events || [],
          })
        }
      })

      const list = Array.from(mergedMap.values())
      setShipments(list)

      // If nothing selected or selected item was updated, keep selection in sync
      if (selected) {
        const stillSelected = list.find((s) => (s.trackingNumber || s.id) === (selected.trackingNumber || selected.id))
        if (stillSelected) {
          setSelected(stillSelected)
          setCurrentLocation(stillSelected.currentLocation || '')
          setMapQuery(stillSelected.mapQuery || '')
          setShowMap(stillSelected.showMap !== undefined ? Boolean(stillSelected.showMap) : true)
          setStatus(stillSelected.status || 'IN_TRANSIT')
          setRemarks(Array.isArray(stillSelected.remarks) ? stillSelected.remarks : [])
        }
      } else if (list.length > 0) {
        const first = list[0]
        setSelected(first)
        setCurrentLocation(first.currentLocation || '')
        setMapQuery(first.mapQuery || '')
        setShowMap(first.showMap !== undefined ? Boolean(first.showMap) : true)
        setStatus(first.status || 'IN_TRANSIT')
        setRemarks(Array.isArray(first.remarks) ? first.remarks : [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadShipments()
  }, [])

  const handleSelect = (t: any) => {
    setSelected(t)
    setCurrentLocation(t.currentLocation || '')
    setMapQuery(t.mapQuery || '')
    setShowMap(t.showMap !== undefined ? Boolean(t.showMap) : true)
    setStatus(t.status || 'IN_TRANSIT')
    setRemarks(Array.isArray(t.remarks) ? t.remarks : [])
  }

  // Add Remark
  const handleAddRemark = () => {
    if (!newRemarkText.trim() || !selected) return

    const now = new Date()
    const newRem = {
      id: 'rem-' + Date.now(),
      text: newRemarkText.trim(),
      category: newRemarkCategory,
      timestamp: now.toISOString(),
      author: 'Operations Admin',
      public: newRemarkPublic,
    }

    const updatedRemarks = [newRem, ...remarks]
    setRemarks(updatedRemarks)
    setNewRemarkText('')

    // Append to events if public
    const updatedEvents = [...(selected.events || [])]
    if (newRemarkPublic) {
      updatedEvents.unshift({
        id: 'evt-' + Date.now(),
        status: status,
        description: `[${newRemarkCategory}] ${newRemarkText.trim()}`,
        location: currentLocation || selected.origin,
        timestamp: now.toISOString(),
        type: 'facility',
      })
    }

    const updatedShipment = {
      ...selected,
      currentLocation,
      mapQuery,
      showMap,
      status,
      remarks: updatedRemarks,
      events: updatedEvents,
    }

    saveLocalShipment(updatedShipment)
    loadShipments()
  }

  // Delete Remark
  const handleDeleteRemark = (remId: string) => {
    if (!selected) return
    const updatedRemarks = remarks.filter((r) => r.id !== remId)
    setRemarks(updatedRemarks)

    const updatedShipment = {
      ...selected,
      remarks: updatedRemarks,
    }

    saveLocalShipment(updatedShipment)
    loadShipments()
  }

  // Save All Overrides
  const handleSaveOverrides = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return

    const updatedEvents = [...(selected.events || [])]
    // If status or location changed, add an event milestone
    if (selected.status !== status || selected.currentLocation !== currentLocation) {
      updatedEvents.unshift({
        id: 'evt-' + Date.now(),
        status: status,
        description: `Status updated to ${status.replace(/_/g, ' ')} at ${currentLocation}`,
        location: currentLocation,
        timestamp: new Date().toISOString(),
        type: status === 'DELIVERED' ? 'delivered' : status === 'CUSTOMS_CLEARANCE' ? 'customs' : 'transit',
      })
    }

    const updatedShipment = {
      ...selected,
      currentLocation,
      mapQuery,
      showMap,
      status,
      remarks,
      events: updatedEvents,
      lastUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    saveLocalShipment(updatedShipment)

    // Sync to database
    try {
      await fetch('/api/shipments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          trackingNumber: selected.trackingNumber,
          status,
          currentLocation,
          mapQuery,
          showMap,
          timelineEvents: updatedEvents,
          remark: `Tracking updated: ${status.replace(/_/g, ' ')} at ${currentLocation}`,
        }),
      })
    } catch (err) {
      console.warn('Failed to sync overrides to DB:', err)
    }

    loadShipments()

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const filtered = shipments.filter(
    (t) =>
      (t.trackingNumber || t.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.recipient || t.recipientName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.destination || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.origin || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#6B2737]" />
            Tracking Overrides, Geolocation &amp; Map Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time control over shipment positions, interactive Google Maps visibility toggle, and consignment remarks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => loadShipments()}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh Data
          </Button>
          <Button asChild className="bg-[#6B2737] hover:bg-[#521b28] text-white text-xs font-bold">
            <Link href="/admin/shipments">
              <Package className="w-4 h-4 mr-1.5" /> Master Shipments List
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tracked Consignments', value: shipments.length.toString(), icon: Truck, color: 'text-blue-400' },
          { label: 'In Transit / Active', value: shipments.filter((s) => s.status === 'IN_TRANSIT').length.toString(), icon: Clock, color: 'text-sky-400' },
          { label: 'In Customs Hold', value: shipments.filter((s) => s.status === 'CUSTOMS_CLEARANCE').length.toString(), icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'Delivered', value: shipments.filter((s) => s.status === 'DELIVERED').length.toString(), icon: CheckCircle2, color: 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <div>
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500 font-semibold">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Shipments List (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Select Shipment</span>
            <span className="text-[10px] text-slate-400 font-semibold">{filtered.length} found</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search AWB, recipient, city..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]"
            />
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filtered.map((t) => {
              const isSel = (selected?.trackingNumber || selected?.id) === (t.trackingNumber || t.id)
              return (
                <button
                  key={t.id || t.trackingNumber}
                  onClick={() => handleSelect(t)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSel
                      ? 'border-[#6B2737] bg-[#6B2737]/10 shadow-md ring-1 ring-[#6B2737]/40'
                      : 'border-slate-800/90 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#6B2737]">{t.trackingNumber || t.id}</span>
                      <p className="text-xs font-semibold text-white mt-0.5">{t.recipient || t.recipientName}</p>
                      <p className="text-[10px] text-slate-400">{t.origin} → {t.destination}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                        statusColors[t.status] || 'text-slate-300 bg-slate-800 border-slate-700'
                      }`}
                    >
                      {t.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800/60">
                    <span className="truncate max-w-[200px]">📍 {t.currentLocation || 'Facility'}</span>
                    <span className={`font-semibold ${t.showMap !== false ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {t.showMap !== false ? 'Map: ON' : 'Map: OFF'}
                    </span>
                  </div>
                </button>
              )
            })}

            {filtered.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No shipments found matching your search.
              </div>
            )}
          </div>
        </div>

        {/* Right: Telemetry, Map Toggle & Remarks Controls (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          {selected ? (
            <>
              {/* Selected Shipment Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">
                      Active Telemetry Target
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        statusColors[status] || 'text-slate-300 bg-slate-800 border-slate-700'
                      }`}
                    >
                      {status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white font-mono mt-0.5">{selected.trackingNumber || selected.id}</h2>
                  <p className="text-xs text-slate-400">
                    {selected.origin} → {selected.destination}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                  >
                    <Link href={`/tracking?number=${selected.trackingNumber || selected.id}`} target="_blank">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> Public View
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="bg-[#6B2737] hover:bg-[#521b28] text-white text-xs font-bold"
                  >
                    <Link href={`/admin/shipments/${selected.id || selected.trackingNumber}`}>
                      <Edit3 className="w-3.5 h-3.5 mr-1" /> Full Editor
                    </Link>
                  </Button>
                </div>
              </div>

              {saved && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Telemetry, map configuration, and remarks saved to public tracking!</span>
                </div>
              )}

              {/* ── Form: Geolocation & Map Toggle ───────────────────────────── */}
              <form onSubmit={handleSaveOverrides} className="space-y-5 text-xs text-slate-300">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-white text-xs flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      Live Map Geolocation &amp; Telemetry
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      GPS Stream
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {showMap ? (
                          <Eye className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="font-bold text-white text-xs">Toggle Map Visibility</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {showMap
                          ? 'ON: Google Maps iframe is active and rendered on public tracking.'
                          : 'OFF: Map is hidden. Customer only sees verified checkpoint location text.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMap(!showMap)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                        showMap ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}
                      title="Toggle Live Map On/Off"
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          showMap ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Location Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-300">
                        Current Location (Text Displayed)
                      </label>
                      <input
                        type="text"
                        value={currentLocation}
                        onChange={(e) => setCurrentLocation(e.target.value)}
                        placeholder="e.g. Frankfurt Cargo Sorting Hub, Germany"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-[#6B2737]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-300">
                        Google Maps Search Query / Coordinates
                      </label>
                      <input
                        type="text"
                        value={mapQuery}
                        onChange={(e) => setMapQuery(e.target.value)}
                        placeholder="e.g. Frankfurt,Germany or JFK+Airport"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-[#6B2737]"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Hubs */}
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                      Quick Set Hub Location Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'London, UK', query: 'London,UK', loc: 'London Heathrow Gateway Hub, UK' },
                        { label: 'New York, US', query: 'New York,USA', loc: 'JFK International Airport Hub, NY' },
                        { label: 'Frankfurt, DE', query: 'Frankfurt,Germany', loc: 'Frankfurt Cargo Sorting Terminal, DE' },
                        { label: 'Lagos, NG', query: 'Lagos,Nigeria', loc: 'Murtala Muhammed Freight Facility, Lagos' },
                        { label: 'Tokyo, JP', query: 'Tokyo,Japan', loc: 'Haneda Logistics Gateway, Tokyo' },
                        { label: 'Dubai, UAE', query: 'Dubai,UAE', loc: 'Dubai World Central Freight Hub, UAE' },
                        { label: 'Toronto, CA', query: 'Toronto,Canada', loc: 'Toronto Pearson International Terminal, CA' },
                        { label: 'Paris, FR', query: 'Paris,France', loc: 'Charles de Gaulle Freight Hub, Paris' },
                        { label: 'Mid-Atlantic', query: 'Atlantic Ocean', loc: 'In-Flight Air Transit — Mid-Atlantic' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setCurrentLocation(preset.loc)
                            setMapQuery(preset.query)
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-[#6B2737] hover:text-white text-slate-300 text-[10px] font-medium transition cursor-pointer"
                        >
                          📍 {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Map Preview or Off Banner */}
                  {showMap ? (
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                      <div className="px-3 py-1.5 text-[10px] text-slate-400 flex items-center justify-between border-b border-slate-800">
                        <span className="font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#6B2737]" /> Map Target: {currentLocation || mapQuery}
                        </span>
                        <span className="text-emerald-400 font-bold uppercase">● Public Map Active</span>
                      </div>
                      <iframe
                        title="Map Telemetry Preview"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery || currentLocation || 'New York')}&output=embed&z=12`}
                        width="100%"
                        height="180"
                        className="w-full border-0"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400">
                      <EyeOff className="w-5 h-5 mx-auto mb-1 text-slate-500" />
                      <span className="font-bold text-white text-xs block">Map View is Turned OFF</span>
                      <span className="text-[11px] text-slate-500">
                        Customer will see verified milestone text badge instead of the interactive Google Map.
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Status Force-Injection ───────────────────────────────── */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-white text-xs">
                      Shipment Operational Status Override
                    </label>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Milestone Step</span>
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-bold text-xs focus:ring-1 focus:ring-[#6B2737]"
                  >
                    {[
                      'IN_TRANSIT',
                      'PICKED_UP',
                      'ARRIVED_AT_FACILITY',
                      'DEPARTED_FACILITY',
                      'CUSTOMS_CLEARANCE',
                      'OUT_FOR_DELIVERY',
                      'DELIVERED',
                      'PENDING_PAYMENT',
                      'LABEL_CREATED',
                      'EXCEPTION',
                      'RETURNED',
                      'CANCELLED',
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Save Overrides Button */}
                <Button
                  type="submit"
                  className="w-full bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs py-3 h-auto"
                >
                  <Save className="w-4 h-4 mr-2" /> Save Geolocation, Map &amp; Status Overrides
                </Button>
              </form>

              {/* ── Consignment Remarks & Advisories ────────────────────────── */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    Consignment Remarks &amp; Official Advisories
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold uppercase">
                    {remarks.length} Recorded
                  </span>
                </div>

                {/* Add Remark */}
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={newRemarkText}
                        onChange={(e) => setNewRemarkText(e.target.value)}
                        placeholder="Add operational or customs advisory..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-[#6B2737]"
                      />
                    </div>
                    <div>
                      <select
                        value={newRemarkCategory}
                        onChange={(e) => setNewRemarkCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                      >
                        <option value="Operational Update">Operational Update</option>
                        <option value="Customs Note">Customs &amp; Clearance</option>
                        <option value="Transit Milestone">Transit Milestone</option>
                        <option value="Facility Check">Facility Security</option>
                        <option value="Weather Advisory">Weather Advisory</option>
                        <option value="Customer Notice">Customer Notice</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-slate-300 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRemarkPublic}
                        onChange={(e) => setNewRemarkPublic(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-[#6B2737] focus:ring-[#6B2737]"
                      />
                      <span>Show on Public Tracking Page</span>
                    </label>

                    <Button
                      type="button"
                      onClick={handleAddRemark}
                      disabled={!newRemarkText.trim()}
                      className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Remark
                    </Button>
                  </div>
                </div>

                {/* Remarks List */}
                <div className="space-y-2 pt-2">
                  {remarks.map((r: any) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {r.category}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(r.timestamp).toLocaleString()}
                          </span>
                          {r.public ? (
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Public
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                              <EyeOff className="w-3 h-3" /> Internal
                            </span>
                          )}
                        </div>
                        <p className="text-white text-xs">{r.text}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteRemark(r.id)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition cursor-pointer"
                        title="Delete Remark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {remarks.length === 0 && (
                    <p className="text-[11px] text-slate-500 text-center py-2">
                      No remarks recorded for this consignment yet.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-slate-500 space-y-2">
              <Package className="w-12 h-12 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No shipment selected</p>
              <p className="text-xs text-slate-500 max-w-xs text-center">
                Select a shipment from the left feed to modify live telemetry, toggle map on/off, or append remarks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

