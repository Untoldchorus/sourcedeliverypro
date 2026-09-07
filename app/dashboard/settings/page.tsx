'use client'

import React from 'react'
import { Settings, Bell, Lock, ShieldCheck, Globe, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UserSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1B2A4A]">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure email alerts, notification triggers, and security options.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 text-xs">
        <div className="space-y-4">
          <h2 className="font-bold text-[#1B2A4A] text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#6B2737]" /> Notification Preferences
          </h2>
          <div className="space-y-3">
            {[
              { id: 'sms', title: 'SMS Checkpoint Notifications', desc: 'Receive real-time SMS whenever package status updates.' },
              { id: 'email', title: 'Email Dispatch Digests', desc: 'Daily breakdown of active shipments & invoice receipts.' },
              { id: 'pod', title: 'Proof of Delivery Alerts', desc: 'Instant notification when recipient signs for parcel.' },
            ].map((opt) => (
              <label key={opt.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 text-[#6B2737] focus:ring-[#6B2737]" />
                <div>
                  <div className="font-bold text-slate-800">{opt.title}</div>
                  <div className="text-slate-500">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t space-y-4">
          <h2 className="font-bold text-[#1B2A4A] text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#6B2737]" /> Security & Password
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start">
              <Lock className="w-4 h-4 mr-2 text-slate-400" /> Change Password
            </Button>
            <Button variant="outline" className="justify-start">
              <ShieldCheck className="w-4 h-4 mr-2 text-slate-400" /> Enable Two-Factor Authentication
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
