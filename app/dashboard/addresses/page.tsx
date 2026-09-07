'use client'

import React, { useState } from 'react'
import { BookOpen, Plus, MapPin, Trash2, Edit3, CheckCircle2, User, Building2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Address {
  id: string
  type: 'SENDER' | 'RECIPIENT'
  fullName: string
  company?: string
  phone: string
  street: string
  city: string
  country: string
  isDefault?: boolean
}

export default function AddressBookPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr-1',
      type: 'SENDER',
      fullName: 'John Doe',
      company: 'SourceDeliveryPro Logistics Hub',
      phone: '+1 555-0199',
      street: '450 Logistics Blvd',
      city: 'New York, DE 19801',
      country: 'United States (US)',
      isDefault: true,
    },
    {
      id: 'addr-2',
      type: 'RECIPIENT',
      fullName: 'Sarah Jenkins',
      company: 'Global Retail UK',
      phone: '+44 20 7946 0991',
      street: '12 Canary Wharf',
      city: 'London E14 5AB',
      country: 'United Kingdom (GB)',
    },
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [newAddr, setNewAddr] = useState<Partial<Address>>({
    type: 'RECIPIENT',
    fullName: '',
    company: '',
    phone: '',
    street: '',
    city: '',
    country: 'United States (US)',
  })

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAddr.fullName || !newAddr.street || !newAddr.city) return

    const created: Address = {
      id: 'addr-' + Date.now(),
      type: newAddr.type || 'RECIPIENT',
      fullName: newAddr.fullName,
      company: newAddr.company,
      phone: newAddr.phone || '+1 555-0000',
      street: newAddr.street,
      city: newAddr.city,
      country: newAddr.country || 'United States (US)',
    }

    setAddresses([...addresses, created])
    setShowAddModal(false)
    setNewAddr({ type: 'RECIPIENT', fullName: '', company: '', phone: '', street: '', city: '', country: 'United States (US)' })
  }

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id))
  }

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1B2A4A]">Address Book</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your saved senders and recipient addresses for rapid 1-click dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => alert('CSV Address Book Import ready. Select file...')} className="text-xs">
            <Upload className="w-4 h-4 mr-1.5" /> Import CSV
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Add New Address
          </Button>
        </div>
      </div>

      {/* Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((a) => (
          <div
            key={a.id}
            className={`bg-white rounded-2xl border p-5 space-y-3 shadow-sm transition relative ${
              a.isDefault ? 'border-[#6B2737] bg-orange-50/10' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  a.type === 'SENDER' ? 'bg-blue-100 text-blue-800' : 'bg-[#6B2737]/10 text-[#6B2737]'
                }`}>
                  {a.type}
                </span>
                {a.isDefault && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Default
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {!a.isDefault && (
                  <button
                    onClick={() => handleSetDefault(a.id)}
                    className="text-xs text-slate-400 hover:text-emerald-600 font-semibold px-2 py-1"
                  >
                    Set Default
                  </button>
                )}
                <button onClick={() => handleDelete(a.id)} className="text-slate-400 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-[#1B2A4A]">{a.fullName}</h3>
              {a.company && <p className="text-xs text-slate-500 font-medium">{a.company}</p>}
            </div>

            <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{a.street}, {a.city}</span>
              </div>
              <div className="text-slate-500 font-semibold pl-5.5">{a.country}</div>
              <div className="text-slate-400 font-mono text-[11px] pl-5.5">{a.phone}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-[#1B2A4A]">Add New Address</h2>

            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewAddr({ ...newAddr, type: 'SENDER' })}
                  className={`py-2 rounded-lg border font-bold ${
                    newAddr.type === 'SENDER' ? 'border-[#6B2737] bg-orange-50 text-[#6B2737]' : 'border-slate-200'
                  }`}
                >
                  Sender Address
                </button>
                <button
                  type="button"
                  onClick={() => setNewAddr({ ...newAddr, type: 'RECIPIENT' })}
                  className={`py-2 rounded-lg border font-bold ${
                    newAddr.type === 'RECIPIENT' ? 'border-[#6B2737] bg-orange-50 text-[#6B2737]' : 'border-slate-200'
                  }`}
                >
                  Recipient Address
                </button>
              </div>

              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={newAddr.fullName}
                  onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Company Name (Optional)</label>
                <input
                  type="text"
                  value={newAddr.company}
                  onChange={(e) => setNewAddr({ ...newAddr, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">City / State</label>
                  <input
                    type="text"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#6B2737] text-white font-bold">
                  Save Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
