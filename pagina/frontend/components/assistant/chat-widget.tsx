'use client'

import { useMemo, useState } from 'react'
import { CloudSun, MessageCircle, SendHorizonal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ChartPoint = {
  label: string
  value: number
}

type ChatChart = {
  type: 'bar'
  title: string
  data: ChartPoint[]
}

type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  text: string
  chart?: ChatChart | null
}

function ChartPreview({ chart }: { chart: ChatChart }) {
  const maxValue = Math.max(...chart.data.map((item) => item.value), 1)

  return (
    <div className="mt-4 rounded-xl border border-border bg-background/70 p-3">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {chart.title}
      </p>
      <svg viewBox="0 0 320 180" className="h-40 w-full">
        {[0, 1, 2, 3].map((tick) => {
          const y = 20 + tick * 38
          return (
            <line
              key={tick}
              x1={28}
              x2={300}
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeDasharray="4 4"
            />
          )
        })}
        {chart.data.map((item, index) => {
          const barWidth = 26
          const x = 36 + index * 52
          const barHeight = (item.value / maxValue) * 110
          const y = 150 - barHeight
          return (
            <g key={`${item.label}-${index}`}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx={6} fill="var(--chart-2)" opacity={0.9} />
              <text x={x + barWidth / 2} y={165} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">
                {item.label.length > 8 ? `${item.label.slice(0, 6)}…` : item.label}
              </text>
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="9" fill="var(--foreground)">
                {item.value}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hola. Puedo responder preguntas del dashboard, resumir tendencias y ayudarte a crear una gráfica dinámica con los datos de PM2.5 y estaciones.',
    },
  ])

  const emptyStateText = useMemo(
    () => 'Pregunta por estación, fecha, tendencia, comparaciones por PM2.5 o pide una gráfica.',
    [],
  )

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const nextUserMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: trimmed }
    setMessages((prev) => [...prev, nextUserMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      const data = await response.json()
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: data.answer ?? 'No pude responder esa consulta.',
        chart: data.chart ?? null,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: 'No pude conectar con el asistente. Revisa la clave de Anthropic en el archivo .env.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-[360px] overflow-hidden rounded-2xl border border-border bg-background/95 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CloudSun className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Rain</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Analista de datos</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted"
              aria-label="Cerrar asistente"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`w-full max-w-[85%] break-words rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-muted/50 text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.text}</p>
                  {message.chart && <ChartPreview chart={message.chart} />}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  Consultando datos…
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-3">
            <label className="sr-only" htmlFor="assistant-question">Pregunta para el asistente</label>
            <div className="flex gap-2">
              <input
                id="assistant-question"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSend()
                }}
                placeholder={emptyStateText}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-primary"
              />
              <Button type="button" onClick={handleSend} disabled={loading || !input.trim()} size="icon" className="rounded-xl">
                <SendHorizonal className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-105"
        aria-label="Abrir asistente de IA"
      >
        <CloudSun className="size-7" />
      </button>
    </div>
  )
}
