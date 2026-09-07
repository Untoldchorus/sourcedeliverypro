'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldAlert, LogOut, Clock, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ImpersonationState {
  isImpersonating: boolean
  adminId: string
  adminName: string
  targetUserId: string
  targetUserName: string
  targetUserEmail: string
  startTime: string
}

export default function ImpersonationBanner() {
  const router = useRouter()
  const [session, setSession] = useState<ImpersonationState | null>(null)

  useEffect(() => {
    // Check if impersonation is active in localStorage / cookie
    const stored = localStorage.getItem('sourcedeliverypro_impersonation') || localStorage.getItem('swiftship_impersonation')
    if (stored) {
      try {
        setSession(JSON.parse(stored))
      } catch (e) {
        // Ignore JSON parse error
      }
    }
  }, [])

  if (!session || !session.isImpersonating) return null

  const handleExit = () => {
    localStorage.removeItem('sourcedeliverypro_impersonation')
    localStorage.removeItem('swiftship_impersonation')
    setSession(null)
    alert(`Exited impersonation mode for user ${session.targetUserEmail}. Returning to Admin Command Center.`)
    router.push('/admin/users')
  }

  return (
    <div className="bg-amber-500 text-slate-950 font-bold px-4 py-2.5 flex items-center justify-between text-xs shadow-lg z-50 sticky top-0 border-b border-amber-600">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-slate-950 text-amber-400 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
          Active Customer Impersonation
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span>Viewing portal as:</span>
          <span className="bg-slate-950/90 text-white px-2 py-0.5 rounded font-mono text-[11px]">
            {session.targetUserName} ({session.targetUserEmail})
          </span>
          <span className="text-slate-900 font-medium">| Authorized By: {session.adminName}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-900 font-mono">
          <Clock className="w-3.5 h-3.5" /> Started {session.startTime}
        </span>

        <Button
          size="sm"
          onClick={handleExit}
          className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-xs px-3 h-8 shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Exit Impersonation
        </Button>
      </div>
    </div>
  )
}
