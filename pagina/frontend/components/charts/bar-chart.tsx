'use client'

import { useState } from 'react'

export type BarDatum = { label: string; value: number; color?: string }

type Props = {
  data: BarDatum[]
  unit?: string
  horizontal?: boolean
}

export function BarChart({ data, unit = '', horizontal = true }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(...data.map((d) => d.value), 1)

  if (horizontal) {
    return (
      <div className="flex flex-col gap-3">
        {data.map((d, i) => (
          <div
            key={d.label}
            className="group flex items-center gap-3"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <div className="w-28 shrink-0 truncate text-right text-xs font-medium text-muted-foreground sm:w-32">
              {d.label}
            </div>
            <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-muted">
              <div
                className="flex h-full items-center justify-end rounded-md px-2 text-[11px] font-semibold text-primary-foreground transition-all duration-500"
                style={{
                  width: `${Math.max((d.value / max) * 100, 8)}%`,
                  backgroundColor: d.color ?? 'var(--chart-1)',
                  opacity: hover == null || hover === i ? 1 : 0.55,
                }}
              >
                {d.value}
                {unit ? ` ${unit}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Vertical bars
  return (
    <div className="flex h-64 items-end gap-2">
      {data.map((d, i) => (
        <div
          key={d.label}
          className="flex flex-1 flex-col items-center gap-2"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          <div className="relative flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${Math.max((d.value / max) * 100, 3)}%`,
                backgroundColor: d.color ?? 'var(--chart-1)',
                opacity: hover == null || hover === i ? 1 : 0.55,
              }}
            />
            {hover === i && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-semibold shadow-md">
                {d.value}
                {unit ? ` ${unit}` : ''}
              </div>
            )}
          </div>
          <span className="w-full truncate text-center text-[10px] text-muted-foreground">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  )
}
