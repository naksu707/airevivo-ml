# Aire Valle Predict

Arranca toda la aplicación con:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API FastAPI: http://localhost:8000/api/health

El frontend reenvía las peticiones a `/api/*` al backend FastAPI dentro de la
red de Docker. El backend inicializa su base SQLite persistente a partir de
`frontend/data/reporte_sisaire.csv`. El código de ambos servicios se monta como
volumen para reflejar cambios inmediatamente.

```bash
docker compose down
```
