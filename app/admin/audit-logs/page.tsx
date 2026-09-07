'use client'

import React, { useState } from 'react'
import { ShieldCheck, Search, Filter, History, Eye, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AuditEvent {
  id: string
  action: string
  resource: string
  resourceId: string
  actorName: string
  actorRole: string
  timestamp: string
  ipAddress: string
  reason: string
  previousValue: string
  newValue: string
}

export default function AuditLogsPage() {
  const [logs] = useState<AuditEvent[]>([
    {
      id: 'log-101',
      action: 'shipments.change_price',
      resource: 'Shipment',
      resourceId: 'SDP8F4K92LM381',
      actorName: 'Operations Admin',
      actorRole: 'OPERATIONS_ADMIN',
      timestamp: 'Sep 06, 2026 — 10:42 AM',
      ipAddress: '192.168.1.45',
      reason: 'Additional remote-area surcharge correction',
      previousValue: '$120.00',
      newValue: '$145.50',
    },
    {
      id: 'log-102',
      action: 'receipts.void',
      resource: 'Receipt',
      resourceId: 'RCPT-2026-00192',
      actorName: 'Super Admin Officer',
      actorRole: 'SUPER_ADMIN',
      timestamp: 'Sep 05, 2026 — 04:15 PM',
      ipAddress: '10.0.0.12',
      reason: 'Re-issued with updated tax breakdown',
      previousValue: 'Status: ISSUED (v1)',
      newValue: 'Status: VOID (v2 created)',
    },
    {
      id: 'log-103',
      action: 'users.impersonate',
      resource: 'UserSession',
      resourceId: 'usr-1',
      actorName: 'Super Admin Officer',
      actorRole: 'SUPER_ADMIN',
      timestamp: 'Sep 06, 2026 — 01:10 AM',
      ipAddress: '10.0.0.12',
      reason: 'Troubleshooting customer checkout issue',
      previousValue: 'Admin Session',
      newValue: 'Impersonating John Doe (john@example.com)',
    },
  ])

  const [selectedLog, setSelectedLog] = useState<AuditEvent | null>(null)
  const [search, setSearch] = useState('')

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actorName.toLowerCase().includes(search.toLowerCase()) ||
      l.resourceId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#6B2737]" />
            Enterprise Audit Trail & Revision History (`audit.view`)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all administrative actions, financial overrides, impersonation sessions, and role changes.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by admin, action, or ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Action & Resource</th>
                <th className="p-3">Administrator</th>
                <th className="p-3">Resource ID</th>
                <th className="p-3">Timestamp & IP</th>
                <th className="p-3">Modification Reason</th>
                <th className="p-3 text-right">Inspect Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-amber-400">{l.action}</td>
                  <td className="p-3">
                    <span className="font-bold text-white block">{l.actorName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{l.actorRole}</span>
                  </td>
                  <td className="p-3 font-mono text-[#6B2737]">{l.resourceId}</td>
                  <td className="p-3 text-slate-400">
                    <span className="block font-mono text-[11px]">{l.timestamp}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{l.ipAddress}</span>
                  </td>
                  <td className="p-3 text-slate-300 italic">{l.reason}</td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedLog(l)}
                      className="text-xs text-slate-300 hover:text-white"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Compare Diff
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Before / After Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl text-xs text-slate-300">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-[#6B2737]" /> Before / After Revision Inspection
            </h2>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
              <div><span className="text-slate-500">Action:</span> {selectedLog.action}</div>
              <div><span className="text-slate-500">Resource:</span> {selectedLog.resource} ({selectedLog.resourceId})</div>
              <div><span className="text-slate-500">Actor:</span> {selectedLog.actorName} ({selectedLog.actorRole})</div>
              <div><span className="text-slate-500">Reason:</span> {selectedLog.reason}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl space-y-1">
                <span className="font-bold text-red-400 block text-[11px] uppercase">BEFORE (PREVIOUS STATE)</span>
                <div className="font-mono text-xs text-slate-200 font-bold">{selectedLog.previousValue}</div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-1">
                <span className="font-bold text-emerald-400 block text-[11px] uppercase">AFTER (NEW STATE)</span>
                <div className="font-mono text-xs text-white font-bold">{selectedLog.newValue}</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={() => setSelectedLog(null)} className="bg-[#6B2737] text-white font-bold">
                Close Diff Inspection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
