'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { User, Mail, Phone, MapPin, ShieldCheck, Lock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UserProfilePage() {
  const { data: session } = useSession()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('United States (US)')
  const [profileSaved, setProfileSaved] = useState(false)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [passwordMsg, setPasswordMsg] = useState('')

  useEffect(() => {
    if (session?.user) {
      const userEmail = session.user.email || ''
      const savedProfileRaw = localStorage.getItem(`sdp_profile_${userEmail}`)
      if (savedProfileRaw) {
        try {
          const parsed = JSON.parse(savedProfileRaw)
          setName(parsed.name || session.user.name || '')
          setEmail(parsed.email || session.user.email || '')
          setPhone(parsed.phone || '')
          setCountry(parsed.country || 'United States (US)')
          return
        } catch {}
      }

      setName(session.user.name || '')
      setEmail(session.user.email || '')
    }
  }, [session])

  const displayName = name || session?.user?.name || 'Customer'
  const displayEmail = email || session?.user?.email || 'customer@sourcedeliverypro.com'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CP'

  const customerId = session?.user?.id
    ? `CST-${session.user.id.slice(-6).toUpperCase()}`
    : `CST-${Math.abs(displayEmail.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) % 900000 + 100000)}`

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (session?.user?.email) {
      const dataToSave = { name, email, phone, country }
      localStorage.setItem(`sdp_profile_${session.user.email}`, JSON.stringify(dataToSave))

      try {
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone }),
        })
      } catch (err) {
        console.warn('Could not sync profile to DB:', err)
      }
    }
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setPasswordStatus('error')
      setPasswordMsg('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus('error')
      setPasswordMsg('Passwords do not match.')
      return
    }

    setPasswordStatus('loading')
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (data.success) {
        setPasswordStatus('success')
        setPasswordMsg('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordStatus('idle'), 3500)
      } else {
        setPasswordStatus('error')
        setPasswordMsg(data.error || 'Failed to change password.')
      }
    } catch (err: any) {
      setPasswordStatus('error')
      setPasswordMsg(err.message || 'Error communicating with server.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1B2A4A]">Account Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your personal identity, default country, and authentication credentials.</p>
      </div>

      {profileSaved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Profile Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#1B2A4A] text-[#6B2737] font-black text-xl flex items-center justify-center shadow-md">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1B2A4A]">{displayName}</h2>
            <p className="text-xs text-slate-500">Personal Shipper • Customer ID: {customerId}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 555-0199"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Default Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United States (US)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <Button type="submit" className="bg-[#6B2737] hover:bg-[#521b28] text-white font-bold">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="border-b pb-3">
          <h2 className="text-base font-bold text-[#1B2A4A] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#6B2737]" /> Change Account Password
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Ensure your account uses a secure, strong password.</p>
        </div>

        {passwordStatus === 'success' && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordMsg}</span>
          </div>
        )}

        {passwordStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{passwordMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={passwordStatus === 'loading'}
              className="bg-[#1B2A4A] hover:bg-[#243660] text-white font-bold text-xs"
            >
              {passwordStatus === 'loading' ? (
                <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Updating...</>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
