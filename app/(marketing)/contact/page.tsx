'use client'

import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()
      if (!json.success) {
        setError(json.error?.message || 'Failed to submit message')
      } else {
        setSuccess(true)
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      }
    } catch (err) {
      setError('An error occurred submitting the contact form.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6B2737]">Get in Touch</span>
        <h1 className="text-4xl font-black text-[#1B2A4A] mt-2 mb-3 tracking-tight">
          Contact SourceDeliveryPro
        </h1>
        <p className="text-slate-600 text-sm">
          Our international customer support and freight dispatch operations are active 24/7 across all global timezones.
        </p>
      </div>

      <div className="rounded-3xl overflow-hidden shadow-xl aspect-video border mb-16" style={{ borderColor: '#DDD0C8' }}>
        <img src="/images/contact_hero.jpg" alt="SourceDeliveryPro Support Center" className="w-full h-full object-cover" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Info Col */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-[#1B2A4A]">Global Headquarters</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#6B2737] shrink-0 mt-0.5" />
                <span>450 Logistics Blvd, Suite 800, New York, NY 10001, United States</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#6B2737] shrink-0" />
                <span>+1 (800) 555-SDPRO (Toll-Free Global)</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#6B2737] shrink-0" />
                <span>dispatch@sourcedeliverypro.com</span>
              </p>
            </div>
          </div>

          <div className="bg-[#1B2A4A] text-white p-6 rounded-2xl space-y-2 text-xs">
            <h4 className="font-bold text-sm text-[#6B2737]">24/7 Air Express Desk</h4>
            <p className="text-slate-300">
              For urgent customs escalation or live flight redirection, our duty managers can be reached at <span className="text-white font-mono">+1 (718) 555-0199</span>.
            </p>
          </div>
        </div>

        {/* Form Col */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm">
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 mb-6 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Thank you! Your message has been sent to our dispatch team.</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 mb-6 text-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Shipment inquiry / Claim / Rate quote"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Message / Consignment Details</label>
              <textarea
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold px-8 py-3 h-auto text-sm shadow-md"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Dispatch Request
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}