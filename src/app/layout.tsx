import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { StoreHydration } from '@/components/storeHydration'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kumpel',
  description: 'A group chat application',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/logo.svg'
    }
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <StoreHydration>{children}</StoreHydration>
      </body>
    </html>
  )
}
