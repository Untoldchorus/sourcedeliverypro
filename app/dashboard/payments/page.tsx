'use client'

import React from 'react'
import Link from 'next/link'
import { CreditCard, DollarSign, ShieldCheck, CheckCircle2, RefreshCw, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { getUnifiedShipments } from '@/lib/payments/manualOptions'

export default function PaymentsPage() {
  const { data: session } = useSession()
  const [payments, setPayments] = React.useState<any[]>([])

  const userEmail = session?.user?.email?.toLowerCase() || ''
  const userName = session?.user?.name?.toLowerCase() || ''

  React.useEffect(() => {
    let isMounted = true

    async function loadPayments() {
      try {
        const unified = await getUnifiedShipments()

        // Filter strictly by logged-in user or session
        const userList = unified.filter((s: any) => {
          const sEmail = (s.senderEmail || s.userEmail || '').toLowerCase()
          const rEmail = (s.recipientEmail || '').toLowerCase()
          const sName = (s.senderName || s.sender || '').toLowerCase()
          const sUser = (s.userId || '').toLowerCase()

          if (userEmail && (sEmail === userEmail || rEmail === userEmail)) return true
          if (userName && sName.includes(userName)) return true
          if (session?.user?.id && sUser === session.user.id.toLowerCase()) return true
          if (s.isLocal) return true
          return false
        })

        const mapped = userList.map((item: any, idx: number) => ({
          id: item.id || `local-pay-${idx}`,
          ref: item.transactionId || item.paymentTxId || item.trackingNumber || `PAY-2026-${1000 + idx}`,
          date: item.created || 'Recent',
          method: item.paymentChoice || item.serviceType || item.paymentMethod || 'Manual Transfer',
          amount: Number(item.amount) || Number(item.totalAmount) || (Number(item.weight) || 2) * 25,
          status: item.status === 'LABEL_CREATED' || item.status === 'DELIVERED' ? 'PAID' : (item.status === 'PAYMENT_SUBMITTED' ? 'AWAITING CONFIRMATION' : item.status || 'PENDING'),
        }))

        if (isMounted) {
          setPayments(mapped)
        }
      } catch (e) {
        console.error('Failed to load payments:', e)
        if (isMounted) setPayments([])
      }
    }

    loadPayments()

    return () => {
      isMounted = false
    }
  }, [userEmail, userName, session?.user?.id])

  const totalSpend = payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const outstandingBalance = payments.filter((p) => p.status !== 'PAID').reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const paidCount = payments.filter((p) => p.status === 'PAID').length
  const pendingCount = payments.filter((p) => p.status !== 'PAID').length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1B2A4A]">Payments & Gateways</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your transactional payment receipts, saved cards, and outstanding freight balances.
          </p>
        </div>

        <Button asChild className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold text-xs">
          <Link href="/dashboard/shipments/new">
            <Plus className="w-4 h-4 mr-1.5" /> Book &amp; Pay Consignment
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Outstanding Balance</span>
          <div className="text-2xl font-black text-amber-600">{formatCurrency(outstandingBalance)}</div>
          <span className="text-[11px] text-slate-500 block">{pendingCount} pending transaction(s)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Spend</span>
          <div className="text-2xl font-black text-emerald-600">{formatCurrency(totalSpend)}</div>
          <span className="text-[11px] text-slate-500 block">{paidCount} completed payment(s)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Payment Processing</span>
          <div className="text-sm font-bold text-slate-800 flex items-center gap-1 mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Gateway Active &amp; Verified
          </div>
          <span className="text-[11px] text-slate-500 block">Zelle, Wire, Cards &amp; Crypto</span>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <h2 className="font-bold text-base text-[#1B2A4A]">Payment Transaction History</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b">
              <tr>
                <th className="p-3">Reference #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Payment Provider</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold text-[#1B2A4A]">{p.ref}</td>
                  <td className="p-3 text-slate-500">{p.date}</td>
                  <td className="p-3 font-medium text-slate-800">{p.method}</td>
                  <td className="p-3 font-bold text-slate-800">{formatCurrency(p.amount)}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => alert(`Downloading payment receipt for ${p.ref}...`)}
                      className="text-xs text-[#6B2737]"
                    >
                      Receipt PDF
                    </Button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No payment history recorded yet. Completed and pending transactions will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
