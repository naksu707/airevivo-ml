'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { ArrowRight, UserPlus, Wind } from 'lucide-react'
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

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [city, setCity] = useState('Cali')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '')
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')
    const confirmPassword = String(form.get('confirmPassword') ?? '')
    setError('')

    if (name.trim().length < 2) return setError('Escribe tu nombre completo.')
    if (city.trim().length < 2) return setError('Escribe la ciudad donde vives.')
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (password !== confirmPassword) return setError('Las contraseñas no coinciden.')

    setIsSubmitting(true)
    try {
      await register(name, email, password, city)
      router.push('/dashboard')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible crear la cuenta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative min-h-[calc(100dvh-8rem)] overflow-hidden bg-sky-wash px-4 py-12 sm:px-6 sm:py-16">
      <div className="absolute inset-0 cloud-grid opacity-60" aria-hidden />
      <div className="relative mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-xl shadow-primary/10 backdrop-blur sm:p-8">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Wind className="size-5" aria-hidden />
          </div>
          <p className="mt-5 text-sm font-semibold text-primary">AireVivo</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Crea tu cuenta</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Guarda una sesión local para continuar explorando la plataforma.
          </p>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" name="name" autoComplete="name" placeholder="Tu nombre" required className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" required className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad donde vives</Label>
              <input type="hidden" name="city" value={city} />
              <Select value={city} onValueChange={(value) => setCity(value ?? '')}>
                <SelectTrigger id="city" className="h-10 w-full">
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
              <p className="text-xs text-muted-foreground">Por el momento solo se muestra el Valle del Cauca.</p>
            </div>
            {error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
              <UserPlus className="size-4" aria-hidden />
              {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia sesión <ArrowRight className="inline size-3.5" aria-hidden />
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
