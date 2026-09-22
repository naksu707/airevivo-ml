import { NextResponse } from 'next/server'
import { getStations } from '@/lib/air-quality/db'
export const dynamic = 'force-dynamic'
export function GET() { return NextResponse.json({ stations: getStations(), demo: false, source: 'SQLite / SISAIRE' }) }
