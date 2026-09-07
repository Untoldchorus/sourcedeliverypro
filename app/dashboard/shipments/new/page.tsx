'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, ArrowLeft, Package, User, MapPin, Truck, ShieldCheck, CreditCard } from 'lucide-react'
import { PaymentOptionsModal } from '@/components/payments/PaymentOptionsModal'
import { saveLocalShipment } from '@/lib/payments/manualOptions'
import { formatCurrency } from '@/lib/utils'

function generateSDPTracking(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let result = 'SDP'
  for (let i = 0; i < 11; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export default function NewShipmentPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [createdShipment, setCreatedShipment] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    senderAddress: '',
    senderCity: '',

    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    recipientAddress: '',
    recipientCity: '',

    weight: '',
    dimensions: '',
    service: 'INTERNATIONAL_EXPRESS',
    description: '',
  })

  // Prefill sender from session if available
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        senderName: prev.senderName || session.user?.name || '',
        senderEmail: prev.senderEmail || session.user?.email || '',
      }))
    }
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleNext = () => setStep((s) => s + 1)
  const handleBack = () => setStep((s) => s - 1)

  const weightNum = parseFloat(formData.weight) || 3.5
  const estimatedAmount = Math.round((weightNum * 25 + 40) * 100) / 100

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault()

    const trackingNumber = generateSDPTracking()
    const shipmentId = 'SHP-' + Math.random().toString(36).substring(2, 9).toUpperCase()

    const newShipment = {
      id: shipmentId,
      trackingNumber,
      status: 'PENDING_PAYMENT',
      userId: session?.user?.id || '',
      sender: formData.senderName,
      senderName: formData.senderName,
      senderEmail: formData.senderEmail,
      senderPhone: formData.senderPhone,
      senderCity: formData.senderCity,
      recipient: formData.recipientName,
      recipientName: formData.recipientName,
      recipientEmail: formData.recipientEmail,
      recipientPhone: formData.recipientPhone,
      recipientCity: formData.recipientCity,
      origin: formData.senderCity,
      destination: formData.recipientCity,
      weight: `${weightNum} kg`,
      dimensions: formData.dimensions,
      serviceType: formData.service,
      service: formData.service.replace(/_/g, ' '),
      amount: estimatedAmount,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      estimated: '3-5 Business Days',
      description: formData.description,
    }

    saveLocalShipment(newShipment)
    setCreatedShipment(newShipment)
    setShowPaymentModal(true)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#1B2A4A] tracking-tight">Create a New Shipment</h1>
        <p className="text-xs text-slate-500 mt-1">
          Follow the 3 steps below to register your shipment. You will select payment (Pay Now, Send Payment Link, or Pay Later) upon confirmation.
        </p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-2">
        {[
          { num: 1, label: 'Sender Details' },
          { num: 2, label: 'Recipient Details' },
          { num: 3, label: 'Package & Service' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-xl font-bold text-xs shrink-0 transition-all ${
                step >= s.num ? 'bg-[#6B2737] text-white shadow-sm' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span className="text-xs font-bold text-slate-600 hidden sm:inline">{s.label}</span>
            {s.num < 3 && <div className={`flex-1 h-1 rounded ${step > s.num ? 'bg-[#6B2737]' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={step === 3 ? handleCreateShipment : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
        {/* Step 1: Sender */}
        {step === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <User className="w-5 h-5 text-[#6B2737]" />
              <h2 className="text-base font-bold text-[#1B2A4A]">Sender Information (Origin)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Sender Full Name *</label>
                <input
                  required
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Sender Email *</label>
                <input
                  required
                  type="email"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Sender Phone</label>
                <input
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">City & Country (Origin) *</label>
                <input
                  required
                  name="senderCity"
                  value={formData.senderCity}
                  onChange={handleChange}
                  placeholder="e.g. New York, US"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-600">Street Address</label>
                <input
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleChange}
                  placeholder="e.g. 450 Logistics Blvd, Suite 200"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Recipient */}
        {step === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <MapPin className="w-5 h-5 text-[#6B2737]" />
              <h2 className="text-base font-bold text-[#1B2A4A]">Recipient Information (Destination)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Recipient Full Name *</label>
                <input
                  required
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Recipient Email *</label>
                <input
                  required
                  type="email"
                  name="recipientEmail"
                  value={formData.recipientEmail}
                  onChange={handleChange}
                  placeholder="e.g. sarah@example.co.uk"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Recipient Phone</label>
                <input
                  name="recipientPhone"
                  value={formData.recipientPhone}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">City & Country (Destination) *</label>
                <input
                  required
                  name="recipientCity"
                  value={formData.recipientCity}
                  onChange={handleChange}
                  placeholder="e.g. London, GB"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-600">Delivery Address</label>
                <input
                  name="recipientAddress"
                  value={formData.recipientAddress}
                  onChange={handleChange}
                  placeholder="e.g. 12 Canary Wharf, Floor 4"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Package & Service */}
        {step === 3 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Package className="w-5 h-5 text-[#6B2737]" />
              <h2 className="text-base font-bold text-[#1B2A4A]">Package Specifications &amp; Shipping Service</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Weight (kg) *</label>
                <input
                  required
                  type="number"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Dimensions (L x W x H)</label>
                <input
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  placeholder="e.g. 35x25x15 cm"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Service Level</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B2737] bg-white"
                >
                  <option value="INTERNATIONAL_EXPRESS">International Express (1-3 Days)</option>
                  <option value="STANDARD_AIR">Standard Tracked Air (5-7 Days)</option>
                  <option value="HEAVY_FREIGHT">Heavy Freight Cargo</option>
                  <option value="DOMESTIC_EXPRESS">Domestic Same-Day</option>
                </select>
              </div>
              <div className="space-y-1 sm:col-span-3">
                <label className="text-xs font-bold text-slate-600">Contents / Description</label>
                <input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                />
              </div>
            </div>

            {/* Price & Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Estimated Cost</span>
                <span className="text-xl font-black text-[#6B2737]">{formatCurrency(estimatedAmount)}</span>
                <span className="text-xs text-slate-400 block mt-0.5">Includes international freight insurance &amp; customs documentation</span>
              </div>
              <div className="text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200 space-y-1 sm:text-right">
                <p>📍 {formData.senderCity} → {formData.recipientCity}</p>
                <p>📦 {formData.weight} kg · {formData.service.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center pt-2">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={handleBack} className="text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </Button>
          ) : <div />}

          {step < 3 ? (
            <Button type="submit" className="bg-[#1B2A4A] hover:bg-[#14223c] text-white text-xs px-6">
              Continue to Step {step + 1} <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs px-8 py-3 h-auto shadow-md"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Confirm &amp; Proceed to 3 Payment Options
            </Button>
          )}
        </div>
      </form>

      {createdShipment && (
        <PaymentOptionsModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            router.push('/dashboard/shipments')
          }}
          shipment={createdShipment}
          returnUrl="/dashboard/shipments"
        />
      )}
    </div>
  )
}
