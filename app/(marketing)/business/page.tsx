import { Building, UploadCloud, Users, Key, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function BusinessPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6B2737]">Commercial Shipping</span>
        <h1 className="text-4xl font-black text-[#1B2A4A] mt-2 mb-4 tracking-tight">
          SourceDeliveryPro for High-Volume Businesses
        </h1>
        <p className="text-slate-600 text-base">
          Scalable logistics infrastructure for e-commerce retailers, global manufacturers, and enterprise supply chains.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button asChild className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold">
            <Link href="/register">Open Commercial Account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Speak With Enterprise Sales</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <UploadCloud className="w-8 h-8 text-[#6B2737]" />
          <h3 className="font-bold text-lg text-[#1B2A4A]">Bulk CSV Consignments</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Upload thousands of orders in seconds. Automated address validation, tariff calculation, and batch shipping label downloads.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <Key className="w-8 h-8 text-blue-600" />
          <h3 className="font-bold text-lg text-[#1B2A4A]">Developer APIs</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Embed real-time shipping rate calculators, programmatic label generation, and webhook event streaming straight into your ERP or store.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <BarChart3 className="w-8 h-8 text-emerald-600" />
          <h3 className="font-bold text-lg text-[#1B2A4A]">Dedicated Account Management</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Volume-based pricing discounts, credit invoicing with net-30 terms, and dedicated operations dispatchers.
          </p>
        </div>
      </div>
    </div>
  )
}