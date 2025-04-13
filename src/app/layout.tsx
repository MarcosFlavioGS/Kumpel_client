import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { StoreHydration } from '@/components/storeHydration'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kumpel App',
  description: 'A group chat application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreHydration>
          {children}
        </StoreHydration>
      </body>
    </html>
  )
}
