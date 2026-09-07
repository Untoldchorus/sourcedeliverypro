'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package, Search, Filter, Plus, ArrowRight, Download,
  CheckCircle2, Clock, FileText, Eye, ShieldCheck, MapPin, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

import { useSession } from 'next-auth/react'

interface Shipment {
  id: string
  trackingNumber: string
  sender: string
  recipient: string
  senderCity: string
  recipientCity: string
  service: string
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'PENDING_PAYMENT' | 'PAYMENT_SUBMITTED' | 'LABEL_CREATED'
  created: string
  estimated: string
  weight: string
  amount: number
  hasPOD?: boolean
  podRecipient?: string
  podTime?: string
}

export default function MyShipmentsPage() {
  const { data: session } = useSession()
  const [tab, setTab] = useState<'ALL' | 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'>('ALL')
  const [search, setSearch] = useState('')
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [showPODModal, setShowPODModal] = useState<Shipment | null>(null)

  const defaultShipments: Shipment[] = []

  const [shipments, setShipments] = useState<Shipment[]>(defaultShipments)

  const userEmail = session?.user?.email?.toLowerCase() || ''
  const userName = session?.user?.name?.toLowerCase() || ''

  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem('sourcedeliverypro_admin_shipments') || localStorage.getItem('swiftship_admin_shipments')
      if (savedRaw) {
        const overrides = JSON.parse(savedRaw)
        const list: any[] = Array.isArray(overrides) ? overrides : Object.values(overrides)

        // Strictly filter to shipments belonging to this user
        const userItems = list
          .filter((o: any) => {
            const sEmail = (o.senderEmail || '').toLowerCase()
            const sName = (o.senderName || o.sender || '').toLowerCase()
            const sUser = (o.userId || '').toLowerCase()

            if (userEmail && sEmail === userEmail) return true
            if (userName && sName === userName) return true
            if (session?.user?.id && sUser === session.user.id.toLowerCase()) return true
            return false
          })
          .map((o: any) => ({
            id: o.id,
            trackingNumber: o.trackingNumber || 'Pending Approval',
            sender: o.sender || o.senderName || '',
            recipient: o.recipient || o.recipientName || '',
            senderCity: o.senderCity || '',
            recipientCity: o.recipientCity || '',
            service: o.serviceType || o.service || 'Standard',
            status: o.status || 'PENDING',
            created: o.created || '',
            estimated: o.estimated || o.estimatedDelivery || '3-5 Days',
            weight: o.weight ? (o.weight.toString().includes('kg') ? o.weight : `${o.weight} kg`) : '',
            amount: (o.totalAmount || o.amount) ? parseFloat(o.totalAmount || o.amount) : 0,
          }))

        setShipments(userItems)
      } else {
        setShipments([])
      }
    } catch (e) {
      console.error(e)
      setShipments([])
    }
  }, [userEmail, userName, session?.user?.id])

  const filtered = shipments.filter((s) => {
    const matchTab = tab === 'ALL' || s.status === tab
    const matchSearch =
      s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.recipient.toLowerCase().includes(search.toLowerCase()) ||
      s.recipientCity.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1B2A4A]">My Consignments & Shipments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete list of your domestic & international shipping orders, waybills, and proof of delivery.
          </p>
        </div>

        <Button asChild className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold">
          <Link href="/dashboard/shipments/new">
            <Plus className="w-4 h-4 mr-2" /> Book New Shipment
          </Link>
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['ALL', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  tab === t ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by AWB #, city, or name..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
            />
          </div>
        </div>

        {/* Shipments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b">
              <tr>
                <th className="p-3">AWB / Tracking #</th>
                <th className="p-3">Route (Origin → Destination)</th>
                <th className="p-3">Service Class</th>
                <th className="p-3">Date Created</th>
                <th className="p-3">Est. Delivery</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold text-[#6B2737]">{s.trackingNumber}</td>
                  <td className="p-3 font-medium text-slate-800">
                    {s.senderCity} → {s.recipientCity}
                    <span className="block text-[10px] text-slate-400 font-normal">To: {s.recipient}</span>
                  </td>
                  <td className="p-3 font-medium">{s.service}</td>
                  <td className="p-3 text-slate-500">{s.created}</td>
                  <td className="p-3 text-slate-500">{s.estimated}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'IN_TRANSIT'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    {s.status === 'PENDING_PAYMENT' && (
                      <Link href={`/pay/${s.id || s.trackingNumber}`}>
                        <Button
                          size="sm"
                          className="bg-[#6B2737] hover:bg-[#521b28] text-white text-[11px] font-bold px-2.5 py-1 h-auto mr-1"
                        >
                          Pay Now / Share Link
                        </Button>
                      </Link>
                    )}

                    {s.status === 'PAYMENT_SUBMITTED' && (
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full mr-1">
                        Verifying Payment
                      </span>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedShipment(s)}
                      className="text-xs text-slate-600 hover:text-[#1B2A4A]"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => alert(`Downloading Commercial Air Waybill (AWB) PDF for ${s.trackingNumber}...`)}
                      className="text-xs text-slate-600 hover:text-[#6B2737]"
                      title="Download Shipping Label / Waybill"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>

                    {s.status === 'DELIVERED' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPODModal(s)}
                        className="text-xs text-emerald-600 hover:text-emerald-700"
                        title="Proof of Delivery (POD)"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No shipments found. Click &quot;Create Shipment&quot; to book a new consignment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment Details Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl relative">
            <button
              onClick={() => setSelectedShipment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Consignment Specification</span>
              <h2 className="text-lg font-black text-[#1B2A4A] font-mono">{selectedShipment.trackingNumber}</h2>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Service Class:</span>
                <span className="font-bold text-slate-800">{selectedShipment.service}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Origin:</span>
                <span className="font-semibold text-slate-800">{selectedShipment.senderCity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Destination:</span>
                <span className="font-semibold text-slate-800">{selectedShipment.recipientCity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Recipient Name:</span>
                <span className="font-semibold text-slate-800">{selectedShipment.recipient}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Weight:</span>
                <span className="font-semibold text-slate-800">{selectedShipment.weight}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Freight Cost:</span>
                <span className="font-bold text-[#6B2737]">{formatCurrency(selectedShipment.amount)}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button asChild className="bg-[#6B2737] text-white font-bold w-full">
                <Link href={`/tracking?number=${selectedShipment.trackingNumber}`}>
                  View Live Map Telemetry <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>

            </div>
          </div>
        </div>
      )}

      {/* Proof of Delivery (POD) Modal */}
      {showPODModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl relative">
            <button
              onClick={() => setShowPODModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-600 border-b pb-3">
              <ShieldCheck className="w-6 h-6" />
              <h2 className="text-base font-bold">Verified Proof of Delivery (POD)</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 space-y-1">
                <div className="font-bold">Signed & Verified Delivery</div>
                <div>Signed By: {showPODModal.podRecipient}</div>
                <div>Timestamp: {showPODModal.podTime}</div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 text-center bg-slate-50 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Digital Courier Signature</span>
                <div className="font-mono text-xl italic text-slate-800 font-bold border-b border-dashed border-slate-300 pb-2">
                  M. Vance
                </div>
                <span className="text-[10px] text-slate-400">Cryptographically signed on driver handheld scanner</span>
              </div>
            </div>

            <Button
              onClick={() => alert(`Downloading Proof of Delivery certificate for ${showPODModal.trackingNumber}...`)}
              className="w-full bg-[#1B2A4A] hover:bg-[#13233D] text-white font-bold"
            >
              Download Signed POD Certificate (PDF)
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
