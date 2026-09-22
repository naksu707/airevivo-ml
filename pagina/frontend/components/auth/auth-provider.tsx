'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { normalizeRole, setSessionCookie, type AppUser, type UserRole } from '@/lib/auth-session'

type StoredUser = AppUser & { passwordHash: string }

type AuthContextValue = {
  user: AppUser | null
  isReady: boolean
  role: UserRole | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, city: string, role?: UserRole) => Promise<void>
  updateProfile: (name: string, city: string) => Promise<void>
  updateUserRole: (email: string, role: UserRole) => Promise<void>
  logout: () => void
}

const USERS_KEY = 'airevivo-users'
const SESSION_KEY = 'airevivo-session'
const AuthContext = createContext<AuthContextValue | null>(null)

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as StoredUser[]
  } catch {
    return []
  }
}

function readSession(): AppUser | null {
  try {
    const savedSession = localStorage.getItem(SESSION_KEY)
    if (!savedSession) return null
    const user = JSON.parse(savedSession) as Partial<AppUser>
    if (!user.email || !user.name || !user.role) return null
    return { name: user.name, email: user.email, city: user.city, role: normalizeRole(user.role) }
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const savedSession = readSession()
    if (savedSession) {
      setUser(savedSession)
    }
    setIsReady(true)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isReady,
    role: user?.role ?? null,
    async login(email, password) {
      const normalizedEmail = email.trim().toLowerCase()
      const passwordHash = await hashPassword(password)
      const account = readUsers().find((item) => item.email === normalizedEmail && item.passwordHash === passwordHash)
      if (!account) throw new Error('Correo o contraseña incorrectos.')

      const session: AppUser = { name: account.name, email: account.email, city: account.city, role: normalizeRole(account.role) }
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      setSessionCookie(session)
      setUser(session)
    },
    async register(name, email, password, city, role = 'USUARIO') {
      const normalizedName = name.trim()
      const normalizedEmail = email.trim().toLowerCase()
      const normalizedCity = city.trim()
      const userRole = normalizeRole(role)
      const users = readUsers()
      if (users.some((item) => item.email === normalizedEmail)) {
        throw new Error('Ya existe una cuenta con este correo.')
      }

      const session: AppUser = { name: normalizedName, email: normalizedEmail, city: normalizedCity, role: userRole }
      const passwordHash = await hashPassword(password)
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, { ...session, passwordHash }]))
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      setSessionCookie(session)
      setUser(session)
    },
    async updateProfile(name, city) {
      if (!user?.email) throw new Error('No hay una sesión activa para actualizar el perfil.')

      const normalizedName = name.trim()
      const normalizedCity = city.trim()
      if (normalizedName.length < 2) throw new Error('El nombre debe tener al menos 2 caracteres.')
      if (normalizedCity.length < 2) throw new Error('La ciudad es obligatoria.')

      const users = readUsers()
      const nextUsers = users.map((item) => {
        if (item.email !== user.email) return item
        return { ...item, name: normalizedName, city: normalizedCity, role: user.role }
      })

      const updatedSession: AppUser = {
        name: normalizedName,
        email: user.email,
        city: normalizedCity,
        role: user.role,
      }

      localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers))
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession))
      setSessionCookie(updatedSession)
      setUser(updatedSession)
    },
    async updateUserRole(email, role) {
      const normalizedEmail = email.trim().toLowerCase()
      const nextRole = normalizeRole(role)
      const users = readUsers()
      const nextUsers = users.map((item) => {
        if (item.email !== normalizedEmail) return item
        return { ...item, role: nextRole }
      })

      localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers))

      if (user?.email === normalizedEmail) {
        const updatedSession: AppUser = {
          name: user.name,
          email: user.email,
          city: user.city,
          role: nextRole,
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession))
        setSessionCookie(updatedSession)
        setUser(updatedSession)
      }
    },
    logout() {
      localStorage.removeItem(SESSION_KEY)
      setSessionCookie(null)
      setUser(null)
    },
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.')
  return context
}
