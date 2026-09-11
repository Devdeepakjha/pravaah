"""
PRAVAAH - Real ML-backed Landslide Intelligence Backend Service
FastAPI Application Entrypoint
"""

import os
import time
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from backend.config import CORS_ORIGINS, CORS_ORIGIN_REGEX
from backend.routes.predict import router as predict_router
from backend.routes.risk_zones import router as risk_zones_router
from backend.routes.weather import router as weather_router
from backend.routes.simulation import router as simulation_router
from backend.routes.field_reports import router as field_reports_router
from backend.routes.response import router as response_router
from backend.routes.alerts import router as alerts_router

app = FastAPI(
    title="PRAVAAH Landslide Intelligence ML API",
    description="Scientifically defensible XGBoost ML prediction engine with SHAP explainability for Northeast India.",
    version="1.0.0"
)

# Lightweight in-memory rate limiter for expensive ML endpoints (60 req/min per IP)
_rate_limits = defaultdict(list)
RATE_LIMIT_WINDOW_SEC = 60
MAX_REQUESTS_PER_WINDOW = 60
EXPENSIVE_PATHS = {"/predict", "/api/v1/simulation/what-if"}

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Only rate-limit expensive ML computation and upload endpoints
    is_expensive = (
        request.url.path in EXPENSIVE_PATHS or
        (request.url.path.startswith("/api/v1/field-reports") and request.method == "POST")
    )
    if is_expensive:
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - RATE_LIMIT_WINDOW_SEC
        # Purge expired timestamps
        _rate_limits[client_ip] = [t for t in _rate_limits[client_ip] if t > window_start]
        if len(_rate_limits[client_ip]) >= MAX_REQUESTS_PER_WINDOW:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded (60 requests per minute). Please try again shortly."}
            )
        _rate_limits[client_ip].append(now)

    response = await call_next(request)
    return response

# Static file serving for field evidence uploads
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(os.path.join(uploads_dir, "field_images"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# CORS middleware for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX if CORS_ORIGIN_REGEX else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)
app.include_router(risk_zones_router)
app.include_router(weather_router)
app.include_router(simulation_router)
app.include_router(field_reports_router)
app.include_router(response_router)
app.include_router(alerts_router)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "pravaah-api",
        "model_version": "pravaah-xgb-v1.0-sikkim-ne"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
