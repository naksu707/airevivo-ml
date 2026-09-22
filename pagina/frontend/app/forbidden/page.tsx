import Link from 'next/link'
import { PageHero } from '@/components/page-hero'
import { Button } from '@/components/ui/button'

export default function ForbiddenPage() {
  return (
    <>
      <PageHero
        eyebrow="Acceso restringido"
        title="No tienes permisos para ver esta vista"
        description="La página solicitada requiere un rol superior o una sesión activa en la plataforma."
      />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">403</p>
          <h2 className="mt-4 font-display text-3xl font-semibold">Permisos insuficientes</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Si necesitas acceder a esta sección, inicia sesión con un perfil autorizado o solicita permisos a un administrador.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button render={<Link href="/" />} nativeButton={false}>Volver al inicio</Button>
            <Button variant="outline" render={<Link href="/login" />} nativeButton={false}>Iniciar sesión</Button>
          </div>
        </div>
      </div>
    </>
  )
}
