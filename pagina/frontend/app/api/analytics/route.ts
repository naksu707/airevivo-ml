import { NextResponse } from 'next/server'
import { averageByStation, distribution, timeSeries } from '@/lib/air-quality/db'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filters = { station: searchParams.get('station'), startDate: searchParams.get('start_date'), endDate: searchParams.get('end_date') }
  return NextResponse.json({
    series: timeSeries(filters),
    byStation: averageByStation(filters),
    distribution: distribution(filters),
  })
}
