import Link from 'next/link'
import { Package, ShieldCheck, Globe, Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#1B2A4A] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#6B2737] flex items-center justify-center text-white font-bold">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                SourceDelivery<span className="text-[#6B2737]">Pro</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm">
              Empowering cross-border commerce and enterprise supply chains with dependable, fast, and secure logistics in over 220 countries and territories.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#6B2737]" />
                <span>Global Reach</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#6B2737]" />
                <span>Cargo Insured</span>
              </div>
            </div>
          </div>

          {/* Shipping Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Shipping & Tracking</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/tracking" className="hover:text-[#6B2737] transition">Track Shipment</Link></li>
              <li><Link href="/shipping/quote" className="hover:text-[#6B2737] transition">Get Rate & Transit Times</Link></li>
              <li><Link href="/shipping" className="hover:text-[#6B2737] transition">Create a Shipment</Link></li>
              <li><Link href="/locations" className="hover:text-[#6B2737] transition">Find Drop-off Location</Link></li>
              <li><Link href="/business" className="hover:text-[#6B2737] transition">Commercial Freight</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-[#6B2737] transition">About SourceDeliveryPro</Link></li>
              <li><Link href="/services" className="hover:text-[#6B2737] transition">Our Global Services</Link></li>
              <li><Link href="/careers" className="hover:text-[#6B2737] transition">Careers & Driver Jobs</Link></li>
              <li><Link href="/blog" className="hover:text-[#6B2737] transition">Logistics News & Insights</Link></li>
              <li><Link href="/contact" className="hover:text-[#6B2737] transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Support & Legal</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/support" className="hover:text-[#6B2737] transition">Help & FAQ Center</Link></li>
              <li><Link href="/terms" className="hover:text-[#6B2737] transition">Terms of Carriage</Link></li>
              <li><Link href="/privacy" className="hover:text-[#6B2737] transition">Privacy Policy</Link></li>
              <li><Link href="/prohibited" className="hover:text-[#6B2737] transition">Prohibited Goods</Link></li>
              <li><Link href="/refunds" className="hover:text-[#6B2737] transition">Claims & Refunds</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SourceDeliveryPro Logistics Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <a href="tel:+16183681268" className="flex items-center gap-1 hover:text-white transition"><Phone className="w-3.5 h-3.5" /> (618) 368 1268</a>
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> dispatch@sourcedeliverypro.com</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Main: 500 Capitol Mall, Sacramento, CA 95814</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Branch: 27 Jalan Sultan Idris Shah, 30000 Ipoh, Perak, Malaysia</span>
          </div>
        </div>
      </div>
    </footer>
  )
}