import { NextResponse } from 'next/server'
import { countRecords, getRecords } from '@/lib/air-quality/db'
export const dynamic = 'force-dynamic'
export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limitRaw = Number(searchParams.get('limit') ?? '100')
  const offsetRaw = Number(searchParams.get('offset') ?? '0')
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 100
  const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0
  const filters = { station: searchParams.get('station'), startDate: searchParams.get('start_date'), endDate: searchParams.get('end_date') }
  const records = getRecords(filters, limit, offset)
  return NextResponse.json({ records, total: countRecords(filters), limit, offset, demo: false })
}
