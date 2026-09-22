import categoriesConfig from '@/config/air_quality_categories.json'

export type IcaCategory = {
  id: string
  nombre: string
  color: string
  emoji: string
  descripcion: string
  pm25_referencia: [number, number]
}

export const ICA_CONFIG = categoriesConfig
export const ICA_CATEGORIES = categoriesConfig.categorias as IcaCategory[]

/**
 * Clasificación REFERENCIAL (no validada) de un valor PM2.5 según los rangos
 * configurables. Se usa solo como ayuda visual en la interfaz; NO representa
 * la salida del modelo de Machine Learning, que aún no está integrado.
 */
export function referenceCategoryForPm25(pm25: number): IcaCategory {
  const found = ICA_CATEGORIES.find(
    (c) => pm25 >= c.pm25_referencia[0] && pm25 <= c.pm25_referencia[1],
  )
  return found ?? ICA_CATEGORIES[ICA_CATEGORIES.length - 1]
}
