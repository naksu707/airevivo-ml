import { NextResponse } from 'next/server'

const backendUrl = (process.env.BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')

export async function GET() {
  try {
    const response = await fetch(`${backendUrl}/api/model`, { cache: 'no-store' })
    if (!response.ok) {
      return NextResponse.json({ disponible: false, estado: 'pendiente_de_integracion', mensaje: 'Modelo predictivo aún no disponible' }, { status: 502 })
    }
    const payload = await response.json()
    return NextResponse.json({
      ...payload,
      algoritmo: payload.algoritmo ?? 'RandomForestClassifier',
    })
  } catch {
    return NextResponse.json({
      disponible: false,
      estado: 'pendiente_de_integracion',
      mensaje: 'Modelo predictivo aún no disponible',
      algoritmo: null,
    }, { status: 502 })
  }
}
