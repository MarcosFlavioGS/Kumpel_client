'use client'

import { useEffect, useState } from 'react'
import useUserStore from '@/app/stores/useUserStore'

export function StoreHydration({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)
  const token = useUserStore((state) => state.token)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return null
  }

  return <>{children}</>
} 