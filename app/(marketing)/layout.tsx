import { MarketingNavbar } from '@/components/navigation/MarketingNavbar'
import { MarketingFooter } from '@/components/navigation/MarketingFooter'
import { LiveChatWidget } from '@/components/chat/LiveChatWidget'
import { TranslateWidget } from '@/components/translate/TranslateWidget'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5EDE8' }}>
      <TranslateWidget />
      <MarketingNavbar />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
      <LiveChatWidget />
    </div>
  )
}