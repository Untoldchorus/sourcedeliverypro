import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react'

export default function BlogPage() {
  const posts = [
    {
      slug: 'cross-border-ecommerce-logistics-2026',
      title: 'Navigating 2026 Cross-Border E-Commerce Tariffs & De Minimis Changes',
      excerpt: 'How automated HS code classification and prepaying digital customs duties prevents delivery delays in the EU and US.',
      date: 'September 2, 2026',
      readTime: '5 min read',
      category: 'Customs & Compliance',
    },
    {
      slug: 'reducing-dimensional-weight-freight-costs',
      title: 'How Smart Packaging Shrinks Dimensional Weight Freight Costs by 30%',
      excerpt: 'Practical packaging engineering guidelines for freight managers balancing cubic volume and air transport surcharges.',
      date: 'August 24, 2026',
      readTime: '7 min read',
      category: 'Supply Chain',
    },
    {
      slug: 'expanding-direct-hub-lanes-west-africa',
      title: 'SourceDeliveryPro Expands Direct Air Cargo Lanes Between London, Frankfurt & West Africa',
      excerpt: 'New dedicated freighter schedules reduce general transit times between European manufacturing centers and West African distribution hubs.',
      date: 'August 12, 2026',
      readTime: '4 min read',
      category: 'Network Expansion',
    },
  ]

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6B2737]">Logistics Insights</span>
        <h1 className="text-4xl font-black text-[#1B2A4A] mt-2 mb-3 tracking-tight">
          The SourceDeliveryPro Logistics Journal
        </h1>
        <p className="text-slate-600 text-sm">
          Trends, regulatory updates, and technical insights from the frontiers of global shipping and supply chain orchestration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article key={post.slug} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold px-2.5 py-1 bg-orange-50 text-[#6B2737] rounded-full inline-block">
                {post.category}
              </span>
              <h3 className="font-bold text-base text-[#1B2A4A] leading-snug">{post.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{post.excerpt}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}