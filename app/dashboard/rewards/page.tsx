'use client'

import React, { useState } from 'react'
import { Award, Share2, Copy, Check, Gift, Tag, DollarSign, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RewardsPage() {
  const [copied, setCopied] = useState(false)
  const referralCode = 'SDP-JOHN-2026'
  const referralUrl = `https://sourcedeliverypro.com/register?ref=${referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#1B2A4A]">Rewards & Commercial Referrals</h1>
        <p className="text-xs text-slate-500 mt-1">
          Share your personal referral link to earn shipping credits and unlock ProPoints discounts.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Available Shipping Credit</span>
          <div className="text-3xl font-black text-emerald-600">$50.00</div>
          <span className="text-[11px] text-slate-500 block">Applied automatically at checkout</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Loyalty ProPoints</span>
          <div className="text-3xl font-black text-[#6B2737]">1,250 pts</div>
          <span className="text-[11px] text-slate-500 block">10 pts earned per $1 spent</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Successful Referrals</span>
          <div className="text-3xl font-black text-[#1B2A4A]">3 Accounts</div>
          <span className="text-[11px] text-slate-500 block">$15 credit per friend who ships</span>
        </div>
      </div>

      {/* Referral Link Box */}
      <div className="bg-gradient-to-r from-[#1B2A4A] to-[#13233D] text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6B2737] flex items-center justify-center text-white font-bold">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold">Invite Shippers & Earn $15 Credit</h2>
            <p className="text-xs text-slate-300">Give your friends 15% off their first shipment and get $15 in credit.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-mono border border-slate-700 focus:outline-none"
          />
          <Button onClick={handleCopy} className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs px-5">
            {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
      </div>

      {/* Available Coupons */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-base text-[#1B2A4A] flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#6B2737]" /> Active Coupons & Vouchers
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="border border-dashed border-orange-300 bg-orange-50/50 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <span className="font-bold text-[#6B2737] block text-sm">GLOBAL15</span>
              <span className="text-slate-600">15% Off International Express Air</span>
              <span className="text-[10px] text-slate-400 block mt-1">Expires Sep 30, 2026</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText('GLOBAL15')
                alert('Coupon code GLOBAL15 copied!')
              }}
              className="text-xs font-bold border-orange-200 text-[#6B2737]"
            >
              Copy Code
            </Button>
          </div>

          <div className="border border-dashed border-slate-200 bg-slate-50 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <span className="font-bold text-[#1B2A4A] block text-sm">FREIGHT50</span>
              <span className="text-slate-600">$50 Off Commercial Pallet Cargo</span>
              <span className="text-[10px] text-slate-400 block mt-1">Expires Oct 15, 2026</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText('FREIGHT50')
                alert('Coupon code FREIGHT50 copied!')
              }}
              className="text-xs font-bold"
            >
              Copy Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
