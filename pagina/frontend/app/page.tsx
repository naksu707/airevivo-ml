import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Wind,
  Database,
  MapPin,
  Gauge,
  CalendarRange,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/stat-card'
import { IcaLegend } from '@/components/ica-legend'
import { DemoNotice, ModelPendingNotice } from '@/components/notices'
import { backendFetch, type BackendStats } from '@/lib/backend'

export default async function HomePage() {
  const [stats] = await Promise.all([
    backendFetch<BackendStats>('/api/stats'),
  ])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-sky-wash">
        <div className="absolute inset-0 cloud-grid opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="grid overflow-hidden rounded-[2rem] border border-border/70 bg-card/70 shadow-[0_30px_80px_rgba(30,52,60,0.12)] backdrop-blur-sm lg:grid-cols-[1.08fr_0.92fr]">
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary/90 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-secondary-foreground uppercase shadow-sm">
                  <Wind className="size-3.5" aria-hidden />
                  Observatorio del aire · Valle del Cauca
                </span>
                <h1 className="mt-7 max-w-xl text-balance font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-[3.5rem]">
                  Entiende el aire que acompaña tu día.
                </h1>
                <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Explora mediciones de PM2.5, estaciones activas y tendencias históricas para mirar la calidad del aire con más contexto.
                </p>
              </div>
            </div>

            <div className="relative min-h-80 overflow-hidden border-l border-border/60 bg-accent sm:min-h-[26.25rem]">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/a/ae/Atardecer_M%C3%A1laga_2.jpg?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original"
                alt="Atardecer con tonos cálidos sobre un paisaje urbano y costero"
                width={1600}
                height={1000}
                quality={100}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="absolute inset-0 h-full w-full scale-[1.02] object-cover saturate-[1.08] contrast-[1.07]"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-foreground/55 via-foreground/10 to-transparent" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Database} label="Registros" value={stats.registros.toLocaleString('es-CO')} hint="Mediciones en el dataset" />
          <StatCard icon={MapPin} label="Estaciones" value={stats.estaciones} hint="Puntos de monitoreo" />
          <StatCard
            icon={Gauge}
            label="PM2.5 promedio"
            value={`${stats.pm25_promedio ?? '—'}`}
            hint="µg/m³ (referencial)"
          />
          <StatCard
            icon={CalendarRange}
            label="Rango de fechas"
            value={stats.fecha_minima ? `${stats.fecha_minima?.slice(0, 7)}` : '—'}
            hint={`hasta ${stats.fecha_maxima?.slice(0, 7) ?? '—'}`}
          />
        </div>
        <DemoNotice className="mt-6" />
      </section>

      {/* ICA categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10">
          <div className="mb-6 max-w-2xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Categorías del Índice de Calidad del Aire
            </h2>
            <p className="mt-3 text-muted-foreground">
              Las seis categorías objetivo del clasificador. Los colores y rangos son configurables
              y sirven como referencia visual, no como la clasificación validada del modelo.
            </p>
          </div>
          <IcaLegend />
          <ModelPendingNotice className="mt-6" />
        </div>
      </section>
    </>
  )
}
