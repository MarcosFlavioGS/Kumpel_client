'use client'

import { useEffect, useState } from 'react'
import { MessagesSquare } from 'lucide-react'

export function StoreHydration({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return (
      <div
        className='flex min-h-screen flex-col items-center justify-center gap-4 bg-kumpel-bg px-4'
        role='status'
        aria-live='polite'
        aria-label='Loading application'>
        <div className='relative flex h-14 w-14 items-center justify-center rounded-2xl border border-kumpel-accent/25 bg-kumpel-accent/10 shadow-kumpel-accent'>
          <MessagesSquare
            className='h-7 w-7 text-kumpel-accent'
            aria-hidden
          />
          <span className='absolute inset-0 rounded-2xl border border-white/5 animate-pulse' />
        </div>
        <p className='text-sm font-medium text-kumpel-muted'>Loading Kumpel…</p>
      </div>
    )
  }

  return <>{children}</>
}
