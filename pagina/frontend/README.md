# AireVivo — MVP de calidad del aire

MVP académico basado en el proyecto **Desarrollo de una herramienta tecnológica basada en un modelo de Machine Learning para la predicción del Índice de Calidad del Aire en el Valle del Cauca**.

## Formato técnico

- Next.js 16 + React 19 + TypeScript
- App Router
- shadcn/ui + Tailwind CSS
- Recharts
- SQLite con `better-sqlite3`
- API Routes para estadísticas, registros, estaciones y predicción

## Qué incluye

- Landing page responsive.
- Dashboard interactivo con filtros por estación y fecha.
- Explorador paginado de registros.
- Red de estaciones.
- Página de predicción preparada para conectar el modelo supervisado.
- Página de metodología y transparencia.
- Base `data/air_quality.db` cargada con el CSV disponible de SISAIRE.

## Datos reales cargados

La base contiene **37.582 registros válidos de 27 estaciones** a partir del CSV disponible en el proyecto.

El archivo analizado contiene:

- `Estacion`
- `Fecha inicial`
- `Fecha final` (vacía en el archivo)
- `PM2.5`

Las variables meteorológicas no están presentes en este CSV, por lo que no se inventan en la interfaz.

## Importante sobre el modelo

La pantalla de predicción no genera resultados ficticios. El clasificador supervisado debe conectarse cuando exista un modelo entrenado y validado.

Además, si el objetivo `Nivel ICA` se construye directamente a partir de PM2.5, usar el PM2.5 del mismo instante como predictor puede producir **data leakage**. Para una predicción futura, deben priorizarse variables disponibles antes del momento objetivo, por ejemplo históricos/rezagos, medias móviles y meteorología pronosticada cuando esté disponible.

## Ejecutar

```bash
pnpm install
pnpm dev
```

Abrir:

`http://localhost:3000`

## Base de datos

La base SQLite ya está incluida en:

`data/air_quality.db`

El CSV fuente está incluido en:

`data/reporte_sisaire.csv`
