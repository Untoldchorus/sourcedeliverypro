'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  Box,
  Save,
  ArrowLeft,
  DollarSign,
  User,
  MapPin,
  Truck,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Plus,
  Trash2,
  Globe,
  Eye,
  EyeOff,
  Package,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { saveLocalShipment, getLocalShipments } from '@/lib/payments/manualOptions'

interface ShipmentRemark {
  id: string
  text: string
  category: string
  timestamp: string
  author: string
  public: boolean
}

export default function AdminEditEverythingShipmentPage() {
  const router = useRouter()
  const params = useParams()
  const shipmentId = (params?.id as string) || ''

  const defaultRecord = {
    id: shipmentId,
    trackingNumber: shipmentId.startsWith('SDP') ? shipmentId : `SDP${shipmentId.slice(-4).toUpperCase()}992X`,
    refNumber: `REF-2026-${shipmentId}`,
    status: 'IN_TRANSIT',
    serviceType: 'INTERNATIONAL_EXPRESS',
    estimatedDelivery: 'Sep 10, 2026',
    actualDelivery: '',

    // Geolocation & Map Controls
    currentLocation: 'JFK International Airport Hub, New York, US',
    mapQuery: 'JFK+Airport+New+York',
    showMap: true,

    // Sender details
    senderName: 'John Doe',
    senderCompany: 'SourceDeliveryPro Logistics',
    senderEmail: 'sender@example.com',
    senderPhone: '+1 555-0100',
    senderAddress: '100 Logistics Blvd',
    senderCity: 'New York',
    senderState: 'NY',
    senderCountry: 'United States (US)',

    // Recipient details
    recipientName: 'Sarah Jenkins',
    recipientCompany: 'Global Retail Enterprise',
    recipientEmail: 'recipient@example.com',
    recipientPhone: '+44 20 7946 0991',
    recipientAddress: '12 Canary Wharf',
    recipientCity: 'London',
    recipientState: 'Greater London',
    recipientCountry: 'United Kingdom (GB)',

    // Package details
    packageType: 'PARCEL',
    weight: '3.5',
    packageCount: '1',
    length: '30',
    width: '20',
    height: '15',
    declaredValue: '250.00',
    isFragile: false,
    specialInstructions: 'Handle with care. Fragile electronic cargo.',

    // Assigned operations
    assignedDriver: 'Marcus Vance',
    assignedFacility: 'JFK International Dispatch Facility',

    // Financials
    baseRate: '120.00',
    fuelSurcharge: '15.00',
    insuranceFee: '10.50',
    totalAmount: '145.50',
    paymentStatus: 'PAID',
    reasonForEdit: '',

    // Remarks & timeline
    remarks: [] as ShipmentRemark[],
    events: [] as any[],
  }

  const [formData, setFormData] = useState<typeof defaultRecord>(defaultRecord)
  const [newRemarkText, setNewRemarkText] = useState('')
  const [newRemarkCategory, setNewRemarkCategory] = useState('Operational Update')
  const [newRemarkPublic, setNewRemarkPublic] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load existing data from localStorage or API fallback
  useEffect(() => {
    async function loadShipmentData() {
      try {
        const allShipments = getLocalShipments()
        let found = allShipments.find(
          (s: any) =>
            (s.id && s.id.toString().toLowerCase() === shipmentId.toLowerCase()) ||
            (s.trackingNumber && s.trackingNumber.toString().toLowerCase() === shipmentId.toLowerCase()) ||
            (s.awb && s.awb.toString().toLowerCase() === shipmentId.toLowerCase())
        )

        if (!found) {
          try {
            const res = await fetch(`/api/tracking/${encodeURIComponent(shipmentId)}`)
            const json = await res.json()
            if (json.success && json.data) {
              found = json.data
            }
          } catch {}
        }

        if (found) {
          setFormData((prev) => ({
            ...prev,
            ...found,
            id: found.id || found.trackingNumber || shipmentId,
            trackingNumber: found.trackingNumber || found.awb || prev.trackingNumber,
            status: found.status || prev.status,
            serviceType: found.serviceType || found.service || prev.serviceType,
            currentLocation: found.currentLocation || found.location || prev.currentLocation,
            mapQuery: found.mapQuery || prev.mapQuery,
            showMap: found.showMap !== undefined ? Boolean(found.showMap) : prev.showMap,
            senderName: found.senderName || found.sender || prev.senderName,
            senderCity: found.senderCity || prev.senderCity,
            recipientName: found.recipientName || found.recipient || prev.recipientName,
            recipientCity: found.recipientCity || prev.recipientCity,
            weight: found.weight ? found.weight.toString().replace(' kg', '') : prev.weight,
            totalAmount: (found.totalAmount || found.amount || prev.totalAmount).toString(),
            remarks: Array.isArray(found.remarks) ? found.remarks : prev.remarks,
            events: Array.isArray(found.events) ? found.events : prev.events,
          }))
        }
      } catch (err) {
        console.error('Error loading shipment for edit:', err)
      }
    }

    loadShipmentData()
  }, [shipmentId])

  // Save all changes
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSaving) return
    setIsSaving(true)
    try {
      saveLocalShipment(formData)

      // Sync to database
      await fetch('/api/shipments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.id,
          trackingNumber: formData.trackingNumber,
          status: formData.status,
          serviceType: formData.serviceType,
          weight: formData.weight,
          amount: formData.totalAmount,
          senderName: formData.senderName,
          senderCity: formData.senderCity,
          recipientName: formData.recipientName,
          recipientCity: formData.recipientCity,
          currentLocation: formData.currentLocation,
          mapQuery: formData.mapQuery,
          showMap: formData.showMap !== undefined ? Boolean(formData.showMap) : true,
          timelineEvents: formData.events && formData.events.length > 0 ? formData.events : undefined,
          remark: formData.remarks?.[0]?.text || `Shipment details updated by Operations Admin.`,
        }),
      }).catch((err) => console.warn('DB patch warning:', err))

      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3500)
    } catch (err) {
      console.error('Failed to save shipment:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Add new remark
  const handleAddRemark = async () => {
    if (!newRemarkText.trim()) return

    const now = new Date()
    const remark: ShipmentRemark = {
      id: 'rem-' + Date.now(),
      text: newRemarkText.trim(),
      category: newRemarkCategory,
      timestamp: now.toISOString(),
      author: 'Operations Super Admin',
      public: newRemarkPublic,
    }

    // Also push a corresponding event scan if public
    const updatedEvents = [...(formData.events || [])]
    if (newRemarkPublic) {
      updatedEvents.unshift({
        id: 'evt-' + Date.now(),
        status: formData.status,
        description: `[${newRemarkCategory}] ${newRemarkText.trim()}`,
        location: formData.currentLocation || formData.senderCity,
        timestamp: now.toISOString(),
      })
    }

    const updated = {
      ...formData,
      remarks: [remark, ...(formData.remarks || [])],
      events: updatedEvents,
    }

    setFormData(updated)
    setNewRemarkText('')
    saveLocalShipment(updated)

    // Sync remark to database
    try {
      await fetch('/api/shipments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.id,
          trackingNumber: formData.trackingNumber,
          status: formData.status,
          currentLocation: formData.currentLocation,
          remark: `[${newRemarkCategory}] ${newRemarkText.trim()}`,
        }),
      })
    } catch (err) {
      console.warn('DB remark sync warning:', err)
    }
  }

  // Delete a remark
  const handleDeleteRemark = (id: string) => {
    const updatedRemarks = (formData.remarks || []).filter((r) => r.id !== id)
    const updated = { ...formData, remarks: updatedRemarks }
    setFormData(updated)
    saveLocalShipment(updated)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost" className="text-slate-400 p-0 hover:bg-transparent">
              <Link href="/admin/shipments">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Shipments
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 mt-1">
            <Box className="w-6 h-6 text-[#6B2737]" />
            Shipment Master Control &amp; Telemetry:{' '}
            <span className="font-mono text-[#6B2737]">{formData.trackingNumber}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Edit shipment details, add official consignment remarks, update live map location, or toggle map visibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
          >
            <Link href={`/tracking?number=${formData.trackingNumber}`} target="_blank">
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Tracking
            </Link>
          </Button>
          <Button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs"
          >
            {isSaving ? (
              <><RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> Saving Changes...</>
            ) : (
              <><Save className="w-4 h-4 mr-1.5" /> Save All Changes</>
            )}
          </Button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Shipment updated successfully! Live location, remarks, and map settings are now synchronized on public tracking.
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs text-slate-300">
        {/* ── SECTION: Map Location & Map Toggle ───────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-white text-sm">
                Live Map Geolocation &amp; Telemetry Display
              </h2>
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              GPS Telemetry
            </span>
          </div>

          {/* Toggle Map ON / OFF */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800/90">
            <div>
              <div className="flex items-center gap-2">
                {formData.showMap ? (
                  <Eye className="w-4 h-4 text-emerald-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-500" />
                )}
                <span className="font-bold text-white text-xs">
                  Display Interactive Map on Public Tracking Page
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {formData.showMap
                  ? 'Active: Customer sees the interactive Google Maps embed centered on the current location.'
                  : 'Hidden: The map frame is turned OFF. Customer only sees verified milestone location text.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, showMap: !formData.showMap })}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                formData.showMap ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
              title="Toggle Live Map On/Off"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  formData.showMap ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Map Location Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-300">
                Current Location (Displayed to Customer)
              </label>
              <input
                type="text"
                value={formData.currentLocation}
                onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                placeholder="e.g. Frankfurt Cargo Hub, Germany or JFK International Airport"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#6B2737]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-300">
                Google Maps Search Query / Coordinates
              </label>
              <input
                type="text"
                value={formData.mapQuery}
                onChange={(e) => setFormData({ ...formData, mapQuery: e.target.value })}
                placeholder="e.g. Frankfurt+Airport or London,UK"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#6B2737]"
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-slate-500 font-semibold block">
              Quick Set Global Hubs:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'London, UK', query: 'London,UK', loc: 'London Heathrow Gateway Hub, UK' },
                { label: 'New York, US', query: 'New York,USA', loc: 'JFK International Airport Hub, NY' },
                { label: 'Frankfurt, DE', query: 'Frankfurt,Germany', loc: 'Frankfurt Cargo Sorting Terminal, DE' },
                { label: 'Lagos, NG', query: 'Lagos,Nigeria', loc: 'Murtala Muhammed Freight Facility, Lagos' },
                { label: 'Tokyo, JP', query: 'Tokyo,Japan', loc: 'Haneda Logistics Gateway, Tokyo' },
                { label: 'Dubai, UAE', query: 'Dubai,UAE', loc: 'Dubai World Central Freight Hub, UAE' },
                { label: 'Toronto, CA', query: 'Toronto,Canada', loc: 'Toronto Pearson International Terminal, CA' },
                { label: 'Paris, FR', query: 'Paris,France', loc: 'Charles de Gaulle Freight Hub, Paris' },
                { label: 'Mid-Atlantic', query: 'Atlantic Ocean', loc: 'In-Flight Air Transit — Mid-Atlantic Corridor' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      currentLocation: preset.loc,
                      mapQuery: preset.query,
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-[#6B2737] hover:text-white text-slate-300 text-[11px] font-medium transition cursor-pointer"
                >
                  📍 {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Map Preview */}
          {formData.showMap ? (
            <div className="rounded-2xl overflow-hidden border border-slate-800 mt-2 bg-slate-950">
              <div className="px-4 py-2 text-[11px] text-slate-400 flex items-center justify-between border-b border-slate-800">
                <span className="font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#6B2737]" />
                  Live Preview: {formData.currentLocation}
                </span>
                <span className="text-emerald-400 font-bold text-[10px] uppercase">
                  ● Map Visible to Customer
                </span>
              </div>
              <iframe
                title="Admin Location Preview"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  formData.mapQuery || formData.currentLocation
                )}&output=embed&z=12`}
                width="100%"
                height="220"
                className="border-0 w-full"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 text-center text-slate-400 text-xs">
              <EyeOff className="w-6 h-6 mx-auto mb-1 text-slate-600" />
              <span className="font-bold text-white block">Map Embed is Disabled</span>
              <span className="text-[11px] text-slate-500">
                Customers viewing tracking will see the verified checkpoint location text without the satellite map view.
              </span>
            </div>
          )}
        </div>

        {/* ── SECTION: Shipment Remarks & Advisories ───────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-white text-sm">
                Consignment Remarks &amp; Official Advisories
              </h2>
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {formData.remarks?.length || 0} Recorded
            </span>
          </div>

          {/* Add Remark Form */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <p className="font-bold text-white text-xs">Add New Consignment Remark / Note</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newRemarkText}
                  onChange={(e) => setNewRemarkText(e.target.value)}
                  placeholder="e.g. Cleared export customs smoothly. Cargo loaded onto Flight SDP-108."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#6B2737]"
                />
              </div>
              <div>
                <select
                  value={newRemarkCategory}
                  onChange={(e) => setNewRemarkCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none"
                >
                  <option value="Operational Update">Operational Update</option>
                  <option value="Customs Note">Customs &amp; Clearance</option>
                  <option value="Transit Milestone">Transit Milestone</option>
                  <option value="Facility Check">Facility Security Check</option>
                  <option value="Weather Advisory">Weather / Safety Advisory</option>
                  <option value="Customer Notice">Customer Notice</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-slate-300 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRemarkPublic}
                  onChange={(e) => setNewRemarkPublic(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-[#6B2737] focus:ring-[#6B2737]"
                />
                <span>Display on Customer Public Tracking Page</span>
              </label>

              <Button
                type="button"
                onClick={handleAddRemark}
                disabled={!newRemarkText.trim()}
                className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Remark
              </Button>
            </div>
          </div>

          {/* List of Existing Remarks */}
          <div className="space-y-2.5">
            {formData.remarks && formData.remarks.length > 0 ? (
              formData.remarks.map((rem) => (
                <div
                  key={rem.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {rem.category}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(rem.timestamp).toLocaleString()}
                      </span>
                      {rem.public ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Public
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Internal
                        </span>
                      )}
                    </div>
                    <p className="text-white text-xs font-medium leading-relaxed">{rem.text}</p>
                    <p className="text-[10px] text-slate-500">By: {rem.author}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteRemark(rem.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition cursor-pointer"
                    title="Remove Remark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                No custom remarks logged yet. Use the form above to post operational remarks to this consignment.
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION: Shipment Identification & Status ───────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <Box className="w-4 h-4 text-[#6B2737]" /> 1. Shipment Identification &amp; Operational Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1">Tracking Number (AWB)</label>
              <input
                type="text"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:ring-1 focus:ring-[#6B2737]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Reference Number</label>
              <input
                type="text"
                value={formData.refNumber}
                onChange={(e) => setFormData({ ...formData, refNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-[#6B2737]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Current Status Override</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs focus:ring-1 focus:ring-[#6B2737]"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PENDING_PAYMENT">PENDING PAYMENT</option>
                <option value="LABEL_CREATED">LABEL CREATED</option>
                <option value="PICKUP_SCHEDULED">PICKUP SCHEDULED</option>
                <option value="PICKED_UP">PICKED UP</option>
                <option value="IN_TRANSIT">IN TRANSIT</option>
                <option value="ARRIVED_AT_FACILITY">ARRIVED AT FACILITY</option>
                <option value="DEPARTED_FACILITY">DEPARTED FACILITY</option>
                <option value="CUSTOMS_CLEARANCE">CUSTOMS CLEARANCE</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="EXCEPTION">EXCEPTION</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-semibold mb-1">Service Type</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              >
                <option value="Standard Courier Service">Standard Courier Service</option>
                <option value="Usual Courier Service">Usual Courier Service</option>
                <option value="Over Night Express Service">Over Night Express Service</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Estimated Delivery Date</label>
              <input
                type="text"
                value={formData.estimatedDelivery}
                onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                placeholder="e.g. Sep 12, 2026"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* ── SECTION: Sender & Recipient ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
            <h2 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <User className="w-4 h-4 text-[#6B2737]" /> 2. Sender Details
            </h2>
            <div>
              <label className="block font-semibold mb-1">Sender Name</label>
              <input
                type="text"
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Company</label>
              <input
                type="text"
                value={formData.senderCompany}
                onChange={(e) => setFormData({ ...formData, senderCompany: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={formData.senderEmail}
                  onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.senderPhone}
                  onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={formData.senderCity}
                  onChange={(e) => setFormData({ ...formData, senderCity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Country</label>
                <input
                  type="text"
                  value={formData.senderCountry}
                  onChange={(e) => setFormData({ ...formData, senderCountry: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
            <h2 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <User className="w-4 h-4 text-[#6B2737]" /> 3. Recipient Details
            </h2>
            <div>
              <label className="block font-semibold mb-1">Recipient Name</label>
              <input
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Company</label>
              <input
                type="text"
                value={formData.recipientCompany}
                onChange={(e) => setFormData({ ...formData, recipientCompany: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.recipientPhone}
                  onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={formData.recipientCity}
                  onChange={(e) => setFormData({ ...formData, recipientCity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Country</label>
                <input
                  type="text"
                  value={formData.recipientCountry}
                  onChange={(e) => setFormData({ ...formData, recipientCountry: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION: Package & Financials ───────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> 4. Package Dimensions &amp; Financials
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold mb-1">Weight (kg)</label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Package Count</label>
              <input
                type="text"
                value={formData.packageCount}
                onChange={(e) => setFormData({ ...formData, packageCount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Total Rate ($)</label>
              <input
                type="text"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Payment Status</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs"
              >
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/shipments')}
            className="border-slate-800 text-slate-400 hover:bg-slate-850 text-xs"
          >
            Back to Shipments List
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold px-8 h-11 text-xs"
          >
            {isSaving ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Saving Changes...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save All Changes</>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
