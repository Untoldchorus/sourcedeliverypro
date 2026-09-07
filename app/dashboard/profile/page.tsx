'use client'

import React from 'react'
import { User, Mail, Phone, MapPin, ShieldCheck, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UserProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1B2A4A]">Account Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your identity, default addresses, and authentication credentials.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#1B2A4A] text-[#6B2737] font-black text-xl flex items-center justify-center shadow-md">
            JD
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1B2A4A]">John Doe</h2>
            <p className="text-xs text-slate-500">Personal Shipper • Customer ID: CST-889140A</p>
          </div>
        </div>

        <form className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                defaultValue="john@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Phone Number</label>
              <input
                type="text"
                defaultValue="+1 (555) 019-2834"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Default Country</label>
              <input
                type="text"
                defaultValue="United States (US)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <Button className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
