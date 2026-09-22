'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { type UserRole } from '@/lib/auth-session'

type ProtectedRouteProps = {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requireAuth?: boolean
}

export function ProtectedRoute({
  children,
  allowedRoles = ['USUARIO', 'ANALISTA', 'ADMINISTRADOR'],
  requireAuth = true,
}: ProtectedRouteProps) {
  const { user, isReady } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isReady) return
    if (requireAuth && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    if (user && !allowedRoles.includes(user.role)) {
      router.replace('/forbidden')
    }
  }, [allowedRoles, isReady, pathname, requireAuth, router, user])

  if (!isReady) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-muted-foreground">Cargando acceso…</div>
  }

  if (requireAuth && !user) return null
  if (user && !allowedRoles.includes(user.role)) return null

  return <>{children}</>
}
