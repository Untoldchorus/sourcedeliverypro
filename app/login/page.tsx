'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Package, Lock, Mail, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid email or password. Please try again.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Unable to authenticate. Please check your credentials.')
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
          Sign In to Your Account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Or{' '}
          <Link href="/register" className="font-semibold text-[#6B2737] hover:underline">
            register for a new personal or commercial account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-600">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#6B2737] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
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
                'Sign In'
              )}
            </Button>
          </form>


        </div>
      </div>
    </div>
  )
}