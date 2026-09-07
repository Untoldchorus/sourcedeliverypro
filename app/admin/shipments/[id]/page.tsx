'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Box, Save, ArrowLeft, ShieldAlert, DollarSign, User, MapPin, Truck, CheckCircle2, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

export default function AdminEditEverythingShipmentPage() {
  const router = useRouter()
  const params = useParams()
  const shipmentId = params?.id as string

  // Dynamic shipment database mock map
  const mockShipmentDb: Record<string, any> = {
    'shp-1': {
      trackingNumber: 'SDP8F4K92LM381',
      refNumber: 'REF-2026-99014',
      status: 'IN_TRANSIT',
      senderName: 'John Doe',
      senderCompany: 'SourceDeliveryPro Logistics Hub',
      senderEmail: 'john@example.com',
      senderPhone: '+1 555-0199',
      senderAddress: '450 Logistics Blvd',
      senderCity: 'New York',
      senderState: 'NY',
      senderCountry: 'United States (US)',
      recipientName: 'Sarah Jenkins',
      recipientCompany: 'Global Retail UK',
      recipientEmail: 'sarah.jenkins@example.co.uk',
      recipientPhone: '+44 20 7946 0991',
      recipientAddress: '12 Canary Wharf',
      recipientCity: 'London',
      recipientState: 'Greater London',
      recipientCountry: 'United Kingdom (GB)',
      packageType: 'PARCEL',
      weight: '3.5',
      length: '30',
      width: '20',
      height: '15',
      declaredValue: '250.00',
      isFragile: true,
      specialInstructions: 'Handle with care. Temperature sensitive.',
      serviceType: 'INTERNATIONAL_EXPRESS',
      assignedDriver: 'Marcus Vance',
      assignedFacility: 'JFK International Dispatch Facility',
      baseRate: '120.00',
      fuelSurcharge: '15.00',
      insuranceFee: '10.50',
      totalAmount: '145.50',
      paymentStatus: 'PAID',
    },
    'shp-2': {
      trackingNumber: 'SDP77B219KP440',
      refNumber: 'REF-2026-99015',
      status: 'DELIVERED',
      senderName: 'John Doe',
      senderCompany: 'Maple Exports',
      senderEmail: 'john@example.com',
      senderPhone: '+1 416-555-0188',
      senderAddress: '100 Bay Street',
      senderCity: 'Toronto',
      senderState: 'ON',
      senderCountry: 'Canada (CA)',
      recipientName: 'Marcus Vance',
      recipientCompany: 'Vance GmbH',
      recipientEmail: 'marcus@vance.de',
      recipientPhone: '+49 69 1234 5678',
      recipientAddress: 'Zeil 106',
      recipientCity: 'Frankfurt',
      recipientState: 'Hesse',
      recipientCountry: 'Germany (DE)',
      packageType: 'DOCUMENTS',
      weight: '2.1',
      length: '25',
      width: '18',
      height: '5',
      declaredValue: '100.00',
      isFragile: false,
      specialInstructions: 'Express document delivery.',
      serviceType: 'STANDARD_AIR',
      assignedDriver: 'Hans Weber',
      assignedFacility: 'Frankfurt Sorting Hub',
      baseRate: '75.00',
      fuelSurcharge: '8.00',
      insuranceFee: '5.00',
      totalAmount: '88.00',
      paymentStatus: 'PAID',
    },
    'shp-3': {
      trackingNumber: 'SDP993C104KL22',
      refNumber: 'REF-2026-99016',
      status: 'PENDING',
      senderName: 'John Doe',
      senderCompany: 'New York Cargo Inc',
      senderEmail: 'john@example.com',
      senderPhone: '+1 212-555-0144',
      senderAddress: '88 Eighth Ave',
      senderCity: 'New York',
      senderState: 'NY',
      senderCountry: 'United States (US)',
      recipientName: 'Acme Corp Warehouse',
      recipientCompany: 'Acme West Africa',
      recipientEmail: 'warehouse@acme.ng',
      recipientPhone: '+234 1 234 5678',
      recipientAddress: '45 Commercial Ave',
      recipientCity: 'Lagos',
      recipientState: 'Lagos',
      recipientCountry: 'Nigeria (NG)',
      packageType: 'PALLET',
      weight: '45.0',
      length: '120',
      width: '80',
      height: '100',
      declaredValue: '1500.00',
      isFragile: false,
      specialInstructions: 'Heavy freight pallet cargo.',
      serviceType: 'HEAVY_FREIGHT',
      assignedDriver: 'Olamide Johnson',
      assignedFacility: 'Murtala Muhammed Freight Hub',
      baseRate: '350.00',
      fuelSurcharge: '40.00',
      insuranceFee: '30.00',
      totalAmount: '420.00',
      paymentStatus: 'PENDING',
    },
  }

  const initialRecord = mockShipmentDb[shipmentId] || {
    trackingNumber: `SDP${shipmentId.slice(-4).toUpperCase()}992X`,
    refNumber: `REF-2026-${shipmentId}`,
    status: 'IN_TRANSIT',
    senderName: 'John Doe',
    senderCompany: 'SourceDeliveryPro Logistics',
    senderEmail: 'john@example.com',
    senderPhone: '+1 555-0100',
    senderAddress: '100 Hub Way',
    senderCity: 'New York',
    senderState: 'NY',
    senderCountry: 'United States (US)',
    recipientName: 'Customer Recipient',
    recipientCompany: 'Destination Corp',
    recipientEmail: 'recipient@example.com',
    recipientPhone: '+1 555-0200',
    recipientAddress: '200 Delivery St',
    recipientCity: 'London',
    recipientState: 'Greater London',
    recipientCountry: 'United Kingdom (GB)',
    packageType: 'PARCEL',
    weight: '5.0',
    length: '30',
    width: '20',
    height: '20',
    declaredValue: '300.00',
    isFragile: false,
    specialInstructions: 'Standard handling.',
    serviceType: 'INTERNATIONAL_EXPRESS',
    assignedDriver: 'Unassigned',
    assignedFacility: 'Regional Sorting Hub',
    baseRate: '150.00',
    fuelSurcharge: '18.00',
    insuranceFee: '12.00',
    totalAmount: '180.00',
    paymentStatus: 'PAID',
  }

  const [formData, setFormData] = useState({
    ...initialRecord,
    reasonForEdit: '',
  })

  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem('sourcedeliverypro_admin_shipments') || localStorage.getItem('swiftship_admin_shipments')
      if (savedRaw) {
        const currentMap = JSON.parse(savedRaw)
        if (currentMap[shipmentId]) {
          setFormData((prev: any) => ({
            ...prev,
            ...currentMap[shipmentId],
          }))
        }
      }
    } catch (err) {
      console.error(err)
    }
  }, [shipmentId])

  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const savedRaw = localStorage.getItem('sourcedeliverypro_admin_shipments') || localStorage.getItem('swiftship_admin_shipments')
      const currentMap = savedRaw ? JSON.parse(savedRaw) : {}
      currentMap[shipmentId] = formData
      localStorage.setItem('sourcedeliverypro_admin_shipments', JSON.stringify(currentMap))
      localStorage.setItem('swiftship_admin_shipments', JSON.stringify(currentMap))
    } catch (err) {
      console.error(err)
    }

    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
            "Edit Everything" Master Record Control: <span className="font-mono text-[#6B2737]">{formData.trackingNumber}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Super Admin & Operations override editor. Financial modifications generate revision audit logs.
          </p>
        </div>

        <Button onClick={handleSave} className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
          <Save className="w-4 h-4 mr-1.5" /> Save All Changes
        </Button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Shipment record updated successfully. Audit log revision created.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs text-slate-300">
        {/* Section 1: Identification & Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <Box className="w-4 h-4 text-[#6B2737]" /> 1. Shipment Identification & Operational Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1">Tracking Number (AWB)</label>
              <input
                type="text"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Reference Number</label>
              <input
                type="text"
                value={formData.refNumber}
                onChange={(e) => setFormData({ ...formData, refNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Current Status Override</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs"
              >
                <option value="LABEL_CREATED">LABEL CREATED</option>
                <option value="PICKUP_SCHEDULED">PICKUP SCHEDULED</option>
                <option value="PICKED_UP">PICKED UP</option>
                <option value="IN_TRANSIT">IN TRANSIT</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="EXCEPTION">EXCEPTION</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Sender & Recipient */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
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

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
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

        {/* Section 3: Financial Override */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> 4. Financial & Tariff Controls
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold mb-1">Base Freight Rate ($)</label>
              <input
                type="text"
                value={formData.baseRate}
                onChange={(e) => setFormData({ ...formData, baseRate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Fuel Surcharge ($)</label>
              <input
                type="text"
                value={formData.fuelSurcharge}
                onChange={(e) => setFormData({ ...formData, fuelSurcharge: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Insurance Fee ($)</label>
              <input
                type="text"
                value={formData.insuranceFee}
                onChange={(e) => setFormData({ ...formData, insuranceFee: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Total Amount ($)</label>
              <input
                type="text"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-amber-400 mb-1">Reason for Operational/Financial Edit <span className="text-slate-500 font-normal">(Optional — added to audit log)</span></label>
            <input
              type="text"
              value={formData.reasonForEdit}
              onChange={(e) => setFormData({ ...formData, reasonForEdit: e.target.value })}
              placeholder="e.g. Tariff recalculation due to remote-area surcharge correction"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-white text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/shipments')} className="border-slate-800 text-slate-400">
            Cancel
          </Button>
          <Button type="submit" className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold px-6">
            Save All Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
