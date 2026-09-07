import { HelpCircle, PhoneCall, Mail, MessageSquare, Shield, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SupportPage() {
  const faqs = [
    {
      q: 'How do I track my international consignment?',
      a: 'Enter your 13-character tracking number (e.g. SDP8F4K92LM381) on our tracking page. Our telemetry records every flight departure, hub sort scan, and customs clearance milestone in real time.',
    },
    {
      q: 'What are the maximum weight and dimension limits?',
      a: 'Standard courier parcels accept up to 70 kg (150 lbs) per piece. Palletized air cargo and commercial freight accept up to 1,000 kg per unit. Use our rate calculator for dimensional weight computations.',
    },
    {
      q: 'How does customs clearance work for cross-border shipping?',
      a: 'We generate electronic commercial invoices at checkout. For standard goods, duties and VAT can be paid upfront (DDP) or settled upon destination arrival (DDU) by the recipient.',
    },
    {
      q: 'What happens if a recipient is unavailable during delivery?',
      a: 'The courier leaves a secure delivery notification card. We automatically reattempt delivery up to three consecutive business days or allow the recipient to redirect to a nearby SourceDeliveryPro Drop Hub.',
    },
  ]

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6B2737]">Customer Help Center</span>
        <h1 className="text-4xl font-black text-[#1B2A4A] mt-2 mb-3 tracking-tight">
          How Can We Help You Today?
        </h1>
        <p className="text-slate-600 text-sm">
          Browse common inquiries or connect directly with our 24/7 global logistics support desk.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 bg-orange-50 text-[#6B2737] rounded-xl flex items-center justify-center mx-auto">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800">Direct Phone Support</h3>
          <p className="text-xs text-slate-500">Speak with an authorized dispatch agent.</p>
          <div className="text-sm font-bold text-[#6B2737]">+1 (800) 555-SDPRO</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800">Email Inquiries</h3>
          <p className="text-xs text-slate-500">Average response within 30 minutes.</p>
          <div className="text-sm font-bold text-blue-600">support@sourcedeliverypro.com</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800">Support Tickets</h3>
          <p className="text-xs text-slate-500">Track ongoing claims and priority issues.</p>
          <Button asChild size="sm" variant="outline">
            <Link href="/contact">Create Support Ticket</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6 pt-6">
        <h2 className="text-2xl font-black text-[#1B2A4A]">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
              <h3 className="font-bold text-base text-[#1B2A4A]">{faq.q}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}