'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Search,
  Package,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Share2,
  Clock,
  Truck,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getLocalShipments, getDeletedShipments, deleteLocalShipment } from '@/lib/payments/manualOptions'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrackingEvent {
  id: string
  status: string
  description: string
  location?: string
  city?: string
  country?: string
  facilityName?: string
  timestamp: string
}

interface TrackingData {
  trackingNumber: string
  status: string
  serviceType: string
  originCity: string
  originCountry: string
  destinationCity: string
  destinationCountry: string
  weight: number
  packageCount: number
  estimatedDelivery?: string
  actualDelivery?: string
  currentLocation?: string
  mapQuery?: string
  showMap?: boolean
  remarks?: Array<{
    id: string
    text: string
    category: string
    timestamp: string
    author?: string
    public?: boolean
  }>
  events: TrackingEvent[]
  hasProofOfDelivery: boolean
  proofOfDelivery?: {
    recipientName: string
    deliveredAt: string
    signatureUrl?: string
    photoUrl?: string
  } | null
}

// ─── Map Helpers ──────────────────────────────────────────────────────────────

const CITY_COORDS: Record<string, string> = {
  'London': 'London,UK',
  'Lagos': 'Lagos,Nigeria',
  'Frankfurt': 'Frankfurt,Germany',
  'New York': 'New York,USA',
  'Toronto': 'Toronto,Canada',
  'JFK International Airport': 'Queens,New York,USA',
  'Mid-Atlantic': 'Atlantic Ocean',
}

function resolveMapQuery(data: TrackingData): string {
  if (data.mapQuery) return data.mapQuery
  const loc = data.currentLocation || ''
  for (const [key, val] of Object.entries(CITY_COORDS)) {
    if (loc.toLowerCase().includes(key.toLowerCase())) return val
  }
  if (loc.trim()) return loc.trim()
  return `${data.destinationCity},${data.destinationCountry}`
}

function buildMapUrl(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed&z=12`
}

// ─── Status Helpers ───────────────────────────────────────────────────────────

function getStatusConfig(status: string) {
  switch (status) {
    case 'DELIVERED':
      return { label: 'DELIVERED', bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500', border: 'border-emerald-300' }
    case 'IN_TRANSIT':
      return { label: 'IN TRANSIT', bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', border: 'border-blue-300' }
    case 'CUSTOMS_CLEARANCE':
    case 'CUSTOMS':
      return { label: 'CUSTOMS CLEARANCE', bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500', border: 'border-amber-300' }
    case 'EXCEPTION':
      return { label: 'EXCEPTION', bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', border: 'border-red-300' }
    case 'OUT_FOR_DELIVERY':
      return { label: 'OUT FOR DELIVERY', bg: 'bg-sky-100', text: 'text-sky-800', dot: 'bg-sky-500', border: 'border-sky-300' }
    default:
      return { label: status.replace(/_/g, ' '), bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400', border: 'border-slate-300' }
  }
}

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return ts
  }
}

function formatServiceType(s: string): string {
  if (!s) return 'Standard Courier Service'
  const v = s.toUpperCase()
  if (v.includes('NIGHT') || v.includes('OVER_NIGHT') || v === 'EXPRESS') {
    return 'Over Night Express Service'
  }
  if (v.includes('USUAL') || v.includes('PRIORITY')) {
    return 'Usual Courier Service'
  }
  if (v.includes('STANDARD') || v.includes('AIR') || v.includes('FREIGHT') || v.includes('ECONOMY')) {
    return 'Standard Courier Service'
  }
  if (s === 'Standard Courier Service' || s === 'Usual Courier Service' || s === 'Over Night Express Service') {
    return s
  }
  return 'Standard Courier Service'
}

// ─── Admin localStorage merge ─────────────────────────────────────────────────

function mergeAdminOverride(data: TrackingData): TrackingData {
  if (typeof window === 'undefined') return data
  try {
    const raw = localStorage.getItem('sourcedeliverypro_admin_shipments') || localStorage.getItem('swiftship_admin_shipments')
    if (!raw) return data
    const parsed = JSON.parse(raw)
    const list: any[] = Array.isArray(parsed) ? parsed : Object.values(parsed)
    const target = (data.trackingNumber || '').toString().trim().toUpperCase()
    const override = list.find(
      (s: any) =>
        (s.trackingNumber || s.awb || s.id || '').toString().trim().toUpperCase() === target ||
        (s.trackingNumber || s.awb || s.id || '').toString().trim().toUpperCase().replace(/\s+/g, '') === target
    )
    if (!override) return data

    const rawWeight = override.weight !== undefined ? override.weight : data.weight
    const parsedWeight = parseFloat(String(rawWeight || '3.5').replace(/[^0-9.]/g, ''))
    const resolvedWeight = !isNaN(parsedWeight) && parsedWeight > 0 ? parsedWeight : data.weight

    const resolvedOriginCity = override.senderCity || override.origin || data.originCity
    const sanitizedOrigin = resolvedOriginCity && !resolvedOriginCity.toString().toLowerCase().endsWith('kg')
      ? resolvedOriginCity
      : data.originCity

    const resolvedDestinationCity = override.recipientCity || override.destination || data.destinationCity

    return {
      ...data,
      weight: resolvedWeight,
      originCity: sanitizedOrigin,
      destinationCity: resolvedDestinationCity,
      originCountry: override.senderCountry || data.originCountry,
      destinationCountry: override.recipientCountry || data.destinationCountry,
      serviceType: override.serviceType || override.service || data.serviceType,
      status: override.status ?? data.status,
      currentLocation: override.currentLocation ?? override.location ?? data.currentLocation,
      mapQuery: override.mapQuery ?? data.mapQuery,
      showMap: override.showMap !== undefined ? Boolean(override.showMap) : (data.showMap !== undefined ? Boolean(data.showMap) : true),
      remarks: override.remarks ?? (data as any).remarks ?? [],
      estimatedDelivery: override.estimatedDelivery ?? data.estimatedDelivery,
      events: override.events && override.events.length > 0 ? override.events : data.events,
    }
  } catch {
    return data
  }
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function TrackingContent() {
  const searchParams = useSearchParams()
  const initialNumber = searchParams.get('number') || ''

  const [inputValue, setInputValue] = useState(initialNumber)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TrackingData | null>(null)
  const [copied, setCopied] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  const fetchTracking = useCallback(async (num: string) => {
    const trimmed = num.trim().toUpperCase()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setData(null)
    setMapLoaded(false)

    // 1. Immediately reject if marked as deleted in local storage blacklist
    const deletedList = getDeletedShipments().map((d) => d.toUpperCase().trim())
    if (deletedList.includes(trimmed)) {
      setLoading(false)
      setError(`No shipment found for tracking number "${trimmed}".`)
      return
    }

    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(trimmed)}`)
      const json = await res.json()

      if (json.success && json.data) {
        const returnedTrk = (json.data.trackingNumber || '').toUpperCase().trim()
        const returnedId = (json.data.id || '').toUpperCase().trim()
        if (deletedList.includes(returnedTrk) || (returnedId && deletedList.includes(returnedId))) {
          setError(`No shipment found for tracking number "${trimmed}".`)
          setData(null)
          return
        }
        setData(mergeAdminOverride(json.data as TrackingData))
      } else {
        const localShipments = getLocalShipments()
        const localFound = localShipments.find(
          (s: any) => (s.trackingNumber || s.id || '').toUpperCase().trim() === trimmed
        )
        if (localFound) {
          const parsedWeight = parseFloat(String(localFound.weight || '3.5').replace(/[^0-9.]/g, ''))
          const resolvedWeight = !isNaN(parsedWeight) && parsedWeight > 0 ? parsedWeight : 3.5
          const rawOrigin = localFound.senderCity || localFound.origin || 'Origin Facility'
          const cleanOrigin = rawOrigin && !rawOrigin.toString().toLowerCase().endsWith('kg') ? rawOrigin : 'Origin Facility'
          const cleanDestination = localFound.recipientCity || localFound.destination || 'Destination Hub'

          setData({
            trackingNumber: localFound.trackingNumber || localFound.id,
            status: localFound.status || 'PENDING_PAYMENT',
            serviceType: localFound.serviceType || localFound.service || 'INTERNATIONAL_EXPRESS',
            originCity: cleanOrigin,
            originCountry: localFound.originCountry || localFound.senderCountry || 'US',
            destinationCity: cleanDestination,
            destinationCountry: localFound.destinationCountry || localFound.recipientCountry || 'Global',
            weight: resolvedWeight,
            packageCount: parseInt(localFound.packageCount) || 1,
            estimatedDelivery: localFound.estimatedDelivery || 'In Transit',
            currentLocation: localFound.currentLocation || cleanOrigin || 'Processing Hub',
            mapQuery: localFound.mapQuery || undefined,
            showMap: localFound.showMap !== undefined ? Boolean(localFound.showMap) : true,
            remarks: Array.isArray(localFound.remarks) ? localFound.remarks : [],
            events: localFound.events && localFound.events.length > 0
              ? localFound.events
              : [
                  {
                    id: 'default-evt-1',
                    status: localFound.status || 'PENDING_PAYMENT',
                    description: `Shipment registered at ${localFound.senderCity || 'Processing Facility'}`,
                    location: localFound.senderCity || 'Processing Facility',
                    timestamp: localFound.createdAt || new Date().toISOString(),
                  },
                ],
            hasProofOfDelivery: false,
            proofOfDelivery: null,
          })
          return
        }
        deleteLocalShipment(trimmed)
        setError(
          json.error?.message ||
            `No shipment found for tracking number "${trimmed}". Please double-check the number and try again.`
        )
      }
    } catch {
      // In case of network failure (offline):
      if (deletedList.includes(trimmed)) {
        setError(`No shipment found for tracking number "${trimmed}".`)
        return
      }

      const localShipments = getLocalShipments()
      const localFound = localShipments.find(
        (s: any) => (s.trackingNumber || s.id || '').toUpperCase().trim() === trimmed
      )
      if (localFound) {
        const parsedWeight = parseFloat(String(localFound.weight || '3.5').replace(/[^0-9.]/g, ''))
        const resolvedWeight = !isNaN(parsedWeight) && parsedWeight > 0 ? parsedWeight : 3.5
        const rawOrigin = localFound.senderCity || localFound.origin || 'Origin Facility'
        const cleanOrigin = rawOrigin && !rawOrigin.toString().toLowerCase().endsWith('kg') ? rawOrigin : 'Origin Facility'
        const cleanDestination = localFound.recipientCity || localFound.destination || 'Destination Hub'

        setData({
          trackingNumber: localFound.trackingNumber || localFound.id,
          status: localFound.status || 'PENDING_PAYMENT',
          serviceType: localFound.serviceType || localFound.service || 'INTERNATIONAL_EXPRESS',
          originCity: cleanOrigin,
          originCountry: localFound.originCountry || localFound.senderCountry || 'US',
          destinationCity: cleanDestination,
          destinationCountry: localFound.destinationCountry || localFound.recipientCountry || 'Global',
          weight: resolvedWeight,
          packageCount: parseInt(localFound.packageCount) || 1,
          estimatedDelivery: localFound.estimatedDelivery || 'In Transit',
          currentLocation: localFound.currentLocation || cleanOrigin || 'Processing Hub',
          mapQuery: localFound.mapQuery || undefined,
          showMap: localFound.showMap !== undefined ? Boolean(localFound.showMap) : true,
          remarks: Array.isArray(localFound.remarks) ? localFound.remarks : [],
          events: localFound.events && localFound.events.length > 0
            ? localFound.events
            : [
                {
                  id: 'evt-local-1',
                  status: localFound.status || 'PENDING_PAYMENT',
                  description: localFound.status === 'LABEL_CREATED'
                    ? 'Shipping label generated and cargo manifest processed.'
                    : `Consignment registered. Status: ${localFound.status || 'Pending'}`,
                  location: localFound.currentLocation || localFound.senderCity || 'Origin Facility',
                  timestamp: localFound.created || new Date().toISOString(),
                },
              ],
          hasProofOfDelivery: false,
          proofOfDelivery: null,
        })
      } else {
        setError(`No shipment found for tracking number "${trimmed}". Please double-check your tracking number and try again.`)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialNumber) {
      setInputValue(initialNumber)
      fetchTracking(initialNumber)
    }
  }, [initialNumber, fetchTracking])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTracking(inputValue)
  }

  const handleShare = async () => {
    const rawOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const origin =
      rawOrigin && !rawOrigin.includes('vercel.app') && !rawOrigin.includes('localhost')
        ? rawOrigin
        : 'https://www.sourcedeliverypro.com'
    const url = `${origin}/tracking?number=${encodeURIComponent(data?.trackingNumber || inputValue)}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const statusCfg = data ? getStatusConfig(data.status) : null
  const finalMapQuery = data ? resolveMapQuery(data) : null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative bg-[#1B2A4A] overflow-hidden"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      >
        {/* Decorative glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#6B2737]/20 blur-3xl" />
          <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full bg-[#6B2737]/10 blur-3xl" />
        </div>

        <div className={`relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all ${data ? 'py-10 sm:py-14' : 'py-20'}`}>
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-white/20 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Live Tracking System Active
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Track Your Shipment
          </h1>
          <p className="mt-4 text-blue-200/80 text-base sm:text-lg max-w-xl mx-auto">
            Real-time visibility into every leg of your SourceDeliveryPro delivery — from pickup to proof of delivery.
          </p>

          {/* Search bar — removed when a package is being actively tracked */}
          {!data && (
            <form onSubmit={handleSubmit} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                  placeholder="Enter AWB or tracking number…"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-[#1B2A4A] font-mono text-sm sm:text-base tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6B2737] shadow-lg"
                  required
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#6B2737] hover:bg-[#7d2f41] active:bg-[#5a1f2d] text-white font-bold text-sm sm:text-base transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" />Tracking…</>
                ) : (
                  <><Truck className="w-4 h-4" />Track</>
                )}
              </button>
            </form>
          )}

          {data && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => { setInputValue(''); setData(null); setError(null) }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition-colors shadow-sm"
              >
                <Search className="w-3.5 h-3.5" /> Track Another Consignment
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Tracking Not Found</p>
              <p className="text-sm mt-0.5 text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {data && statusCfg && (
          <div className="space-y-6">
            {/* ── 1. Shipment Timeline First ────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-[#6B2737] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-black text-[#1B2A4A] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#6B2737]" />
                  Shipment Timeline
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[#1B2A4A] bg-slate-100 border border-slate-200 px-3 py-1 rounded-md">
                    AWB: {data.trackingNumber}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    {statusCfg.label}
                  </span>
                </div>
              </div>
              {data.events.length === 0 ? (
                <p className="text-sm text-slate-400">Shipment order received. Awaiting initial scan at dispatch hub.</p>
              ) : (
                <div className="relative pl-7 space-y-8">
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200" />
                  {data.events.map((evt, idx) => (
                    <div key={evt.id} className="relative">
                      <div
                        className={`absolute -left-7 top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                          idx === 0 ? 'bg-[#6B2737]' : 'bg-slate-200'
                        }`}
                      >
                        {idx === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white/80" />}
                      </div>
                      <div
                        className={`rounded-xl p-4 ${
                          idx === 0
                            ? 'bg-[#6B2737]/5 border border-[#6B2737]/20'
                            : 'bg-slate-50/80 border border-slate-100'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <p className={`font-bold text-sm ${idx === 0 ? 'text-[#6B2737]' : 'text-[#1B2A4A]'}`}>
                            {evt.description}
                          </p>
                          <span className="text-xs text-slate-400 font-mono shrink-0">
                            {formatTimestamp(evt.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {evt.facilityName ? `${evt.facilityName} — ` : ''}
                          {evt.city || evt.location || 'Hub Facility'}
                          {evt.country ? `, ${evt.country}` : ''}
                        </p>
                        <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {evt.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Official Remarks Section ─────────────────────────────────── */}
            {data.remarks && data.remarks.filter((r: any) => r.public !== false).length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-amber-500 p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-[#1B2A4A] flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                    Official Consignment Remarks &amp; Updates
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Operations Log
                  </span>
                </div>
                <div className="space-y-3">
                  {data.remarks
                    .filter((r: any) => r.public !== false)
                    .map((rem: any) => (
                      <div key={rem.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] uppercase tracking-wider">
                            {rem.category || 'Operational Remark'}
                          </span>
                          <span className="text-slate-400 text-[11px]">{formatTimestamp(rem.timestamp)}</span>
                        </div>
                        <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                          {rem.text}
                        </p>
                        <p className="text-[10px] text-slate-400">Recorded by: {rem.author || 'Operations Admin'}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ── 2. Tracking Number / Shipment Details Card ──────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-[#6B2737] overflow-hidden">
              <div className="p-6 sm:p-8">
                {/* Top row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tracking Number</p>
                    <h2 className="text-2xl font-mono font-black text-[#1B2A4A] tracking-wider">{data.trackingNumber}</h2>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                    <button
                      onClick={() => alert('Downloading shipping label for ' + data.trackingNumber)}
                      title="Download label"
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleShare}
                      title="Share tracking link"
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Route */}
                <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Origin</p>
                    <p className="font-bold text-[#1B2A4A] flex items-center gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 text-[#6B2737] shrink-0" />
                      {data.originCity}, {data.originCountry}
                    </p>
                  </div>
                  {/* Arrow */}
                  <div className="hidden sm:flex flex-col items-center gap-1 px-2">
                    <div className="flex items-center gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-4 h-0.5 bg-[#6B2737]/40 rounded-full" />
                      ))}
                      <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-[#6B2737]/60" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{formatServiceType(data.serviceType)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Destination</p>
                    <p className="font-bold text-[#1B2A4A] flex items-center gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                      {data.destinationCity}, {data.destinationCountry}
                    </p>
                  </div>
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Service</p>
                    <p className="mt-1 font-bold text-[#1B2A4A] text-sm flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#6B2737]" />
                      {formatServiceType(data.serviceType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Weight</p>
                    <p className="mt-1 font-bold text-[#1B2A4A] text-sm">{data.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pieces</p>
                    <p className="mt-1 font-bold text-[#1B2A4A] text-sm">{data.packageCount} pc</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      {data.actualDelivery ? 'Delivered On' : 'Est. Delivery'}
                    </p>
                    <p className="mt-1 font-bold text-[#1B2A4A] text-sm flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      {data.actualDelivery || data.estimatedDelivery || 'TBD'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Proof of Delivery (if present) ──────────────────────────── */}
            {data.hasProofOfDelivery && data.proofOfDelivery && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900 text-sm">Proof of Delivery Verified</p>
                  <p className="text-sm text-emerald-700 mt-0.5">
                    Signed for by <strong className="font-bold">{data.proofOfDelivery.recipientName}</strong> on{' '}
                    {formatTimestamp(data.proofOfDelivery.deliveredAt)}.
                  </p>
                </div>
              </div>
            )}

            {/* ── 3. Map Section Moved to Bottom ──────────────────────────── */}
            {data.showMap !== false && finalMapQuery && (
              <div className="bg-[#1B2A4A] rounded-2xl overflow-hidden shadow-lg">
                <div className="px-6 py-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#6B2737]" />
                    <p className="text-white/80 text-sm font-medium">
                      📍 Current Location:{' '}
                      <span className="text-white font-bold">{data.currentLocation || finalMapQuery}</span>
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live GPS Telemetry
                  </span>
                </div>
                <div className="relative w-full h-[400px] bg-[#0f1e36]">
                  {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="text-center">
                        <RefreshCw className="w-6 h-6 text-white/40 animate-spin mx-auto mb-2" />
                        <p className="text-white/40 text-xs">Loading map…</p>
                      </div>
                    </div>
                  )}
                  <iframe
                    title="Shipment Location Map"
                    src={buildMapUrl(data.mapQuery || finalMapQuery)}
                    width="100%"
                    height="400"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    onLoad={() => setMapLoaded(true)}
                  />
                </div>
              </div>
            )}

            {/* When map is toggled off, display verified location badge */}
            {data.showMap === false && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: '#1B2A4A' }}>
                    <MapPin className="w-5 h-5 text-[#C27F88]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                      Verified Checkpoint Location
                    </span>
                    <span className="font-bold text-sm text-[#1B2A4A]">
                      {data.currentLocation || data.originCity}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  Telemetry Confirmed
                </span>
              </div>
            )}

            {/* ── Action bar ──────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => { setInputValue(''); setData(null); setError(null) }}
                className="border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                <Search className="w-4 h-4 mr-2" />
                Track Another
              </Button>
              <Button
                onClick={() => alert('Downloading shipping label for ' + data.trackingNumber)}
                className="bg-[#6B2737] hover:bg-[#7d2f41] text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Label
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-[#6B2737] text-[#6B2737] hover:bg-[#6B2737]/5"
              >
                {copied ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />Copied!</>
                ) : (
                  <><Share2 className="w-4 h-4 mr-2" />Share</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!data && !error && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-[#1B2A4A]/30" />
            </div>
            <h3 className="text-lg font-bold text-[#1B2A4A]/60">No shipment loaded</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              Enter your AWB or tracking number above to see real-time status and location.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1B2A4A] flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-white/40 animate-spin mx-auto mb-3" />
            <p className="text-white/50 text-sm">Loading tracking system…</p>
          </div>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  )
}