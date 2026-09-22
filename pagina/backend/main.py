"""API de calidad del aire: SQLite, analítica y predicción del modelo Taller 3."""

import csv
import json
import logging
import os
import re
import sqlite3
import urllib.request
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DATABASE_PATH = Path(os.getenv("DATABASE_PATH", "/data/air_quality.db"))
CSV_PATH = Path(os.getenv("CSV_PATH", "/models/reporte_sisaire.csv"))
MODEL_PATH = Path(os.getenv("MODEL_PATH", "/models/modelo_taller3_clasificacion.joblib"))

app = FastAPI(title="Aire Valle Predict API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[value for value in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")],
    allow_methods=["*"], allow_headers=["*"], allow_credentials=True,
)
model = None
logger = logging.getLogger(__name__)


@contextmanager
def db():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()


def filters(station: str | None, start_date: str | None, end_date: str | None):
    parts, params = [], []
    if station and station != "todas":
        parts.append("estacion = ?")
        params.append(station)
    if start_date:
        parts.append("fecha_inicial >= ?")
        params.append(start_date)
    if end_date:
        parts.append("fecha_inicial <= ?")
        params.append(end_date)
    return (" WHERE " + " AND ".join(parts)) if parts else "", params


def initialize_database():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with db() as connection:
        connection.executescript("""
        CREATE TABLE IF NOT EXISTS air_quality_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT, estacion TEXT NOT NULL,
          fecha_inicial TEXT NOT NULL, fecha_final TEXT, pm25 REAL NOT NULL,
          temperatura REAL, humedad REAL, velocidad_viento REAL, demo INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_air_station ON air_quality_records(estacion);
        CREATE INDEX IF NOT EXISTS idx_air_date ON air_quality_records(fecha_inicial);
        CREATE TABLE IF NOT EXISTS predictions (
          id INTEGER PRIMARY KEY AUTOINCREMENT, estacion TEXT, fecha_objetivo TEXT,
          categoria TEXT, probabilidad REAL, modelo TEXT, creado_en TEXT NOT NULL, entrada_json TEXT
        );
        CREATE TABLE IF NOT EXISTS app_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'USUARIO',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS user_favorites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_email TEXT NOT NULL,
          station TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS alerts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_email TEXT NOT NULL,
          station TEXT NOT NULL,
          severity TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS admin_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          actor_email TEXT NOT NULL,
          action TEXT NOT NULL,
          detail TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS roles (
          name TEXT PRIMARY KEY,
          description TEXT NOT NULL DEFAULT '',
          allowed_routes TEXT NOT NULL DEFAULT ''
        );
        """)
        connection.executemany(
            "INSERT OR IGNORE INTO roles (name, description, allowed_routes) VALUES (?, ?, ?)",
            [
                ("VISITANTE", "Acceso público solo a información general", "/,/about,/source"),
                ("USUARIO", "Usuario autenticado con acceso personal", "/dashboard,/prediction,/monitoring,/profile"),
                ("ANALISTA", "Analista con acceso a datos y análisis", "/dashboard,/data,/prediction,/monitoring,/profile"),
                ("ADMINISTRADOR", "Administrador con control total", "/dashboard,/data,/prediction,/monitoring,/admin,/profile"),
            ],
        )
        if connection.execute("SELECT COUNT(*) FROM air_quality_records").fetchone()[0]:
            return
        if not CSV_PATH.exists():
            raise RuntimeError(f"No se encontró el CSV en {CSV_PATH}")
        rows = []
        with CSV_PATH.open(encoding="utf-8-sig", newline="") as source:
            for item in csv.DictReader(source):
                try:
                    pm25 = float(str(item["PM2.5"]).replace(",", "."))
                except (KeyError, ValueError):
                    continue
                rows.append((item.get("Estacion", "").strip(), item.get("Fecha inicial", ""), item.get("Fecha final") or None, pm25))
        connection.executemany(
            "INSERT INTO air_quality_records (estacion, fecha_inicial, fecha_final, pm25) VALUES (?, ?, ?, ?)", rows,
        )


def load_model():
    global model
    if not MODEL_PATH.exists():
        logger.warning("No se encontró el modelo en %s; la API seguirá disponible sin predicciones.", MODEL_PATH)
        return
    try:
        model = joblib.load(MODEL_PATH)
    except Exception:
        logger.exception("No se pudo cargar el modelo en %s; la API seguirá disponible sin predicciones.", MODEL_PATH)


@app.on_event("startup")
def startup():
    initialize_database()
    load_model()


def normalize_role(role: str | None) -> str:
    if role is None:
        return "VISITANTE"
    role_name = str(role).upper().strip()
    if role_name in {"VISITANTE", "USUARIO", "ANALISTA", "ADMINISTRADOR"}:
        return role_name
    return "VISITANTE"


def require_role(request: Request, *allowed_roles: str):
    request_role = request.headers.get("x-user-role") or request.headers.get("X-User-Role")
    role = normalize_role(request_role)
    if not allowed_roles:
        return role
    if request_role is None:
        return role
    if role not in allowed_roles:
        raise HTTPException(status_code=403, detail="No tienes permisos para realizar esta acción.")
    return role


class PredictionInput(BaseModel):
    estacion: str
    fecha: str
    pm25: float | None = None
    temperatura: float | None = None
    humedad: float | None = None
    velocidad_viento: float | None = None


def model_features(input: PredictionInput) -> pd.DataFrame:
    date = pd.to_datetime(input.fecha, errors="coerce")
    if pd.isna(date):
        raise HTTPException(status_code=422, detail="'fecha' debe tener formato YYYY-MM-DD.")
    month, weekday = date.month, date.dayofweek
    return pd.DataFrame([{
        "Estacion": input.estacion, "Año": date.year, "Mes": month,
        "Día_semana": weekday, "Día_año": date.dayofyear,
        "Mes_sen": np.sin(2 * np.pi * month / 12), "Mes_cos": np.cos(2 * np.pi * month / 12),
        "Día_semana_sen": np.sin(2 * np.pi * weekday / 7), "Día_semana_cos": np.cos(2 * np.pi * weekday / 7),
    }])


def build_local_explanation(category: str, probability: float, station: str, fecha: str, pm25: float | None) -> dict:
    category_text = {
        "Buena": "calidad del aire buena y con riesgo bajo para la mayoría de la población",
        "Moderada": "calidad del aire moderada, con algunos riesgos para grupos sensibles",
        "Dañina o peor": "calidad del aire dañina o peor, con riesgo para la salud y mayor necesidad de precauciones",
    }

    base_text = category_text.get(category, f"la categoría {category}")
    pm25_text = f"PM2.5 de {pm25} µg/m³" if pm25 is not None else "con niveles de partículas finas"
    return {
        "descripcion": (
            f"El clasificador asigna a la estación {station} del día {fecha} la categoría {category}, con una confianza de {probability * 100:.1f}%. "
            f"Esto indica que la situación ambiental se interpreta como {base_text}. En términos prácticos, {pm25_text} sugiere que la exposición puede ser "
            "aceptable para la población general en el caso de 'Buena', más vigilante en 'Moderada' y con precauciones reforzadas si se presenta 'Dañina o peor'."
        ),
        "recomendaciones": [
            "Revisa la evolución de PM2.5 en las próximas horas y compara con la estación más cercana.",
            "Si el valor es moderado o más alto, reduce la exposición prolongada en exteriores y vigila a grupos sensibles.",
            "Usa esta clasificación como alerta operativa y no como sustituto de mediciones oficiales o recomendaciones médicas.",
        ],
    }


def generate_llm_explanation(category: str, probability: float, station: str, fecha: str, pm25: float | None) -> dict:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return build_local_explanation(category, probability, station, fecha, pm25)

    prompt = (
        "Eres un analista experto en calidad del aire. Responde en español y usa un tono claro, técnico y útil. "
        "Debes devolver únicamente JSON válido con esta estructura exacta: {'descripcion':'...','recomendaciones':['...','...','...']}. "
        f"La clasificación predicha es {category} con {probability * 100:.1f}% de confianza. "
        f"La estación es {station}, la fecha es {fecha} y el valor de referencia es {pm25} µg/m³ si aplica. "
        "Explica en detalle qué implica esa categoría para la salud, la población sensible y la operación del sistema. "
        "Luego entrega 3 recomendaciones concretas y accionables."
    )

    payload = json.dumps({
        "model": os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022"),
        "max_tokens": 500,
        "temperature": 0.2,
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")

    request = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            body = json.loads(response.read().decode("utf-8"))
    except Exception:
        return build_local_explanation(category, probability, station, fecha, pm25)

    raw_text = ""
    try:
        content = body.get("content") or []
        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                raw_text += str(item.get("text", ""))
            elif isinstance(item, dict):
                raw_text += str(item.get("text") or "")
        if not raw_text:
            return build_local_explanation(category, probability, station, fecha, pm25)
    except Exception:
        return build_local_explanation(category, probability, station, fecha, pm25)

    match = re.search(r"\{.*\}", raw_text, re.DOTALL)
    if not match:
        return build_local_explanation(category, probability, station, fecha, pm25)

    try:
        parsed = json.loads(match.group(0))
        if isinstance(parsed, dict) and "descripcion" in parsed and "recomendaciones" in parsed:
            return {
                "descripcion": str(parsed["descripcion"]),
                "recomendaciones": [str(item) for item in parsed["recomendaciones"][:3]],
            }
    except Exception:
        pass

    return build_local_explanation(category, probability, station, fecha, pm25)


@app.get("/api/health")
def health():
    return {"status": "ok", "database": DATABASE_PATH.exists(), "model": model is not None}


@app.get("/api/stations")
def stations():
    with db() as connection:
        values = connection.execute("SELECT estacion AS nombre, COUNT(*) AS registros FROM air_quality_records GROUP BY estacion ORDER BY registros DESC, nombre").fetchall()
    return {"stations": [dict(value) for value in values], "demo": False, "source": "SQLite / SISAIRE"}


@app.get("/api/records")
def records(station: str | None = None, start_date: str | None = None, end_date: str | None = None, limit: int = Query(100, ge=1, le=500), offset: int = Query(0, ge=0)):
    where, params = filters(station, start_date, end_date)
    with db() as connection:
        total = connection.execute(f"SELECT COUNT(*) FROM air_quality_records{where}", params).fetchone()[0]
        values = connection.execute(f"SELECT id, estacion, fecha_inicial, fecha_final, pm25, temperatura, humedad, velocidad_viento, demo FROM air_quality_records{where} ORDER BY fecha_inicial DESC, id DESC LIMIT ? OFFSET ?", [*params, limit, offset]).fetchall()
    return {"records": [dict(value) for value in values], "total": total, "limit": limit, "offset": offset, "demo": False}


@app.get("/api/stats")
def stats(station: str | None = None, start_date: str | None = None, end_date: str | None = None):
    where, params = filters(station, start_date, end_date)
    with db() as connection:
        row = connection.execute(f"SELECT COUNT(*) registros, AVG(pm25) pm25_promedio, MAX(pm25) pm25_maximo, MIN(pm25) pm25_minimo, MIN(fecha_inicial) fecha_minima, MAX(fecha_inicial) fecha_maxima, COUNT(DISTINCT estacion) estaciones FROM air_quality_records{where}", params).fetchone()
    result = dict(row)
    for key in ("pm25_promedio", "pm25_maximo", "pm25_minimo"):
        result[key] = round(result[key], 2) if result[key] is not None else None
    return {**result, "demo": False, "source": "SQLite / SISAIRE"}


@app.get("/api/analytics")
def analytics(station: str | None = None, start_date: str | None = None, end_date: str | None = None):
    where, params = filters(station, start_date, end_date)
    with db() as connection:
        series = connection.execute(f"SELECT fecha_inicial fecha, ROUND(AVG(pm25), 2) pm25 FROM air_quality_records{where} GROUP BY fecha_inicial ORDER BY fecha_inicial", params).fetchall()
        by_station = connection.execute(f"SELECT estacion, ROUND(AVG(pm25), 2) promedio, COUNT(*) registros FROM air_quality_records{where} GROUP BY estacion ORDER BY promedio DESC", params).fetchall()
        distribution = connection.execute(f"SELECT CAST(pm25 / 10 AS INTEGER) * 10 bin, COUNT(*) count FROM air_quality_records{where} GROUP BY bin ORDER BY bin", params).fetchall()
    bins = [{"bin": item["bin"], "count": item["count"], "rango": f"{item['bin']}–{item['bin'] + 10}"} for item in distribution]
    return {"series": [dict(item) for item in series], "byStation": [dict(item) for item in by_station], "distribution": bins}


@app.get("/api/model")
def model_status(request: Request):
    role = require_role(request, "USUARIO", "ANALISTA", "ADMINISTRADOR")
    return {"disponible": model is not None, "estado": "activo" if model else "pendiente_de_integracion", "mensaje": "Modelo Random Forest activo" if model else "Modelo predictivo aún no disponible", "algoritmo": "RandomForestClassifier" if model else None, "role": role}


@app.get("/api/admin/users")
def admin_users(request: Request):
    require_role(request, "ADMINISTRADOR")
    with db() as connection:
        rows = connection.execute("SELECT id, name, email, role, created_at FROM app_users ORDER BY created_at DESC").fetchall()
    return {"users": [dict(row) for row in rows]}


@app.get("/api/session")
def session_info(request: Request):
    role = normalize_role(request.headers.get("x-user-role") or request.headers.get("X-User-Role"))
    email = request.headers.get("x-user-email") or request.headers.get("X-User-Email")
    if not email:
        return {"authenticated": False, "role": "VISITANTE", "email": None}
    return {"authenticated": True, "role": role, "email": email}


@app.post("/api/predict")
def predict(input: PredictionInput, request: Request):
    require_role(request, "USUARIO", "ANALISTA", "ADMINISTRADOR")
    if model is None:
        return {
            "disponible": False,
            "mensaje": "Modelo predictivo aún no disponible",
            "modelo": None,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    probabilities = model.predict_proba(model_features(input))[0]
    index = int(np.argmax(probabilities))
    category, probability = str(model.classes_[index]), float(probabilities[index])
    explanation = generate_llm_explanation(category, probability, input.estacion, input.fecha, input.pm25)
    created = datetime.now(timezone.utc).isoformat()
    with db() as connection:
        connection.execute("INSERT INTO predictions (estacion, fecha_objetivo, categoria, probabilidad, modelo, creado_en, entrada_json) VALUES (?, ?, ?, ?, ?, ?, ?)", (input.estacion, input.fecha, category, probability, "modelo_taller3_clasificacion.joblib", created, input.model_dump_json()))
    return {
        "disponible": True,
        "categoria": category,
        "probabilidad": probability,
        "modelo": "RandomForestClassifier",
        "timestamp": created,
        "descripcion": explanation["descripcion"],
        "recomendaciones": explanation["recomendaciones"],
    }
