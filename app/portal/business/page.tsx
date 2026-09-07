import { Building, UploadCloud, Users, Key, Download, Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BusinessPortalPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-[#1B2A4A] text-white p-6 rounded-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#6B2737] flex items-center justify-center font-bold">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Commercial Shipper Portal</h1>
              <p className="text-xs text-slate-400">Enterprise Wholesale Freight & API Consignments</p>
            </div>
          </div>
          <Button className="bg-[#6B2737] hover:bg-[#E85A24] text-white text-xs font-bold">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Bulk CSV Manifest
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <UploadCloud className="w-8 h-8 text-[#6B2737]" />
            <h3 className="font-bold text-base text-[#1B2A4A]">Bulk Dispatch</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload standard CSV files to generate multi-consignee labels with one click.
            </p>
            <Button variant="outline" size="sm" className="text-xs w-full">
              Download CSV Template
            </Button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <Key className="w-8 h-8 text-blue-600" />
            <h3 className="font-bold text-base text-[#1B2A4A]">API Access Keys</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Integrate SourceDeliveryPro checkout rate calculation and auto-tracking into your shop.
            </p>
            <Button variant="outline" size="sm" className="text-xs w-full">
              Manage API Secrets
            </Button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <Users className="w-8 h-8 text-emerald-600" />
            <h3 className="font-bold text-base text-[#1B2A4A]">Team Management</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Assign permissions to shipping managers, finance staff, and warehouse dispatchers.
            </p>
            <Button variant="outline" size="sm" className="text-xs w-full">
              Manage Team Members
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}