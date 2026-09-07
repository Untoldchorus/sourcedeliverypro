'use client'

import React, { useState } from 'react'
import { Truck, Search, MapPin, User, Clock, CheckCircle2, AlertTriangle, Plus, X, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const mockRoutes = [
  {
    id: 'RT-001',
    name: 'NYC → London Express',
    driver: 'Marcus Vance',
    vehicle: 'Boeing 747 Cargo · AA101',
    stops: 2,
    status: 'ACTIVE',
    departure: 'Sep 06, 18:00',
    arrival: 'Sep 07, 06:00',
    shipments: ['SDP8F4K92LM381'],
    progress: 65,
  },
  {
    id: 'RT-002',
    name: 'Lagos Last-Mile Zone A',
    driver: 'Olamide Johnson',
    vehicle: 'Ford Transit · LG-440',
    stops: 8,
    status: 'PENDING',
    departure: 'Sep 07, 07:00',
    arrival: 'Sep 07, 17:00',
    shipments: ['SDP993C104KL22'],
    progress: 0,
  },
  {
    id: 'RT-003',
    name: 'Frankfurt City Delivery',
    driver: 'Hans Weber',
    vehicle: 'Mercedes Sprinter · FF-220',
    stops: 5,
    status: 'COMPLETED',
    departure: 'Sep 04, 08:00',
    arrival: 'Sep 04, 15:30',
    shipments: ['SDP77B219KP440'],
    progress: 100,
  },
  {
    id: 'RT-004',
    name: 'Toronto → JFK Feeder',
    driver: 'Unassigned',
    vehicle: 'Pending Assignment',
    stops: 1,
    status: 'SCHEDULED',
    departure: 'Sep 08, 09:00',
    arrival: 'Sep 08, 13:00',
    shipments: [],
    progress: 0,
  },
]

const statusColors: Record<string, string> = {
  ACTIVE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  COMPLETED: 'text-slate-400 bg-slate-800/50 border-slate-700',
  SCHEDULED: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  CANCELLED: 'text-red-400 bg-red-500/10 border-red-500/30',
}

export default function DispatchRoutesPage() {
  const [routes, setRoutes] = useState(mockRoutes)
  const [search, setSearch] = useState('')
  const [showNewRoute, setShowNewRoute] = useState(false)
  const [newRoute, setNewRoute] = useState({ name: '', driver: '', vehicle: '', departure: '', arrival: '' })
  const [saved, setSaved] = useState(false)

  const filtered = routes.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.driver.toLowerCase().includes(search.toLowerCase()) ||
      r.status.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault()
    const created = {
      id: 'RT-' + Date.now(),
      name: newRoute.name,
      driver: newRoute.driver || 'Unassigned',
      vehicle: newRoute.vehicle || 'TBD',
      stops: 0,
      status: 'SCHEDULED',
      departure: newRoute.departure,
      arrival: newRoute.arrival,
      shipments: [],
      progress: 0,
    }
    setRoutes([created, ...routes])
    setShowNewRoute(false)
    setNewRoute({ name: '', driver: '', vehicle: '', departure: '', arrival: '' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleStatusChange = (id: string, status: string) => {
    setRoutes(routes.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#6B2737]" />
            Dispatch &amp; Route Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, assign, and monitor all active delivery routes and driver dispatches.
          </p>
        </div>
        <Button
          onClick={() => setShowNewRoute(true)}
          className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Create Route
        </Button>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4" /> Route created successfully.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Routes', value: routes.filter((r) => r.status === 'ACTIVE').length, color: 'text-emerald-400' },
          { label: 'Scheduled', value: routes.filter((r) => r.status === 'SCHEDULED').length, color: 'text-blue-400' },
          { label: 'Pending', value: routes.filter((r) => r.status === 'PENDING').length, color: 'text-amber-400' },
          { label: 'Completed', value: routes.filter((r) => r.status === 'COMPLETED').length, color: 'text-slate-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search routes, drivers, status..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
        />
      </div>

      {/* Route Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((r) => (
          <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500">{r.id}</span>
                <h3 className="text-sm font-black text-white">{r.name}</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[r.status] || 'text-slate-300 bg-slate-800 border-slate-700'}`}>
                {r.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-white">{r.driver}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Truck className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-300">{r.vehicle}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Dep: <span className="text-slate-300">{r.departure}</span></span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Arr: <span className="text-slate-300">{r.arrival}</span></span>
              </div>
            </div>

            {r.status === 'ACTIVE' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Route Progress</span>
                  <span className="text-emerald-400 font-bold">{r.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className="bg-[#6B2737] h-1.5 rounded-full transition-all"
                    style={{ width: `${r.progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-500">{r.shipments.length} shipment(s) assigned</span>
              <div className="flex items-center gap-2">
                <select
                  value={r.status}
                  onChange={(e) => handleStatusChange(r.id, e.target.value)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none"
                >
                  {['SCHEDULED','PENDING','ACTIVE','COMPLETED','CANCELLED'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Route Modal */}
      {showNewRoute && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#6B2737]" /> Create New Route
              </h2>
              <button onClick={() => setShowNewRoute(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRoute} className="space-y-3 text-xs">
              {[
                { label: 'Route Name', key: 'name', placeholder: 'e.g. NYC → Frankfurt Express', required: true },
                { label: 'Assigned Driver', key: 'driver', placeholder: 'Driver name' },
                { label: 'Vehicle / Flight', key: 'vehicle', placeholder: 'e.g. Sprinter · REG-001' },
                { label: 'Departure Time', key: 'departure', placeholder: 'e.g. Sep 10, 08:00' },
                { label: 'Estimated Arrival', key: 'arrival', placeholder: 'e.g. Sep 10, 16:00' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-slate-400 font-bold mb-1">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    required={f.required}
                    value={newRoute[f.key as keyof typeof newRoute]}
                    onChange={(e) => setNewRoute({ ...newRoute, [f.key]: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]"
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowNewRoute(false)} className="text-slate-400 text-xs">Cancel</Button>
                <Button type="submit" className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">Create Route</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
