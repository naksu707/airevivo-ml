import type { Metadata } from 'next'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageHero } from '@/components/page-hero'
import { DataTableView } from '@/components/data/data-table-view'
import { DemoNotice } from '@/components/notices'

export const metadata: Metadata = {
  title: 'Datos — AireVivo',
  description: 'Consulta y filtra los registros de PM2.5 de las estaciones del Valle del Cauca.',
}

export default function DataPage() {
  return (
    <ProtectedRoute allowedRoles={['ANALISTA', 'ADMINISTRADOR']}>
      <>
        <PageHero
          eyebrow="Registros"
          title="Explorador de datos"
          description="Consulta los registros de PM2.5 por estación y fecha. El archivo disponible contiene estación, fecha y PM2.5; las variables meteorológicas no están presentes en este dataset."
        />
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
          <DemoNotice />
          <DataTableView />
        </div>
      </>
    </ProtectedRoute>
  )
}
