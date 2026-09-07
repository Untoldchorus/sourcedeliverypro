'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Lock, Mail, User, Phone, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
    acceptTerms: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()
      if (!json.success) {
        setError(json.error?.message || 'Registration failed')
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 2000)
      }
    } catch (err) {
      setError('An error occurred during registration.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#6B2737] flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20">
            <Package className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-[#1B2A4A]">
            SourceDelivery<span className="text-[#6B2737]">Pro</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black text-[#1B2A4A] tracking-tight">
          Create Your SourceDeliveryPro Account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#6B2737] hover:underline">
            Sign In
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Account created! Redirecting to login...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'CUSTOMER' })}
                  className={cn(
                    'py-2 text-xs font-bold rounded-lg border transition',
                    formData.role === 'CUSTOMER'
                      ? 'border-[#6B2737] bg-orange-50/50 text-[#6B2737]'
                      : 'border-slate-200 text-slate-600'
                  )}
                >
                  Personal Shipper
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'BUSINESS_CUSTOMER' })}
                  className={cn(
                    'py-2 text-xs font-bold rounded-lg border transition',
                    formData.role === 'BUSINESS_CUSTOMER'
                      ? 'border-[#6B2737] bg-orange-50/50 text-[#6B2737]'
                      : 'border-slate-200 text-slate-600'
                  )}
                >
                  Business / Freight
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold py-3 h-auto shadow-md"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                'Create SourceDeliveryPro Account'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}