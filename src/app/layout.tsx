import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ServiceWorker } from '@/components/service-worker'

const display = Space_Grotesk({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
})

const numeric = JetBrains_Mono({
  variable: '--font-numeric',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Schema',
  description: 'Persoonlijk indelingsschema',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Schema' },
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#080b14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  // Zorgt dat de app tot achter de statusbalk en gebarenbalk loopt.
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={`${display.variable} ${numeric.variable} antialiased`}>
        <div className="relative z-10 mx-auto min-h-dvh w-full max-w-lg">{children}</div>
        <ServiceWorker />
      </body>
    </html>
  )
}
