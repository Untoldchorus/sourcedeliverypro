'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, UserCheck, ShieldAlert, Key, Search, Lock, Edit3, Eye, EyeOff,
  AlertCircle, RefreshCw, X, CheckCircle2, Plus, Save, Trash2, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getDeletedUsers, addDeletedUser, removeDeletedUser } from '@/lib/payments/manualOptions'

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

const DEFAULT_USERS: AdminUser[] = [
  {
    id: 'usr-admin-1',
    name: 'Super Admin Officer',
    email: 'admin@sourcedeliverypro.com',
    phone: '(618) 368 1268',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    lastLogin: 'Today',
    company: 'SourceDeliveryPro Command Hub',
    address: '500 Capitol Mall, Sacramento, CA 95814',
  },
]

export default function UserDirectoryPage() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>(DEFAULT_USERS)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  // Edit User State
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Add User State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'CUSTOMER',
    company: '',
    password: '',
  })

  // Change Password State
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswordText, setShowPasswordText] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [passwordMsg, setPasswordMsg] = useState('')

  // Delete User State
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Load registered users from database & local overrides
  const loadUsers = async () => {
    setLoading(true)
    try {
      // 1. Fetch real users from DB
      const res = await fetch('/api/admin/users')
      const json = await res.json()
      const dbUsers: any[] = json.success && Array.isArray(json.data) ? json.data : []
      if (Array.isArray(json.deletedUsers)) {
        json.deletedUsers.forEach((d: string) => addDeletedUser(d))
      }
      const deleted = getDeletedUsers()

      // 2. Read local overrides
      const savedRaw = localStorage.getItem('sourcedeliverypro_admin_users') || localStorage.getItem('swiftship_admin_users')
      const localUsers: AdminUser[] = savedRaw ? JSON.parse(savedRaw) : []

      const mergedMap = new Map<string, AdminUser>()

      // Defaults (only if not deleted)
      DEFAULT_USERS.forEach((u) => {
        const uEmail = u.email.toLowerCase()
        const uId = u.id.toLowerCase()
        if (!deleted.includes(uEmail) && !deleted.includes(uId)) {
          mergedMap.set(uEmail, u)
        }
      })

        const legacyExcluded = [
          'admin@swiftship.io',
          'admin@example.com',
          'manager@sourcedeliverypro.com',
          'manager@swiftship.io',
          'driver@sourcedeliverypro.com',
          'driver@swiftship.io',
          'staff@sourcedeliverypro.com',
          'staff@swiftship.io',
          'finance@sourcedeliverypro.com',
          'finance@swiftship.io',
          'john@example.com',
        ]

        // Real users from database
        dbUsers.forEach((u: any) => {
          const key = (u.email || '').toLowerCase().trim()
          const uId = (u.id || '').toLowerCase().trim()
          if (key && !deleted.includes(key) && !deleted.includes(uId)) {
            // Exclude legacy mock user remnants
            if (legacyExcluded.includes(key)) return

            mergedMap.set(key, {
              id: u.id,
              name: u.name || key.split('@')[0],
              email: u.email,
              phone: u.phone || '—',
              role: key === 'admin@sourcedeliverypro.com' ? 'SUPER_ADMIN' : u.role || 'CUSTOMER',
              status: u.isSuspended ? 'SUSPENDED' : u.isActive === false ? 'LOCKED' : 'ACTIVE',
              lastLogin: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Recent',
              company: u.role === 'BUSINESS_CUSTOMER' ? 'Commercial Account' : 'Personal Shipper',
            })
          }
        })

        // Overlay local updates
        localUsers.forEach((u) => {
          if (u.email) {
            const key = u.email.toLowerCase().trim()
            const uId = (u.id || '').toLowerCase().trim()
            if (legacyExcluded.includes(key)) return
            if (!deleted.includes(key) && !deleted.includes(uId)) {
              const existing = mergedMap.get(key) || {}
              mergedMap.set(key, { ...existing, ...u })
            }
          }
        })

      setUsers(Array.from(mergedMap.values()))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
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

  // Impersonate
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
    alert(`Authorized Customer Impersonation session started for ${u.name} (${u.email}).`)
    router.push('/dashboard')
  }

  // Toggle Suspend
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

  // Save Edit
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

  // Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.name || !newUser.email) return

    const cleanEmail = newUser.email.toLowerCase().trim()
    removeDeletedUser(cleanEmail)

    const created: AdminUser = {
      id: 'usr-' + Date.now(),
      name: newUser.name,
      email: cleanEmail,
      phone: newUser.phone || '+1 555-0000',
      role: newUser.role,
      status: 'ACTIVE',
      lastLogin: 'Just now',
      company: newUser.company || 'Direct Account',
    }

    // Also call register API to persist into database
    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password || 'SourceDelivery@2026',
          phone: newUser.phone || '+1 555-0000',
          role: newUser.role,
        }),
      })
    } catch {}

    const updated = [created, ...users]
    persistUsers(updated)
    setShowAddModal(false)
    setNewUser({ name: '', email: '', phone: '', role: 'CUSTOMER', company: '', password: '' })
  }

  // Open Password Modal
  const openPasswordModal = (u: AdminUser) => {
    setPasswordUser(u)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordStatus('idle')
    setPasswordMsg('')
    setShowPasswordText(false)
  }

  // Change Password Action
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordUser) return

    if (newPassword.length < 6) {
      setPasswordStatus('error')
      setPasswordMsg('Password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus('error')
      setPasswordMsg('Passwords do not match.')
      return
    }

    setPasswordStatus('loading')
    try {
      const res = await fetch('/api/admin/users/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: passwordUser.id,
          email: passwordUser.email,
          newPassword,
        }),
      })

      const json = await res.json()
      if (json.success) {
        setPasswordStatus('success')
        setPasswordMsg(`Password for ${passwordUser.name} (${passwordUser.email}) updated successfully!`)
        setTimeout(() => {
          setPasswordUser(null)
          setPasswordStatus('idle')
        }, 2000)
      } else {
        setPasswordStatus('error')
        setPasswordMsg(json.error || 'Failed to update password.')
      }
    } catch (err: any) {
      setPasswordStatus('error')
      setPasswordMsg(err.message || 'Error communicating with server.')
    }
  }

  // Generate Random Password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$'
    let pwd = ''
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword(pwd)
    setConfirmPassword(pwd)
    setShowPasswordText(true)
  }

  // Delete User Action
  const handleDeleteUser = async () => {
    if (!userToDelete) return
    setDeleteLoading(true)

    try {
      if (userToDelete.email) addDeletedUser(userToDelete.email)
      if (userToDelete.id) addDeletedUser(userToDelete.id)

      // Call API to remove from database
      await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userToDelete.id, email: userToDelete.email }),
      })

      const updated = users.filter((u) => u.id !== userToDelete.id && u.email !== userToDelete.email)
      persistUsers(updated)
      setUserToDelete(null)
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setDeleteLoading(false)
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(search.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#6B2737]" />
            User &amp; Customer Management (`users.*`)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage registered accounts, reset user passwords, delete accounts, assign PBAC roles, and impersonate customers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, or role..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#6B2737]"
            />
          </div>

          <Button
            variant="outline"
            onClick={loadUsers}
            disabled={loading}
            className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" /> Add New User
          </Button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Registered Accounts Directory</h2>
          <span className="text-xs font-semibold text-slate-400">{filtered.length} Accounts Found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">User &amp; Company</th>
                <th className="p-3">Email &amp; Phone</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Activity</th>
                <th className="p-3 text-right">Master Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((u) => (
                <tr key={u.id || u.email} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <span className="font-bold text-white block text-sm">{u.name}</span>
                    <span className="text-[10px] text-slate-400">{u.company || 'Personal Shipper'}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-slate-200 block font-medium">{u.email}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{u.phone}</span>
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
                  <td className="p-3 text-slate-400 font-mono text-[11px]">{u.lastLogin}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {/* Change Password */}
                      <Button
                        size="sm"
                        onClick={() => openPasswordModal(u)}
                        className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-slate-700"
                        title="Change / Reset User Password"
                      >
                        <Key className="w-3.5 h-3.5 mr-1" /> Password
                      </Button>

                      {/* Edit User */}
                      <Button
                        size="sm"
                        onClick={() => setEditingUser({ ...u })}
                        className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs"
                        title="Edit User Details & Roles"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>

                      {/* Impersonate */}
                      <Button
                        size="sm"
                        onClick={() => handleImpersonate(u)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                        title="1-Click Customer Impersonation"
                      >
                        <UserCheck className="w-3.5 h-3.5 mr-1" /> Login As
                      </Button>

                      {/* Suspend / Activate */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(u.id)}
                        className="border-slate-800 text-slate-400 hover:bg-slate-800 text-xs"
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </Button>

                      {/* Delete Account */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setUserToDelete(u)}
                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 text-xs p-2"
                        title="Permanently Delete User Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No users matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Change / Reset Password ──────────────────────────────────── */}
      {passwordUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setPasswordUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Security Administration
              </span>
              <h2 className="text-lg font-black text-white flex items-center gap-2 mt-1">
                <Key className="w-5 h-5 text-amber-400" />
                Change Password for {passwordUser.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{passwordUser.email}</p>
            </div>

            {passwordStatus === 'success' && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordMsg}</span>
              </div>
            )}

            {passwordStatus === 'error' && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-bold">New Password</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-amber-400 hover:underline font-semibold"
                  >
                    🎲 Generate Strong Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white pr-10 focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Confirm New Password</label>
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password to confirm..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPasswordUser(null)}
                  className="text-slate-400 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={passwordStatus === 'loading'}
                  className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs"
                >
                  {passwordStatus === 'loading' ? (
                    <><RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-3.5 h-3.5 mr-1" /> Update Password</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Delete User Account ──────────────────────────────────────── */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-white">Delete User Account?</h2>
              <p className="text-xs text-slate-400">
                Are you sure you want to permanently delete the account for{' '}
                <strong className="text-white">{userToDelete.name}</strong> ({userToDelete.email})?
              </p>
              <p className="text-[11px] text-red-400/80 pt-1">
                This action will remove their profile and credentials. It cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUserToDelete(null)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete Account'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Edit User Details ────────────────────────────────────────── */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
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
                  className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold text-xs"
                >
                  <Save className="w-3.5 h-3.5 mr-1" /> Save User Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Create New User ──────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
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
                  placeholder="e.g. Samuel Aka"
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
                  placeholder="e.g. saka@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Initial Password</label>
                <input
                  type="text"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Default: SourceDelivery@2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="+1 555-0100"
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
                <Button type="submit" className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold">
                  Create User Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
