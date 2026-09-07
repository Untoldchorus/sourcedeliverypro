'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShieldCheck, LayoutDashboard, Users, Box, MapPin,
  CreditCard, FileText, Settings, Key, AlertTriangle,
  HelpCircle, BarChart3, Truck, Building2, ChevronRight, Menu, X, ArrowLeft, Hash
} from 'lucide-react'
import ImpersonationBanner from '@/components/admin/ImpersonationBanner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const adminNavSections = [
  {
    title: 'Operations & Tracking',
    items: [
      { href: '/admin', label: 'Command Center', icon: LayoutDashboard },
      { href: '/admin/shipments', label: 'Shipment Controls', icon: Box },
      { href: '/admin/tracking', label: 'Tracking Overrides', icon: MapPin },
      { href: '/admin/tracking-generator', label: 'AWB Generator & Email', icon: Hash },
      { href: '/admin/dispatch', label: 'Dispatch & Routes', icon: Truck },
    ],
  },
  {
    title: 'Customers & Fleet',
    items: [
      { href: '/admin/users', label: 'User Directory', icon: Users },
      { href: '/admin/drivers', label: 'Drivers & Fleet', icon: Truck },
      { href: '/admin/facilities', label: 'Facilities & Hubs', icon: Building2 },
    ],
  },
  {
    title: 'Finance & Tariffs',
    items: [
      { href: '/admin/payments', label: 'Payment Approvals', icon: CreditCard },
      { href: '/admin/receipts', label: 'Receipt Generator', icon: FileText },
      { href: '/admin/pricing', label: 'Tariffs & Rates', icon: BarChart3 },
    ],
  },
  {
    title: 'Security & Governance',
    items: [
      { href: '/admin/roles', label: 'Role & PBAC Engine', icon: Key },
      { href: '/admin/audit-logs', label: 'Audit Log Inspection', icon: ShieldCheck },
    ],
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Customer Impersonation Banner */}
      <ImpersonationBanner />

      {/* Main Flex Wrapper */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#6B2737]" />
            <span className="font-black text-base text-white">SourceDeliveryPro Command</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="p-5 space-y-6 overflow-y-auto flex-1">
            {/* Header Brand */}
            <div className="hidden lg:flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#6B2737] flex items-center justify-center font-black text-white shadow-md shadow-orange-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-sm text-white tracking-tight">Admin Console</h2>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  PBAC & Audit Engine
                </span>
              </div>
            </div>

            {/* Navigation Groups */}
            <div className="space-y-5">
              {adminNavSections.map((sec, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block">
                    {sec.title}
                  </span>
                  {sec.items.map((item) => {
                    const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors',
                          active
                            ? 'bg-[#6B2737] text-white font-bold shadow-md shadow-orange-500/20'
                            : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <item.icon className={cn('w-4 h-4', active ? 'text-white' : 'text-slate-400')} />
                          <span>{item.label}</span>
                        </div>
                        {active && <ChevronRight className="w-3 h-3 text-white" />}
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Back to Public Site */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60">
            <Button asChild variant="outline" className="w-full justify-start text-xs border-slate-700 text-slate-300 hover:bg-slate-800">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" /> Exit to Customer View
              </Link>
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
