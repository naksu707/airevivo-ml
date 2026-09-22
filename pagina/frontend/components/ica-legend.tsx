import { ICA_CATEGORIES } from '@/lib/air-quality/categories'

export function IcaLegend({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'flex flex-wrap gap-2' : 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'}>
      {ICA_CATEGORIES.map((c) =>
        compact ? (
          <span
            key={c.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium"
          >
            <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
            {c.nombre}
          </span>
        ) : (
          <div
            key={c.id}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
          >
            <span
              className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-sm"
              style={{ backgroundColor: `${c.color}22` }}
            >
              <span className="size-3 rounded-full" style={{ backgroundColor: c.color }} />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{c.nombre}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{c.descripcion}</p>
              <p className="mt-1 text-[11px] font-medium text-muted-foreground/80">
                PM2.5 ref.: {c.pm25_referencia[0]}–{c.pm25_referencia[1]} µg/m³
              </p>
            </div>
          </div>
        ),
      )}
    </div>
  )
}
