'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  Package, ChevronDown, Menu, X, Globe, Search, User, LogOut,
  LayoutDashboard, Settings, Bell, Truck, Building2, MapPin,
  Calculator, Clock, Shield, Zap, ArrowRight, PhoneCall,
  FileText, HelpCircle, Star, Box, Plane, Ship, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { cn, getInitials, formatEnum } from '@/lib/utils'

// ===========================
// Mega Menu Data
// ===========================

const shippingMenuItems = [
  {
    title: 'Domestic Shipping',
    description: 'Same-day, next-day & standard delivery within your country',
    icon: Truck,
    href: '/services#domestic',
    badge: undefined as string | undefined,
  },
  {
    title: 'International Shipping',
    description: 'Express & economy options to 220+ countries',
    icon: Globe,
    href: '/services#international',
    badge: undefined as string | undefined,
  },
  {
    title: 'Freight & Cargo',
    description: 'Heavy shipments & palletized cargo solutions',
    icon: Ship,
    href: '/services#freight',
    badge: undefined as string | undefined,
  },
  {
    title: 'Air Express',
    description: 'Fastest delivery with next-flight-out options',
    icon: Plane,
    href: '/services#air-express',
    badge: 'New' as string | undefined,
  },
]

const servicesMenuItems = [
  {
    title: 'Get a Quote',
    description: 'Instant shipping rates for any package or destination',
    icon: Calculator,
    href: '/shipping/quote',
  },
  {
    title: 'Track a Package',
    description: 'Real-time tracking with live map updates',
    icon: MapPin,
    href: '/tracking',
  },
  {
    title: 'Schedule Pickup',
    description: 'We come to you — book a pickup in minutes',
    icon: Clock,
    href: '/shipping',
  },
  {
    title: 'Insurance',
    description: 'Protect your shipments with comprehensive coverage',
    icon: Shield,
    href: '/services',
  },
]

const businessMenuItems = [
  {
    title: 'Business Account',
    description: 'Volume discounts, invoicing & dedicated support',
    icon: Building2,
    href: '/business',
  },
  {
    title: 'API Integration',
    description: 'Embed shipping into your platform with our API',
    icon: Zap,
    href: '/portal/business',
  },
  {
    title: 'Analytics & Reports',
    description: 'Detailed insights into your shipping operations',
    icon: BarChart3,
    href: '/portal/business',
  },
  {
    title: 'Enterprise Solutions',
    description: 'Custom contracts for high-volume shippers',
    icon: Star,
    href: '/portal/business',
  },
]

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-red-100 text-red-800',
  OPERATIONS_MANAGER: 'bg-blue-100 text-blue-800',
  DISPATCHER: 'bg-cyan-100 text-cyan-800',
  COURIER_STAFF: 'bg-teal-100 text-teal-800',
  WAREHOUSE_STAFF: 'bg-orange-100 text-orange-800',
  CUSTOMER_SUPPORT: 'bg-green-100 text-green-800',
  FINANCE_STAFF: 'bg-yellow-100 text-yellow-800',
  DRIVER: 'bg-indigo-100 text-indigo-800',
  BUSINESS_CUSTOMER: 'bg-gray-100 text-gray-800',
  CUSTOMER: 'bg-gray-100 text-gray-800',
}

// ===========================
// Mega Menu Component
// ===========================

interface MegaMenuItem {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: string
}

function MegaMenuPanel({
  items,
  footerHref,
  footerLabel,
}: {
  items: MegaMenuItem[]
  footerHref: string
  footerLabel: string
}) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[640px] bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-2xl shadow-2xl overflow-hidden z-50">
      {/* Arrow */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-navy-900 border-l border-t border-gray-100 dark:border-navy-700 rotate-45" />
      <div className="grid grid-cols-2 gap-0 p-6">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-orange-50 dark:bg-orange-950/30 rounded-lg flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-950/50 transition-colors">
              <item.icon className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-navy-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {item.title}
                </span>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="border-t border-gray-100 dark:border-navy-700 px-6 py-3 bg-gray-50 dark:bg-navy-800">
        <Link
          href={footerHref}
          className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
        >
          {footerLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

// ===========================
// Main Navbar
// ===========================

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setOpenMenu(null)
    setMobileOpen(false)
  }, [pathname])

  const user = session?.user
  const isLoading = status === 'loading'

  const getDashboardHref = () => {
    if (!user) return '/login'
    const role = user.role
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return '/admin'
    if (['COURIER_STAFF', 'DISPATCHER', 'WAREHOUSE_STAFF', 'CUSTOMER_SUPPORT', 'FINANCE_STAFF', 'OPERATIONS_MANAGER'].includes(role)) return '/staff'
    if (role === 'DRIVER') return '/driver'
    return '/dashboard'
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-white/95 dark:bg-navy-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-navy-800'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mr-8 flex-shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight">
              <span className="text-navy-900 dark:text-white">SourceDelivery</span>
              <span className="text-[#6B2737]">Pro</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 flex-1">
            {/* Shipping Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setOpenMenu('shipping')}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                className={cn(
                  'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  'text-gray-700 dark:text-gray-200 hover:text-navy-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800',
                  openMenu === 'shipping' && 'text-navy-900 dark:text-white bg-gray-100 dark:bg-navy-800'
                )}
              >
                Shipping
                <ChevronDown className={cn('w-4 h-4 transition-transform', openMenu === 'shipping' && 'rotate-180')} />
              </button>
              {openMenu === 'shipping' && (
                <MegaMenuPanel
                  items={shippingMenuItems}
                  footerHref="/services"
                  footerLabel="View all shipping services"
                />
              )}
            </div>

            {/* Services Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setOpenMenu('services')}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                className={cn(
                  'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  'text-gray-700 dark:text-gray-200 hover:text-navy-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800',
                  openMenu === 'services' && 'text-navy-900 dark:text-white bg-gray-100 dark:bg-navy-800'
                )}
              >
                Services
                <ChevronDown className={cn('w-4 h-4 transition-transform', openMenu === 'services' && 'rotate-180')} />
              </button>
              {openMenu === 'services' && (
                <MegaMenuPanel
                  items={servicesMenuItems}
                  footerHref="/services"
                  footerLabel="Explore all services"
                />
              )}
            </div>

            {/* Business Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setOpenMenu('business')}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                className={cn(
                  'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  'text-gray-700 dark:text-gray-200 hover:text-navy-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800',
                  openMenu === 'business' && 'text-navy-900 dark:text-white bg-gray-100 dark:bg-navy-800'
                )}
              >
                Business
                <ChevronDown className={cn('w-4 h-4 transition-transform', openMenu === 'business' && 'rotate-180')} />
              </button>
              {openMenu === 'business' && (
                <MegaMenuPanel
                  items={businessMenuItems}
                  footerHref="/business"
                  footerLabel="Learn about business solutions"
                />
              )}
            </div>

            <Link
              href="/tracking"
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                'text-gray-700 dark:text-gray-200 hover:text-navy-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800'
              )}
            >
              Track
            </Link>

            <Link
              href="/about"
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                'text-gray-700 dark:text-gray-200 hover:text-navy-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800'
              )}
            >
              About
            </Link>
          </div>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center gap-3 ml-auto">
            <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
              <Search className="w-5 h-5" />
            </Button>

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-navy-700 animate-pulse" />
            ) : user ? (
              // Logged in — show user menu
              <>
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300 relative" asChild>
                  <Link href="/dashboard/notifications">
                    <Bell className="w-5 h-5" />
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User'} />
                        <AvatarFallback className="bg-orange-100 text-orange-700 text-xs font-bold">
                          {getInitials(user.name ?? user.email ?? 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left hidden xl:block">
                        <div className="text-sm font-semibold text-navy-900 dark:text-white leading-tight">
                          {user.name ?? 'Account'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                          {user.email}
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>
                      <div>
                        <div className="font-semibold text-navy-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-gray-500 font-normal mt-0.5">{user.email}</div>
                        <Badge className={cn('mt-2 text-[10px]', roleColors[user.role])} variant="secondary">
                          {formatEnum(user.role)}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardHref()}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/shipments">
                        <Box className="mr-2 h-4 w-4" />
                        My Shipments
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 cursor-pointer"
                      onClick={async () => {
                        try {
                          await signOut({ redirect: false })
                        } catch {}
                        window.location.href = '/login'
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Logged out
              <>
                <Button variant="ghost" asChild className="text-gray-700 dark:text-gray-200">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="ghost" asChild className="text-gray-700 dark:text-gray-200">
                  <Link href="/register">Create Account</Link>
                </Button>
                <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white shadow-brand">
                  <Link href="/shipping/quote">
                    <Calculator className="w-4 h-4 mr-2" />
                    Get a Quote
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden ml-auto">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] p-0 bg-white dark:bg-navy-900">
                {/* Mobile menu content */}
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-navy-800">
                    <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-base font-black">
                        <span className="text-navy-900 dark:text-white">SourceDelivery</span>
                        <span className="text-[#6B2737]">Pro</span>
                      </span>
                    </Link>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="w-5 h-5" />
                      </Button>
                    </SheetClose>
                  </div>

                  {/* Nav links */}
                  <div className="flex-1 overflow-y-auto py-4 px-6">
                    {user && (
                      <div className="mb-6 p-4 bg-gray-50 dark:bg-navy-800 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.image ?? undefined} />
                            <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                              {getInitials(user.name ?? 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-sm text-navy-900 dark:text-white">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <Badge className={cn('mt-3 text-[10px]', roleColors[user.role])} variant="secondary">
                          {formatEnum(user.role)}
                        </Badge>
                      </div>
                    )}

                    <div className="space-y-1">
                      {[
                        { href: '/services', label: 'Shipping Services', icon: Truck },
                        { href: '/shipping/quote', label: 'Get a Quote', icon: Calculator },
                        { href: '/tracking', label: 'Track Package', icon: MapPin },
                        { href: '/shipping', label: 'Schedule Pickup', icon: Clock },
                        { href: '/business', label: 'Business Solutions', icon: Building2 },
                        { href: '/about', label: 'About Us', icon: FileText },
                        { href: '/contact', label: 'Contact', icon: PhoneCall },
                        { href: '/support', label: 'Help Center', icon: HelpCircle },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-800 hover:text-navy-900 dark:hover:text-white transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-orange-500" />
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    {user && (
                      <>
                        <div className="my-4 border-t border-gray-100 dark:border-navy-800" />
                        <div className="space-y-1">
                          <Link
                            href={getDashboardHref()}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-orange-500" />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/shipments"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
                          >
                            <Box className="w-4 h-4 text-orange-500" />
                            My Shipments
                          </Link>
                          <Link
                            href="/dashboard/profile"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
                          >
                            <User className="w-4 h-4 text-orange-500" />
                            Profile & Settings
                          </Link>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Bottom actions */}
                  <div className="px-6 py-4 border-t border-gray-100 dark:border-navy-800 space-y-3">
                    {user ? (
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        onClick={async () => {
                          setMobileOpen(false)
                          try {
                            await signOut({ redirect: false })
                          } catch {}
                          window.location.href = '/login'
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    ) : (
                      <>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/login" onClick={() => setMobileOpen(false)}>
                            Sign In
                          </Link>
                        </Button>
                        <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                          <Link href="/shipping/quote" onClick={() => setMobileOpen(false)}>
                            <Calculator className="w-4 h-4 mr-2" />
                            Get a Quote
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
