'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calculator, Package, ArrowRight, ShieldCheck, Clock,
  CheckCircle2, AlertCircle, RefreshCw, DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { COUNTRIES } from '@/lib/countries'

export default function ShippingQuotePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quoteResult, setQuoteResult] = useState<any>(null)

  const [formData, setFormData] = useState({
    fromCountry: 'US',
    fromCity: 'New York',
    toCountry: 'GB',
    toCity: 'London',
    weight: 2.5,
    length: 30,
    width: 20,
    height: 15,
    serviceType: 'Standard Courier Service',
    packageType: 'PARCEL',
    declaredValue: 150,
    requiresInsurance: true,
    requiresSignature: false,
    isResidential: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setQuoteResult(null)

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()
      if (!json.success) {
        setError(json.error?.message || 'Failed to calculate rate')
      } else {
        setQuoteResult(json.data)
      }
    } catch (err) {
      setError('An error occurred connecting to the rate engine.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-[#1B2A4A] tracking-tight">
          Calculate Shipping Rates & Transit Times
        </h1>
        <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">
          Instant door-to-door estimate based on dimensional weight, destination tariffs, and priority level.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Origin Country</label>
                <select
                  value={formData.fromCountry}
                  onChange={(e) => setFormData({ ...formData, fromCountry: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Destination Country</label>
                <select
                  value={formData.toCountry}
                  onChange={(e) => setFormData({ ...formData, toCountry: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Origin City</label>
                <input
                  type="text"
                  value={formData.fromCity}
                  onChange={(e) => setFormData({ ...formData, fromCity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Destination City</label>
                <input
                  type="text"
                  value={formData.toCity}
                  onChange={(e) => setFormData({ ...formData, toCity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                  required
                />
              </div>
            </div>

            {/* Package weight & dimensions */}
            <div className="border-t pt-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-3">Package Specs</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0.1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Length (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Width (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                  />
                </div>
              </div>
            </div>

            {/* Service speed */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Service Class</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
              >
                <option value="Standard Courier Service">Standard Courier Service</option>
                <option value="Usual Courier Service">Usual Courier Service</option>
                <option value="Over Night Express Service">Over Night Express Service</option>
              </select>
            </div>

            {/* Options */}
            <div className="space-y-2 border-t pt-4">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.requiresInsurance}
                  onChange={(e) => setFormData({ ...formData, requiresInsurance: e.target.checked })}
                  className="rounded text-[#6B2737] focus:ring-[#6B2737]"
                />
                Add Cargo Protection / Insurance ( declared value)
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.requiresSignature}
                  onChange={(e) => setFormData({ ...formData, requiresSignature: e.target.checked })}
                  className="rounded text-[#6B2737] focus:ring-[#6B2737]"
                />
                Direct Signature Required upon Delivery
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6B2737] hover:bg-[#E85A24] text-white font-semibold py-3.5 h-auto text-base shadow-md"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                'Calculate Shipping Rate'
              )}
            </Button>
          </form>
        </div>

        {/* Breakdown & Result */}
        <div className="lg:col-span-5 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {quoteResult ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
              <div className="border-b pb-4 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Quote Reference</span>
                  <div className="font-mono font-bold text-sm text-[#1B2A4A]">{quoteResult.quoteNumber}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase block">Estimated Transit</span>
                  <span className="text-sm font-extrabold text-emerald-600 flex items-center gap-1 justify-end">
                    <Clock className="w-3.5 h-3.5" />
                    {quoteResult.estimatedDays === 0 ? 'Same Day' : `${quoteResult.estimatedDays} Business Day(s)`}
                  </span>
                </div>
              </div>

              {/* Total Callout */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="font-bold text-[#1B2A4A]">Total Shipping Cost:</span>
                <span className="text-2xl font-black text-[#6B2737]">
                  {formatCurrency(quoteResult.totalAmount, quoteResult.currency)}
                </span>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span>Base Freight Rate</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(quoteResult.baseRate)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span>Chargeable Weight (Max of actual vs dimensional)</span>
                  <span className="font-semibold text-slate-800">{quoteResult.chargeableWeight} kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span>Fuel Surcharge (12.5%)</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(quoteResult.fuelSurcharge)}</span>
                </div>
                {quoteResult.insuranceFee > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span>Cargo Insurance</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(quoteResult.insuranceFee)}</span>
                  </div>
                )}
                {quoteResult.residentialFee > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span>Residential Delivery Fee</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(quoteResult.residentialFee)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span>Estimated Taxes / Duties (7.5%)</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(quoteResult.taxAmount)}</span>
                </div>
              </div>

              <Button
                onClick={() => router.push('/shipping')}
                className="w-full bg-[#1B2A4A] hover:bg-[#13233D] text-white font-semibold py-3 h-auto"
              >
                Proceed to Ship With This Rate
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-3">
              <Calculator className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm">Fill in the origin, destination, and package details to calculate instant commercial rates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}