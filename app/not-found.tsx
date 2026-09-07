'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Search, ArrowRight, Home, MapPin, Calculator, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const router = useRouter()
  const [trackingNumber, setTrackingNumber] = useState('')

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingNumber.trim()) {
      router.push(`/tracking?number=${encodeURIComponent(trackingNumber.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-16">
      <div className="max-w-xl w-full text-center space-y-8">
        {/* Brand logo & Badge */}
        <div className="inline-flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-[#1B2A4A] text-[#6B2737] font-black text-2xl flex items-center justify-center shadow-lg shadow-navy-900/10">
            <Package className="w-8 h-8" />
          </div>
          <span className="text-6xl font-black tracking-tight text-[#1B2A4A]">
            4<span className="text-[#6B2737]">0</span>4
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-black text-[#1B2A4A] tracking-tight">
            Consignment or Page Not Found
          </h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            The page or cargo route you requested could not be located. It may have been moved, renamed, or is temporarily offline.
          </p>
        </div>

        {/* Quick Tracking Search Widget */}
        <form onSubmit={handleTrack} className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Looking for a shipment? Enter tracking # e.g. SDP8F4K92LM381"
            className="w-full text-xs bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800"
          />
          <Button type="submit" className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs py-2 px-4 rounded-xl">
            Track <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </form>

        {/* Popular destinations */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Link
            href="/"
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-[#6B2737] hover:shadow-sm transition flex flex-col items-center gap-1.5 font-semibold text-slate-700 hover:text-[#6B2737]"
          >
            <Home className="w-5 h-5 text-slate-400" />
            Homepage
          </Link>

          <Link
            href="/tracking"
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-[#6B2737] hover:shadow-sm transition flex flex-col items-center gap-1.5 font-semibold text-slate-700 hover:text-[#6B2737]"
          >
            <MapPin className="w-5 h-5 text-slate-400" />
            Tracking
          </Link>

          <Link
            href="/shipping/quote"
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-[#6B2737] hover:shadow-sm transition flex flex-col items-center gap-1.5 font-semibold text-slate-700 hover:text-[#6B2737]"
          >
            <Calculator className="w-5 h-5 text-slate-400" />
            Get Quote
          </Link>

          <Link
            href="/support"
            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-[#6B2737] hover:shadow-sm transition flex flex-col items-center gap-1.5 font-semibold text-slate-700 hover:text-[#6B2737]"
          >
            <HelpCircle className="w-5 h-5 text-slate-400" />
            Help Center
          </Link>
        </div>
      </div>
    </div>
  )
}
