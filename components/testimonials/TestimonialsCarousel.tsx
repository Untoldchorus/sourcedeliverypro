'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plane,
  Quote,
  ShieldCheck
} from 'lucide-react'

export interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  location: string
  route: { from: string; to: string }
  rating: number
  quote: string
  service: string
  deliveryTime: string
  initials: string
  avatarBg: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Elena Rostova',
    role: 'Founder & Master Jeweler',
    company: 'Aurelia Fine Jewelry',
    location: 'London, United Kingdom',
    route: { from: 'London, UK', to: 'New York, USA' },
    rating: 5,
    quote:
      'Shipping high-value gemstones internationally used to keep me awake at night. SourceDeliveryPro changed everything. The live GPS telemetry gave us exact milestone scans at every checkpoint, and delivery arrived 18 hours ahead of schedule with digital signature proof. Outstanding service!',
    service: 'International Express Air',
    deliveryTime: 'Delivered in 28 hrs',
    initials: 'ER',
    avatarBg: 'linear-gradient(135deg, #6B2737 0%, #A85060 100%)',
  },
  {
    id: 2,
    name: 'Marcus Chen',
    role: 'Director of Global Supply',
    company: 'Apex Dynamics Aerospace',
    location: 'Toronto, Canada',
    route: { from: 'Toronto, CA', to: 'Frankfurt, DE' },
    rating: 5,
    quote:
      "We export mission-critical aerospace components. SourceDeliveryPro's automated customs clearance saved us hundreds of hours—zero customs holds, instant digital HS compliance, and 100% on-time SLA. Their tracking dashboard is by far the cleanest in the industry.",
    service: 'Heavy Cargo & Freight',
    deliveryTime: 'Delivered in 2 days',
    initials: 'MC',
    avatarBg: 'linear-gradient(135deg, #1B2A4A 0%, #435890 100%)',
  },
  {
    id: 3,
    name: 'Dr. Amara Okafor',
    role: 'Chief Medical Logistics Officer',
    company: 'BioHealth Solutions',
    location: 'Lagos, Nigeria',
    route: { from: 'Atlanta, USA', to: 'Lagos, NG' },
    rating: 5,
    quote:
      'Temperature-sensitive medical diagnostic kits delivered right to our clinic in Lagos within 3 days. The live chat team answered our clearance inquiry in less than 90 seconds. Truly unmatched reliability, speed, and peace of mind.',
    service: 'Priority Medical Courier',
    deliveryTime: 'Delivered in 3 days',
    initials: 'AO',
    avatarBg: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
  },
  {
    id: 4,
    name: 'Sofia Martinez',
    role: 'Head of Global E-Commerce',
    company: 'Vela Fashion House',
    location: 'Madrid, Spain',
    route: { from: 'Madrid, ES', to: 'Tokyo, JP' },
    rating: 5,
    quote:
      'Our overseas customer satisfaction rating surged to 99.2% since switching to SourceDeliveryPro. The automatic multi-language translation and instant tracking links mean our Japanese buyers never experience communication gaps. Flawless execution!',
    service: 'International Express',
    deliveryTime: 'Delivered in 48 hrs',
    initials: 'SM',
    avatarBg: 'linear-gradient(135deg, #9333EA 0%, #C084FC 100%)',
  },
  {
    id: 5,
    name: 'David Vance',
    role: 'VP of Operations',
    company: 'Vance Precision Engineering',
    location: 'Chicago, United States',
    route: { from: 'Chicago, USA', to: 'Melbourne, AU' },
    rating: 5,
    quote:
      "Heavy palletized air cargo handled without a single scratch. The upfront transparent rate calculator meant zero surprise customs surcharges at the destination. We've dispatched over 140 consignments this quarter without a single delay.",
    service: 'Standard Air Cargo',
    deliveryTime: 'Delivered in 3 days',
    initials: 'DV',
    avatarBg: 'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)',
  },
  {
    id: 6,
    name: 'Chloe Dupont',
    role: 'Gallery Director',
    company: 'Dupont Contemporary Art',
    location: 'Paris, France',
    route: { from: 'Paris, FR', to: 'Singapore, SG' },
    rating: 5,
    quote:
      'Delicate sculptures require white-glove precision. SourceDeliveryPro handled end-to-end security, full declared-value insurance coverage, and delivered in pristine condition. Every scan was logged in real time on the interactive map.',
    service: 'Insured White-Glove Courier',
    deliveryTime: 'Delivered in 2 days',
    initials: 'CD',
    avatarBg: 'linear-gradient(135deg, #BE185D 0%, #FB7185 100%)',
  },
  {
    id: 7,
    name: 'James Sterling',
    role: 'CEO & Founder',
    company: 'Sterling Electronics Ltd',
    location: 'Austin, United States',
    route: { from: 'Austin, USA', to: 'São Paulo, BR' },
    rating: 5,
    quote:
      'South American shipping corridors can be tricky with customs procedures. SourceDeliveryPro cleared Brazilian customs in under 24 hours. The automated email alerts kept both our operations team and customer synced every step of the way.',
    service: 'International Priority Air',
    deliveryTime: 'Delivered in 3 days',
    initials: 'JS',
    avatarBg: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
  },
]

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [visibleCount, setVisibleCount] = useState(3)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Calculate visible cards based on screen size
  useEffect(() => {
    const updateVisibleCount = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 768) {
          setVisibleCount(1)
        } else if (window.innerWidth < 1120) {
          setVisibleCount(2)
        } else {
          setVisibleCount(3)
        }
      }
    }

    updateVisibleCount()
    window.addEventListener('resize', updateVisibleCount)
    return () => window.removeEventListener('resize', updateVisibleCount)
  }, [])

  const maxIndex = Math.max(0, TESTIMONIALS.length - visibleCount)

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex])

  // Moving slide timer (auto-advances every 3.5s when not hovered)
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      handleNext()
    }, 3500)
    return () => clearInterval(interval)
  }, [isPaused, handleNext])

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50) {
      handleNext()
    } else if (diff < -50) {
      handlePrev()
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: '#FAF7F5' }}
      aria-label="Customer Testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative background grid and subtle brand glows */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#6B2737 0.75px, transparent 0.75px), radial-gradient(#1B2A4A 0.75px, #FAF7F5 0.75px)',
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 15px 15px',
        }}
      />
      <div
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ background: '#6B2737' }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ background: '#1B2A4A' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider mb-4 shadow-sm"
              style={{
                backgroundColor: 'rgba(107, 39, 55, 0.08)',
                borderColor: 'rgba(107, 39, 55, 0.25)',
                color: '#6B2737',
              }}
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-semibold text-slate-800">5.0 Star Rated Delivery Network</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight" style={{ color: '#1B2A4A' }}>
              What Our Satisfied <br />
              <span style={{ color: '#6B2737' }}>Customers Say</span>
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-xl">
              From bespoke jewelers and aerospace engineers to global e-commerce brands, hear how our verified shippers
              rely on SourceDeliveryPro every single day.
            </p>
          </div>

          {/* Controls & Status */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Live moving status indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs text-slate-600">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isPaused ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isPaused ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              </span>
              <span className="font-semibold">
                {isPaused ? 'Slide Paused (Hovered)' : 'Auto-Moving Slide'}
              </span>
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="w-11 h-11 rounded-full border bg-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md cursor-pointer"
                style={{ borderColor: 'rgba(27, 42, 74, 0.2)', color: '#1B2A4A' }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next testimonial"
                className="w-11 h-11 rounded-full text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg cursor-pointer"
                style={{ background: '#6B2737' }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Viewport */}
        <div
          className="overflow-hidden relative py-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Moving Track */}
          <div
            className="flex transition-transform duration-700 ease-out gap-6"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
            }}
          >
            {TESTIMONIALS.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0"
                style={{
                  width: `calc(${100 / visibleCount}% - ${((visibleCount - 1) * 24) / visibleCount}px)`,
                }}
              >
                <div className="h-full bg-white rounded-3xl p-7 border border-slate-200/90 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1">
                  {/* Top colored accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 group-hover:h-2"
                    style={{ background: 'linear-gradient(90deg, #1B2A4A 0%, #6B2737 100%)' }}
                  />

                  <div>
                    {/* Header: Stars & Route Pill */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      {/* 5-Star Rating */}
                      <div className="flex items-center gap-1" aria-label="5 out of 5 stars rating">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-amber-400 text-amber-400 transition-transform group-hover:scale-110"
                            style={{ transitionDelay: `${i * 40}ms` }}
                          />
                        ))}
                      </div>

                      {/* Transit speed badge */}
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {item.deliveryTime}
                      </span>
                    </div>

                    {/* Route Tag */}
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold mb-4 border"
                      style={{
                        backgroundColor: '#FAF7F5',
                        borderColor: '#E8DFDA',
                        color: '#1B2A4A',
                      }}
                    >
                      <Plane className="w-3 h-3 text-[#6B2737]" />
                      <span>{item.route.from}</span>
                      <span className="text-slate-400">➔</span>
                      <span>{item.route.to}</span>
                    </div>

                    {/* Quote Text */}
                    <div className="relative mb-6">
                      <Quote className="w-8 h-8 text-slate-200 absolute -top-3 -left-2 -z-0 opacity-60" />
                      <p className="text-slate-700 text-sm sm:text-base leading-relaxed relative z-10 italic">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Customer Info Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md shrink-0"
                        style={{ background: item.avatarBg }}
                      >
                        {item.initials}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-slate-900 truncate">{item.name}</h3>
                          <CheckCircle2
                            className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                            title="Verified Consignment Shipper"
                          />
                        </div>
                        <p className="text-xs text-slate-500 truncate">{item.role}</p>
                        <p className="text-[11px] font-medium text-slate-400 truncate">{item.company}</p>
                      </div>
                    </div>

                    {/* Service Pill */}
                    <span
                      className="hidden sm:inline-block text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shrink-0"
                      style={{ backgroundColor: 'rgba(27, 42, 74, 0.06)', color: '#1B2A4A' }}
                    >
                      {item.service}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Bottom Navigation & Indicators */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          {/* Trust Metric Pill */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>4.9 / 5.0 Rating • Based on 14,200+ Verified Consignments</span>
          </div>

          {/* 7 Slide Indicators */}
          <div className="flex items-center gap-2">
            {TESTIMONIALS.map((t, idx) => {
              const isActive =
                idx >= currentIndex && idx < currentIndex + visibleCount
              const isPrimary = idx === currentIndex
              return (
                <button
                  key={t.id}
                  onClick={() => setCurrentIndex(Math.min(idx, maxIndex))}
                  aria-label={`Jump to review ${idx + 1} of 7: ${t.name}`}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isPrimary
                      ? 'w-8 bg-[#6B2737]'
                      : isActive
                      ? 'w-4 bg-[#1B2A4A]/40'
                      : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              )
            })}
          </div>

          {/* Quick Info & Slide Counter */}
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span>
              Showing {currentIndex + 1}–{Math.min(currentIndex + visibleCount, TESTIMONIALS.length)} of {TESTIMONIALS.length} verified reviews
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
