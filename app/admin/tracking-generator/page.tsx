'use client'

import React, { useState } from 'react'
import { Hash, Copy, Mail, CheckCircle2, AlertCircle, RefreshCw, Send, Zap, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaymentOptionsModal } from '@/components/payments/PaymentOptionsModal'
import { saveLocalShipment } from '@/lib/payments/manualOptions'

function generateAWB(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'SDP'
  for (let i = 0; i < 11; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export default function TrackingGeneratorPage() {
  // Form state
  const [form, setForm] = useState({
    senderName: '',
    senderEmail: '',
    recipientName: '',
    recipientEmail: '',
    origin: '',
    destination: '',
    service: 'Standard Courier Service',
    weight: '',
    estimatedDelivery: '',
    customAmount: '127.50',
  })
  const [bypassCalculator, setBypassCalculator] = useState(false)
  const [generated, setGenerated] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [emailMsg, setEmailMsg] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentShipment, setCurrentShipment] = useState<any>(null)
  
  // history of generated numbers
  const [history, setHistory] = useState<Array<{awb: string, recipient: string, destination: string, time: string}>>([]) 

  const handleWeightChange = (newWeight: string) => {
    const nextForm = { ...form, weight: newWeight }
    if (!bypassCalculator) {
      const wNum = parseFloat(String(newWeight).replace(/[^0-9.]/g, '')) || 3.5
      const calc = Math.round((wNum * 25 + 40) * 100) / 100
      nextForm.customAmount = calc.toFixed(2)
    }
    setForm(nextForm)
  }

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    const awb = generateAWB()
    setGenerated(awb)
    setCopied(false)
    setEmailStatus('idle')
    setHistory(prev => [{ awb, recipient: form.recipientName, destination: form.destination, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)])
    
    const weightNum = parseFloat(String(form.weight || '3.5').replace(/[^0-9.]/g, '')) || 3.5
    const calculatedAmount = Math.round((weightNum * 25 + 40) * 100) / 100
    const finalAmount = bypassCalculator && form.customAmount !== ''
      ? parseFloat(form.customAmount) || 0
      : (parseFloat(form.customAmount) || calculatedAmount)

    const cleanOrigin = form.origin.trim()
    const cleanDestination = form.destination.trim()

    const shipmentObj = {
      id: awb,
      trackingNumber: awb,
      status: 'PENDING_PAYMENT',
      senderName: form.senderName,
      senderEmail: form.senderEmail,
      recipientName: form.recipientName,
      recipientEmail: form.recipientEmail,
      senderCity: cleanOrigin,
      recipientCity: cleanDestination,
      origin: cleanOrigin,
      destination: cleanDestination,
      serviceType: form.service,
      weight: weightNum,
      estimatedDelivery: form.estimatedDelivery,
      amount: finalAmount,
      totalAmount: finalAmount,
      created: new Date().toLocaleDateString(),
    }

    saveLocalShipment(shipmentObj)
    setCurrentShipment(shipmentObj)
    setShowPaymentModal(true)

    // Sync to database
    fetch('/api/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: awb,
        trackingNumber: awb,
        status: 'PENDING_PAYMENT',
        senderName: form.senderName,
        senderEmail: form.senderEmail,
        recipientName: form.recipientName,
        recipientEmail: form.recipientEmail,
        senderCity: cleanOrigin,
        recipientCity: cleanDestination,
        origin: cleanOrigin,
        destination: cleanDestination,
        serviceType: form.service,
        weight: weightNum,
        amount: finalAmount,
        totalAmount: finalAmount,
        estimatedDelivery: form.estimatedDelivery,
      }),
    }).catch((err) => console.warn('DB creation error:', err))
  }

  const handleCopy = () => {
    if (generated) {
      navigator.clipboard.writeText(generated)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSendEmail = async () => {
    if (!generated) return
    const emailTo = form.recipientEmail || form.senderEmail
    if (!emailTo) {
      setEmailMsg('Please enter a recipient or sender email address.')
      setEmailStatus('error')
      return
    }
    setEmailStatus('sending')
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo,
          trackingNumber: generated,
          senderName: form.senderName,
          recipientName: form.recipientName,
          origin: form.origin,
          destination: form.destination,
          service: form.service,
          estimatedDelivery: form.estimatedDelivery,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setEmailStatus('sent')
        setEmailMsg(data.dev ? `Dev mode: logged to console (not sent). AWB: ${generated}` : `Email sent to ${emailTo}`)
      } else {
        setEmailStatus('error')
        setEmailMsg(data.error || 'Email failed to send.')
      }
    } catch (err: any) {
      setEmailStatus('error')
      setEmailMsg(err.message)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Hash className="w-6 h-6 text-[#6B2737]" />
          Tracking Number Generator &amp; Email Dispatcher
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Generate an AWB/tracking number for a new shipment and send the confirmation email to the customer directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Shipment Details</h2>
          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Sender Name</label>
                <input type="text" required value={form.senderName} onChange={(e) => setForm({...form, senderName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Sender Email</label>
                <input type="email" value={form.senderEmail} onChange={(e) => setForm({...form, senderEmail: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Recipient Name</label>
                <input type="text" required value={form.recipientName} onChange={(e) => setForm({...form, recipientName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Recipient Email</label>
                <input type="email" value={form.recipientEmail} onChange={(e) => setForm({...form, recipientEmail: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Origin (City, Country)</label>
                <input type="text" required value={form.origin} onChange={(e) => setForm({...form, origin: e.target.value})} placeholder="e.g. New York, US"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Destination (City, Country)</label>
                <input type="text" required value={form.destination} onChange={(e) => setForm({...form, destination: e.target.value})} placeholder="e.g. London, GB"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Service Type</label>
                <select value={form.service} onChange={(e) => setForm({...form, service: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none">
                  {[
                    'Standard Courier Service',
                    'Usual Courier Service',
                    'Over Night Express Service',
                  ].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Weight (kg)</label>
                <input type="text" value={form.weight} onChange={(e) => handleWeightChange(e.target.value)} placeholder="e.g. 3.5"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-bold mb-1">Estimated Delivery Date</label>
                <input type="text" value={form.estimatedDelivery} onChange={(e) => setForm({...form, estimatedDelivery: e.target.value})} placeholder="e.g. Sep 10, 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]" />
              </div>

              {/* Rate & Calculator Bypass Section */}
              <div className="sm:col-span-2 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">Rate Calculator &amp; Pricing Control</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bypassCalculator}
                      onChange={(e) => setBypassCalculator(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-[#6B2737] focus:ring-[#6B2737]"
                    />
                    <span className={`text-[10px] font-bold ${bypassCalculator ? 'text-amber-400' : 'text-slate-400'}`}>
                      Bypass Calculator (Manual Custom Rate)
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Total Shipment Rate ($ USD) {bypassCalculator && <span className="text-amber-400 font-bold">(Manual Override Active)</span>}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500 font-bold text-xs">$</span>
                      <input
                        type="text"
                        value={form.customAmount}
                        onChange={(e) => {
                          setBypassCalculator(true)
                          setForm({ ...form, customAmount: e.target.value })
                        }}
                        placeholder="e.g. 145.50"
                        className="w-full bg-slate-900 border border-slate-750 rounded-xl pl-7 pr-3 py-2 text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#6B2737]"
                      />
                    </div>
                  </div>
                  {!bypassCalculator && (
                    <button
                      type="button"
                      onClick={() => {
                        const wNum = parseFloat(String(form.weight).replace(/[^0-9.]/g, '')) || 3.5
                        const calc = Math.round((wNum * 25 + 40) * 100) / 100
                        setForm({ ...form, customAmount: calc.toFixed(2) })
                      }}
                      className="mt-4 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-bold transition cursor-pointer"
                    >
                      Re-Calculate
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  {bypassCalculator
                    ? 'Calculator bypassed. The amount entered above will be charged and printed on waybill without auto-adjusting.'
                    : 'Auto-calculation active. Formula: (Weight kg × $25) + $40 baseline fee. Check "Bypass Calculator" to set custom price.'}
                </p>
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#6B2737] hover:bg-[#E85A24] text-white font-black text-sm py-3">
              <Zap className="w-4 h-4 mr-2" /> Generate Tracking Number
            </Button>
          </form>
        </div>

        {/* Result Panel */}
        <div className="space-y-4">
          {generated ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Generated AWB / Tracking Number</p>
                <div className="bg-slate-950 border-2 border-[#6B2737] rounded-xl p-4">
                  <span className="font-mono text-2xl font-black text-[#6B2737] tracking-widest">{generated}</span>
                </div>
                <Button onClick={handleCopy} variant="outline" className="mt-3 w-full border-slate-700 text-slate-300 hover:bg-slate-800 text-xs">
                  {copied ? <><CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" /> Copied!</> : <><Copy className="w-4 h-4 mr-1" /> Copy AWB</>}
                </Button>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Payment Processing</p>
                <Button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-[#1B2A4A] hover:bg-[#243660] text-white font-bold text-xs border border-slate-700"
                >
                  <CreditCard className="w-4 h-4 mr-1.5 text-amber-400" />
                  3 Payment Options (Pay Now / Link / Later)
                </Button>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Send to Customer</p>
                {emailStatus === 'sent' && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2 rounded-lg text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{emailMsg}</span>
                  </div>
                )}
                {emailStatus === 'error' && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded-lg text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{emailMsg}</span>
                  </div>
                )}
                <Button onClick={handleSendEmail} disabled={emailStatus === 'sending' || emailStatus === 'sent'}
                  className="w-full bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
                  {emailStatus === 'sending' ? <><RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Sending...</> :
                   emailStatus === 'sent' ? <><CheckCircle2 className="w-4 h-4 mr-1" /> Email Sent</> :
                   <><Send className="w-4 h-4 mr-1" /> Send Confirmation Email</>}
                </Button>
                <p className="text-[10px] text-slate-500">Sends to: {form.recipientEmail || form.senderEmail || 'no email entered'}</p>
              </div>

              <div className="border-t border-slate-800 pt-3 text-[10px] text-slate-500 space-y-1">
                <p>📦 {form.origin} → {form.destination}</p>
                <p>🚚 {form.service}</p>
                <p>📅 ETA: {form.estimatedDelivery || 'TBD'}</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center h-48 text-slate-500 space-y-2">
              <Hash className="w-10 h-10" />
              <p className="text-sm font-semibold text-center">Fill the form and click Generate</p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recent Generations</p>
              {history.slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                  <div>
                    <span className="font-mono text-[11px] text-[#6B2737] font-bold">{h.awb}</span>
                    <p className="text-[10px] text-slate-500">{h.recipient} → {h.destination}</p>
                  </div>
                  <span className="text-[10px] text-slate-600">{h.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {currentShipment && (
        <PaymentOptionsModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          shipment={currentShipment}
          isAdmin={true}
          returnUrl="/admin/shipments"
        />
      )}
    </div>
  )
}
