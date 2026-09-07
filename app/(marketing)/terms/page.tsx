export default function TermsPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 bg-white my-8 rounded-2xl border border-slate-200 p-8">
      <h1 className="text-3xl font-black text-[#1B2A4A]">Terms of Carriage & Service</h1>
      <p className="text-xs text-slate-400">Effective Date: January 1, 2026</p>

      <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1B2A4A]">1. Scope of Service</h2>
          <p>
            SourceDeliveryPro provides door-to-door international express courier, air freight forwarding, customs brokerage, and scheduled delivery services subject strictly to these standard conditions of carriage.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1B2A4A]">2. Calculation of Charges & Dimensional Weight</h2>
          <p>
            Rates are computed based on the greater of actual gross weight or volumetric dimensional weight according to the IATA standard volumetric divisor (Length x Width x Height in cm divided by 5,000). Surcharges including fuel adjustments, remote area delivery, and customs duties apply.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1B2A4A]">3. Carrier Liability & Insurance</h2>
          <p>
            Unless the shipper declares a higher value and purchases supplementary cargo protection, carrier liability for lost or damaged goods is governed strictly by the Montreal Convention or Warsaw Convention where applicable.
          </p>
        </section>
      </div>
    </div>
  )
}