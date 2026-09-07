'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Shield, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TrackingWidget() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const router = useRouter()

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) return
    router.push(`/tracking?number=${encodeURIComponent(trackingNumber.trim())}`)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 max-w-2xl mx-auto -mt-16 relative z-20">
      <div className="flex items-center justify-between mb-4 border-b pb-3">
        <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
          <Search className="w-5 h-5 text-[#6B2737]" />
          Track Your Shipment
        </h2>
        <span className="text-xs text-slate-400">Multiple tracking supported</span>
      </div>

      <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter Tracking Number (e.g. SDP8F4K92LM381)"
            className="w-full px-4 py-3.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6B2737] focus:border-transparent font-mono text-sm tracking-wide text-slate-800 uppercase"
            required
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-semibold flex items-center justify-center gap-2 h-auto py-3.5 px-8 shadow-md shadow-orange-500/20"
        >
          <span>Track</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="flex flex-wrap items-center justify-between mt-4 text-xs text-slate-500 pt-3 border-t border-slate-50">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-500" /> Real-time GPS & checkpoint updates
        </span>
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-blue-500" /> Verified transit status
        </span>
      </div>
    </div>
  )
}