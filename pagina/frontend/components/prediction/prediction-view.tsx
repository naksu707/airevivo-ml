'use client'

import { useState } from 'react'
import { BrainCircuit, Loader2, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ModelPendingNotice } from '@/components/notices'
import { referenceCategoryForPm25 } from '@/lib/air-quality/categories'


type ApiResult = {
  disponible: boolean
  mensaje?: string
  timestamp?: string
  categoria?: string
  probabilidad?: number
  modelo?: string
  descripcion?: string
  recomendaciones?: string[]
}

export function PredictionView({ stations }: { stations: string[] }) {
  const [estacion, setEstacion] = useState(stations[0] ?? '')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [pm25, setPm25] = useState(35)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResult | null>(null)

  const cat = referenceCategoryForPm25(pm25)
  const maxRef = 300
  const gaugePct = Math.min(100, (pm25 / maxRef) * 100)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estacion, fecha, pm25 }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ disponible: false, mensaje: 'No se pudo contactar el servicio de predicción.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="size-5 text-primary" aria-hidden />
            Consultar predicción ICA
          </CardTitle>
          <CardDescription>
            Selecciona una estación y fecha para consultar el clasificador. La respuesta refleja el
            estado real del servicio de Machine Learning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="estacion">Estación</Label>
              <Select value={estacion} onValueChange={(value) => setEstacion(value ?? '')}>
                <SelectTrigger id="estacion" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fecha">Fecha objetivo</Label>
              <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="pm25">PM2.5 de referencia</Label>
                <span className="font-display text-lg font-semibold tabular-nums">
                  {pm25} <span className="text-sm font-normal text-muted-foreground">µg/m³</span>
                </span>
              </div>
              <Slider
                id="pm25"
                min={0}
                max={maxRef}
                step={1}
                value={[pm25]}
                onValueChange={(v) => setPm25(Array.isArray(v) ? Number(v[0] ?? 0) : Number(v ?? 0))}
              />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Consultando…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Consultar modelo
                </>
              )}
            </Button>
          </form>

          {result && result.disponible ? (
            <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                    Resultado del modelo
                  </p>
                  <p className="mt-2 text-2xl font-display font-semibold text-foreground">
                    {result.categoria}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Confianza
                  </p>
                  <div className="mt-1 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    {(Number(result.probabilidad ?? 0) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                El porcentaje indica la confianza del modelo en que la instancia pertenece a la categoría
                predicha. No es el PM2.5 real ni el valor del ICA calculado.
              </p>
              {result.descripcion && (
                <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 via-background to-background p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-2 rounded-full bg-emerald-500" aria-hidden />
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Explicación del modelo
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-foreground">{result.descripcion}</p>
                </div>
              )}
              {result.recomendaciones && result.recomendaciones.length > 0 && (
                <div className="mt-4 rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/8 via-background to-background p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-2 rounded-full bg-sky-500" aria-hidden />
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Recomendaciones
                    </p>
                  </div>
                  <ul className="mt-3 space-y-3 text-sm text-foreground">
                    {result.recomendaciones.map((item) => (
                      <li key={item} className="flex gap-3 rounded-xl bg-background/40 px-2 py-1.5">
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
                        <span className="leading-6">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-4 text-sm text-muted-foreground">
                Modelo: {result.modelo ?? 'RandomForestClassifier'}
              </p>
              {result.timestamp && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Consulta registrada · {new Date(result.timestamp).toLocaleString('es-CO')}
                </p>
              )}
            </div>
          ) : result && !result.disponible ? (
            <div className="mt-5">
              <ModelPendingNotice />
              {result.timestamp && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Consulta registrada · {new Date(result.timestamp).toLocaleString('es-CO')}
                </p>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Reference gauge */}
      <Card>
        <CardHeader>
          <CardTitle>Umbral de referencia por PM2.5</CardTitle>
          <CardDescription>
            El umbral de <span className="font-medium text-foreground">Moderada</span> está definido entre
            <span className="font-medium text-foreground"> 12.1 y 35.4 µg/m³</span>. Este rango se usa porque, aunque la calidad del aire aún es
            generalmente aceptable, valores por encima de <span className="font-medium text-foreground">12 µg/m³</span> pueden empezar a afectar a
            grupos sensibles como niños, personas mayores o pacientes respiratorios. Por eso la categoría cambia en ese punto.
            <span className="font-medium text-foreground"> Es solo una referencia visual, no la predicción del modelo.</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="flex flex-col items-center justify-center rounded-2xl border border-border p-8 text-center transition-colors"
            style={{ backgroundColor: `${cat.color}18` }}
          >
            <span
              className="flex size-16 items-center justify-center rounded-full text-2xl"
              style={{ backgroundColor: `${cat.color}33` }}
            >
              <span className="size-6 rounded-full" style={{ backgroundColor: cat.color }} />
            </span>
            <p className="mt-4 font-display text-2xl font-semibold" style={{ color: cat.color }}>
              {cat.nombre}
            </p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">{cat.descripcion}</p>
          </div>

          <div>
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{maxRef}+ µg/m³</span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${gaugePct}%`, backgroundColor: cat.color }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
