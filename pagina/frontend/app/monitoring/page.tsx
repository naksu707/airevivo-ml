import type { Metadata } from 'next'
import { MapPin, Activity } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageHero } from '@/components/page-hero'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { BarChart } from '@/components/charts/bar-chart'
import { DemoNotice } from '@/components/notices'
import { backendFetch, type BackendStation } from '@/lib/backend'
import { referenceCategoryForPm25 } from '@/lib/air-quality/categories'

export const metadata: Metadata = {
  title: 'Red de monitoreo — AireVivo',
  description: 'Estaciones de monitoreo de calidad del aire del Valle del Cauca y su actividad.',
}

const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

export default async function MonitoringPage() {
  const [stationResponse, analytics] = await Promise.all([
    backendFetch<{ stations: BackendStation[] }>('/api/stations'),
    backendFetch<{ byStation: { estacion: string; promedio: number }[] }>('/api/analytics'),
  ])
  const stations = stationResponse.stations
  const averages = analytics.byStation
  const avgMap = new Map(averages.map((a) => [a.estacion, a.promedio]))
  const chartData = averages.map((a, i) => ({
    label: a.estacion,
    value: a.promedio,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  return (
    <ProtectedRoute allowedRoles={['USUARIO', 'ANALISTA', 'ADMINISTRADOR']}>
      <>
        <PageHero
          eyebrow="Red"
          title="Red de monitoreo del Valle del Cauca"
          description="Puntos de monitoreo incluidos en el dataset, con su volumen de registros y concentración media de PM2.5."
        />
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
          <DemoNotice />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stations.map((s) => {
              const prom = avgMap.get(s.nombre) ?? null
              const cat = prom != null ? referenceCategoryForPm25(prom) : null
              return (
                <Card key={s.nombre} className="p-5">
                  <div className="flex items-start justify-between">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="size-4.5" aria-hidden />
                    </span>
                    {cat && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs">
                        <span className="size-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.nombre}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold">{s.nombre}</h3>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Activity className="size-3.5" aria-hidden />
                      {s.registros.toLocaleString('es-CO')} reg.
                    </span>
                    <span className="font-semibold tabular-nums">
                      {prom ?? '—'} <span className="text-xs font-normal text-muted-foreground">µg/m³</span>
                    </span>
                  </div>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>PM2.5 promedio por estación</CardTitle>
              <CardDescription>Comparación de la concentración media (µg/m³) entre estaciones.</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart data={chartData} unit="" horizontal />
            </CardContent>
          </Card>
        </div>
      </>
    </ProtectedRoute>
  )
}
