'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Bell, CheckCircle2, Package, Truck, ShieldCheck, Inbox } from 'lucide-react'

interface NotificationItem {
  id: string
  title: string
  desc: string
  time: string
  type: 'info' | 'success' | 'warning'
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const storageKey = `sdp_notifications_${session?.user?.email || 'user'}`

  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(storageKey)
      if (savedRaw) {
        setNotifications(JSON.parse(savedRaw))
      } else {
        setNotifications([])
      }
    } catch {
      setNotifications([])
    }
  }, [storageKey])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1B2A4A]">Notifications Center</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time alerts, checkpoint tracking updates, and system messages.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">No new notifications</p>
            <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
              Your tracking alerts, flight scans, payment confirmations, and consignment updates will appear here automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#6B2737] flex items-center justify-center shrink-0 mt-0.5">
                <Truck className="w-5 h-5" />
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
      )}
    </div>
  )
}
