import type { Metadata } from 'next'
import { PageHero } from '@/components/page-hero'

export const metadata: Metadata = {
  title: 'Fuente de datos — AireVivo',
  description: 'Información sobre el origen y el tratamiento de los datos de vigilancia de calidad del aire.',
}

export default function SourcePage() {
  return (
    <>
      <PageHero
        eyebrow="Fuentes"
        title="Origen de los datos"
        description="La plataforma usa mediciones de PM2.5 del Valle del Cauca y sus resultados son analizados a través del modelo predictivo del proyecto."
      />
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-semibold">Qué información se usa</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            El conjunto de datos de referencia corresponde a registros de estaciones de monitoreo del Valle del Cauca, con mediciones de PM2.5 y fechas de observación. Los análisis están orientados a la interpretación del riesgo ambiental y a la clasificación de la calidad del aire.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6">
            <h3 className="font-display text-xl font-semibold">Base de datos</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Se conserva la información en SQLite para que la aplicación pueda consultar estaciones, series temporales y registros de observación sin depender de una fuente externa al momento de la demo.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <h3 className="font-display text-xl font-semibold">Modelo predictivo</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              El sistema aplica un clasificador entrenado sobre información histórica para estimar la categoría del Índice de Calidad del Aire y apoyar interpretaciones operativas.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
