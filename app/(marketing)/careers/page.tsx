import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CareersPage() {
  const jobs = [
    {
      id: 'JOB-01',
      title: 'Senior Freight Routing Engineer',
      dept: 'Technology & Algorithms',
      location: 'New York, NY / Remote',
      type: 'Full-Time',
      desc: 'Architect our international flight and hub load balancing routing engine to minimize transshipment latency.',
    },
    {
      id: 'JOB-02',
      title: 'International Customs Compliance Officer',
      dept: 'Legal & Regulatory',
      location: 'London Heathrow Gateway',
      type: 'Full-Time',
      desc: 'Oversee electronic cross-border tariff settlements and bonded customs warehouse declarations.',
    },
    {
      id: 'JOB-03',
      title: 'Fleet Operations Dispatcher',
      dept: 'Operations & Fleet',
      location: 'Frankfurt Hub, Germany',
      type: 'Full-Time',
      desc: 'Coordinate express driver shifts, linehaul feeder trucks, and time-critical delivery attempts.',
    },
    {
      id: 'JOB-04',
      title: 'Commercial Key Account Manager',
      dept: 'Enterprise Sales',
      location: 'Lagos / West Africa',
      type: 'Full-Time',
      desc: 'Build strategic relationships with e-commerce distributors and cross-border merchants.',
    },
  ]

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6B2737]">Join SourceDeliveryPro</span>
        <h1 className="text-4xl font-black text-[#1B2A4A] mt-2 mb-3 tracking-tight">
          Build the Future of Global Logistics
        </h1>
        <p className="text-slate-600 text-sm">
          Join our worldwide team of logistics operators, engineers, dispatchers, and drivers moving over 5 million consignments every year.
        </p>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#6B2737]">{job.dept}</span>
              <h3 className="font-bold text-lg text-[#1B2A4A]">{job.title}</h3>
              <p className="text-xs text-slate-500 max-w-xl leading-relaxed">{job.desc}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.type}</span>
              </div>
            </div>

            <Button asChild size="sm" className="bg-[#1B2A4A] hover:bg-[#13233D] text-white shrink-0">
              <Link href="/contact">Apply Now</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}