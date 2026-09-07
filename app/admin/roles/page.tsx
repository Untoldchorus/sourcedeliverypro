'use client'

import React, { useState } from 'react'
import { Key, Plus, Shield, Check, Copy, Trash2, Edit3, Lock, CheckSquare, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PERMISSIONS, ROLE_PERMISSIONS, PermissionScope } from '@/lib/auth/permissions'

interface CustomRole {
  id: string
  name: string
  description: string
  scope: PermissionScope
  permissions: string[]
  isSystemDefault?: boolean
}

const permissionGroups = [
  {
    category: 'Users & Customers',
    keys: [
      PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_EDIT,
      PERMISSIONS.USERS_DELETE, PERMISSIONS.USERS_SUSPEND, PERMISSIONS.USERS_IMPERSONATE,
      PERMISSIONS.USERS_RESET_PASSWORD, PERMISSIONS.USERS_CHANGE_ROLE,
    ],
  },
  {
    category: 'Shipments & Edit Everything',
    keys: [
      PERMISSIONS.SHIPMENTS_VIEW, PERMISSIONS.SHIPMENTS_CREATE, PERMISSIONS.SHIPMENTS_EDIT,
      PERMISSIONS.SHIPMENTS_DELETE, PERMISSIONS.SHIPMENTS_CANCEL, PERMISSIONS.SHIPMENTS_ASSIGN,
      PERMISSIONS.SHIPMENTS_CHANGE_STATUS, PERMISSIONS.SHIPMENTS_CHANGE_PRICE,
    ],
  },
  {
    category: 'Tracking Overrides',
    keys: [
      PERMISSIONS.TRACKING_VIEW, PERMISSIONS.TRACKING_ADD_EVENT, PERMISSIONS.TRACKING_EDIT_EVENT,
      PERMISSIONS.TRACKING_OVERRIDE_STATUS, PERMISSIONS.TRACKING_CORRECT_LOCATION,
    ],
  },
  {
    category: 'Receipts Engine',
    keys: [
      PERMISSIONS.RECEIPTS_VIEW, PERMISSIONS.RECEIPTS_GENERATE, PERMISSIONS.RECEIPTS_EDIT,
      PERMISSIONS.RECEIPTS_VOID, PERMISSIONS.RECEIPTS_DOWNLOAD,
    ],
  },
  {
    category: 'Payments & Refunds Workflow',
    keys: [
      PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_VERIFY, PERMISSIONS.PAYMENTS_MARK_PAID,
      PERMISSIONS.REFUNDS_VIEW, PERMISSIONS.REFUNDS_CREATE, PERMISSIONS.REFUNDS_APPROVE, PERMISSIONS.REFUNDS_EXECUTE,
    ],
  },
  {
    category: 'Fleet & Hub Operations',
    keys: [
      PERMISSIONS.DRIVERS_VIEW, PERMISSIONS.DRIVERS_ASSIGN, PERMISSIONS.FACILITIES_VIEW,
      PERMISSIONS.DISPATCH_VIEW, PERMISSIONS.WAREHOUSE_VIEW, PERMISSIONS.WAREHOUSE_SCAN,
    ],
  },
]

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<CustomRole[]>([
    {
      id: 'role-1',
      name: 'SUPER_ADMIN',
      description: 'Complete unrestricted access across all systems and settings.',
      scope: 'GLOBAL',
      permissions: Object.values(PERMISSIONS),
      isSystemDefault: true,
    },
    {
      id: 'role-2',
      name: 'Operations Manager',
      description: 'Manages daily logistics, dispatch routes, drivers, and exceptions.',
      scope: 'FACILITY',
      permissions: ROLE_PERMISSIONS['OPERATIONS_ADMIN'] || [],
    },
    {
      id: 'role-3',
      name: 'Finance Reviewer',
      description: 'Generates receipts, verifies payments, and requests refunds.',
      scope: 'DEPARTMENT',
      permissions: ROLE_PERMISSIONS['FINANCE_STAFF'] || [],
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Partial<CustomRole>>({
    name: '',
    description: '',
    scope: 'GLOBAL',
    permissions: [],
  })

  const togglePermission = (permKey: string) => {
    const current = editingRole.permissions || []
    if (current.includes(permKey)) {
      setEditingRole({ ...editingRole, permissions: current.filter((p) => p !== permKey) })
    } else {
      setEditingRole({ ...editingRole, permissions: [...current, permKey] })
    }
  }

  const selectGroupAll = (groupKeys: string[]) => {
    const current = editingRole.permissions || []
    const combined = Array.from(new Set([...current, ...groupKeys]))
    setEditingRole({ ...editingRole, permissions: combined })
  }

  const clearGroupAll = (groupKeys: string[]) => {
    const current = editingRole.permissions || []
    setEditingRole({ ...editingRole, permissions: current.filter((p) => !groupKeys.includes(p)) })
  }

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRole.name) return

    const newRole: CustomRole = {
      id: editingRole.id || 'role-' + Date.now(),
      name: editingRole.name,
      description: editingRole.description || '',
      scope: editingRole.scope || 'GLOBAL',
      permissions: editingRole.permissions || [],
    }

    if (editingRole.id) {
      setRoles(roles.map((r) => (r.id === editingRole.id ? newRole : r)))
    } else {
      setRoles([...roles, newRole])
    }

    setShowModal(false)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Key className="w-6 h-6 text-[#6B2737]" />
            Role-Based & Permission-Based Control Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure custom administrative roles, assign resource.action permissions, and define operational scopes.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingRole({ name: '', description: '', scope: 'GLOBAL', permissions: [] })
            setShowModal(true)
          }}
          className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Create Custom Role
        </Button>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((r) => (
          <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{r.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-400/20">
                  {r.scope} SCOPE
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{r.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{r.permissions.length} Permissions Active</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingRole(r)
                    setShowModal(true)
                  }}
                  className="text-slate-400 hover:text-white p-1"
                  title="Edit Role & Permissions"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Role Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white">Configure Role & Granular Permissions</h2>

            <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Role Title</label>
                  <input
                    type="text"
                    value={editingRole.name}
                    onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                    placeholder="e.g. Lagos Facility Dispatcher"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Permission Scope</label>
                  <select
                    value={editingRole.scope}
                    onChange={(e) => setEditingRole({ ...editingRole, scope: e.target.value as PermissionScope })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="GLOBAL">GLOBAL — All system records</option>
                    <option value="REGION">REGION — Regional hub jurisdiction</option>
                    <option value="FACILITY">FACILITY — Single warehouse/facility</option>
                    <option value="DEPARTMENT">DEPARTMENT — Finance or Support dept</option>
                    <option value="ASSIGNED">ASSIGNED — Explicitly assigned items</option>
                    <option value="OWN">OWN — Own created records</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Role Description</label>
                <input
                  type="text"
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  placeholder="Summary of responsibilities..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              {/* Permission Check Matrix */}
              <div className="space-y-4 pt-2">
                <span className="font-bold text-slate-200 block border-b border-slate-800 pb-2">
                  Granular Permission Matrix (`resource.action`)
                </span>

                {permissionGroups.map((grp, gIdx) => (
                  <div key={gIdx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400">{grp.category}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => selectGroupAll(grp.keys)}
                          className="text-[10px] text-emerald-400 font-bold hover:underline"
                        >
                          Select All
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                          type="button"
                          onClick={() => clearGroupAll(grp.keys)}
                          className="text-[10px] text-slate-500 font-bold hover:underline"
                        >
                          Clear Group
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                      {grp.keys.map((k) => {
                        const checked = (editingRole.permissions || []).includes(k)
                        return (
                          <label
                            key={k}
                            onClick={() => togglePermission(k)}
                            className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer border transition text-[11px] font-mono ${
                              checked ? 'bg-[#6B2737]/10 border-[#6B2737] text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {checked ? <CheckSquare className="w-4 h-4 text-[#6B2737]" /> : <Square className="w-4 h-4 text-slate-600" />}
                            <span>{k}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="border-slate-800 text-slate-400">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold">
                  Save Role Permissions
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
