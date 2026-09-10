import { Plane, Truck, Ship, Globe, Clock, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ServicesPage() {
  const services = [
    {
      icon: Truck,
      title: 'Standard Courier Service',
      speed: '3-5 Business Days',
      desc: 'Reliable and economical door-to-door courier delivery with continuous tracking and electronic proof-of-delivery.',
    },
    {
      icon: Plane,
      title: 'Usual Courier Service',
      speed: '2-3 Business Days',
      desc: 'Everyday prompt scheduled courier transit for commercial packages, priority cartons, and time-sensitive documents.',
    },
    {
      icon: Clock,
      title: 'Over Night Express Service',
      speed: 'Next Morning Delivery',
      desc: 'Top-priority expedited courier handling and flight dispatch for urgent overnight door-to-door delivery.',
    },
    {
      icon: Globe,
      title: 'Customs Clearance & Brokerage',
      speed: 'Continuous Processing',
      desc: 'Direct EDI customs clearance interfaces, automated HS code classification, and prepaid tariff and duties settlements.',
    },
  ]

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6B2737]">Services Portfolio</span>
        <h1 className="text-4xl font-black text-[#1B2A4A] mt-2 mb-4 tracking-tight">
          Comprehensive Logistics Solutions
        </h1>
        <p className="text-slate-600 text-base">
          Every parcel, document, and cargo pallet moves through our strictly monitored global transportation pipeline.
        </p>
      </div>

      <div className="rounded-3xl overflow-hidden shadow-xl aspect-video border mb-16" style={{ borderColor: '#DDD0C8' }}>
        <img src="/images/services_hero.jpg" alt="SourceDeliveryPro Multi-modal Logistics" className="w-full h-full object-cover" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((s, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#6B2737] flex items-center justify-center">
                <s.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">{s.speed}</span>
            </div>
            <h3 className="text-xl font-bold text-[#1B2A4A]">{s.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            <div className="pt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/shipping/quote">Estimate Rate</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}