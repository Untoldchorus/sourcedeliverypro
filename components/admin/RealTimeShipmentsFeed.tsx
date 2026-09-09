'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  getLocalShipments,
  deleteLocalShipment,
  getDeletedShipments,
  addDeletedShipment,
} from '@/lib/payments/manualOptions'

interface RealTimeShipmentsFeedProps {
  initialShipments: any[]
}

export default function RealTimeShipmentsFeed({ initialShipments }: RealTimeShipmentsFeedProps) {
  const [shipments, setShipments] = useState<any[]>(initialShipments)

  useEffect(() => {
    try {
      const deleted = new Set(getDeletedShipments().map((k) => String(k).trim().toLowerCase()))
      const local = getLocalShipments()

      const map = new Map<string, any>()

      // 1. Initial DB shipments
      initialShipments.forEach((s) => {
        const idKey = String(s.id || '').trim().toLowerCase()
        const trkKey = String(s.trackingNumber || '').trim().toLowerCase()
        const shpKey = String(s.shipmentNumber || '').trim().toLowerCase()

        if ((idKey && deleted.has(idKey)) || (trkKey && deleted.has(trkKey)) || (shpKey && deleted.has(shpKey))) {
          return
        }

        const key = s.trackingNumber || s.id
        map.set(key, s)
      })

      // 2. Overlay local shipments
      local.forEach((loc) => {
        const idKey = String(loc.id || '').trim().toLowerCase()
        const trkKey = String(loc.trackingNumber || '').trim().toLowerCase()
        const shpKey = String(loc.shipmentNumber || '').trim().toLowerCase()

        if ((idKey && deleted.has(idKey)) || (trkKey && deleted.has(trkKey)) || (shpKey && deleted.has(shpKey))) {
          return
        }

        const key = loc.trackingNumber || loc.id
        const existing = map.get(key)
        if (existing) {
          map.set(key, { ...existing, ...loc })
        } else {
          map.set(key, {
            id: loc.id || loc.trackingNumber,
            trackingNumber: loc.trackingNumber,
            senderCity: loc.senderCity || loc.sender || 'Dispatch Hub',
            senderCountry: loc.senderCountry || '',
            recipientCity: loc.recipientCity || loc.recipient || 'Destination',
            recipientCountry: loc.recipientCountry || '',
            serviceType: loc.service || loc.serviceType || 'EXPRESS',
            weight: loc.weight || 2.5,
            status: loc.status || 'IN_TRANSIT',
            totalAmount: loc.totalAmount || loc.amount || 0,
            createdBy: { name: loc.userName || loc.sender, email: loc.userEmail || '' },
            payment: { status: loc.paymentStatus || 'PENDING' },
          })
        }
      })

      setShipments(Array.from(map.values()))
    } catch (e) {
      console.error('Error syncing real-time shipments:', e)
    }
  }, [initialShipments])

  const handleDelete = async (s: any) => {
    const label = s.trackingNumber || s.shipmentNumber || s.id
    if (!confirm(`Permanently delete shipment ${label}? This will remove it from all feeds and tracking.`)) {
      return
    }

    const id = s.id
    const trk = s.trackingNumber
    const shpNum = s.shipmentNumber

    // Immediate local removal
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

    // Server API deletion
    try {
      await fetch(
        `/api/shipments?id=${encodeURIComponent(id || '')}&trackingNumber=${encodeURIComponent(trk || '')}`,
        { method: 'DELETE' }
      )
    } catch (err) {
      console.error('Delete shipment DB error:', err)
    }

    setShipments((prev) =>
      prev.filter(
        (item) =>
          item.id !== id &&
          item.trackingNumber !== trk &&
          (!shpNum || item.shipmentNumber !== shpNum)
      )
    )
  }

  if (shipments.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        No shipments currently registered in system database.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-800 text-slate-400 uppercase font-semibold border-b border-slate-700">
          <tr>
            <th className="p-4">Tracking ID</th>
            <th className="p-4">Booked By (User)</th>
            <th className="p-4">Sender Hub</th>
            <th className="p-4">Destination</th>
            <th className="p-4">Service</th>
            <th className="p-4">Weight</th>
            <th className="p-4">Status</th>
            <th className="p-4">Amount</th>
            <th className="p-4 text-right sticky right-0 bg-slate-800 z-10 shadow-[-8px_0_12px_rgba(0,0,0,0.5)]">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {shipments.map((s) => {
            const creatorName =
              s.createdBy?.name ||
              s.customer?.user?.name ||
              s.customer?.companyName ||
              s.senderName ||
              s.userName ||
              'Customer'
            const creatorEmail =
              s.createdBy?.email ||
              s.customer?.user?.email ||
              s.senderEmail ||
              s.userEmail ||
              ''
            const isAwaitingVerification =
              s.status === 'PROCESSING' ||
              s.payment?.status === 'PROCESSING' ||
              s.status === 'PAYMENT_SUBMITTED'

            return (
              <tr key={s.id || s.trackingNumber} className="hover:bg-slate-700/30 transition-colors">
                <td className="p-4 font-mono font-bold text-[#FF6B35]">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/admin/shipments/${s.id || s.trackingNumber}`} className="hover:underline">
                      {s.trackingNumber || s.id}
                    </Link>
                    {s.trackingNumber && (
                      <Link
                        href={`/tracking?number=${s.trackingNumber}`}
                        target="_blank"
                        title="View Public Tracking"
                        className="text-slate-500 hover:text-white"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">
                      {creatorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-white block text-xs">
                        {creatorName}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono truncate max-w-[150px]">
                        {creatorEmail || 'Verified User'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {s.senderCity || 'Dispatch Hub'}
                  {s.senderCountry ? `, ${s.senderCountry}` : ''}
                </td>
                <td className="p-4 font-medium text-white">
                  {s.recipientCity || 'Destination'}
                  {s.recipientCountry ? `, ${s.recipientCountry}` : ''}
                </td>
                <td className="p-4">{s.serviceType?.replace(/_/g, ' ') || s.service || 'Standard'}</td>
                <td className="p-4 font-mono">{Number(s.weight || 0)} kg</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isAwaitingVerification
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : s.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : s.status === 'IN_TRANSIT'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isAwaitingVerification ? 'PAYMENT SUBMITTED' : s.status?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-4 font-bold text-emerald-400">
                  {formatCurrency(Number(s.totalAmount || s.amount || 0))}
                </td>
                <td className="p-4 text-right whitespace-nowrap sticky right-0 bg-slate-800/95 backdrop-blur-sm z-10 shadow-[-8px_0_12px_rgba(0,0,0,0.5)]">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(s)}
                    className="border-red-500/40 text-red-400 hover:bg-red-500/15 hover:text-red-300 font-bold text-xs"
                    title="Permanently Delete Shipment"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
