'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Package, Mail, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError(null)

    try {
      // Simulate reset request
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
    } catch (err) {
      setError('An error occurred requesting password reset.')
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
          Reset Your Password
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your account email to receive a password reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1B2A4A]">Reset Link Sent</h3>
              <p className="text-xs text-slate-500">
                If an account exists for <span className="font-semibold text-slate-800">{email}</span>, we have sent instructions to reset your password.
              </p>
              <Button asChild className="w-full bg-[#1B2A4A] hover:bg-[#13233D] text-white">
                <Link href="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                    placeholder="name@company.com"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold py-3 h-auto shadow-md"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs font-semibold text-slate-500 hover:text-[#6B2737] inline-flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
