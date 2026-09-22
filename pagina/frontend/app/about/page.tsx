import type { Metadata } from 'next'
import { Database, BrainCircuit, ShieldAlert, GitBranch } from 'lucide-react'
import { PageHero } from '@/components/page-hero'
import { Card } from '@/components/ui/card'
import { DemoNotice, ModelPendingNotice } from '@/components/notices'

export const metadata: Metadata = {
  title: 'Metodología — AireVivo',
  description: 'Enfoque, alcance y decisiones metodológicas del sistema de predicción de calidad del aire.',
}

export default function AboutPage() {
  const blocks = [
    {
      icon: Database,
      title: 'Origen de los datos',
      body: 'El MVP utiliza el CSV de SISAIRE disponible y lo carga en una base de datos SQLite para consulta local. En el archivo analizado están disponibles Estación, Fecha inicial y PM2.5; Fecha final está vacía y no se incluyen variables meteorológicas.',
    },
    {
      icon: BrainCircuit,
      title: 'Modelo de clasificación',
      body: 'El objetivo es un clasificador supervisado que asigne la categoría ICA. Se entrena en Python (scikit-learn) y se serializa; la aplicación define el contrato de integración mediante la clase MLPredictor.',
    },
    {
      icon: ShieldAlert,
      title: 'Evitar el data leakage',
      body: 'PM2.5 participa en la construcción del ICA, por lo que usarlo directamente como predictor exige documentar la metodología. Las features deben estar disponibles ANTES del momento de predicción: históricos, medias móviles, meteorología pronosticada y variables temporales.',
    },
    {
      icon: GitBranch,
      title: 'Arquitectura',
      body: 'Capa de datos (registros y estadísticas), capa de visualización (dashboard interactivo) y capa de predicción (API preparada). Cada capa es independiente para facilitar la integración del modelo real.',
    },
  ]

  return (
    <>
      <PageHero
        eyebrow="Acerca de"
        title="Metodología y alcance"
        description="Cómo está pensado AireVivo y qué decisiones guían el desarrollo hacia un sistema de alerta temprana de calidad del aire."
      />
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {blocks.map((b) => (
            <Card key={b.title} className="p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <b.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
            </Card>
          ))}
        </div>

        <DemoNotice />
        <ModelPendingNotice />
      </div>
    </>
  )
}
