import Link from 'next/link'
import { Wind } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Wind className="size-5" aria-hidden />
              </span>
              <span className="font-display text-base font-semibold">
                AireValle<span className="text-primary">Predict</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Proyecto académico — Machine Learning y calidad del aire. Prototipo (MVP) para el
              análisis de PM2.5 y la futura predicción del Índice de Calidad del Aire en el Valle
              del Cauca.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/data" className="text-muted-foreground hover:text-foreground">
              Datos
            </Link>
            <Link href="/prediction" className="text-muted-foreground hover:text-foreground">
              Predicción
            </Link>
            <Link href="/monitoring" className="text-muted-foreground hover:text-foreground">
              Red de monitoreo
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground">
              Proyecto
            </Link>
            <a
              href="http://sisaire.ideam.gov.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              SISAIRE / IDEAM
            </a>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Fuente de datos:{' '}
            <a
              href="http://sisaire.ideam.gov.co"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              sisaire.ideam.gov.co
            </a>
          </p>
          <p>
            No es un producto oficial del IDEAM. Las predicciones no sustituyen mediciones oficiales
            ni constituyen recomendaciones médicas.
          </p>
        </div>
      </div>
    </footer>
  )
}
