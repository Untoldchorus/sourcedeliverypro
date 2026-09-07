export default function PrivacyPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 bg-white my-8 rounded-2xl border border-slate-200 p-8">
      <h1 className="text-3xl font-black text-[#1B2A4A]">Global Privacy & Data Governance</h1>
      <p className="text-xs text-slate-400">Effective Date: January 1, 2026</p>

      <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1B2A4A]">1. Information We Collect</h2>
          <p>
            To clear customs and deliver consignments, SourceDeliveryPro collects sender and recipient names, addresses, emails, phone numbers, shipment value declarations, electronic signatures, and delivery GPS coordinates.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1B2A4A]">2. Regulatory & Customs Disclosures</h2>
          <p>
            Shipment manifest data is electronically transmitted to national customs and border protection authorities in compliance with cross-border import and export security regulations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1B2A4A]">3. Payment & Security</h2>
          <p>
            We do not store complete payment card credentials on our servers. All financial transactions are tokenized through PCI-DSS Level 1 certified gateways.
          </p>
        </section>
      </div>
    </div>
  )
}