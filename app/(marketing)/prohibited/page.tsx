import { AlertTriangle, Ban, ShieldAlert } from 'lucide-react'

export default function ProhibitedItemsPage() {
  const items = [
    { title: 'Dangerous Goods & Explosives', desc: 'Fireworks, ammunition, flares, detonators, and military materiel.' },
    { title: 'Flammable Liquids & Solids', desc: 'Unregulated gasoline, lighter fluids, aerosols, and matches.' },
    { title: 'Toxic & Infectious Substances', desc: 'Pesticides, biohazards, medical samples without prior hazardous goods clearance.' },
    { title: 'Currency & Bearer Negotiable Instruments', desc: 'Banknotes, bullion, coins, and unregistered precious metals.' },
    { title: 'Narcotics & Controlled Substances', desc: 'Strictly prohibited in all international and domestic transit networks.' },
  ]

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 bg-white my-8 rounded-2xl border border-slate-200 p-8">
      <div className="flex items-center gap-3">
        <Ban className="w-8 h-8 text-red-500" />
        <div>
          <h1 className="text-3xl font-black text-[#1B2A4A]">Prohibited & Restricted Items</h1>
          <p className="text-xs text-slate-400">International Aviation & Customs Regulations</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">
        For the security of our flight crews, ground couriers, and international transport facilities, SourceDeliveryPro strictly rejects the following categories of cargo:
      </p>

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="p-4 rounded-xl border border-red-100 bg-red-50/50 space-y-1">
            <h3 className="font-bold text-sm text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              {item.title}
            </h3>
            <p className="text-xs text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}