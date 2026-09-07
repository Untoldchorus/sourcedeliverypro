'use client'

import React from 'react'
import { Bell, CheckCircle2, Package, Truck, ShieldCheck } from 'lucide-react'

export default function NotificationsPage() {
  const notifications = [
    {
      id: 'n-1',
      title: 'Shipment SDP8F4K92LM381 In Transit',
      desc: 'Arrived at London Heathrow Distribution Hub (LHR).',
      time: '10 minutes ago',
      icon: Truck,
      type: 'info',
    },
    {
      id: 'n-2',
      title: 'Payment Verification Successful',
      desc: 'Invoice INV-2026-88194 paid via SourceDeliveryPro Gateway.',
      time: '2 hours ago',
      icon: CheckCircle2,
      type: 'success',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1B2A4A]">Notifications Center</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time alerts, checkpoint tracking updates, and system messages.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {notifications.map((n) => (
          <div key={n.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#6B2737] flex items-center justify-center shrink-0 mt-0.5">
              <n.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#1B2A4A] text-sm">{n.title}</h3>
                <span className="text-slate-400 font-mono text-[11px]">{n.time}</span>
              </div>
              <p className="text-slate-600 mt-1">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
