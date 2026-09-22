'use client'

import { useEffect, useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageHero } from '@/components/page-hero'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const VALLE_DEL_CAUCA_CITIES = [
  'Cali',
  'Palmira',
  'Yumbo',
  'Jamundí',
  'Buga',
  'Tuluá',
  'Cartago',
  'Caicedonia',
  'La Unión',
  'Pradera',
  'Florida',
  'San Pedro',
  'Ginebra',
  'Sevilla',
  'Calima',
]

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [city, setCity] = useState(user?.city ?? '')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setName(user?.name ?? '')
    setCity(user?.city ?? '')
  }, [user])

  async function handleSave() {
    setError('')
    if (!name.trim() || !city.trim()) {
      setError('El nombre y la ciudad son obligatorios.')
      return
    }

    setIsSaving(true)
    try {
      await updateProfile(name, city)
      setIsEditing(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible actualizar el perfil.')
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancel() {
    setError('')
    setName(user?.name ?? '')
    setCity(user?.city ?? '')
    setIsEditing(false)
  }

  return (
    <ProtectedRoute allowedRoles={['USUARIO', 'ANALISTA', 'ADMINISTRADOR']}>
      <>
        <PageHero
          eyebrow="Perfil"
          title="Mi cuenta"
          description="Consulta y actualiza tu información personal en la plataforma AireVivo."
        />
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Cuenta</p>
                <h2 className="mt-3 font-display text-3xl font-semibold">{user?.name ?? 'Usuario'}</h2>
              </div>
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="size-4" aria-hidden />
                  Editar
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Nombre completo</Label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-city">Ciudad</Label>
                  <Select value={city} onValueChange={(value) => setCity(value ?? '')}>
                    <SelectTrigger id="profile-city" className="w-full">
                      <SelectValue placeholder="Selecciona tu ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      {VALLE_DEL_CAUCA_CITIES.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email">Correo electrónico</Label>
                  <Input id="profile-email" value={user?.email ?? ''} readOnly className="bg-muted/50 text-muted-foreground" />
                </div>

                {error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" size="sm" className="rounded-xl" onClick={handleCancel}>
                    <X className="size-4" aria-hidden />
                    Cancelar
                  </Button>
                  <Button type="button" size="sm" className="rounded-xl" onClick={handleSave} disabled={isSaving}>
                    <Check className="size-4" aria-hidden />
                    {isSaving ? 'Guardando…' : 'Guardar'}
                  </Button>
                </div>
              </div>
            ) : (
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nombre completo</dt>
                  <dd className="mt-2 font-medium">{user?.name ?? 'Sin nombre'}</dd>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Correo electrónico</dt>
                  <dd className="mt-2 font-medium">{user?.email ?? 'Sin correo'}</dd>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/30 p-4 sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Ciudad</dt>
                  <dd className="mt-2 font-medium">{user?.city ?? 'No especificada'}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </>
    </ProtectedRoute>
  )
}
