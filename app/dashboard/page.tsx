'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  Package, Clock, CheckCircle2, AlertCircle, ArrowRight,
  TrendingUp, Plus, Search, MapPin, DollarSign, Truck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { getLocalShipments } from '@/lib/payments/manualOptions'

export default function CustomerDashboardPage() {
  const { data: session } = useSession()
  const [shipments, setShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const userEmail = session?.user?.email?.toLowerCase() || ''
  const userName = session?.user?.name?.toLowerCase() || ''

  useEffect(() => {
    try {
      const allLocal = getLocalShipments()

      // Strictly filter to shipments belonging to this customer
      const userShipments = allLocal.filter((s: any) => {
        const sEmail = (s.senderEmail || '').toLowerCase()
        const sName = (s.senderName || s.sender || '').toLowerCase()
        const sUser = (s.userId || '').toLowerCase()

        // Match by user's email or sender name
        if (userEmail && sEmail === userEmail) return true
        if (userName && sName === userName) return true
        if (session?.user?.id && sUser === session.user.id.toLowerCase()) return true
        return false
      })

      setShipments(userShipments)
    } catch {
      setShipments([])
    } finally {
      setLoading(false)
    }
  }, [userEmail, userName, session?.user?.id])

  const activeShipments = shipments.filter((s) =>
    ['LABEL_CREATED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'CUSTOMS_CLEARANCE'].includes(s.status)
  ).length

  const deliveredShipments = shipments.filter((s) => s.status === 'DELIVERED').length
  const totalShipments = shipments.length
  const totalSpent = shipments
    .filter((s) => s.status === 'LABEL_CREATED' || s.status === 'DELIVERED')
    .reduce((sum, s) => sum + (Number(s.amount) || Number(s.totalAmount) || 0), 0)

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A4A] tracking-tight">
              Customer Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Overview of your active consignments, live telemetry, invoices, and shipping records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold">
              <Link href="/dashboard/shipments/new">
                <Plus className="w-4 h-4 mr-1.5" /> Create Shipment
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-300">
              <Link href="/tracking">
                <Search className="w-4 h-4 mr-1.5" /> Track Number
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Active In Transit</span>
            <div className="text-3xl font-black text-[#6B2737] mt-1">{activeShipments}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Live GPS and sorting checkpoints</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Delivered Parcels</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">{deliveredShipments}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Signed with Proof of Delivery</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Consignments</span>
            <div className="text-3xl font-black text-[#1B2A4A] mt-1">{totalShipments}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Lifetime shipment orders</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Logistics Spend</span>
            <div className="text-3xl font-black text-blue-600 mt-1">{formatCurrency(totalSpent)}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Verified freight invoices</span>
          </div>
        </div>

        {/* Recent Shipments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b flex justify-between items-center">
            <h2 className="font-bold text-base text-[#1B2A4A]">Recent Consignments</h2>
            <Link href="/shipping/quote" className="text-xs font-semibold text-[#6B2737] hover:underline">
              Get Rates &amp; Transit Times
            </Link>
          </div>

          {shipments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">No shipments created yet</p>
                <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
                  Book your first domestic or international parcel shipment to track live GPS telemetry and milestones.
                </p>
              </div>
              <Button asChild size="sm" className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold">
                <Link href="/dashboard/shipments/new">+ Create First Shipment</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-400 uppercase font-semibold border-b">
                  <tr>
                    <th className="p-4">Tracking ID</th>
                    <th className="p-4">Recipient</th>
                    <th className="p-4">Destination</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shipments.map((s) => (
                    <tr key={s.id || s.trackingNumber} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-[#1B2A4A]">{s.trackingNumber}</td>
                      <td className="p-4 font-medium text-slate-800">{s.recipientName || s.recipient}</td>
                      <td className="p-4">{s.recipientCity || s.destination || 'Global'}</td>
                      <td className="p-4 font-medium">{s.serviceType || s.service || 'Express'}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800">
                          {(s.status || 'PENDING').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {formatCurrency(Number(s.totalAmount || s.amount || 0))}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/tracking?number=${s.trackingNumber}`}
                          className="text-xs font-semibold text-[#6B2737] hover:underline"
                        >
                          Track
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}