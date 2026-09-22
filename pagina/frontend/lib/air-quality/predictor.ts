/**
 * MLPredictor — capa de abstracción para consultar el modelo real del backend.
 *
 * El modelo entrenado vive en el servicio FastAPI y no en el frontend. Esta
 * clase define el contrato de integración para consultar el estado del modelo y
 * ejecutar predicciones con los datos de entrada.
 */

export type PredictionInput = {
  estacion: string
  fecha: string
  pm25?: number | null
  temperatura?: number | null
  humedad?: number | null
  velocidad_viento?: number | null
}

export type PredictionResult =
  | {
      disponible: false
      mensaje: string
      modelo: null
      timestamp: string
    }
  | {
      disponible: true
      categoria: string
      probabilidad: number | null
      modelo: string
      timestamp: string
    }

const backendUrl = (process.env.BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')

export class MLPredictor {
  private modelLoaded = false
  private modelVersion: string | null = null

  async loadModel(): Promise<void> {
    try {
      const response = await fetch(`${backendUrl}/api/model`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`Model status failed: ${response.status}`)
      const data = await response.json()
      this.modelLoaded = Boolean(data.disponible)
      this.modelVersion = data.algoritmo ?? data.modelo ?? 'RandomForestClassifier'
    } catch {
      this.modelLoaded = false
      this.modelVersion = null
    }
  }

  isAvailable(): boolean {
    return this.modelLoaded
  }

  async run(input: PredictionInput): Promise<PredictionResult> {
    const timestamp = new Date().toISOString()
    try {
      const response = await fetch(`${backendUrl}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.status}`)
      }

      const payload = await response.json()
      if (!payload.disponible) {
        return {
          disponible: false,
          mensaje: payload.mensaje ?? 'Modelo predictivo aún no disponible',
          modelo: null,
          timestamp,
        }
      }

      return {
        disponible: true,
        categoria: payload.categoria ?? 'desconocida',
        probabilidad: payload.probabilidad ?? null,
        modelo: payload.modelo ?? this.modelVersion ?? 'RandomForestClassifier',
        timestamp: payload.timestamp ?? timestamp,
      }
    } catch {
      return {
        disponible: false,
        mensaje: 'No se pudo contactar el servicio de predicción.',
        modelo: null,
        timestamp,
      }
    }
  }
}

export const predictor = new MLPredictor()

