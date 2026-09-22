'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { referenceCategoryForPm25 } from '@/lib/air-quality/categories'

const PAGE_SIZE = 12

export function DataTableView() {
  const [station, setStation] = useState('todas')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [page, setPage] = useState(1)
  const [stations, setStations] = useState<string[]>([])
  const [pageRows, setPageRows] = useState<any[]>([])
  const [total, setTotal] = useState(0)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const current = Math.min(page, totalPages)

  useEffect(() => {
    const q = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String((current - 1) * PAGE_SIZE) })
    if (station !== 'todas') q.set('station', station)
    if (start) q.set('start_date', start)
    if (end) q.set('end_date', end)
    Promise.all([fetch(`/api/records?${q.toString()}`).then(r => r.json()), fetch('/api/stations').then(r => r.json())])
      .then(([data, stationData]) => {
        setPageRows(data.records ?? [])
        setTotal(data.total ?? 0)
        setStations((stationData.stations ?? []).map((s: any) => s.nombre).sort())
      })
  }, [station, start, end, current])

  function update<T>(setter: (v: T) => void) {
    return (v: T | null) => {
      setter((v ?? '') as T)
      setPage(1)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="estacion">Estación</Label>
            <Select value={station} onValueChange={(value) => update(setStation)(value ?? 'todas')}>
              <SelectTrigger id="estacion" className="w-full">
                <SelectValue />
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
            <Input
              id="desde"
              type="date"
              value={start}
              onChange={(e) => update(setStart)(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hasta">Hasta</Label>
            <Input
              id="hasta"
              type="date"
              value={end}
              onChange={(e) => update(setEnd)(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Search className="size-4" aria-hidden />
            {total.toLocaleString('es-CO')} registros
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Estación</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">PM2.5 (µg/m³)</TableHead>
                <TableHead>Categoría (ref.)</TableHead>
                <TableHead className="text-center">Meteo.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No hay registros para los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((r) => {
                  const cat = referenceCategoryForPm25(r.pm25)
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="text-muted-foreground">{r.id}</TableCell>
                      <TableCell className="font-medium">{r.estacion}</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {r.fecha_inicial}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {r.pm25}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.nombre}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-normal text-muted-foreground">
                          sin datos
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Página {current} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current <= 1}
              className="bg-card"
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={current >= totalPages}
              className="bg-card"
            >
              Siguiente
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
