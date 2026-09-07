'use client'

import Link from 'next/link'
import { Package } from 'lucide-react'

// ─── Data ──────────────────────────────────────────────────────

const services = [
  { label: 'Domestic Shipping', href: '/services#domestic' },
  { label: 'International', href: '/services#international' },
  { label: 'Air Freight', href: '/services#air-express' },
  { label: 'Sea Cargo', href: '/services#freight' },
  { label: 'Package Tracking', href: '/tracking' },
]

const support = [
  { label: 'Track Package', href: '/tracking' },
  { label: 'FAQ', href: '/support#faq' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Live Chat', href: '/contact#chat' },
  { label: 'File a Claim', href: '/support#claim' },
]

const company = [
  { label: 'About Us', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'Press', href: '/press' },
  { label: 'Partners', href: '/partners' },
  { label: 'Blog', href: '/blog' },
]

const SOCIAL = [
  { icon: '𝕏', label: 'Twitter / X', href: 'https://twitter.com' },
  { icon: 'in', label: 'LinkedIn', href: 'https://linkedin.com' },
  { icon: 'f', label: 'Facebook', href: 'https://facebook.com' },
  { icon: '▶', label: 'YouTube', href: 'https://youtube.com' },
]

// ─── Sub-components ────────────────────────────────────────────

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-xs font-bold uppercase tracking-widest mb-4"
      style={{ color: '#C9B8B0' }}
    >
      {children}
    </h3>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm transition-colors duration-200 hover:underline"
        style={{ color: '#8A9AB5' }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#A85060')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#8A9AB5')}
      >
        {children}
      </Link>
    </li>
  )
}

// ─── Main footer ───────────────────────────────────────────────

export function MarketingFooter() {
  return (
    <footer style={{ backgroundColor: '#0F1A2E', color: '#8A9AB5' }}>
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* ── Column 1: Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg"
                style={{ backgroundColor: '#6B2737' }}
              >
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                SourceDelivery<span style={{ color: '#A85060' }}>Pro</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: '#8A9AB5' }}>
              Fast, reliable, and transparent courier services to 220+ countries. Your package,
              our promise — delivered on time, every time.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200"
                  style={{ backgroundColor: '#1B2A4A', color: '#C9B8B0' }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#6B2737'
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#fff'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1B2A4A'
                    ;(e.currentTarget as HTMLAnchorElement).style.color = '#C9B8B0'
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Column 2: Services ── */}
          <div>
            <FooterHeading>Services</FooterHeading>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <FooterLink key={s.href} href={s.href}>
                  {s.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Support ── */}
          <div>
            <FooterHeading>Support</FooterHeading>
            <ul className="space-y-2.5">
              {support.map((s) => (
                <FooterLink key={s.href} href={s.href}>
                  {s.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Company ── */}
          <div>
            <FooterHeading>Company</FooterHeading>
            <ul className="space-y-2.5">
              {company.map((c) => (
                <FooterLink key={c.href} href={c.href}>
                  {c.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* ── Column 5: Contact ── */}
          <div>
            <FooterHeading>Contact</FooterHeading>
            <ul className="space-y-3 text-sm mb-8" style={{ color: '#8A9AB5' }}>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-base">📍</span>
                <span>
                  1200 Logistics Blvd, Suite 400
                  <br />
                  Atlanta, GA 30301, USA
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-base">📞</span>
                <a
                  href="tel:+18007943846"
                  className="transition-colors duration-200"
                  style={{ color: '#8A9AB5' }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = '#A85060')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = '#8A9AB5')
                  }
                >
                  +1 (800) SOURCE-PRO
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-base">✉</span>
                <a
                  href="mailto:support@sourcedeliverypro.com"
                  className="transition-colors duration-200"
                  style={{ color: '#8A9AB5' }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = '#A85060')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = '#8A9AB5')
                  }
                >
                  support@sourcedeliverypro.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-base">🕐</span>
                <span>Mon–Fri 8 AM–8 PM EST</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: '#1B2A4A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span style={{ color: '#8A9AB5' }}>
            © {new Date().getFullYear()} SourceDeliveryPro. All rights reserved.
          </span>
          <div className="flex items-center gap-5">
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Cookie Policy', href: '/cookies' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors duration-200"
                style={{ color: '#8A9AB5' }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = '#A85060')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = '#8A9AB5')
                }
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default MarketingFooter
