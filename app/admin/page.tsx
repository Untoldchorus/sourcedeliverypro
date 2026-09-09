import Link from 'next/link'
import {
  Users, Package, DollarSign, Truck, AlertTriangle, ShieldCheck,
  TrendingUp, BarChart3, Settings, FileText, ArrowRight, User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import RealTimeShipmentsFeed from '@/components/admin/RealTimeShipmentsFeed'

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

          <RealTimeShipmentsFeed initialShipments={JSON.parse(JSON.stringify(recentShipments))} />
        </div>
      </div>
    </div>
  )
}