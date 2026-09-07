import { Warehouse, Scan, ArrowRightLeft, ShieldAlert, CheckCircle, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function StaffWarehousePortalPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-[#1B2A4A] text-white p-6 rounded-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#6B2737] flex items-center justify-center font-bold">
              <Warehouse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Sorting Facility & Hub Scanner Portal</h1>
              <p className="text-xs text-slate-400">JFK International Gateway Hub · NYC-HUB-01</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full">
            Scanner Ready
          </span>
        </div>

        {/* Scan package form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-2xl mx-auto">
          <h2 className="font-bold text-base text-[#1B2A4A] flex items-center gap-2">
            <Scan className="w-5 h-5 text-[#6B2737]" />
            Scan Parcel Barcode / QR Code
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Scan barcode (e.g. SDP8F4K92LM381)"
              className="flex-1 px-4 py-3 rounded-lg border border-slate-300 font-mono text-sm uppercase focus:ring-2 focus:ring-[#6B2737] focus:outline-none"
            />
            <Button className="bg-[#6B2737] hover:bg-[#E85A24] text-white font-bold px-6">
              Process Scan
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <Button variant="outline" size="sm" className="text-xs">Arrived at Hub</Button>
            <Button variant="outline" size="sm" className="text-xs">Departed Hub</Button>
            <Button variant="outline" size="sm" className="text-xs">Customs Cleared</Button>
            <Button variant="outline" size="sm" className="text-xs">Loaded on Van</Button>
          </div>
        </div>
      </div>
    </div>
  )
}