import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

type Props = {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
}

export function StatCard({ icon: Icon, label, value, hint }: Props) {
  return (
    <Card className="group relative overflow-hidden border border-border/70 bg-card/85 p-5 shadow-[0_12px_30px_rgba(30,52,60,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(30,52,60,0.08)]">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" aria-hidden />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10">
          <Icon className="size-4.5" aria-hidden />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  )
}
