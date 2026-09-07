'use client'

import React, { useState } from 'react'
import { Truck, Search, Star, CheckCircle2, AlertTriangle, MapPin, Phone, Mail, Plus, X, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Driver {
  id: string
  name: string
  email: string
  phone: string
  vehicle: string
  licensePlate: string
  status: 'ACTIVE' | 'OFF_DUTY' | 'ON_DELIVERY' | 'SUSPENDED'
  rating: number
  totalDeliveries: number
  currentRoute: string | null
  location: string
  joinDate: string
}

const mockDrivers: Driver[] = [
  {
    id: 'DRV-001',
    name: 'Marcus Vance',
    email: 'marcus.vance@sourcedeliverypro.com',
    phone: '+49 30 123456',
    vehicle: 'Boeing 747 Cargo',
    licensePlate: 'FLIGHT-AA101',
    status: 'ON_DELIVERY',
    rating: 4.9,
    totalDeliveries: 1284,
    currentRoute: 'NYC → London Express',
    location: 'Mid-Atlantic',
    joinDate: 'Jan 2022',
  },
  {
    id: 'DRV-002',
    name: 'Hans Weber',
    email: 'h.weber@sourcedeliverypro.com',
    phone: '+49 69 987654',
    vehicle: 'Mercedes Sprinter',
    licensePlate: 'FF-220',
    status: 'ACTIVE',
    rating: 4.7,
    totalDeliveries: 876,
    currentRoute: null,
    location: 'Frankfurt Hub',
    joinDate: 'Mar 2023',
  },
  {
    id: 'DRV-003',
    name: 'Olamide Johnson',
    email: 'o.johnson@sourcedeliverypro.com',
    phone: '+234 1 234 5678',
    vehicle: 'Ford Transit',
    licensePlate: 'LG-440',
    status: 'ACTIVE',
    rating: 4.6,
    totalDeliveries: 512,
    currentRoute: null,
    location: 'Lagos Freight Hub',
    joinDate: 'Jun 2023',
  },
  {
    id: 'DRV-004',
    name: 'Aisha Nwosu',
    email: 'a.nwosu@sourcedeliverypro.com',
    phone: '+234 8 001 234567',
    vehicle: 'Hyundai H350',
    licensePlate: 'ABJ-001',
    status: 'OFF_DUTY',
    rating: 4.8,
    totalDeliveries: 331,
    currentRoute: null,
    location: 'Abuja Depot',
    joinDate: 'Sep 2023',
  },
]

const statusColors: Record<string, string> = {
  ON_DELIVERY: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  ACTIVE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  OFF_DUTY: 'text-slate-400 bg-slate-800/50 border-slate-700',
  SUSPENDED: 'text-red-400 bg-red-500/10 border-red-500/30',
}

export default function DriversFleetPage() {
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers)
  const [search, setSearch] = useState('')
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newDriver, setNewDriver] = useState({ name: '', email: '', phone: '', vehicle: '', licensePlate: '' })
  const [saved, setSaved] = useState(false)

  const filtered = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      d.vehicle.toLowerCase().includes(search.toLowerCase())
  )

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDriver) return
    setDrivers(drivers.map((d) => (d.id === editingDriver.id ? editingDriver : d)))
    setSaved(true)
    setTimeout(() => { setSaved(false); setEditingDriver(null) }, 1500)
  }

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault()
    const created: Driver = {
      id: 'DRV-' + Date.now(),
      name: newDriver.name,
      email: newDriver.email,
      phone: newDriver.phone,
      vehicle: newDriver.vehicle,
      licensePlate: newDriver.licensePlate,
      status: 'ACTIVE',
      rating: 5.0,
      totalDeliveries: 0,
      currentRoute: null,
      location: 'Pending Assignment',
      joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    }
    setDrivers([created, ...drivers])
    setShowAdd(false)
    setNewDriver({ name: '', email: '', phone: '', vehicle: '', licensePlate: '' })
  }

  const handleStatusToggle = (id: string) => {
    setDrivers(drivers.map((d) =>
      d.id === id ? { ...d, status: d.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : d
    ))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#6B2737]" />
            Drivers &amp; Fleet Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage courier drivers, fleet vehicles, assignments, and performance.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
          <Plus className="w-4 h-4 mr-1.5" /> Add Driver
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Drivers', value: drivers.length, color: 'text-white' },
          { label: 'On Delivery', value: drivers.filter((d) => d.status === 'ON_DELIVERY').length, color: 'text-blue-400' },
          { label: 'Available', value: drivers.filter((d) => d.status === 'ACTIVE').length, color: 'text-emerald-400' },
          { label: 'Suspended', value: drivers.filter((d) => d.status === 'SUSPENDED').length, color: 'text-red-400' },
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
          placeholder="Search name, email, vehicle..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
        />
      </div>

      {/* Driver Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Driver</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Location</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40">
                  <td className="p-3">
                    <span className="font-bold text-white block">{d.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{d.id} · Since {d.joinDate}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-slate-300 block">{d.email}</span>
                    <span className="text-[10px] text-slate-500">{d.phone}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-200 block">{d.vehicle}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{d.licensePlate}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3 h-3 text-[#6B2737]" />
                      <span>{d.location}</span>
                    </div>
                    {d.currentRoute && (
                      <span className="text-[10px] text-blue-400">{d.currentRoute}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-amber-400">{d.rating}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{d.totalDeliveries.toLocaleString()} deliveries</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[d.status]}`}>
                      {d.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Button size="sm" onClick={() => setEditingDriver({ ...d })} className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
                      <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatusToggle(d.id)} className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs">
                      {d.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Driver Modal */}
      {editingDriver && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#6B2737]" /> Edit Driver: {editingDriver.name}
              </h2>
              <button onClick={() => setEditingDriver(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {saved && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Driver updated successfully!
              </div>
            )}
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Full Name', field: 'name' },
                  { label: 'Email', field: 'email' },
                  { label: 'Phone', field: 'phone' },
                  { label: 'Vehicle', field: 'vehicle' },
                  { label: 'License Plate', field: 'licensePlate' },
                  { label: 'Location', field: 'location' },
                ].map((f) => (
                  <div key={f.field}>
                    <label className="block text-slate-400 font-bold mb-1">{f.label}</label>
                    <input
                      type="text"
                      value={(editingDriver as any)[f.field] || ''}
                      onChange={(e) => setEditingDriver({ ...editingDriver, [f.field]: e.target.value } as Driver)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Status</label>
                  <select
                    value={editingDriver.status}
                    onChange={(e) => setEditingDriver({ ...editingDriver, status: e.target.value as Driver['status'] })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {['ACTIVE','ON_DELIVERY','OFF_DUTY','SUSPENDED'].map((s) => (
                      <option key={s} value={s}>{s.replace('_',' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setEditingDriver(null)} className="text-slate-400 text-xs">Cancel</Button>
                <Button type="submit" className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#6B2737]" /> Add New Driver
              </h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddDriver} className="space-y-3 text-xs">
              {[
                { label: 'Full Name', key: 'name', required: true },
                { label: 'Email Address', key: 'email', required: true },
                { label: 'Phone Number', key: 'phone' },
                { label: 'Vehicle Type', key: 'vehicle' },
                { label: 'License Plate / Flight ID', key: 'licensePlate' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-slate-400 font-bold mb-1">{f.label}</label>
                  <input
                    type="text"
                    required={f.required}
                    value={newDriver[f.key as keyof typeof newDriver]}
                    onChange={(e) => setNewDriver({ ...newDriver, [f.key]: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]"
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowAdd(false)} className="text-slate-400 text-xs">Cancel</Button>
                <Button type="submit" className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">Add Driver</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
