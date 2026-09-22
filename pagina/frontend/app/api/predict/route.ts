import { NextResponse } from 'next/server'
import type { PredictionInput } from '@/lib/air-quality/predictor'

const backendUrl = (process.env.BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')

export async function POST(request: Request) {
  let body: Partial<PredictionInput>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (!body.estacion || !body.fecha) {
    return NextResponse.json(
      { error: 'Los campos "estacion" y "fecha" son obligatorios.' },
      { status: 422 },
    )
  }

  try {
    const response = await fetch(`${backendUrl}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estacion: body.estacion,
        fecha: body.fecha,
        pm25: body.pm25 ?? null,
        temperatura: body.temperatura ?? null,
        humedad: body.humedad ?? null,
        velocidad_viento: body.velocidad_viento ?? null,
      }),
      cache: 'no-store',
    })

    const payload = await response.json()
    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status })
    }

    return NextResponse.json(payload)
  } catch {
    return NextResponse.json({
      disponible: false,
      mensaje: 'No se pudo contactar el servicio de predicción.',
      modelo: null,
      timestamp: new Date().toISOString(),
    }, { status: 502 })
  }
}
