'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, Globe, ChevronDown, Package, User, LogOut } from 'lucide-react'

// ─── Nav links ────────────────────────────────────────────────
const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/tracking', label: 'Track Package' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

// ─── Helpers ──────────────────────────────────────────────────
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

// ─── Top info bar ─────────────────────────────────────────────
function TopBar() {
  return (
    <div
      className="w-full text-xs py-2 px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1"
      style={{ backgroundColor: '#0F1A2E', color: '#C9B8B0' }}
    >
      <span>📞 +1 (800) SOURCE-PRO</span>
      <span className="hidden sm:inline" style={{ color: '#6B2737' }}>|</span>
      <span className="hidden sm:inline">✉ support@sourcedeliverypro.com</span>
      <span className="hidden md:inline" style={{ color: '#6B2737' }}>|</span>
      <span className="hidden md:inline">🌍 Serving 220+ Countries</span>
    </div>
  )
}

// ─── Language selector ────────────────────────────────────────
function LanguageSelector() {
  return (
    <div className="relative z-50 flex items-center">
      <div id="google_translate_element" className="scale-90 origin-right" />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────
export function MarketingNavbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const user = session?.user
  const portalHref =
    user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
      ? '/admin'
      : '/dashboard'
  const portalLabel =
    user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
      ? 'Admin Portal'
      : 'My Dashboard'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <TopBar />

      <header
        className="sticky top-0 z-40 transition-all duration-300"
        style={{
          backgroundColor: '#1B2A4A',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-6">
            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#6B2737' }}
              >
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight">
                <span className="text-white">SourceDelivery</span>
                <span style={{ color: '#A85060' }}>Pro</span>
              </span>
            </Link>

            {/* ── Desktop nav links ── */}
            <div className="hidden lg:flex items-center gap-1 flex-1">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'text-white bg-white/10'
                        : 'hover:text-white hover:bg-white/10',
                    )}
                    style={active ? {} : { color: '#C9B8B0' }}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* ── Right-side actions ── */}
            <div className="hidden lg:flex items-center gap-3 ml-auto">
              <LanguageSelector />

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={portalHref}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold text-white transition-all duration-200 flex items-center gap-2 shadow-sm"
                    style={{ backgroundColor: '#6B2737' }}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{portalLabel}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await signOut({ redirect: false })
                      } catch {}
                      window.location.href = '/login'
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 hover:bg-white/10 hover:text-white"
                  style={{ color: '#C9B8B0', borderColor: 'rgba(107,39,55,0.6)' }}
                >
                  Login
                </Link>
              )}

              <Link
                href="/shipping/quote"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                style={{ backgroundColor: '#6B2737' }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#4A1520')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#6B2737')
                }
              >
                Get Quote
              </Link>
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              className="lg:hidden ml-auto p-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: '#C9B8B0' }}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* ── Mobile drawer ── */}
        {mobileOpen && (
          <div
            className="lg:hidden border-t"
            style={{ backgroundColor: '#1B2A4A', borderColor: '#243660' }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      active ? 'text-white bg-white/10' : 'hover:text-white hover:bg-white/10',
                    )}
                    style={active ? {} : { color: '#C9B8B0' }}
                  >
                    {link.label}
                  </Link>
                )
              })}

              {/* Google Translate in mobile */}
              <div className="pt-2 pb-1 px-4">
                <div id="google_translate_element_mobile" />
              </div>

              <div
                className="mt-3 flex flex-col gap-2 pt-3"
                style={{ borderTop: '1px solid #243660' }}
              >
                {user ? (
                  <>
                    <Link
                      href={portalHref}
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#6B2737' }}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{portalLabel}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        setMobileOpen(false)
                        try {
                          await signOut({ redirect: false })
                        } catch {}
                        window.location.href = '/login'
                      }}
                      className="w-full text-center px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white border border-slate-700 hover:bg-white/10"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors hover:bg-white/10 hover:text-white"
                    style={{ color: '#C9B8B0', borderColor: 'rgba(107,39,55,0.6)' }}
                  >
                    Login
                  </Link>
                )}
                <Link
                  href="/shipping/quote"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
                  style={{ backgroundColor: '#6B2737' }}
                >
                  Get Quote
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default MarketingNavbar
