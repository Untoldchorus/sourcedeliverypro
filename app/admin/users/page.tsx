'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, UserCheck, ShieldAlert, Key, Search, Lock, Edit3, Eye,
  AlertCircle, RefreshCw, X, CheckCircle2, Plus, Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: 'ACTIVE' | 'SUSPENDED' | 'LOCKED'
  lastLogin: string
  company?: string
  address?: string
}

export default function UserDirectoryPage() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([
    {
      id: 'usr-1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 555-0199',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      lastLogin: 'Sep 05, 2026',
      company: 'Personal Shipper',
      address: '450 Logistics Blvd, New York, US',
    },
    {
      id: 'usr-2',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.co.uk',
      phone: '+44 20 7946 0991',
      role: 'BUSINESS_CUSTOMER',
      status: 'ACTIVE',
      lastLogin: 'Sep 04, 2026',
      company: 'Global Retail UK',
      address: '12 Canary Wharf, London, GB',
    },
    {
      id: 'usr-3',
      name: 'Marcus Vance',
      email: 'driver@sourcedeliverypro.com',
      phone: '+49 30 123456',
      role: 'DRIVER',
      status: 'ACTIVE',
      lastLogin: 'Sep 06, 2026',
      company: 'SourceDeliveryPro Express Fleet',
      address: '100 Bay Street, Toronto, CA',
    },
    {
      id: 'usr-4',
      name: 'Hans Weber',
      email: 'h.weber@sourcedeliverypro.com',
      phone: '+49 69 987654',
      role: 'OPERATIONS_MANAGER',
      status: 'ACTIVE',
      lastLogin: 'Sep 06, 2026',
      company: 'Frankfurt Hub Command',
      address: 'Zeil 106, Frankfurt, DE',
    },
  ])

  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'CUSTOMER',
    company: '',
  })

  // Load persisted overrides if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sourcedeliverypro_admin_users') || localStorage.getItem('swiftship_admin_users')
      if (saved) {
        setUsers(JSON.parse(saved))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const persistUsers = (updated: AdminUser[]) => {
    setUsers(updated)
    try {
      localStorage.setItem('sourcedeliverypro_admin_users', JSON.stringify(updated))
      localStorage.setItem('swiftship_admin_users', JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    }
  }

  const handleImpersonate = (u: AdminUser) => {
    const sessionData = {
      isImpersonating: true,
      adminId: 'super-admin-1',
      adminName: 'Super Admin Officer',
      targetUserId: u.id,
      targetUserName: u.name,
      targetUserEmail: u.email,
      startTime: new Date().toLocaleTimeString(),
    }

    localStorage.setItem('sourcedeliverypro_impersonation', JSON.stringify(sessionData))
    localStorage.setItem('swiftship_impersonation', JSON.stringify(sessionData))
    alert(`Authorized Customer Impersonation mode started for ${u.name} (${u.email}). Audit log generated.`)
    router.push('/dashboard')
  }

  const handleToggleStatus = (id: string) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        const next = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
        return { ...u, status: next as any }
      }
      return u
    })
    persistUsers(updated)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    const updated = users.map((u) => (u.id === editingUser.id ? editingUser : u))
    persistUsers(updated)

    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
      setEditingUser(null)
    }, 1200)
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.name || !newUser.email) return

    const created: AdminUser = {
      id: 'usr-' + Date.now(),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || '+1 555-0000',
      role: newUser.role,
      status: 'ACTIVE',
      lastLogin: 'Just now',
      company: newUser.company || 'Direct Account',
    }

    const updated = [created, ...users]
    persistUsers(updated)
    setShowAddModal(false)
    setNewUser({ name: '', email: '', phone: '', role: 'CUSTOMER', company: '' })
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#6B2737]" />
            User & Customer Directory (`users.*`)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage personal identity, edit user account details, assign PBAC roles, and authorize customer impersonation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, or company..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
            />
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" /> Add New User
          </Button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">User & Company</th>
                <th className="p-3">Email & Phone</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last Activity</th>
                <th className="p-3 text-right">Master Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="p-3">
                    <span className="font-bold text-white block">{u.name}</span>
                    <span className="text-[10px] text-slate-400">{u.company || 'Personal Account'}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-slate-300 block">{u.email}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{u.phone}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-amber-400 border border-amber-400/20">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 font-mono">{u.lastLogin}</td>
                  <td className="p-3 text-right space-x-2">
                    <Button
                      size="sm"
                      onClick={() => setEditingUser({ ...u })}
                      className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs"
                      title="Edit User Details & Roles"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit User
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleImpersonate(u)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                      title="1-Click Customer Impersonation"
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1" /> Impersonate
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(u.id)}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                    >
                      {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Admin Control Panel
              </span>
              <h2 className="text-xl font-black text-white flex items-center gap-2 mt-1">
                <Edit3 className="w-5 h-5 text-[#6B2737]" />
                Edit User Details: {editingUser.name}
              </h2>
            </div>

            {saveSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                User details updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={editingUser.company || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">User Role (PBAC)</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="BUSINESS_CUSTOMER">BUSINESS_CUSTOMER</option>
                    <option value="DRIVER">DRIVER</option>
                    <option value="DISPATCHER">DISPATCHER</option>
                    <option value="WAREHOUSE_STAFF">WAREHOUSE_STAFF</option>
                    <option value="FINANCE_STAFF">FINANCE_STAFF</option>
                    <option value="OPERATIONS_MANAGER">OPERATIONS_MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Account Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="LOCKED">LOCKED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Primary Address</label>
                <input
                  type="text"
                  value={editingUser.address || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingUser(null)}
                  className="text-slate-400 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs"
                >
                  <Save className="w-3.5 h-3.5 mr-1" /> Save User Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#6B2737]" />
              Create New User Account
            </h2>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="BUSINESS_CUSTOMER">BUSINESS_CUSTOMER</option>
                  <option value="DRIVER">DRIVER</option>
                  <option value="OPERATIONS_MANAGER">OPERATIONS_MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="text-slate-400">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#6B2737] text-white font-bold">
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
