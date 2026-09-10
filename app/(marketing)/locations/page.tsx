import { MapPin, Phone, Clock, Search, ShieldCheck } from 'lucide-react'

export default function LocationsPage() {
  const hubs = [
    {
      code: 'SAC-HQ-01',
      name: 'Main Corporate Headquarters',
      address: '500 Capitol Mall, Sacramento, CA 95814, United States',
      hours: 'Mon - Fri: 08:00 - 18:00',
      phone: '(618) 368 1268',
      services: ['Executive Office', 'Express Dispatch', 'Customer Support', 'Billing'],
      badge: 'Main Headquarters',
      badgeClass: 'bg-[#6B2737]/15 text-[#6B2737] font-bold',
    },
    {
      code: 'IPH-BR-01',
      name: 'Asia-Pacific Regional Branch Office',
      address: '27 Jalan Sultan Idris Shah, 30000 Ipoh, Perak, Malaysia',
      hours: 'Mon - Sat: 08:30 - 18:30',
      phone: '+60 5-254 0100',
      services: ['Regional Branch', 'Express Drop-off', 'Customs Support', 'Sea & Air Freight'],
      badge: 'Regional Branch',
      badgeClass: 'bg-blue-100 text-blue-800 font-bold',
    },
    {
      code: 'NYC-HUB-01',
      name: 'New York JFK International Air Hub',
      address: 'Bldg 141 Cargo Area, JFK Airport, Jamaica, NY 11430',
      hours: 'Mon - Sun: Open 24 Hours',
      phone: '+1 (718) 555-0144',
      services: ['Air Express', 'Drop-off', 'Customs Clearance', 'Freight'],
      badge: 'Operational',
      badgeClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      code: 'LON-HUB-02',
      name: 'London Heathrow Gateway Logistics Center',
      address: 'Unit 4 Scylla Rd, Heathrow Airport, Hounslow TW6 3FE',
      hours: 'Mon - Sun: Open 24 Hours',
      phone: '+44 20 8759 0021',
      services: ['Air Express', 'Drop-off', 'Customs Brokerage', 'Bonded Storage'],
      badge: 'Operational',
      badgeClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      code: 'LOS-HUB-03',
      name: 'Lagos Ikeja Aviation Cargo Terminal',
      address: 'NAHCO Cargo Complex, Murtala Muhammed Int Airport, Lagos',
      hours: 'Mon - Sat: 07:00 - 22:00',
      phone: '+234 1 271 9000',
      services: ['Express Dispatch', 'Drop-off', 'Door-to-Door Delivery'],
      badge: 'Operational',
      badgeClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      code: 'FRA-HUB-04',
      name: 'Frankfurt CargoCity South Hub',
      address: 'Gebäude 534, CargoCity Süd, 60549 Frankfurt am Main',
      hours: 'Mon - Sun: Open 24 Hours',
      phone: '+49 69 690 70000',
      services: ['Intercontinental Freight', 'Express Sort', 'Temperature Controlled'],
      badge: 'Operational',
      badgeClass: 'bg-emerald-100 text-emerald-800',
    },
  ]

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6B2737]">Global Facilities Directory</span>
        <h1 className="text-4xl font-black text-[#1B2A4A] mt-2 mb-3 tracking-tight">
          SourceDeliveryPro Hubs & Drop Locations
        </h1>
        <p className="text-slate-600 text-sm">
          Locate your nearest authorized sorting facility, parcel drop-off point, or regional international airport terminal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hubs.map((hub) => (
          <div key={hub.code} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">{hub.code}</span>
                <h3 className="font-bold text-lg text-[#1B2A4A] mt-0.5">{hub.name}</h3>
              </div>
              <span className={`px-2.5 py-1 text-xs rounded-full ${hub.badgeClass}`}>
                {hub.badge}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#6B2737] shrink-0" />
                {hub.address}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                {hub.hours}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                {hub.phone}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {hub.services.map((svc, i) => (
                <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                  {svc}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}