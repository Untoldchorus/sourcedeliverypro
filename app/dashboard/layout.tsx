'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Box, PlusCircle, Search, BookOpen,
  CreditCard, FileText, Bell, HelpCircle, User, Award,
  LogOut, Menu, X, ChevronRight, Package, ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/shipments', label: 'My Shipments', icon: Box },
  { href: '/dashboard/shipments/new', label: 'Create Shipment', icon: PlusCircle },
  { href: '/tracking', label: 'Track Package', icon: Search },
  { href: '/dashboard/addresses', label: 'Address Book', icon: BookOpen },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/support', label: 'Support Tickets', icon: HelpCircle },
  { href: '/dashboard/profile', label: 'My Account', icon: User },
  { href: '/dashboard/rewards', label: 'Rewards & Referrals', icon: Award },
]

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const userName = session?.user?.name || 'Customer'
  const userInitials = (session?.user?.name || 'Customer')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Top Navbar */}
      <div className="lg:hidden bg-[#1B2A4A] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6B2737] flex items-center justify-center font-black text-white">
            <Package className="w-5 h-5" />
          </div>
          <span className="font-black text-lg">
            SourceDelivery<span className="text-[#6B2737]">Pro</span>
          </span>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:bg-navy-800"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#1B2A4A] text-slate-300 flex flex-col justify-between transition-transform duration-300 shadow-xl lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Logo */}
          <Link href="/" className="hidden lg:flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#6B2737] flex items-center justify-center font-black text-white shadow-md shadow-orange-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xl text-white tracking-tight">
                SourceDelivery<span className="text-[#6B2737]">Pro</span>
              </span>
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Customer Portal
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl transition-all',
                    active
                      ? 'bg-[#6B2737] text-white font-bold shadow-md shadow-orange-500/20'
                      : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn('w-4 h-4', active ? 'text-white' : 'text-slate-400')} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#6B2737] text-white font-black text-xs flex items-center justify-center shrink-0">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 truncate">Verified Customer</p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await signOut({ redirect: false })
                } catch {}
                window.location.href = '/login'
              }}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
