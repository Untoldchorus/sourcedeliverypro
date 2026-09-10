'use client'

import React, { useState } from 'react'
import { Building2, Search, MapPin, Package, Truck, CheckCircle2, AlertTriangle, Plus, X, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Facility {
  id: string
  name: string
  type: 'DISPATCH_HUB' | 'SORTING_CENTER' | 'CUSTOMS' | 'DELIVERY_DEPOT' | 'FREIGHT_TERMINAL'
  address: string
  city: string
  country: string
  manager: string
  phone: string
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'CLOSED'
  capacity: number
  currentLoad: number
  activeShipments: number
}

const mockFacilities: Facility[] = [
  {
    id: 'FAC-HQ',
    name: 'Sacramento Corporate Headquarters',
    type: 'DISPATCH_HUB',
    address: '500 Capitol Mall',
    city: 'Sacramento, CA 95814',
    country: 'United States',
    manager: 'Corporate Dispatch',
    phone: '(618) 368 1268',
    status: 'OPERATIONAL',
    capacity: 10000,
    currentLoad: 4200,
    activeShipments: 65,
  },
  {
    id: 'FAC-MYS',
    name: 'Ipoh Regional Branch Office',
    type: 'SORTING_CENTER',
    address: '27 Jalan Sultan Idris Shah',
    city: 'Ipoh, Perak 30000',
    country: 'Malaysia',
    manager: 'Tan Wei Lun',
    phone: '+60 5-254 0100',
    status: 'OPERATIONAL',
    capacity: 4000,
    currentLoad: 1850,
    activeShipments: 34,
  },
  {
    id: 'FAC-001',
    name: 'JFK International Dispatch Hub',
    type: 'DISPATCH_HUB',
    address: '100 Air Cargo Rd',
    city: 'New York',
    country: 'United States',
    manager: 'James Monroe',
    phone: '+1 718 555 0100',
    status: 'OPERATIONAL',
    capacity: 5000,
    currentLoad: 3200,
    activeShipments: 48,
  },
  {
    id: 'FAC-002',
    name: 'Frankfurt Sorting Hub',
    type: 'SORTING_CENTER',
    address: 'Cargo City Süd, Gate 21',
    city: 'Frankfurt',
    country: 'Germany',
    manager: 'Hans Weber',
    phone: '+49 69 1234 5678',
    status: 'OPERATIONAL',
    capacity: 8000,
    currentLoad: 4100,
    activeShipments: 72,
  },
  {
    id: 'FAC-003',
    name: 'Murtala Muhammed Freight Hub',
    type: 'FREIGHT_TERMINAL',
    address: 'Airport Road, Ikeja',
    city: 'Lagos',
    country: 'Nigeria',
    manager: 'Olamide Johnson',
    phone: '+234 1 234 5678',
    status: 'OPERATIONAL',
    capacity: 3000,
    currentLoad: 2800,
    activeShipments: 31,
  },
  {
    id: 'FAC-004',
    name: 'Heathrow Import Customs',
    type: 'CUSTOMS',
    address: 'Terminal 4, Cargo Building',
    city: 'London',
    country: 'United Kingdom',
    manager: 'Claire Thompson',
    phone: '+44 20 7946 0200',
    status: 'OPERATIONAL',
    capacity: 2000,
    currentLoad: 950,
    activeShipments: 19,
  },
  {
    id: 'FAC-005',
    name: 'Toronto Pearson Depot',
    type: 'DELIVERY_DEPOT',
    address: '6301 Silver Dart Dr',
    city: 'Toronto',
    country: 'Canada',
    manager: 'Unassigned',
    phone: '+1 416 555 0140',
    status: 'MAINTENANCE',
    capacity: 1500,
    currentLoad: 0,
    activeShipments: 0,
  },
]

const typeColors: Record<string, string> = {
  DISPATCH_HUB: 'text-[#6B2737] bg-orange-500/10 border-orange-500/30',
  SORTING_CENTER: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  CUSTOMS: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  DELIVERY_DEPOT: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  FREIGHT_TERMINAL: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
}

const statusColors: Record<string, string> = {
  OPERATIONAL: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  MAINTENANCE: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  CLOSED: 'text-red-400 bg-red-500/10 border-red-500/30',
}

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>(mockFacilities)
  const [search, setSearch] = useState('')
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newFacility, setNewFacility] = useState({ name: '', type: 'SORTING_CENTER', city: '', country: '', manager: '' })
  const [saved, setSaved] = useState(false)

  const filtered = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.city.toLowerCase().includes(search.toLowerCase()) ||
      f.country.toLowerCase().includes(search.toLowerCase())
  )

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFacility) return
    setFacilities(facilities.map((f) => (f.id === editingFacility.id ? editingFacility : f)))
    setSaved(true)
    setTimeout(() => { setSaved(false); setEditingFacility(null) }, 1500)
  }

  const handleAddFacility = (e: React.FormEvent) => {
    e.preventDefault()
    const created: Facility = {
      id: 'FAC-' + Date.now(),
      name: newFacility.name,
      type: newFacility.type as Facility['type'],
      address: 'Pending',
      city: newFacility.city,
      country: newFacility.country,
      manager: newFacility.manager || 'Unassigned',
      phone: 'TBD',
      status: 'OPERATIONAL',
      capacity: 1000,
      currentLoad: 0,
      activeShipments: 0,
    }
    setFacilities([created, ...facilities])
    setShowAdd(false)
    setNewFacility({ name: '', type: 'SORTING_CENTER', city: '', country: '', manager: '' })
  }

  const totalCapacity = facilities.reduce((s, f) => s + f.capacity, 0)
  const totalLoad = facilities.reduce((s, f) => s + f.currentLoad, 0)
  const loadPercent = Math.round((totalLoad / totalCapacity) * 100)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#6B2737]" />
            Facilities &amp; Hub Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor all warehouses, sorting centres, freight terminals and dispatch hubs globally.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
          <Plus className="w-4 h-4 mr-1.5" /> Add Facility
        </Button>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Facilities', value: facilities.length, color: 'text-white' },
          { label: 'Operational', value: facilities.filter((f) => f.status === 'OPERATIONAL').length, color: 'text-emerald-400' },
          { label: 'Network Load', value: `${loadPercent}%`, color: loadPercent > 85 ? 'text-red-400' : 'text-amber-400' },
          { label: 'Active Shipments', value: facilities.reduce((s, f) => s + f.activeShipments, 0), color: 'text-blue-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search facility, city, country..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
        />
      </div>

      {/* Facility Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((f) => {
          const loadPct = Math.round((f.currentLoad / f.capacity) * 100)
          return (
            <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block mb-1.5 ${typeColors[f.type]}`}>
                    {f.type.replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-sm font-black text-white leading-tight">{f.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#6B2737]" />
                    {f.city}, {f.country}
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${statusColors[f.status]}`}>
                  {f.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate-400">Manager: <span className="text-slate-200 font-semibold">{f.manager}</span></div>
                <div className="text-slate-400">Phone: <span className="text-slate-200">{f.phone}</span></div>
                <div className="text-slate-400">Active: <span className="text-blue-400 font-bold">{f.activeShipments} shipments</span></div>
                <div className="text-slate-400">Capacity: <span className="text-slate-200">{f.capacity.toLocaleString()} units</span></div>
              </div>

              {f.status !== 'MAINTENANCE' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Facility Load</span>
                    <span className={loadPct > 85 ? 'text-red-400 font-bold' : 'text-slate-300'}>{loadPct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${loadPct > 85 ? 'bg-red-500' : loadPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${loadPct}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end border-t border-slate-800 pt-3">
                <Button size="sm" onClick={() => setEditingFacility({ ...f })} className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Facility
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Facility Modal */}
      {editingFacility && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#6B2737]" /> Edit Facility
              </h2>
              <button onClick={() => setEditingFacility(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {saved && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Facility updated!
              </div>
            )}
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Facility Name', field: 'name' },
                  { label: 'Manager', field: 'manager' },
                  { label: 'City', field: 'city' },
                  { label: 'Country', field: 'country' },
                  { label: 'Address', field: 'address' },
                  { label: 'Phone', field: 'phone' },
                ].map((fi) => (
                  <div key={fi.field}>
                    <label className="block text-slate-400 font-bold mb-1">{fi.label}</label>
                    <input
                      type="text"
                      value={(editingFacility as any)[fi.field] || ''}
                      onChange={(e) => setEditingFacility({ ...editingFacility, [fi.field]: e.target.value } as Facility)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Status</label>
                  <select
                    value={editingFacility.status}
                    onChange={(e) => setEditingFacility({ ...editingFacility, status: e.target.value as Facility['status'] })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {['OPERATIONAL','MAINTENANCE','CLOSED'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Capacity (units)</label>
                  <input
                    type="number"
                    value={editingFacility.capacity}
                    onChange={(e) => setEditingFacility({ ...editingFacility, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setEditingFacility(null)} className="text-slate-400 text-xs">Cancel</Button>
                <Button type="submit" className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Facility Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#6B2737]" /> Add New Facility
              </h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddFacility} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Facility Name</label>
                <input type="text" required value={newFacility.name} onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Facility Type</label>
                <select value={newFacility.type} onChange={(e) => setNewFacility({ ...newFacility, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none">
                  {['DISPATCH_HUB','SORTING_CENTER','CUSTOMS','DELIVERY_DEPOT','FREIGHT_TERMINAL'].map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g,' ')}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">City</label>
                  <input type="text" required value={newFacility.city} onChange={(e) => setNewFacility({ ...newFacility, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Country</label>
                  <input type="text" required value={newFacility.country} onChange={(e) => setNewFacility({ ...newFacility, country: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Facility Manager</label>
                <input type="text" value={newFacility.manager} onChange={(e) => setNewFacility({ ...newFacility, manager: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowAdd(false)} className="text-slate-400 text-xs">Cancel</Button>
                <Button type="submit" className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">Add Facility</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
