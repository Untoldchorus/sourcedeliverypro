'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Package, Plane, Truck, Ship, ShieldCheck, Globe, Clock,
  ArrowRight, CheckCircle2, ChevronRight, BarChart3, Building,
  MapPin, Phone, Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TestimonialsCarousel } from '@/components/testimonials/TestimonialsCarousel'

export default function HomePage() {
  const router = useRouter()
  const { data: session } = useSession()

  const handleCreateShipmentClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (session?.user) {
      router.push('/dashboard/shipments/new')
    } else {
      router.push('/login?callbackUrl=' + encodeURIComponent('/dashboard/shipments/new'))
    }
  }

  return (
    <div>
      {/* ── Quick Tracking Bar (Above Hero Section) ── */}
      <section className="relative z-20 border-b border-white/10 py-3.5 sm:py-4" style={{ backgroundColor: '#0F1A2E' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 max-w-xl">
            <p className="text-xs font-semibold mb-2" style={{ color: '#C9B8B0' }}>📦 Quick Track — Enter your AWB number</p>
            <form action="/tracking" method="get" className="flex gap-2">
              <input
                name="number"
                type="text"
                placeholder="Enter AWB or tracking number (e.g. SDP...)"
                className="flex-1 px-4 py-3 rounded-xl font-mono text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#C27F88]"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl font-bold text-white text-sm flex items-center gap-2 transition hover:opacity-90 cursor-pointer shrink-0"
                style={{ background: '#6B2737' }}
              >
                <Search className="w-4 h-4" /> Track
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Hero Section ── */}
      <section className="relative text-white pt-16 pb-28 sm:pt-20 sm:pb-36 overflow-hidden bg-[#1B2A4A]">
        {/* Background image with overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity" 
          style={{ backgroundImage: 'url(/images/hero_logistics.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} 
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A]/80 to-transparent" />
        
        {/* dot grid pattern */}
        <div className="absolute inset-0 opacity-10 z-0" style={{ backgroundImage: 'radial-gradient(#6B2737 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        {/* oxblood bottom accent bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #6B2737, #4A1520, #6B2737)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-6" style={{ background: 'rgba(107,39,55,0.3)', borderColor: '#6B2737', color: '#F5EDE8' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#6B2737' }} />
              Trusted Global Courier Network — 220+ Countries
            </div>

            <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight mb-6">
              Your Parcel.<br />
              <span style={{ color: '#C27F88' }}>Our Priority.</span><br />
              <span className="text-white">Worldwide.</span>
            </h1>

            <p className="text-lg mb-8 max-w-2xl leading-relaxed" style={{ color: '#C9B8B0' }}>
              SourceDeliveryPro delivers packages to 220+ countries with real-time tracking, customs clearance, live map updates, and instant notifications — all in one platform.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="font-bold text-base px-8 h-12 text-white shadow-lg border-0 cursor-pointer"
                style={{ background: '#6B2737' }}
              >
                <Link
                  href={session?.user ? '/dashboard/shipments/new' : '/login?callbackUrl=' + encodeURIComponent('/dashboard/shipments/new')}
                  onClick={handleCreateShipmentClick}
                >
                  Create Shipment <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 h-12 font-semibold cursor-pointer" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', background: 'transparent' }}>
                <Link href="/services">Explore Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-12 border-y" style={{ background: '#0F1A2E', borderColor: '#1B2A4A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '220+', label: 'Countries Served', color: '#C27F88' },
              { value: '99.4%', label: 'On-Time Reliability', color: 'white' },
              { value: '5.2M+', label: 'Parcels Shipped', color: 'white' },
              { value: '1,400+', label: 'Global Hubs', color: '#C27F88' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-4xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-sm mt-1" style={{ color: '#7A8FAA' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service Cards ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6B2737' }}>Our Services</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2" style={{ color: '#1B2A4A' }}>
            End-to-End Shipping Solutions
          </h2>
          <p className="mt-3 text-base" style={{ color: '#5A6B80' }}>
            From single parcels to bulk freight — we have the right service for every shipment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: 'Standard Courier Service', desc: 'Door-to-door courier shipping to 220+ destinations with transparent tracking and digital proof.', href: '/services', accent: '#6B2737' },
            { icon: Plane, title: 'Usual Courier Service', desc: 'Everyday prompt scheduled courier transit for commercial packages and personal parcels.', href: '/services', accent: '#243660' },
            { icon: Clock, title: 'Over Night Express Service', desc: 'Top-priority overnight air courier transit with expedited customs and morning delivery.', href: '/services', accent: '#6B2737' },
            { icon: Building, title: 'Business Solutions', desc: 'Volume discounts, dedicated account managers, bulk uploads and shipping APIs.', href: '/business', accent: '#243660' },
          ].map((card) => (
            <div key={card.title} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1 overflow-hidden">
              <div className="h-1.5" style={{ background: card.accent }} />
              <div className="p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition group-hover:scale-110" style={{ background: `${card.accent}18` }}>
                  <card.icon className="w-6 h-6" style={{ color: card.accent }} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#1B2A4A' }}>{card.title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#64748b' }}>{card.desc}</p>
                <Link href={card.href} className="text-xs font-bold flex items-center gap-1 group-hover:underline" style={{ color: card.accent }}>
                  Learn more <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Track Your Package CTA ── */}
      <section className="py-16" style={{ background: '#F5EDE8' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6B2737' }}>Real-Time Tracking</span>
          <h2 className="text-3xl font-extrabold mt-2 mb-4" style={{ color: '#1B2A4A' }}>
            Know Where Your Package Is — Live
          </h2>
          <p className="mb-8" style={{ color: '#5A6B80' }}>
            Get live map updates, status alerts, and full transit history for every shipment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Enter AWB or tracking number (e.g. SDP...)"
              className="flex-1 px-4 py-3 rounded-xl border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-oxblood"
              style={{ borderColor: '#6B2737' }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value
                  if (val) window.location.href = `/tracking?number=${val}`
                }
              }}
            />
            <Button asChild className="text-white font-bold px-8" style={{ background: '#6B2737' }}>
              <Link href="/tracking">Track Now <MapPin className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6B2737' }}>Why SourceDeliveryPro</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 mb-6" style={{ color: '#1B2A4A' }}>
              Global Scale.<br /> Precision Delivery.
            </h2>
            <p className="leading-relaxed mb-8" style={{ color: '#5A6B80' }}>
              We combine modern routing technology, automated customs compliance, real-time tracking, and multilingual support to make international shipping effortless.
            </p>
            <div className="space-y-5">
              {[
                { title: 'Live Map Tracking', desc: 'See exactly where your parcel is on a real-time interactive map — updated every scan.' },
                { title: 'Automated Customs Clearance', desc: 'Digital invoices and HS code verification reduce customs holds by over 80%.' },
                { title: 'Multilingual Support', desc: 'Our platform supports 100+ languages via built-in Google Translate — no barriers.' },
                { title: 'Instant Email Notifications', desc: 'Receive automated email confirmations and status alerts at every checkpoint.' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#6B2737' }} />
                  <div>
                    <h4 className="font-semibold" style={{ color: '#1B2A4A' }}>{f.title}</h4>
                    <p className="text-sm" style={{ color: '#64748b' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Button asChild size="lg" className="text-white font-bold" style={{ background: '#1B2A4A' }}>
                <Link href="/about">Our Story <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
          </div>

          {/* Image + Live tracking preview card */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden mb-8 shadow-xl aspect-video border" style={{ borderColor: '#DDD0C8' }}>
              <img src="/images/global_network.jpg" alt="Global logistics network" className="w-full h-full object-cover" />
            </div>

            <div className="rounded-3xl p-7 bg-white border border-slate-200/80 shadow-xl overflow-hidden relative">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: 'linear-gradient(90deg, #1B2A4A, #6B2737)' }} />

              <div className="flex items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">Live Logistics Telemetry</span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Global Hubs Active
                </span>
              </div>

              <h3 className="text-xl font-black mb-1" style={{ color: '#1B2A4A' }}>
                Precision Delivery &amp; Chain of Custody
              </h3>
              <p className="text-xs mb-6 leading-relaxed" style={{ color: '#5A6B80' }}>
                Real-time tracking, digital waybill generation, and automated customs clearance across our worldwide air and ground network.
              </p>

              {/* 2x2 Metric Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-2xl border border-slate-100 shadow-sm" style={{ background: '#FAF7F5' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Air Transit</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: '#6B2737' }}>
                      <Plane className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black tracking-tight" style={{ color: '#1B2A4A' }}>1–3 Days</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Express global corridors</div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 shadow-sm" style={{ background: '#FAF7F5' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">On-Time SLA</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: '#1B2A4A' }}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black tracking-tight" style={{ color: '#1B2A4A' }}>99.4%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Verified milestone compliance</div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 shadow-sm" style={{ background: '#FAF7F5' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Global Coverage</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: '#1B2A4A' }}>
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black tracking-tight" style={{ color: '#1B2A4A' }}>220+</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Countries &amp; territories</div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 shadow-sm" style={{ background: '#FAF7F5' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Security</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: '#6B2737' }}>
                      <Package className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black tracking-tight" style={{ color: '#1B2A4A' }}>100%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Digital POD &amp; scan telemetry</div>
                </div>
              </div>

              {/* Action Banner */}
              <div className="rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-white" style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #243660 100%)' }}>
                <div>
                  <div className="text-xs font-bold">Ready to dispatch a consignment?</div>
                  <div className="text-[11px] text-slate-300">Get upfront rates or track live shipments.</div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button asChild size="sm" className="w-full sm:w-auto text-white font-bold text-xs" style={{ background: '#6B2737' }}>
                    <Link href="/shipping/quote">Get Quote <ArrowRight className="ml-1 w-3 h-3" /></Link>
                  </Button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>

      {/* ── Features Grid ── */}
      <section className="py-20" style={{ background: '#1B2A4A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#C27F88' }}>Platform Features</span>
            <h2 className="text-3xl font-extrabold mt-2 text-white">Everything You Need in One Place</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🗺️', title: 'Real-Time Map Location', desc: 'Watch your parcel move on an interactive live map — powered by Google Maps.' },
              { icon: '💬', title: 'Live Customer Support', desc: '24/7 live chat with our logistics agents. Average response: under 2 minutes.' },
              { icon: '🌍', title: 'Built-in Translator', desc: 'Automatic Google Translate for 100+ languages — every customer can use the platform.' },
              { icon: '📧', title: 'Email Notifications', desc: 'Automated shipment confirmation emails with tracking link sent directly to the customer.' },
              { icon: '🔢', title: 'AWB Number Generator', desc: 'Instantly generate unique Air Waybill tracking numbers for every new shipment.' },
              { icon: '🔒', title: 'Insured & Secure', desc: 'Full declared-value insurance on all express and priority shipments, with POD.' },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl p-6 border transition hover:border-[#6B2737]" style={{ background: '#243660', borderColor: '#2D3E60' }}>
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm" style={{ color: '#94A3B8' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Customer Testimonials Carousel ── */}
      <TestimonialsCarousel />

      {/* ── CTA Banner ── */}
      <section className="py-20 text-white text-center" style={{ background: 'linear-gradient(135deg, #4A1520 0%, #6B2737 50%, #4A1520 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black mb-4">Ready to Ship Globally?</h2>
          <p className="mb-10 text-lg" style={{ color: '#F5EDE8' }}>
            Create a free account and start sending parcels to 220+ countries today. No setup fees.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="font-bold text-base px-10 h-12 text-white border-2 border-white bg-transparent hover:bg-white hover:text-[#6B2737] transition-colors">
              <Link href="/register">Create Free Account</Link>
            </Button>
            <Button asChild size="lg" className="font-bold text-base px-10 h-12 border-0" style={{ background: '#1B2A4A', color: 'white' }}>
              <Link href="/tracking">Track a Package</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm" style={{ color: '#F5EDE8' }}>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Free to Register</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> No Hidden Fees</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> 24/7 Support</span>
            <a href="tel:+16183681268" className="flex items-center gap-2 hover:underline"><Phone className="w-4 h-4" /> (618) 368 1268</a>
          </div>
        </div>
      </section>
    </div>
  )
}