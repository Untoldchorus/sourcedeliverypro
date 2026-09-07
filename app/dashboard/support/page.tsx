'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { HelpCircle, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, FileText, Send } from 'lucide-react'
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
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'tkt-1',
      ticketNumber: 'TKT-2026-9041',
      subject: 'Customs Clearance Document Inquiry',
      category: 'Customs Brokerage',
      shipmentAWB: 'SDP8F4K92LM381',
      status: 'IN_PROGRESS',
      created: 'Sep 05, 2026',
      lastUpdated: '1 hour ago',
    },
    {
      id: 'tkt-2',
      ticketNumber: 'TKT-2026-8812',
      subject: 'Address Amendment Request',
      category: 'Delivery Address',
      shipmentAWB: 'SDP77B219KP440',
      status: 'RESOLVED',
      created: 'Aug 30, 2026',
      lastUpdated: 'Sep 01, 2026',
    },
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('Tracking')
  const [shipmentAWB, setShipmentAWB] = useState('')
  const [message, setMessage] = useState('')

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !message) return

    const created: Ticket = {
      id: 'tkt-' + Date.now(),
      ticketNumber: 'TKT-2026-' + Math.floor(1000 + Math.random() * 9000),
      subject,
      category,
      shipmentAWB: shipmentAWB || undefined,
      status: 'OPEN',
      created: 'Today',
      lastUpdated: 'Just now',
    }

    setTickets([created, ...tickets])
    setShowCreateModal(false)
    setSubject('')
    setMessage('')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1B2A4A]">Support & Claim Tickets</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create inquiry tickets, request route modifications, or communicate with dispatch officers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="text-xs">
            <Link href="/support">
              <HelpCircle className="w-4 h-4 mr-1.5" /> Help Center & FAQ
            </Link>
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Create Ticket
          </Button>
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <h2 className="font-bold text-base text-[#1B2A4A]">Your Support Tickets</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b">
              <tr>
                <th className="p-3">Ticket #</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Category</th>
                <th className="p-3">Associated AWB</th>
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
                      onClick={() => alert(`Opening ticket details for ${t.ticketNumber}...`)}
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
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-[#1B2A4A]">Open New Support Ticket</h2>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Inquiry Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                >
                  <option value="Tracking">Tracking & Telemetry</option>
                  <option value="Delivery Address">Address Amendment</option>
                  <option value="Customs Brokerage">Customs & Duties</option>
                  <option value="Claims & Refunds">Claims & Refunds</option>
                  <option value="Billing & Invoice">Billing & Invoicing</option>
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
                <label className="block font-semibold mb-1">Associated AWB / Tracking # (Optional)</label>
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
                <Button type="submit" className="bg-[#6B2737] text-white font-bold">
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
