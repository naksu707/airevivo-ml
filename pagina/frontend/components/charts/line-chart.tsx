'use client'

import { useMemo, useRef, useState } from 'react'

export type LinePoint = { label: string; value: number }

type Props = {
  data: LinePoint[]
  unit?: string
  height?: number
}

const PAD = { top: 16, right: 16, bottom: 28, left: 40 }
const W = 760
const H = 260

export function LineChart({ data, unit = 'µg/m³', height = 300 }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const { path, area, points, min, max, ticks } = useMemo(() => {
    const values = data.map((d) => d.value)
    const rawMax = Math.max(...values, 1)
    const rawMin = Math.min(...values, 0)
    const max = Math.ceil(rawMax / 10) * 10
    const min = Math.max(0, Math.floor(rawMin / 10) * 10)
    const span = max - min || 1
    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom
    const pts = data.map((d, i) => {
      const x = PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
      const y = PAD.top + innerH - ((d.value - min) / span) * innerH
      return { x, y, ...d }
    })
    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const area =
      pts.length > 0
        ? `M${pts[0].x},${PAD.top + innerH} ` +
          pts.map((p) => `L${p.x},${p.y}`).join(' ') +
          ` L${pts[pts.length - 1].x},${PAD.top + innerH} Z`
        : ''
    const ticks = Array.from({ length: 5 }, (_, i) => {
      const v = min + (span * i) / 4
      const y = PAD.top + innerH - (i / 4) * innerH
      return { v: Math.round(v), y }
    })
    return { path, area, points: pts, min, max, ticks }
  }, [data])

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg || points.length === 0) return
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    let nearest = 0
    let dist = Infinity
    points.forEach((p, i) => {
      const d = Math.abs(p.x - x)
      if (d < dist) {
        dist = d
        nearest = i
      }
    })
    setHover(nearest)
  }

  const active = hover != null ? points[hover] : null

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label="Serie temporal de PM2.5"
      >
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t.y}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={t.y}
              y2={t.y}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text x={PAD.left - 8} y={t.y + 4} textAnchor="end" className="fill-muted-foreground" fontSize={11}>
              {t.v}
            </text>
          </g>
        ))}

        {area && <path d={area} fill="url(#lineFill)" />}
        {path && <path d={path} fill="none" stroke="var(--chart-1)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}

        {active && (
          <g>
            <line
              x1={active.x}
              x2={active.x}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="var(--chart-1)"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.5}
            />
            <circle cx={active.x} cy={active.y} r={5} fill="var(--chart-1)" stroke="var(--background)" strokeWidth={2} />
          </g>
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg"
          style={{
            left: `${(active.x / W) * 100}%`,
            top: `${(active.y / H) * 100}%`,
          }}
        >
          <div className="font-medium text-popover-foreground">{active.label}</div>
          <div className="text-muted-foreground">
            <span className="font-semibold text-primary">{active.value}</span> {unit}
          </div>
        </div>
      )}
    </div>
  )
}
