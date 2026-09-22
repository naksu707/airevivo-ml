export type UserRole = 'VISITANTE' | 'USUARIO' | 'ANALISTA' | 'ADMINISTRADOR'

export type AppUser = {
  name: string
  email: string
  city?: string
  role: UserRole
}

export const SESSION_COOKIE = 'airevivo_session'

export const ROLE_LABELS: Record<UserRole, string> = {
  VISITANTE: 'Visitante',
  USUARIO: 'Usuario',
  ANALISTA: 'Analista',
  ADMINISTRADOR: 'Administrador',
}

export const PUBLIC_PATHS = ['/', '/about', '/source', '/login', '/register', '/forbidden']

export const NAV_LINKS: Record<UserRole, Array<{ href: string; label: string }>> = {
  VISITANTE: [
    { href: '/', label: 'Inicio' },
    { href: '/about', label: 'Proyecto' },
    { href: '/source', label: 'Fuente de datos' },
  ],
  USUARIO: [
    { href: '/', label: 'Inicio' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/prediction', label: 'Predicción' },
    { href: '/monitoring', label: 'Red de monitoreo' },
    { href: '/about', label: 'Proyecto' },
    { href: '/source', label: 'Fuente de datos' },
  ],
  ANALISTA: [
    { href: '/', label: 'Inicio' },
    { href: '/dashboard', label: 'Análisis' },
    { href: '/data', label: 'Datos' },
    { href: '/prediction', label: 'Predicción' },
    { href: '/monitoring', label: 'Monitorización' },
    { href: '/source', label: 'Fuente de datos' },
  ],
  ADMINISTRADOR: [
    { href: '/', label: 'Inicio' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/data', label: 'Datos' },
    { href: '/prediction', label: 'Predicción' },
    { href: '/monitoring', label: 'Red de monitoreo' },
    { href: '/admin/users', label: 'Usuarios' },
    { href: '/source', label: 'Fuente de datos' },
  ],
}

export function normalizeRole(role?: string | null): UserRole {
  switch (role) {
    case 'ADMINISTRADOR':
      return 'ADMINISTRADOR'
    case 'ANALISTA':
      return 'ANALISTA'
    case 'USUARIO':
      return 'USUARIO'
    default:
      return 'VISITANTE'
  }
}

export function canAccessPath(role: UserRole | null | undefined, pathname: string): boolean {
  const normalizedRole = role ?? 'VISITANTE'
  if (PUBLIC_PATHS.includes(pathname)) return true
  if (pathname.startsWith('/admin')) return normalizedRole === 'ADMINISTRADOR'
  if (pathname.startsWith('/data')) return normalizedRole === 'ANALISTA' || normalizedRole === 'ADMINISTRADOR'
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/prediction') || pathname.startsWith('/monitoring')) {
    return normalizedRole === 'USUARIO' || normalizedRole === 'ANALISTA' || normalizedRole === 'ADMINISTRADOR'
  }
  if (pathname.startsWith('/profile')) {
    return normalizedRole === 'USUARIO' || normalizedRole === 'ANALISTA' || normalizedRole === 'ADMINISTRADOR'
  }
  if (pathname.startsWith('/source') || pathname.startsWith('/about')) return true
  return false
}

export function readSessionCookie(raw?: string | null): AppUser | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<AppUser>
    if (!parsed.email || !parsed.name || !parsed.role) return null
    return { name: parsed.name, email: parsed.email, city: parsed.city, role: normalizeRole(parsed.role) }
  } catch {
    return null
  }
}

export function setSessionCookie(user: AppUser | null) {
  if (typeof document === 'undefined') return
  if (!user) {
    document.cookie = `${SESSION_COOKIE}=; Max-Age=0; path=/; SameSite=Lax`
    return
  }
  const payload = encodeURIComponent(JSON.stringify(user))
  document.cookie = `${SESSION_COOKIE}=${payload}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
}
