import { ShieldCheck, Globe, Users, Award, Building, Package, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6B2737]">About SourceDeliveryPro</span>
        <h1 className="text-4xl font-black text-[#1B2A4A] mt-2 mb-4 tracking-tight">
          The Logistics Backbone of Global Commerce
        </h1>
        <p className="text-slate-600 leading-relaxed text-base">
          Founded with a clear mandate to bring speed, transparency, and deep infrastructural reliability to global shipping, SourceDeliveryPro manages priority cross-border transport networks spanning North America, Europe, Africa, Asia, and the Middle East.
        </p>
      </div>

      <div className="rounded-3xl overflow-hidden shadow-xl aspect-video border" style={{ borderColor: '#DDD0C8' }}>
        <img src="/images/about_hero.jpg" alt="SourceDeliveryPro Global Headquarters" className="w-full h-full object-cover" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm">
          <Globe className="w-8 h-8 text-[#6B2737] mb-4" />
          <h3 className="font-bold text-lg text-[#1B2A4A] mb-2">Our Global Network</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Direct airline partnerships, private sort centers, and regional hubs facilitate fast hand-offs with strict SLA compliance.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm">
          <ShieldCheck className="w-8 h-8 text-blue-600 mb-4" />
          <h3 className="font-bold text-lg text-[#1B2A4A] mb-2">Security & Custody</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Tamper-evident seals, continuous CCTV tracking, GPS route telemetry, and electronic signature confirmations on every delivery.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm">
          <Award className="w-8 h-8 text-emerald-600 mb-4" />
          <h3 className="font-bold text-lg text-[#1B2A4A] mb-2">Customer Commitment</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            24/7 bilingual dispatch agents and transparent online tracking ensure your cargo never leaves your sight.
          </p>
        </div>
      </div>
    </div>
  )
}