'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { BookOpen, Plus, MapPin, Trash2, Edit3, CheckCircle2, User, Building2, Upload, X } from 'lucide-react'
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
  const { data: session } = useSession()
  const [addresses, setAddresses] = useState<Address[]>([])

  const storageKey = `sdp_addresses_${session?.user?.email || 'user'}`

  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(storageKey)
      if (savedRaw) {
        setAddresses(JSON.parse(savedRaw))
      } else {
        setAddresses([])
      }
    } catch {
      setAddresses([])
    }
  }, [storageKey])

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
      isDefault: addresses.length === 0,
    }

    const updated = [...addresses, created]
    setAddresses(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))

    setShowAddModal(false)
    setNewAddr({ type: 'RECIPIENT', fullName: '', company: '', phone: '', street: '', city: '', country: 'United States (US)' })
  }

  const handleDelete = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id)
    setAddresses(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
  }

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }))
    setAddresses(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
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
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add New Address
          </Button>
        </div>
      </div>

      {/* Address Grid or Empty State */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">No saved addresses yet</p>
            <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
              Save your frequently used sender and recipient addresses for rapid 1-click shipment creation.
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Your First Address
          </Button>
        </div>
      ) : (
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
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

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
                  placeholder="e.g. John Doe or Samuel Aka"
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
                  placeholder="e.g. SourceDeliveryPro Logistics"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  placeholder="e.g. 100 Main Street, Suite 400"
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
                    placeholder="e.g. Atlanta, GA"
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
                    placeholder="+1 555-0100"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Country</label>
                <input
                  type="text"
                  value={newAddr.country}
                  onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })}
                  placeholder="e.g. United States (US)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold">
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
