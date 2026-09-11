"""
PRAVAAH - Real ML-backed Landslide Intelligence Backend Service
FastAPI Application Entrypoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import CORS_ORIGINS
from backend.routes.predict import router as predict_router
from backend.routes.risk_zones import router as risk_zones_router
from backend.routes.weather import router as weather_router
from backend.routes.simulation import router as simulation_router

app = FastAPI(
    title="PRAVAAH Landslide Intelligence ML API",
    description="Scientifically defensible XGBoost ML prediction engine with SHAP explainability for Northeast India.",
    version="1.0.0"
)

# CORS middleware for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)
app.include_router(risk_zones_router)
app.include_router(weather_router)
app.include_router(simulation_router)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "pravaah-ml-backend",
        "model_version": "pravaah-xgb-v1.0-sikkim-ne",
        "docs_url": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
