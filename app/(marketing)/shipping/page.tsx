'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package, User, MapPin, Truck, ShieldCheck, CheckCircle2,
  AlertCircle, ArrowRight, ArrowLeft, RefreshCw, CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, cn } from '@/lib/utils'
import { COUNTRIES } from '@/lib/countries'
import { PaymentOptionsModal } from '@/components/payments/PaymentOptionsModal'
import { saveLocalShipment } from '@/lib/payments/manualOptions'

export default function CreateShipmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdShipment, setCreatedShipment] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1: Sender
    senderName: 'John Doe',
    senderCompany: 'SourceDeliveryPro Logistics Hub',
    senderEmail: 'john@example.com',
    senderPhone: '+1 555-0199',
    senderAddressLine1: '450 Logistics Blvd',
    senderAddressLine2: 'Suite 200',
    senderCity: 'New York',
    senderState: 'NY',
    senderCountry: 'US',
    senderPostalCode: '10001',

    // Step 2: Recipient
    recipientName: 'Sarah Jenkins',
    recipientCompany: 'Global Imports Ltd',
    recipientEmail: 'sarah.jenkins@example.co.uk',
    recipientPhone: '+44 20 7946 0991',
    recipientAddressLine1: '12 Canary Wharf',
    recipientAddressLine2: 'Floor 4',
    recipientCity: 'London',
    recipientState: 'Greater London',
    recipientCountry: 'GB',
    recipientPostalCode: 'E14 5AB',

    // Step 3: Package
    packageType: 'PARCEL',
    weight: 3.5,
    length: 35,
    width: 25,
    height: 15,
    packageCount: 1,
    declaredValue: 250,
    contents: 'Electronic components and sample parts',
    isFrangile: true,
    isDangerousGoods: false,

    // Step 4: Service
    serviceType: 'EXPRESS',

    // Step 5: Options
    requiresSignature: true,
    requiresInsurance: true,
    isSaturdayDelivery: false,
    isResidential: false,
    hasPickupService: true,
    specialInstructions: 'Handle with care. Deliver to reception desk.',
  })

  const handleNext = () => setStep((s) => Math.min(s + 1, 5))
  const handleBack = () => setStep((s) => Math.max(s - 1, 1))

  const handleCreateShipment = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()
      if (!json.success) {
        setError(json.error?.message || 'Failed to submit shipment')
      } else {
        const trk = json.data?.trackingNumber || ('SDP' + Math.random().toString(36).substring(2, 13).toUpperCase())
        const newShipment = {
          id: json.data?.shipmentId || ('shp-' + Date.now()),
          trackingNumber: trk,
          status: 'PENDING_PAYMENT',
          senderName: formData.senderName,
          senderEmail: formData.senderEmail,
          senderCity: formData.senderCity,
          recipientName: formData.recipientName,
          recipientEmail: formData.recipientEmail,
          recipientCity: formData.recipientCity,
          origin: `${formData.senderCity}, ${formData.senderCountry}`,
          destination: `${formData.recipientCity}, ${formData.recipientCountry}`,
          serviceType: formData.serviceType,
          weight: formData.weight,
          estimatedDelivery: '3-5 Business Days',
          amount: 145.5,
          created: new Date().toLocaleDateString(),
        }
        saveLocalShipment(newShipment)
        setCreatedShipment(newShipment)
        setShowPaymentModal(true)
      }
    } catch (err) {
      setError('An error occurred submitting the shipment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Step Indicator */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#1B2A4A] tracking-tight mb-4">
          Create Shipment
        </h1>
        <div className="flex items-center justify-between border-b pb-4 text-xs font-semibold text-slate-500">
          <span className={step >= 1 ? 'text-[#6B2737]' : ''}>1. Sender</span>
          <span className={step >= 2 ? 'text-[#6B2737]' : ''}>2. Recipient</span>
          <span className={step >= 3 ? 'text-[#6B2737]' : ''}>3. Package</span>
          <span className={step >= 4 ? 'text-[#6B2737]' : ''}>4. Service</span>
          <span className={step >= 5 ? 'text-[#6B2737]' : ''}>5. Review & Confirm</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {/* Step 1: Sender */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#6B2737]" />
              Sender Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.senderCompany}
                  onChange={(e) => setFormData({ ...formData, senderCompany: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.senderEmail}
                  onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.senderPhone}
                  onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.senderAddressLine1}
                  onChange={(e) => setFormData({ ...formData, senderAddressLine1: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  value={formData.senderCity}
                  onChange={(e) => setFormData({ ...formData, senderCity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Country</label>
                <select
                  value={formData.senderCountry}
                  onChange={(e) => setFormData({ ...formData, senderCountry: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Recipient */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#6B2737]" />
              Recipient Destination
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Recipient Full Name</label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Recipient Company</label>
                <input
                  type="text"
                  value={formData.recipientCompany}
                  onChange={(e) => setFormData({ ...formData, recipientCompany: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.recipientPhone}
                  onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={formData.recipientAddressLine1}
                  onChange={(e) => setFormData({ ...formData, recipientAddressLine1: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  value={formData.recipientCity}
                  onChange={(e) => setFormData({ ...formData, recipientCity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Destination Country</label>
                <select
                  value={formData.recipientCountry}
                  onChange={(e) => setFormData({ ...formData, recipientCountry: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Package */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-[#6B2737]" />
              Package Specifications
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0.1 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Length (cm)</label>
                <input
                  type="number"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Width (cm)</label>
                <input
                  type="number"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Declared Customs Value ($ USD)</label>
                <input
                  type="number"
                  value={formData.declaredValue}
                  onChange={(e) => setFormData({ ...formData, declaredValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Contents Description</label>
                <input
                  type="text"
                  value={formData.contents}
                  onChange={(e) => setFormData({ ...formData, contents: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Service */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-[#6B2737]" />
              Select Service Level
            </h2>
            <div className="space-y-3">
              {[
                { id: 'EXPRESS', name: 'International Priority Express', time: '1-3 Business Days', desc: 'Fastest door-to-door delivery with direct flight dispatch.' },
                { id: 'STANDARD', name: 'Standard Tracked Air', time: '5-7 Business Days', desc: 'Economical international courier with full tracking.' },
                { id: 'SAME_DAY', name: 'Same Day Air (Domestic)', time: 'Today', desc: 'Immediate dispatch by dedicated courier.' },
              ].map((svc) => (
                <label
                  key={svc.id}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition',
                    formData.serviceType === svc.id ? 'border-[#6B2737] bg-orange-50/20' : 'border-slate-200'
                  )}
                >
                  <input
                    type="radio"
                    name="serviceType"
                    value={svc.id}
                    checked={formData.serviceType === svc.id}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="mt-1 text-[#6B2737] focus:ring-[#6B2737]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1B2A4A]">{svc.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">{svc.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{svc.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#6B2737]" />
              Review Consignment Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="font-bold uppercase text-slate-400 block mb-1">From (Sender)</span>
                <p className="font-bold text-slate-800">{formData.senderName}</p>
                <p className="text-slate-600">{formData.senderAddressLine1}, {formData.senderCity}, {formData.senderCountry}</p>
                <p className="text-slate-500 mt-1">{formData.senderEmail} | {formData.senderPhone}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="font-bold uppercase text-slate-400 block mb-1">To (Recipient)</span>
                <p className="font-bold text-slate-800">{formData.recipientName}</p>
                <p className="text-slate-600">{formData.recipientAddressLine1}, {formData.recipientCity}, {formData.recipientCountry}</p>
                <p className="text-slate-500 mt-1">{formData.recipientEmail} | {formData.recipientPhone}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold uppercase text-slate-400 block">Package & Service</span>
                <span className="font-bold text-slate-800">{formData.weight} kg · {formData.serviceType} Service</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">Ready to Register</span>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between items-center border-t pt-6 mt-8">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={handleBack} className="text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </Button>
          ) : <div />}

          {step < 5 ? (
            <Button type="button" onClick={handleNext} className="bg-[#1B2A4A] hover:bg-[#13233D] text-white text-xs px-6">
              Continue <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={loading}
              onClick={handleCreateShipment}
              className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs px-8 py-3 h-auto shadow-md"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Confirm & Proceed to Payment
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {createdShipment && (
        <PaymentOptionsModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          shipment={createdShipment}
        />
      )}
    </div>
  )
}