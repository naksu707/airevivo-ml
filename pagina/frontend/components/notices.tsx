import { Info, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DemoNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-secondary-foreground/15 bg-secondary/50 p-4 text-sm',
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-secondary-foreground" aria-hidden />
      <p className="leading-relaxed text-secondary-foreground">
        <span className="font-semibold">Datos del MVP.</span> Los registros mostrados provienen del CSV de SISAIRE cargado en SQLite.
        El dataset disponible contiene estación, fecha y PM2.5; las variables meteorológicas permanecen vacías porque no están presentes en este archivo.
      </p>
    </div>
  )
}

export function ModelPendingNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm',
        className,
      )}
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <p className="leading-relaxed text-foreground">
        <span className="font-semibold">Modelo predictivo pendiente.</span> El clasificador de
        Machine Learning aún no está integrado, por lo que la aplicación{' '}
        <span className="font-medium">no genera predicciones simuladas</span>. Esta sección quedará
        activa cuando el modelo entrenado y validado se conecte a la API.
      </p>
    </div>
  )
}
