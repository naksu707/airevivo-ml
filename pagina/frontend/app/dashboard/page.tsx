import type { Metadata } from 'next'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageHero } from '@/components/page-hero'
import { DashboardView } from '@/components/dashboard/dashboard-view'

export const metadata: Metadata = {
  title: 'Dashboard — AireVivo',
  description: 'Visualización analítica de datos de PM2.5 por estación y fecha en el Valle del Cauca.',
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['USUARIO', 'ANALISTA', 'ADMINISTRADOR']}>
      <>
        <PageHero
          eyebrow="Análisis"
          title="Dashboard de calidad del aire"
          description="Explora la evolución de PM2.5, compara estaciones y revisa la distribución de concentraciones. Filtra por estación y rango de fechas."
        />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <DashboardView />
        </div>
      </>
    </ProtectedRoute>
  )
}
