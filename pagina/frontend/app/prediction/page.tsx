import type { Metadata } from 'next'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageHero } from '@/components/page-hero'
import { PredictionView } from '@/components/prediction/prediction-view'
import { backendFetch, type BackendStation } from '@/lib/backend'

export const metadata: Metadata = {
  title: 'Predicción ICA — AireVivo',
  description:
    'Capa de predicción del Índice de Calidad del Aire, preparada para integrar el modelo de Machine Learning.',
}

export default async function PredictionPage() {
  const { stations } = await backendFetch<{ stations: BackendStation[] }>('/api/stations')
  return (
    <ProtectedRoute allowedRoles={['USUARIO', 'ANALISTA', 'ADMINISTRADOR']}>
      <>
        <PageHero
          eyebrow="Machine Learning"
          title="Predicción del Índice de Calidad del Aire"
          description="El clasificador entrenado ya está conectado a la API y genera predicciones reales del ICA para cada estación y fecha."
        />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <PredictionView stations={stations.map((station) => station.nombre)} />
        </div>
      </>
    </ProtectedRoute>
  )
}
