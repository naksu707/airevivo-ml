'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageHero } from '@/components/page-hero'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { normalizeRole, type UserRole } from '@/lib/auth-session'

type StoredUser = {
  name: string
  email: string
  city?: string
  role: string
}

export default function AdminUsersPage() {
  const { user, updateUserRole } = useAuth()
  const [users, setUsers] = useState<StoredUser[]>([])
  const [editingEmail, setEditingEmail] = useState<string | null>(null)
  const [draftRole, setDraftRole] = useState<UserRole>('USUARIO')
  const [isSaving, setIsSaving] = useState(false)

  function readUsers(): StoredUser[] {
    try {
      return JSON.parse(localStorage.getItem('airevivo-users') ?? '[]') as StoredUser[]
    } catch {
      return []
    }
  }

  useEffect(() => {
    try {
      const stored = readUsers()
      const city = user?.city?.trim()
      if (!city) {
        setUsers([])
        return
      }
      setUsers(stored.filter((item) => item.city && item.city.trim().toLowerCase() === city.trim().toLowerCase()))
    } catch {
      setUsers([])
    }
  }, [user?.city, user?.email])

  const cityLabel = useMemo(() => user?.city ?? 'tu ciudad', [user?.city])

  async function handleSaveRole(email: string) {
    setIsSaving(true)
    try {
      await updateUserRole(email, draftRole)
      setEditingEmail(null)
      const stored = readUsers()
      const city = user?.city?.trim()
      if (!city) {
        setUsers([])
        return
      }
      setUsers(stored.filter((item) => item.city && item.city.trim().toLowerCase() === city.trim().toLowerCase()))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
      <>
        <PageHero
          eyebrow="Administración"
          title="Gestión de usuarios"
          description="Usuarios registrados en tu ciudad y con acceso a la plataforma AireVivo."
        />
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <Card className="p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Administrador activo</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">{user?.name ?? 'Admin'}</h2>
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              Ciudad administrativa: <span className="font-medium text-foreground">{cityLabel}</span>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-border">
              <div className="grid grid-cols-[1.4fr_1.2fr_0.8fr_0.4fr] border-b border-border bg-secondary/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <span>Usuario</span>
                <span>Correo</span>
                <span>Rol</span>
                <span className="text-right">Editar</span>
              </div>

              {users.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay usuarios registrados en {cityLabel}.
                </div>
              ) : (
                users.map((item) => {
                  const isEditing = editingEmail === item.email
                  return (
                    <div key={`${item.email}-${item.name}`} className="grid grid-cols-[1.4fr_1.2fr_0.8fr_0.4fr] items-center border-b border-border px-4 py-3 text-sm last:border-b-0">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.city ?? 'Sin ciudad'}</p>
                      </div>
                      <span className="text-muted-foreground">{item.email}</span>

                      {isEditing ? (
                        <div className="pr-2">
                          <Select value={draftRole} onValueChange={(value) => setDraftRole(normalizeRole(value))}>
                            <SelectTrigger className="h-9 w-full text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USUARIO">Usuario</SelectItem>
                              <SelectItem value="ANALISTA">Analista</SelectItem>
                              <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <span className="font-medium text-foreground">{item.role}</span>
                      )}

                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setEditingEmail(null)} aria-label="Cancelar edición">
                            <X className="size-3.5" aria-hidden />
                          </Button>
                          <Button type="button" variant="default" size="icon-sm" onClick={() => handleSaveRole(item.email)} disabled={isSaving} aria-label="Guardar rol">
                            <Check className="size-3.5" aria-hidden />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="rounded-lg"
                            onClick={() => {
                              setEditingEmail(item.email)
                              setDraftRole(normalizeRole(item.role))
                            }}
                            aria-label={`Editar rol de ${item.name}`}
                          >
                            <Pencil className="size-3.5" aria-hidden />
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>
      </>
    </ProtectedRoute>
  )
}
