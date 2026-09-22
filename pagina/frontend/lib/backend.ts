export type BackendStation = { nombre: string; registros: number }

export type BackendStats = {
  registros: number
  estaciones: number
  pm25_promedio: number | null
  pm25_maximo: number | null
  pm25_minimo: number | null
  fecha_minima: string | null
  fecha_maxima: string | null
}

const backendUrl = (process.env.BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')

/** Calls FastAPI from server-rendered pages inside the Docker network. */
export async function backendFetch<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {}

  if (typeof window !== 'undefined') {
    try {
      const session = window.localStorage.getItem('airevivo-session')
      if (session) {
        const parsed = JSON.parse(session) as { name?: string; email?: string; role?: string }
        if (parsed.email) headers['x-user-email'] = parsed.email
        if (parsed.name) headers['x-user-name'] = parsed.name
        if (parsed.role) headers['x-user-role'] = parsed.role
      }
    } catch {
      // Ignored for guests or malformed sessions.
    }
  }

  const response = await fetch(`${backendUrl}${path}`, { cache: 'no-store', headers })
  if (!response.ok) throw new Error(`La API respondió con ${response.status}.`)
  return response.json() as Promise<T>
}
