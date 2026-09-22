'use client'

import { useEffect, useState } from 'react'
import { Gauge, TrendingUp, TrendingDown, Database } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/stat-card'
import { IcaLegend } from '@/components/ica-legend'
import { LineChart } from '@/components/charts/line-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { referenceCategoryForPm25 } from '@/lib/air-quality/categories'

const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

type CorrelationPoint = { label: string; x: number; y: number }

function CartogramChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const width = 760
  const height = 310
  const padding = { top: 24, right: 30, bottom: 42, left: 40 }
  const max = Math.max(...data.map((d) => d.value), 1)
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom
  const step = data.length ? innerWidth / data.length : innerWidth
  const columnWidth = Math.min(34, step * 0.58)
  const hoveredItem = data.find((d) => d.label === hovered) ?? null

  return (
    <div className="relative h-[320px] w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Gráfico de columnas triangulares por estación">
        <rect x={0} y={0} width={width} height={height} fill="transparent" />

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const value = max * ratio
          const y = height - padding.bottom - ratio * innerHeight
          return (
            <g key={ratio}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="var(--border)" strokeDasharray="4 4" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill="var(--muted-foreground)">{Math.round(value)}</text>
            </g>
          )
        })}

        {data.map((d, index) => {
          const valueRatio = Math.max(0.15, d.value / max)
          const x = padding.left + index * step + step / 2
          const baseY = height - padding.bottom
          const peakY = baseY - valueRatio * innerHeight
          const leftX = x - columnWidth / 2
          const rightX = x + columnWidth / 2
          const left = `${leftX},${baseY}`
          const right = `${rightX},${baseY}`
          const top = `${x},${peakY}`
          const active = hovered === d.label

          return (
            <g key={d.label}>
              <polygon
                points={`${left} ${top} ${right}`}
                fill={d.color}
                opacity={active ? 1 : 0.9}
                stroke="rgba(255,255,255,0.22)"
                strokeWidth={active ? 2.2 : 1.5}
                onMouseEnter={() => setHovered(d.label)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              />
              <text x={x} y={peakY - 8} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--foreground)">{d.value.toFixed(1)}</text>
            </g>
          )
        })}
      </svg>

      {hoveredItem && (
        <div
          className="pointer-events-none absolute rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg"
          style={{
            left: '50%',
            top: '16px',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-semibold text-popover-foreground">{hoveredItem.label}</div>
          <div className="mt-1 text-muted-foreground">{hoveredItem.value.toFixed(1)} µg/m³</div>
        </div>
      )}
    </div>
  )
}

function CorrelationChart({ data }: { data: CorrelationPoint[] }) {
  const width = 760
  const height = 280
  const padding = { top: 16, right: 20, bottom: 36, left: 52 }
  const [hovered, setHovered] = useState<string | null>(null)

  const maxColumn = Math.max(...data.map((d) => d.x), 1)
  const maxPoint = Math.max(...data.map((d) => d.y), 1)
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom
  const step = data.length > 0 ? innerWidth / data.length : innerWidth
  const barWidth = Math.min(32, step * 0.68)

  const yForColumn = (value: number) => {
    const ratio = value / maxColumn
    return height - padding.bottom - ratio * innerHeight
  }

  const yForPoint = (value: number) => {
    const ratio = value / maxPoint
    return height - padding.bottom - ratio * innerHeight
  }

  const hoverPoint = data.find((d) => d.label === hovered)
  const hoverIndex = hoverPoint ? data.findIndex((d) => d.label === hoverPoint.label) : -1
  const hoverX = hoverIndex >= 0 ? padding.left + (hoverIndex + 0.5) * step : null
  const hoverY = hoverPoint ? yForPoint(hoverPoint.y) : null

  const ticksY = Array.from({ length: 5 }, (_, i) => {
    const value = (maxColumn / 4) * i
    return { value, y: yForColumn(value) }
  })

  return (
    <div className="relative h-72 w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Gráfico de columnas con puntos por estación">
        <rect x={0} y={0} width={width} height={height} fill="transparent" />

        {ticksY.map((tick) => (
          <g key={tick.value}>
            <line x1={padding.left} x2={width - padding.right} y1={tick.y} y2={tick.y} stroke="var(--border)" strokeDasharray="4 4" />
            <text x={padding.left - 8} y={tick.y + 4} textAnchor="end" fontSize={11} fill="var(--muted-foreground)">{Math.round(tick.value)}</text>
          </g>
        ))}

        <line x1={padding.left} x2={width - padding.right} y1={height - padding.bottom} y2={height - padding.bottom} stroke="var(--foreground)" strokeOpacity={0.6} />
        <line x1={padding.left} x2={padding.left} y1={padding.top} y2={height - padding.bottom} stroke="var(--foreground)" strokeOpacity={0.6} />

        {data.map((point, index) => {
          const x = padding.left + index * step + step / 2
          const columnX = x - barWidth / 2
          const columnY = yForColumn(point.x)
          const active = hovered === point.label

          return (
            <g key={point.label}>
              <rect
                x={columnX}
                y={columnY}
                width={barWidth}
                height={height - padding.bottom - columnY}
                rx={8}
                fill="var(--chart-3)"
                opacity={active ? 0.9 : 0.7}
              />

              <circle
                cx={x}
                cy={yForPoint(point.y)}
                r={active ? 6.5 : 5}
                fill="var(--chart-1)"
                stroke="var(--background)"
                strokeWidth={2}
                opacity={1}
                onMouseEnter={() => setHovered(point.label)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          )
        })}

        {data.map((point, index) => {
          const x = padding.left + index * step + step / 2
          return (
            <text
              key={`${point.label}-label`}
              x={x}
              y={height - 10}
              textAnchor="middle"
              fontSize={9}
              fill="var(--muted-foreground)"
            >
              {point.label.length > 10 ? `${point.label.slice(0, 8)}…` : point.label}
            </text>
          )
        })}
      </svg>

      {hoverPoint && hoverX !== null && hoverY !== null && (
        <div
          className="pointer-events-none absolute rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg"
          style={{
            left: `${Math.min(Math.max((hoverX / width) * 100, 8), 82)}%`,
            top: `${Math.max((hoverY / height) * 100 - 15, 8)}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-semibold text-popover-foreground">{hoverPoint.label}</div>
          <div className="mt-1 text-muted-foreground">Registros: {hoverPoint.x}</div>
          <div className="text-muted-foreground">PM2.5: {hoverPoint.y} µg/m³</div>
        </div>
      )}
    </div>
  )
}

export function DashboardView() {
  const [station, setStation] = useState('todas')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [stations, setStations] = useState<string[]>([])
  const [stats, setStats] = useState<any>(null)
  const [series, setSeries] = useState<{ label: string; value: number }[]>([])
  const [byStation, setByStation] = useState<{ label: string; value: number; color: string }[]>([])
  const [correlation, setCorrelation] = useState<CorrelationPoint[]>([])

  useEffect(() => {
    const q = new URLSearchParams()
    if (station !== 'todas') q.set('station', station)
    if (start) q.set('start_date', start)
    if (end) q.set('end_date', end)
    const qs = q.toString()
    Promise.all([fetch(`/api/stats?${qs}`).then(r => r.json()), fetch(`/api/analytics?${qs}`).then(r => r.json()), fetch('/api/stations').then(r => r.json())])
      .then(([st, analytics, stationData]) => {
        setStats(st)
        setSeries((analytics.series ?? []).map((d: any) => ({ label: d.fecha, value: d.pm25 })))
        setByStation((analytics.byStation ?? []).map((d: any, i: number) => ({ label: d.estacion, value: d.promedio, color: CHART_COLORS[i % CHART_COLORS.length] })))

        const stationList = stationData.stations ?? []
        const avgMap = new Map((analytics.byStation ?? []).map((d: any) => [d.estacion, Number(d.promedio)]))
        setCorrelation(
          stationList.map((s: any) => ({
            label: s.nombre,
            x: Number(s.registros ?? 0),
            y: avgMap.get(s.nombre) ?? 0,
          })),
        )
        setStations((stationList).map((s: any) => s.nombre).sort())
      })
      .catch(() => setStats(null))
  }, [station, start, end])

  const safeStats = stats ?? { registros: 0, pm25_promedio: null, pm25_maximo: null, pm25_minimo: null }

  const avgCat = safeStats.pm25_promedio != null ? referenceCategoryForPm25(safeStats.pm25_promedio) : null

  function reset() {
    setStation('todas')
    setStart('')
    setEnd('')
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="estacion">Estación</Label>
            <Select value={station} onValueChange={(value) => setStation(value ?? 'todas')}>
              <SelectTrigger id="estacion" className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las estaciones</SelectItem>
                {stations.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desde">Desde</Label>
            <Input id="desde" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hasta">Hasta</Label>
            <Input id="hasta" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <Button variant="outline" onClick={reset} className="bg-card">
            Limpiar filtros
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Database} label="Registros filtrados" value={safeStats.registros.toLocaleString('es-CO')} />
        <StatCard
          icon={Gauge}
          label="PM2.5 promedio"
          value={safeStats.pm25_promedio ?? '—'}
          hint={avgCat ? avgCat.nombre : 'µg/m³'}
        />
        <StatCard icon={TrendingUp} label="PM2.5 máximo" value={safeStats.pm25_maximo ?? '—'} hint="µg/m³" />
        <StatCard icon={TrendingDown} label="PM2.5 mínimo" value={safeStats.pm25_minimo ?? '—'} hint="µg/m³" />
      </div>

      {series.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No hay registros para los filtros seleccionados.
        </Card>
      ) : (
        <>
          {/* Time series */}
          <Card>
            <CardHeader>
              <CardTitle>Evolución temporal de PM2.5</CardTitle>
              <CardDescription>
                Promedio diario de concentración (µg/m³). Pasa el cursor para ver cada punto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart data={series} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Promedio por estación</CardTitle>
                <CardDescription>Cartograma continuo de la concentración media de PM2.5 por estación (µg/m³). Pasa el mouse sobre cada triángulo para ver el nombre.</CardDescription>
              </CardHeader>
              <CardContent>
                <CartogramChart data={byStation} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Correlación: registros vs PM2.5</CardTitle>
                <CardDescription>Cada punto representa una estación; el eje X muestra su volumen de registros y el eje Y el promedio de PM2.5.</CardDescription>
              </CardHeader>
              <CardContent>
                <CorrelationChart data={correlation} />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Legend */}
      <Card className="p-5">
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          Referencia de categorías ICA (orientativa)
        </p>
        <IcaLegend compact />
      </Card>
    </div>
  )
}
