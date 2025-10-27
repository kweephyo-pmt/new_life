'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function useRequireAuth(redirectUrl: string = '/') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectUrl)
    }
  }, [user, loading, router, redirectUrl])

  return { user, loading }
}
