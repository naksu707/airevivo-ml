import { NextResponse } from 'next/server'
import { computeStats } from '@/lib/air-quality/db'
export const dynamic = 'force-dynamic'
export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filters = { station: searchParams.get('station'), startDate: searchParams.get('start_date'), endDate: searchParams.get('end_date') }
  return NextResponse.json({ ...computeStats(filters), demo: false, source: 'SQLite / SISAIRE' })
}
