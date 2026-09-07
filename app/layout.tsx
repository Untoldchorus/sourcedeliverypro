import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'SourceDeliveryPro | International Courier & Logistics Services',
    template: '%s | SourceDeliveryPro',
  },
  description:
    'Reliable worldwide express shipping, parcel tracking, freight forwarding, and supply chain logistics solutions.',
  keywords: ['courier', 'shipping', 'freight', 'tracking', 'logistics', 'express delivery', 'international shipping'],
  authors: [{ name: 'SourceDeliveryPro Logistics' }],
  metadataBase: new URL(
    (process.env.NEXT_PUBLIC_APP_URL || 'https://sourcedeliverypro.com').replace(/^["']|["']$/g, '')
  ),
  openGraph: {
    title: 'SourceDeliveryPro - Ship Smarter. Deliver Faster.',
    description: 'International express shipping and intelligent logistics management.',
    url: 'https://sourcedeliverypro.com',
    siteName: 'SourceDeliveryPro',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}