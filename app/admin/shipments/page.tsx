'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Box,
  Search,
  Edit3,
  CheckCircle2,
  Globe,
  MessageSquare,
  ExternalLink,
  MapPin,
  Trash2,
  User,
  X,
  Plus,
  RefreshCw,
  Calendar,
  Eye,
  EyeOff,
  Save,
  Check,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { getLocalShipments, saveLocalShipment, deleteLocalShipment, getDeletedShipments, addDeletedShipment } from '@/lib/payments/manualOptions'

const ALL_STATUSES = [
  'DRAFT',
  'PENDING_PAYMENT',
  'PAYMENT_SUBMITTED',
  'PROCESSING',
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
  PAYMENT_SUBMITTED: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  PROCESSING: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
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
    service: 'Over Night Express Service',
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
    service: 'Usual Courier Service',
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
    service: 'Standard Courier Service',
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
  const [successToast, setSuccessToast] = useState<string | null>(null)

  // ─── Pop-Out Edit Modal State ───
  const [editingShipment, setEditingShipment] = useState<any | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editForm, setEditForm] = useState<{
    id: string
    trackingNumber: string
    status: string
    service: string
    currentLocation: string
    mapQuery: string
    showMap: boolean
    events: any[]
  }>({
    id: '',
    trackingNumber: '',
    status: 'IN_TRANSIT',
    service: 'Express Courier',
    currentLocation: '',
    mapQuery: '',
    showMap: true,
    events: [],
  })

  // New Milestone inputs inside modal
  const [newMilestoneStatus, setNewMilestoneStatus] = useState('IN_TRANSIT')
  const [newMilestoneLocation, setNewMilestoneLocation] = useState('')
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('')

  // Load shipments from database API, localStorage, and seeds (respecting deleted blacklist)
  const loadShipments = async () => {
    try {
      const deleted = getDeletedShipments()
      const localList = getLocalShipments()
      const map = new Map<string, any>()

      // 1. Put defaults ONLY if they have not been deleted
      DEFAULT_SEED_SHIPMENTS.forEach((s) => {
        const sId = s.id.toLowerCase()
        const sTrk = (s.trackingNumber || '').toLowerCase()
        if (!deleted.includes(sId) && !deleted.includes(sTrk)) {
          map.set(s.trackingNumber || s.id, s)
        }
      })

      // 2. Fetch all shipments from database API
      try {
        const res = await fetch('/api/shipments')
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          json.data.forEach((dbItem: any) => {
            const key = (dbItem.trackingNumber || dbItem.id || '').toUpperCase().trim()
            const dId = (dbItem.id || '').toLowerCase()
            const dTrk = (dbItem.trackingNumber || '').toLowerCase()
            if (key && !deleted.includes(dId) && !deleted.includes(dTrk)) {
              map.set(key, {
                id: dbItem.id,
                trackingNumber: dbItem.trackingNumber || key,
                sender: `${dbItem.senderName || 'Sender'} (${dbItem.senderCity || 'Origin'})`,
                recipient: `${dbItem.recipientName || 'Recipient'} (${dbItem.recipientCity || 'Destination'})`,
                service: dbItem.serviceType || 'Express Courier',
                driver: 'Assigned Carrier Driver',
                facility: 'Regional Hub',
                status: dbItem.displayStatus || (dbItem.status === 'PROCESSING' ? 'PAYMENT_SUBMITTED' : (dbItem.status || 'PENDING_PAYMENT')),
                amount: Number(dbItem.totalAmount) || 145.5,
                currentLocation: `${dbItem.senderCity || 'Operations Dispatch'}, ${dbItem.senderCountry || 'US'}`,
                mapQuery: `${dbItem.senderCity || 'New York'},${dbItem.senderCountry || 'USA'}`,
                showMap: true,
                remarks: [],
                userName: dbItem.userName || dbItem.createdBy?.name || dbItem.senderName,
                userEmail: dbItem.userEmail || dbItem.createdBy?.email || dbItem.senderEmail,
                userRole: dbItem.userRole || dbItem.createdBy?.role || 'CUSTOMER',
                createdBy: dbItem.createdBy,
              })
            }
          })
        }
      } catch {}

      // 3. Overlay from local storage with strict canonical deduplication
      localList.forEach((s: any) => {
        const trk = (s.trackingNumber || '').toUpperCase().trim()
        const sid = (s.id || '').toUpperCase().trim()
        if ((!trk && !sid) || deleted.includes(sid.toLowerCase()) || deleted.includes(trk.toLowerCase())) {
          return
        }

        let existingKey = ''
        if (trk && map.has(trk)) existingKey = trk
        else if (sid && map.has(sid)) existingKey = sid
        else {
          for (const [k, v] of map.entries()) {
            if ((trk && v.trackingNumber && v.trackingNumber.toUpperCase().trim() === trk) ||
                (sid && v.id && v.id.toUpperCase().trim() === sid)) {
              existingKey = k
              break
            }
          }
        }

        const canonicalKey = existingKey || trk || sid
        const existing = map.get(canonicalKey) || {}
        map.set(canonicalKey, {
          ...existing,
          ...s,
          id: existing.id || s.id || canonicalKey,
          trackingNumber: existing.trackingNumber || s.trackingNumber || canonicalKey,
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
          userName: s.userName || s.senderName || existing.userName,
          userEmail: s.userEmail || s.senderEmail || existing.userEmail,
          userRole: s.userRole || existing.userRole || 'CUSTOMER',
          createdBy: existing.createdBy || s.createdBy,
        })
      })
      setShipments(Array.from(map.values()))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadShipments()
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    const target = shipments.find((s) => s.id === id || s.trackingNumber === id)
    if (target) {
      const updatedItem = { ...target, status: newStatus }
      saveLocalShipment(updatedItem)

      // Sync to database
      try {
        await fetch('/api/shipments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: target.id,
            trackingNumber: target.trackingNumber,
            status: newStatus,
            remark: `Status changed to ${newStatus.replace(/_/g, ' ')} by Courier Admin.`,
          }),
        })
      } catch (err) {
        console.warn('DB patch failed for status change:', err)
      }
    }

    const updated = shipments.map((s) =>
      s.id === id || s.trackingNumber === id ? { ...s, status: newStatus } : s
    )
    setShipments(updated)

    setStatusSaved(id)
    setTimeout(() => setStatusSaved(null), 2000)
  }

  // ─── Open Pop-Out Modal ───
  const openEditModal = async (shipment: any) => {
    setEditingShipment(shipment)
    setNewMilestoneStatus(shipment.status || 'IN_TRANSIT')
    setNewMilestoneLocation(shipment.currentLocation || '')
    setNewMilestoneDesc('')

    let eventsList = Array.isArray(shipment.events) && shipment.events.length > 0 ? shipment.events : []

    // If events are not in local item, fetch from tracking API
    if (eventsList.length === 0 && shipment.trackingNumber) {
      try {
        const res = await fetch(`/api/tracking/${encodeURIComponent(shipment.trackingNumber)}`)
        const json = await res.json()
        if (json.success && json.data?.events && json.data.events.length > 0) {
          eventsList = json.data.events
        }
      } catch {}
    }

    setEditForm({
      id: shipment.id,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status || 'IN_TRANSIT',
      service: shipment.service || 'Express Courier',
      currentLocation: shipment.currentLocation || '',
      mapQuery: shipment.mapQuery || '',
      showMap: shipment.showMap !== undefined ? Boolean(shipment.showMap) : true,
      events: eventsList,
    })
  }

  // Add Milestone Checkpoint inside Modal
  const handleAddModalMilestone = () => {
    if (!newMilestoneDesc.trim()) return

    const newEvt = {
      id: 'evt-' + Date.now(),
      status: newMilestoneStatus,
      description: newMilestoneDesc.trim(),
      location: newMilestoneLocation.trim() || editForm.currentLocation || 'Dispatch Facility',
      city: newMilestoneLocation.trim() || editForm.currentLocation || 'Dispatch Facility',
      timestamp: new Date().toISOString(),
    }

    setEditForm((prev) => ({
      ...prev,
      events: [newEvt, ...prev.events],
      status: newMilestoneStatus,
      currentLocation: newMilestoneLocation.trim() || prev.currentLocation,
    }))

    setNewMilestoneDesc('')
  }

  // Delete Milestone Checkpoint inside Modal
  const handleDeleteModalMilestone = (evtId: string) => {
    setEditForm((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== evtId),
    }))
  }

  // ─── Save Changes in Modal ───
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSavingEdit || !editingShipment) return

    setIsSavingEdit(true)
    try {
      const updatedShipment = {
        ...editingShipment,
        status: editForm.status,
        currentLocation: editForm.currentLocation,
        mapQuery: editForm.mapQuery,
        showMap: editForm.showMap,
        events: editForm.events,
      }

      // 1. Save to local storage
      saveLocalShipment(updatedShipment)

      // 2. Sync to DB via PATCH /api/shipments
      await fetch('/api/shipments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editForm.id,
          trackingNumber: editForm.trackingNumber,
          status: editForm.status,
          currentLocation: editForm.currentLocation,
          mapQuery: editForm.mapQuery,
          showMap: editForm.showMap,
          timelineEvents: editForm.events,
        }),
      }).catch((err) => console.warn('Modal DB sync error:', err))

      // 3. Reload shipments list
      await loadShipments()

      // 4. Close the pop-out modal immediately!
      setEditingShipment(null)

      // 5. Show success notification
      setSuccessToast(`Shipment ${editForm.trackingNumber} and timeline updated successfully!`)
      setTimeout(() => setSuccessToast(null), 4000)
    } catch (err) {
      console.error('Failed to save shipment edits:', err)
    } finally {
      setIsSavingEdit(false)
    }
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
                <th className="p-3 text-right sticky right-0 bg-slate-950 z-10 shadow-[-8px_0_12px_rgba(0,0,0,0.5)]">Actions</th>
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
                      <span className="text-[10px] text-slate-400 block">From: {s.sender}</span>
                      {(s.userName || s.userEmail || s.createdBy) && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-sky-400 max-w-[220px]">
                          <User className="w-3 h-3 text-sky-400 shrink-0" />
                          <span className="text-slate-400">Booked by:</span>
                          <span className="font-bold text-sky-300 truncate">{s.userName || s.createdBy?.name || 'Customer'}</span>
                          <span className="text-slate-500 font-mono text-[9px] truncate">({s.userEmail || s.createdBy?.email || s.senderEmail || 'Verified'})</span>
                        </div>
                      )}
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
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap sticky right-0 bg-slate-900 z-10 shadow-[-8px_0_12px_rgba(0,0,0,0.5)]">
                      <Button
                        size="sm"
                        onClick={() => openEditModal(s)}
                        className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs cursor-pointer shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> Quick Edit / Timeline
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 text-xs"
                      >
                        <Link href={`/admin/shipments/${s.id || s.trackingNumber}`}>
                          Full Form
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (confirm(`Permanently delete shipment ${s.trackingNumber || s.id}? This will remove it from all feeds and tracking.`)) {
                            const id = s.id
                            const trk = s.trackingNumber
                            const shpNum = s.shipmentNumber
                            if (id) {
                              deleteLocalShipment(id)
                              addDeletedShipment(id)
                            }
                            if (trk) {
                              deleteLocalShipment(trk)
                              addDeletedShipment(trk)
                            }
                            if (shpNum) {
                              deleteLocalShipment(shpNum)
                              addDeletedShipment(shpNum)
                            }
                            try {
                              await fetch(
                                `/api/shipments?id=${encodeURIComponent(id || '')}&trackingNumber=${encodeURIComponent(trk || '')}`,
                                { method: 'DELETE' }
                              )
                            } catch {}
                            setShipments((prev) =>
                              prev.filter((item) => item.id !== id && item.trackingNumber !== trk && item.shipmentNumber !== shpNum)
                            )
                          }
                        }}
                        className="border-red-500/40 text-red-400 hover:bg-red-500/15 hover:text-red-300 font-bold text-xs"
                        title="Permanently Delete Shipment"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
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

      {/* ─── POP-OUT EDIT MODAL (CLOSES ON SAVE, PREVENTS DUPLICATE CLICKS) ─── */}
      {editingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#6B2737]" />
                  Edit Shipment &amp; Timeline
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs text-[#C27F88] font-bold">
                    {editForm.trackingNumber}
                  </span>
                  <span className="text-[11px] text-slate-500">· ID: {editForm.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingShipment(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Area */}
            <form onSubmit={handleSaveModal} className="overflow-y-auto flex-1 pr-1 space-y-6 text-xs text-slate-300">
              {/* SECTION: Status & Map Controls */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-400" />
                  Status &amp; Live Map Telemetry
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-400">Shipment Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs focus:ring-1 focus:ring-[#6B2737]"
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Live Map Switch */}
                  <div>
                    <label className="block font-semibold mb-1 text-slate-400">Live Map Display Switch</label>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, showMap: !editForm.showMap })}
                      className={`w-full px-3 py-2 rounded-xl border flex items-center justify-between font-bold text-xs transition cursor-pointer ${
                        editForm.showMap
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {editForm.showMap ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                        {editForm.showMap ? 'Live Map: ON' : 'Live Map: OFF'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${editForm.showMap ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                        {editForm.showMap ? 'VISIBLE' : 'HIDDEN'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Current Location Input */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-400">Current Checkpoint Location</label>
                  <input
                    type="text"
                    value={editForm.currentLocation}
                    onChange={(e) => setEditForm({ ...editForm, currentLocation: e.target.value })}
                    placeholder="e.g. Frankfurt Cargo Sorting Terminal, Germany"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-[#6B2737]"
                  />
                </div>

                {/* Map Search Query */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-400">Google Maps Search Query</label>
                  <input
                    type="text"
                    value={editForm.mapQuery}
                    onChange={(e) => setEditForm({ ...editForm, mapQuery: e.target.value })}
                    placeholder="e.g. Frankfurt+Germany or London,UK"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-[#6B2737]"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: 'London, UK', q: 'London,UK', loc: 'London Heathrow Gateway Hub, UK' },
                    { label: 'New York, US', q: 'New York,USA', loc: 'JFK International Airport Hub, NY' },
                    { label: 'Frankfurt, DE', q: 'Frankfurt,Germany', loc: 'Frankfurt Cargo Sorting Terminal, DE' },
                    { label: 'Lagos, NG', q: 'Lagos,Nigeria', loc: 'Murtala Muhammed Freight Facility, Lagos' },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, currentLocation: p.loc, mapQuery: p.q })}
                      className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-[#6B2737] hover:text-white text-slate-400 text-[10px] font-medium transition cursor-pointer"
                    >
                      📍 {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION: Timeline Events Editor */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    Timeline Milestones Editor
                  </h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {editForm.events.length} Milestones
                  </span>
                </div>

                {/* Add New Milestone Form */}
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2.5">
                  <p className="font-bold text-white text-[11px]">Add Milestone Event</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Status</label>
                      <select
                        value={newMilestoneStatus}
                        onChange={(e) => setNewMilestoneStatus(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Location</label>
                      <input
                        type="text"
                        value={newMilestoneLocation}
                        onChange={(e) => setNewMilestoneLocation(e.target.value)}
                        placeholder="e.g. Frankfurt Cargo Hub, DE"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Description / Activity</label>
                    <input
                      type="text"
                      value={newMilestoneDesc}
                      onChange={(e) => setNewMilestoneDesc(e.target.value)}
                      placeholder="e.g. Cargo scanned and cleared export terminal."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddModalMilestone}
                    disabled={!newMilestoneDesc.trim()}
                    className="w-full bg-slate-800 hover:bg-[#6B2737] text-white font-bold text-xs py-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Milestone to Timeline
                  </Button>
                </div>

                {/* Existing Milestones List */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {editForm.events.length > 0 ? (
                    editForm.events.map((evt, idx) => (
                      <div
                        key={evt.id || idx}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {(evt.status || 'EVENT').replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'Recent'}
                            </span>
                          </div>
                          <p className="font-semibold text-white text-xs">{evt.description || evt.event}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-[#6B2737]" />
                            {evt.location || evt.city || 'Hub Facility'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteModalMilestone(evt.id)}
                          className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                          title="Remove milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                      No milestones recorded on this shipment timeline yet. Add one above.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingShipment(null)}
                  disabled={isSavingEdit}
                  className="border-slate-800 text-slate-400 hover:bg-slate-800 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingEdit}
                  className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold px-6 text-xs shadow-md"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1.5" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

