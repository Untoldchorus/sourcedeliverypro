export default function RefundsPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 bg-white my-8 rounded-2xl border border-slate-200 p-8">
      <h1 className="text-3xl font-black text-[#1B2A4A]">Claims & Refund Policy</h1>
      <p className="text-xs text-slate-400">Effective Date: January 1, 2026</p>

      <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1B2A4A]">1. Service Failure Guarantees</h2>
          <p>
            On time-definite express air services, shippers may request transportation credit if a shipment arrives past the published delivery commitment, excluding customs clearance holds, weather delays, or force majeure events.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1B2A4A]">2. Cargo Loss or Damage Claims</h2>
          <p>
            Notice of loss or damage must be filed in writing within 14 calendar days of consignment delivery (or scheduled delivery date if lost). Photos of outer packaging and inner content damage are mandatory.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1B2A4A]">3. Refund Settlement Processing</h2>
          <p>
            Approved refunds are remitted to the original payment source (card or commercial billing account) within 5 to 10 banking days following adjuster review.
          </p>
        </section>
      </div>
    </div>
  )
}