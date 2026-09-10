'use client'

import React, { useState } from 'react'
import { BarChart3, Save, Plus, Trash2, CheckCircle2, AlertTriangle, Edit3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface PricingRule {
  id: string
  name: string
  serviceType: string
  zone: string
  baseRate: number
  perKgRate: number
  fuelSurcharge: number
  insuranceRate: number
  remoteAreaSurcharge: number
  minWeight: number
  maxWeight: number
  currency: string
  isActive: boolean
}

const defaultRules: PricingRule[] = [
  {
    id: 'PRC-001',
    name: 'Standard Courier Service',
    serviceType: 'Standard Courier Service',
    zone: 'Domestic',
    baseRate: 15.00,
    perKgRate: 2.00,
    fuelSurcharge: 8,
    insuranceRate: 1.5,
    remoteAreaSurcharge: 15.00,
    minWeight: 0.1,
    maxWeight: 30,
    currency: 'USD',
    isActive: true,
  },
  {
    id: 'PRC-002',
    name: 'Usual Courier Service',
    serviceType: 'Usual Courier Service',
    zone: 'Regional',
    baseRate: 25.00,
    perKgRate: 3.50,
    fuelSurcharge: 10,
    insuranceRate: 2.0,
    remoteAreaSurcharge: 20.00,
    minWeight: 0.1,
    maxWeight: 50,
    currency: 'USD',
    isActive: true,
  },
  {
    id: 'PRC-003',
    name: 'Over Night Express Service',
    serviceType: 'Over Night Express Service',
    zone: 'International',
    baseRate: 45.00,
    perKgRate: 6.50,
    fuelSurcharge: 12,
    insuranceRate: 2.5,
    remoteAreaSurcharge: 25.00,
    minWeight: 0.1,
    maxWeight: 70,
    currency: 'USD',
    isActive: true,
  },
]

const serviceTypeColors: Record<string, string> = {
  'Standard Courier Service': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'Usual Courier Service': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'Over Night Express Service': 'text-[#6B2737] bg-orange-500/10 border-orange-500/30',
}

export default function PricingTariffsPage() {
  const [rules, setRules] = useState<PricingRule[]>(defaultRules)
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newRule, setNewRule] = useState<Partial<PricingRule>>({
    name: '', serviceType: 'Standard Courier Service', zone: 'Domestic',
    baseRate: 0, perKgRate: 0, fuelSurcharge: 0, insuranceRate: 0,
    remoteAreaSurcharge: 0, minWeight: 0, maxWeight: 100, currency: 'USD', isActive: true,
  })

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRule) return
    setRules(rules.map((r) => (r.id === editingRule.id ? editingRule : r)))
    setSaved(true)
    setTimeout(() => { setSaved(false); setEditingRule(null) }, 1500)
  }

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault()
    const created: PricingRule = {
      id: 'PRC-' + Date.now(),
      name: newRule.name || 'New Rate',
      serviceType: newRule.serviceType || 'DOMESTIC_STANDARD',
      zone: newRule.zone || 'Domestic',
      baseRate: Number(newRule.baseRate) || 0,
      perKgRate: Number(newRule.perKgRate) || 0,
      fuelSurcharge: Number(newRule.fuelSurcharge) || 0,
      insuranceRate: Number(newRule.insuranceRate) || 0,
      remoteAreaSurcharge: Number(newRule.remoteAreaSurcharge) || 0,
      minWeight: Number(newRule.minWeight) || 0,
      maxWeight: Number(newRule.maxWeight) || 100,
      currency: newRule.currency || 'USD',
      isActive: true,
    }
    setRules([...rules, created])
    setShowAdd(false)
    setNewRule({ name: '', serviceType: 'DOMESTIC_STANDARD', zone: 'Domestic', baseRate: 0, perKgRate: 0, fuelSurcharge: 0, insuranceRate: 0, remoteAreaSurcharge: 0, minWeight: 0, maxWeight: 100, currency: 'USD', isActive: true })
  }

  const handleToggleActive = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)))
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this pricing rule?')) return
    setRules(rules.filter((r) => r.id !== id))
  }

  const RateField = ({ label, field, prefix = '$', suffix = '' }: { label: string; field: keyof PricingRule; prefix?: string; suffix?: string }) => (
    <div>
      <label className="block text-slate-400 font-bold mb-1 text-[10px]">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-slate-500 text-xs">{prefix}</span>}
        <input
          type="number"
          step="0.01"
          value={(editingRule as any)?.[field] ?? 0}
          onChange={(e) => setEditingRule({ ...editingRule!, [field]: parseFloat(e.target.value) || 0 })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#6B2737]"
        />
        {suffix && <span className="text-slate-500 text-xs">{suffix}</span>}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#6B2737]" />
            Tariffs &amp; Rate Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure base rates, per-kg surcharges, fuel levies, and service-type pricing rules.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
          <Plus className="w-4 h-4 mr-1.5" /> Add Rate Rule
        </Button>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4" /> Rate rule updated successfully.
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Rules', value: rules.filter((r) => r.isActive).length, color: 'text-emerald-400' },
          { label: 'Inactive Rules', value: rules.filter((r) => !r.isActive).length, color: 'text-slate-400' },
          { label: 'Lowest Base Rate', value: formatCurrency(Math.min(...rules.map((r) => r.baseRate))), color: 'text-blue-400' },
          { label: 'Highest Base Rate', value: formatCurrency(Math.max(...rules.map((r) => r.baseRate))), color: 'text-[#6B2737]' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Rate Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Rule Name &amp; Service</th>
                <th className="p-3">Zone</th>
                <th className="p-3">Base Rate</th>
                <th className="p-3">Per KG</th>
                <th className="p-3">Fuel %</th>
                <th className="p-3">Insurance %</th>
                <th className="p-3">Weight Range</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rules.map((r) => (
                <tr key={r.id} className={`hover:bg-slate-800/40 ${!r.isActive ? 'opacity-50' : ''}`}>
                  <td className="p-3">
                    <span className="font-bold text-white block">{r.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${serviceTypeColors[r.serviceType] || 'text-slate-300 bg-slate-800 border-slate-700'}`}>
                      {r.serviceType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{r.zone}</td>
                  <td className="p-3 font-bold text-emerald-400">{formatCurrency(r.baseRate)}</td>
                  <td className="p-3 text-slate-300">{formatCurrency(r.perKgRate)}/kg</td>
                  <td className="p-3 text-amber-400 font-bold">{r.fuelSurcharge}%</td>
                  <td className="p-3 text-slate-300">{r.insuranceRate}%</td>
                  <td className="p-3 text-slate-400">{r.minWeight}–{r.maxWeight} kg</td>
                  <td className="p-3">
                    <button onClick={() => handleToggleActive(r.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${r.isActive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-slate-400 bg-slate-800 border-slate-700'}`}>
                      {r.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <Button size="sm" onClick={() => setEditingRule({ ...r })} className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
                      <Edit3 className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-300 text-xs">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#6B2737]" /> Edit Rate Rule: {editingRule.name}
              </h2>
              <button onClick={() => setEditingRule(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-400 font-bold mb-1">Rule Name</label>
                  <input type="text" value={editingRule.name}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]" />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Service Type</label>
                  <select value={editingRule.serviceType}
                    onChange={(e) => setEditingRule({ ...editingRule, serviceType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none">
                    {['Standard Courier Service', 'Usual Courier Service', 'Over Night Express Service'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Zone</label>
                  <select value={editingRule.zone}
                    onChange={(e) => setEditingRule({ ...editingRule, zone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none">
                    {['Domestic','International','Regional','West Africa','Europe','North America'].map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
                <RateField label="Base Rate (USD)" field="baseRate" />
                <RateField label="Per KG Rate (USD)" field="perKgRate" />
                <RateField label="Fuel Surcharge (%)" field="fuelSurcharge" prefix="" suffix="%" />
                <RateField label="Insurance Rate (%)" field="insuranceRate" prefix="" suffix="%" />
                <RateField label="Remote Area Surcharge (USD)" field="remoteAreaSurcharge" />
                <RateField label="Min Weight (kg)" field="minWeight" prefix="" />
                <RateField label="Max Weight (kg)" field="maxWeight" prefix="" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setEditingRule(null)} className="text-slate-400 text-xs">Cancel</Button>
                <Button type="submit" className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
                  <Save className="w-3.5 h-3.5 mr-1" /> Save Rate Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#6B2737]" /> New Rate Rule
              </h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddRule} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Rule Name</label>
                <input type="text" required value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Service Type</label>
                  <select value={newRule.serviceType} onChange={(e) => setNewRule({ ...newRule, serviceType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none">
                    {['Standard Courier Service', 'Usual Courier Service', 'Over Night Express Service'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Base Rate ($)</label>
                  <input type="number" step="0.01" value={newRule.baseRate} onChange={(e) => setNewRule({ ...newRule, baseRate: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Per KG Rate ($)</label>
                  <input type="number" step="0.01" value={newRule.perKgRate} onChange={(e) => setNewRule({ ...newRule, perKgRate: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Fuel Surcharge (%)</label>
                  <input type="number" step="0.1" value={newRule.fuelSurcharge} onChange={(e) => setNewRule({ ...newRule, fuelSurcharge: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowAdd(false)} className="text-slate-400 text-xs">Cancel</Button>
                <Button type="submit" className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">Add Rule</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
