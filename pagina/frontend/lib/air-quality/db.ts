import Database from 'better-sqlite3'
import path from 'node:path'

const dbPath = path.join(process.cwd(), 'data', 'air_quality.db')

let db: Database.Database | null = null

function getDb() {
  if (!db) {
    db = new Database(dbPath, { readonly: true })
  }
  return db
}

export type AirQualityRecord = {
  id: number
  estacion: string
  fecha_inicial: string
  fecha_final: string | null
  pm25: number
  temperatura: number | null
  humedad: number | null
  velocidad_viento: number | null
  demo: boolean
}

export type Station = { nombre: string; registros: number }
export type RecordFilters = { station?: string | null; startDate?: string | null; endDate?: string | null }

function where(filters: RecordFilters) {
  const clauses: string[] = []
  const params: Record<string, string> = {}
  if (filters.station && filters.station !== 'todas') { clauses.push('estacion = @station'); params.station = filters.station }
  if (filters.startDate) { clauses.push('fecha_inicial >= @startDate'); params.startDate = filters.startDate }
  if (filters.endDate) { clauses.push('fecha_inicial <= @endDate'); params.endDate = filters.endDate }
  return { sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params }
}

export function getStations(): Station[] {
  return getDb().prepare(`SELECT estacion AS nombre, COUNT(*) AS registros FROM air_quality_records GROUP BY estacion ORDER BY registros DESC, nombre`).all() as Station[]
}

export function getRecords(filters: RecordFilters = {}, limit = 500, offset = 0): AirQualityRecord[] {
  const w = where(filters)
  return getDb().prepare(`SELECT id, estacion, fecha_inicial, fecha_final, pm25, temperatura, humedad, velocidad_viento, demo FROM air_quality_records ${w.sql} ORDER BY fecha_inicial DESC, id DESC LIMIT @limit OFFSET @offset`).all({ ...w.params, limit, offset }).map((r: any) => ({ ...r, demo: Boolean(r.demo) })) as AirQualityRecord[]
}

export function countRecords(filters: RecordFilters = {}) {
  const w = where(filters)
  return (getDb().prepare(`SELECT COUNT(*) AS total FROM air_quality_records ${w.sql}`).get(w.params) as { total: number }).total
}

export function computeStats(filters: RecordFilters = {}) {
  const w = where(filters)
  const row = getDb().prepare(`SELECT COUNT(*) AS registros, AVG(pm25) AS pm25_promedio, MAX(pm25) AS pm25_maximo, MIN(pm25) AS pm25_minimo, MIN(fecha_inicial) AS fecha_minima, MAX(fecha_inicial) AS fecha_maxima, COUNT(DISTINCT estacion) AS estaciones FROM air_quality_records ${w.sql}`).get(w.params) as any
  return {
    registros: row.registros,
    estaciones: row.estaciones,
    pm25_promedio: row.pm25_promedio == null ? null : Number(row.pm25_promedio.toFixed(2)),
    pm25_maximo: row.pm25_maximo == null ? null : Number(row.pm25_maximo.toFixed(2)),
    pm25_minimo: row.pm25_minimo == null ? null : Number(row.pm25_minimo.toFixed(2)),
    fecha_minima: row.fecha_minima,
    fecha_maxima: row.fecha_maxima,
  }
}

export function averageByStation(filters: RecordFilters = {}) {
  const w = where(filters)
  return getDb().prepare(`SELECT estacion, ROUND(AVG(pm25), 2) AS promedio, COUNT(*) AS registros FROM air_quality_records ${w.sql} GROUP BY estacion ORDER BY promedio DESC`).all(w.params) as { estacion: string; promedio: number; registros: number }[]
}

export function timeSeries(filters: RecordFilters = {}) {
  const w = where(filters)
  return getDb().prepare(`SELECT fecha_inicial AS fecha, ROUND(AVG(pm25), 2) AS pm25 FROM air_quality_records ${w.sql} GROUP BY fecha_inicial ORDER BY fecha_inicial`).all(w.params) as { fecha: string; pm25: number }[]
}

export function distribution(filters: RecordFilters = {}) {
  const w = where(filters)
  return getDb().prepare(`SELECT CAST(pm25 / 10 AS INTEGER) * 10 AS bin, COUNT(*) AS count FROM air_quality_records ${w.sql} GROUP BY bin ORDER BY bin`).all(w.params).map((r: any) => ({ bin: Number(r.bin), count: Number(r.count), rango: `${r.bin}–${Number(r.bin) + 10}` }))
}

export function getLatestRecords(filters: RecordFilters = {}, limit = 500) {
  return getRecords(filters, limit, 0)
}

