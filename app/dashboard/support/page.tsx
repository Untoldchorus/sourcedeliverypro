'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { HelpCircle, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, FileText, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  category: string
  shipmentAWB?: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  created: string
  lastUpdated: string
}

export default function SupportTicketsPage() {
  const { data: session } = useSession()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('Tracking & Telemetry')
  const [shipmentAWB, setShipmentAWB] = useState('')
  const [message, setMessage] = useState('')

  const storageKey = `sdp_tickets_${session?.user?.email || 'user'}`

  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(storageKey)
      if (savedRaw) {
        setTickets(JSON.parse(savedRaw))
      } else {
        setTickets([])
      }
    } catch {
      setTickets([])
    }
  }, [storageKey])

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !message) return

    const now = new Date()
    const created: Ticket = {
      id: 'tkt-' + Date.now(),
      ticketNumber: 'TKT-2026-' + Math.floor(1000 + Math.random() * 9000),
      subject,
      category,
      shipmentAWB: shipmentAWB || undefined,
      status: 'OPEN',
      created: now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      lastUpdated: 'Just now',
    }

    const updated = [created, ...tickets]
    setTickets(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))

    setShowCreateModal(false)
    setSubject('')
    setMessage('')
    setShipmentAWB('')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1B2A4A]">Support &amp; Claim Tickets</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create inquiry tickets, request route modifications, or communicate with dispatch officers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="text-xs border-slate-300">
            <Link href="/support">
              <HelpCircle className="w-4 h-4 mr-1.5" /> Help Center &amp; FAQ
            </Link>
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Ticket
          </Button>
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <h2 className="font-bold text-base text-[#1B2A4A]">Your Support Tickets</h2>

        {tickets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">No support tickets found</p>
              <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
                Need help with an ongoing shipment, customs clearance documentation, or billing? Click &quot;Create Ticket&quot; to reach an operations specialist.
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Open New Ticket
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b">
                <tr>
                  <th className="p-3">Ticket #</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Tracking Number</th>
                  <th className="p-3">Last Activity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-[#1B2A4A]">{t.ticketNumber}</td>
                    <td className="p-3 font-bold text-slate-800">{t.subject}</td>
                    <td className="p-3 font-medium text-slate-600">{t.category}</td>
                    <td className="p-3 font-mono text-[#6B2737]">{t.shipmentAWB || '—'}</td>
                    <td className="p-3 text-slate-500">{t.lastUpdated}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => alert(`Ticket ${t.ticketNumber} details: inquiry under review by operations team.`)}
                        className="text-xs text-[#6B2737]"
                      >
                        View Discussion
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-[#1B2A4A]">Open New Support Ticket</h2>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Inquiry Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                >
                  <option value="Tracking & Telemetry">Tracking &amp; Telemetry</option>
                  <option value="Delivery Address">Address Amendment</option>
                  <option value="Customs Brokerage">Customs &amp; Duties</option>
                  <option value="Claims & Refunds">Claims &amp; Refunds</option>
                  <option value="Billing & Invoice">Billing &amp; Invoicing</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your inquiry..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tracking Number (Optional)</label>
                <input
                  type="text"
                  value={shipmentAWB}
                  onChange={(e) => setShipmentAWB(e.target.value)}
                  placeholder="e.g. SDP8F4K92LM381"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Detailed Message</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry or requested modification..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold">
                  Submit Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
