'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { ArrowRight, LogIn, Wind } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError('')
    setIsSubmitting(true)
    try {
      await login(String(form.get('email') ?? ''), String(form.get('password') ?? ''))
      router.push('/dashboard')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible iniciar sesión.')
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
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Inicia sesión</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Accede a tu espacio de seguimiento de calidad del aire.
          </p>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-10" />
            </div>
            {error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
              <LogIn className="size-4" aria-hidden />
              {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Aún no tienes una cuenta?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Regístrate <ArrowRight className="inline size-3.5" aria-hidden />
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
