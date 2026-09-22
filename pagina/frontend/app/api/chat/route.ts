import { NextResponse } from 'next/server'

const backendUrl = (process.env.BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')

function buildChartFromAnalytics(data: { label: string; value: number }[], title: string) {
  const chartData = [...data].sort((a, b) => b.value - a.value).slice(0, 6)
  return chartData.length
    ? {
        type: 'bar',
        title,
        data: chartData.map((item) => ({
          label: item.label.length > 12 ? `${item.label.slice(0, 10)}…` : item.label,
          value: Number(item.value) || 0,
        })),
      }
    : null
}

export async function POST(request: Request) {
  const { message } = await request.json().catch(() => ({ message: '' }))
  const question = String(message ?? '').trim()

  if (!question) {
    return NextResponse.json({
      answer: 'Escribe una pregunta sobre estaciones, tendencias o comparaciones de calidad del aire.',
      chart: null,
    })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'TU_API_KEY_AQUI') {
    return NextResponse.json({
      answer:
        'Todavía no has configurado tu clave de Claude en el archivo .env. Agrega ANTHROPIC_API_KEY y reinicia el contenedor para activar el asistente.',
      chart: null,
    })
  }

  const [stats, analytics, stations] = await Promise.all([
    fetch(`${backendUrl}/api/stats`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
    fetch(`${backendUrl}/api/analytics`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
    fetch(`${backendUrl}/api/stations`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null),
  ])

  const stationChart = buildChartFromAnalytics(
    ((analytics?.byStation ?? []) as Array<{ estacion: string; promedio: number }>).map((item) => ({
      label: item.estacion,
      value: Number(item.promedio) || 0,
    })),
    'Promedio PM2.5 por estación',
  )

  const summary = {
    registros: stats?.registros ?? 0,
    pm25_promedio: stats?.pm25_promedio ?? 0,
    pm25_maximo: stats?.pm25_maximo ?? 0,
    fecha_minima: stats?.fecha_minima ?? 'N/A',
    fecha_maxima: stats?.fecha_maxima ?? 'N/A',
    estaciones: stats?.estaciones ?? 0,
    estaciones_lista: (stations?.stations ?? []).slice(0, 10).map((item: any) => item.nombre),
    top_estaciones: (analytics?.byStation ?? []).slice(0, 6).map((item: any) => ({
      estacion: item.estacion,
      promedio: item.promedio,
    })),
  }

  const prompt = `Eres un asistente experto en calidad del aire para la app AireVivo. Responde en español, claro y breve.

Contexto de datos:
${JSON.stringify(summary, null, 2)}

Pregunta del usuario:
${question}

Instrucciones:
- Usa solo los datos del contexto.
- Si el usuario pide una gráfica, devuelve un JSON con esta estructura exacta: {"answer":"...","chart":{"type":"bar","title":"...","data":[{"label":"...","value":123}]}}.
- Si no pide gráfica, responde con un resumen útil y breve en texto plano.
- Si no puedes responder con los datos disponibles, dilo honestamente.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022',
        max_tokens: 700,
        temperature: 0.2,
        system:
          'Eres un asistente analítico para un dashboard de calidad del aire. Responde siempre en español y prioriza datos concretos.',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        answer: `La clave de Anthropic no está activa o la petición falló. Revisa tu .env y la API. Detalle: ${errorText.slice(0, 180)}`,
        chart: null,
      }, { status: 502 })
    }

    const payload = await response.json()
    const rawText = payload?.content?.[0]?.text ?? ''

    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json({
          answer: parsed.answer ?? rawText,
          chart: parsed.chart ?? stationChart,
        })
      } catch {
        // fall through to plain text
      }
    }

    return NextResponse.json({
      answer: rawText || 'No pude generar una respuesta útil.',
      chart: /grafica|gráfico|chart|barras|diagrama|histogram/i.test(question) ? stationChart : null,
    })
  } catch (error) {
    console.error('Anthropic chat error:', error)
    return NextResponse.json({
      answer:
        'No pude contactar a Claude. Verifica la clave en .env y que el contenedor esté corriendo con las variables correctas.',
      chart: null,
    }, { status: 502 })
  }
}
