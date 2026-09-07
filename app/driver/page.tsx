import { Truck, MapPin, CheckCircle2, AlertTriangle, Clock, Phone, Navigation, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DriverPortalPage() {
  const deliveries = [
    {
      trackingNumber: 'SDP8F4K92LM381',
      recipient: 'Sarah Jenkins',
      address: '12 Canary Wharf, Floor 4, London E14 5AB',
      phone: '+44 20 7946 0991',
      instructions: 'Deliver to reception. Signature required.',
      status: 'OUT_FOR_DELIVERY',
      eta: '11:45 AM',
    },
    {
      trackingNumber: 'UA99K883ZZ102',
      recipient: 'David Miller',
      address: '45 Kensington High St, London W8 5ED',
      phone: '+44 20 7946 0882',
      instructions: 'Ring bell #3. Leave with concierge if unavailable.',
      status: 'SCHEDULED',
      eta: '01:15 PM',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-[#1B2A4A] text-white p-6 rounded-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#6B2737] flex items-center justify-center font-bold">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Driver Dispatch & Delivery Manifest</h1>
              <p className="text-xs text-slate-400">Route #RTE-88192 · Active Shift</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
            Route Active
          </span>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-sm text-slate-700 uppercase tracking-wider">Assigned Stops (Today)</h2>
          {deliveries.map((d) => (
            <div key={d.trackingNumber} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-[#6B2737]">{d.trackingNumber}</span>
                  <h3 className="text-lg font-bold text-[#1B2A4A] mt-0.5">{d.recipient}</h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
                  ETA: {d.eta}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#6B2737] shrink-0" />
                  {d.address}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  {d.phone}
                </p>
                <p className="bg-amber-50 text-amber-800 p-2.5 rounded-lg border border-amber-200/60 mt-2">
                  <strong>Instructions:</strong> {d.instructions}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Complete Delivery & Signature
                </Button>
                <Button variant="outline" className="text-xs border-slate-300">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-red-500" /> Mark Delivery Exception
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}