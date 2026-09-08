import Link from 'next/link'
import {
  Users, Package, DollarSign, Truck, AlertTriangle, ShieldCheck,
  TrendingUp, BarChart3, Settings, FileText, ArrowRight, User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboardPage() {
  let userCount = 0
  let shipmentCount = 0
  let pendingPayments = 0
  let activeExceptions = 0
  let totalRevenue = 0
  let recentShipments: any[] = []

  try {
    userCount = await db.user.count()
    shipmentCount = await db.shipment.count()
    pendingPayments = await db.payment.count({
      where: { status: { in: ['PENDING', 'PROCESSING'] } },
    })
    activeExceptions = await db.shipmentException.count({ where: { isResolved: false } })
    const paidSum = await db.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    })
    totalRevenue = Number(paidSum._sum.amount || 0)

    recentShipments = await db.shipment.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        customer: {
          select: {
            id: true,
            customerNumber: true,
            companyName: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        payment: true,
      },
    })
  } catch (e) {
    console.error('AdminDashboardPage db.shipment.findMany error:', e)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#6B2737]" />
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Enterprise Operations Command Center
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Global parcel telemetry, RBAC administration, tariff engine, and dispatch exception management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold">
              <Link href="/shipping">Book Consignment</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
              <Link href="/dashboard">Customer View</Link>
            </Button>
          </div>
        </div>

        {/* Core Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Revenue</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(totalRevenue)}</div>
            <span className="text-[11px] text-slate-500">Settled through gateway</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase">All Consignments</span>
            <div className="text-2xl font-black text-white mt-1">{shipmentCount}</div>
            <span className="text-[11px] text-slate-500">Domestic &amp; cross-border</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase">Registered Users</span>
            <div className="text-2xl font-black text-[#6B2737] mt-1">{userCount}</div>
            <span className="text-[11px] text-slate-500">Customers &amp; Staff</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase">Awaiting Confirmation</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{pendingPayments}</div>
            <span className="text-[11px] text-slate-500">Payments awaiting approval</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Exceptions</span>
            <div className="text-2xl font-black text-red-400 mt-1">{activeExceptions}</div>
            <span className="text-[11px] text-slate-500">Requires dispatcher action</span>
          </div>
        </div>

        {/* Global Operations Table */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-700 flex justify-between items-center">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-[#6B2737]" />
              Real-Time Global Shipments Feed
            </h2>
            <span className="text-xs text-slate-400">Live telemetry updated from database</span>
          </div>

          {recentShipments.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No shipments currently registered in system database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-4">Tracking ID</th>
                    <th className="p-4">Booked By (User)</th>
                    <th className="p-4">Sender Hub</th>
                    <th className="p-4">Destination</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Weight</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {recentShipments.map((s) => {
                    const creatorName = s.createdBy?.name || s.customer?.user?.name || s.customer?.companyName || s.senderName || 'Customer'
                    const creatorEmail = s.createdBy?.email || s.customer?.user?.email || s.senderEmail || ''
                    const isAwaitingVerification = s.status === 'PROCESSING' || s.payment?.status === 'PROCESSING'

                    return (
                      <tr key={s.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#FF6B35]">
                          <Link href={`/admin/shipments/${s.id}`} className="hover:underline">
                            {s.trackingNumber}
                          </Link>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">
                              {creatorName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-white block text-xs">
                                {creatorName}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {creatorEmail || 'Verified User'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{s.senderCity}, {s.senderCountry}</td>
                        <td className="p-4 font-medium text-white">{s.recipientCity}, {s.recipientCountry}</td>
                        <td className="p-4">{s.serviceType?.replace(/_/g, ' ')}</td>
                        <td className="p-4 font-mono">{Number(s.weight)} kg</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isAwaitingVerification
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : s.status === 'DELIVERED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : s.status === 'IN_TRANSIT'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            {isAwaitingVerification ? 'PAYMENT SUBMITTED' : s.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-emerald-400">{formatCurrency(Number(s.totalAmount))}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}