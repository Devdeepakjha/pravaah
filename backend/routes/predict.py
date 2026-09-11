"""
PRAVAAH Backend - Prediction API Routes
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
from backend.services.inference_engine import get_inference_engine

router = APIRouter(tags=["Prediction"])


class PredictionRequest(BaseModel):
    grid_id: Optional[str] = "CUSTOM_01"
    latitude: float = Field(..., description="Latitude in decimal degrees (e.g. 27.28)")
    longitude: float = Field(..., description="Longitude in decimal degrees (e.g. 88.57)")
    elevation: Optional[float] = Field(1200.0, description="Elevation in meters")
    slope: Optional[float] = Field(32.0, description="Slope gradient in degrees")
    curvature: Optional[float] = Field(0.0, description="Surface curvature")
    aspect: Optional[float] = Field(180.0, description="Azimuth aspect angle in degrees")
    landcover: Optional[int] = Field(2, description="LULC category code")
    rain_24h: float = Field(..., description="24h precipitation accumulation in mm")
    rain_72h: float = Field(..., description="72h cumulative precipitation in mm")
    rain_7d: float = Field(..., description="7-day cumulative precipitation in mm")
    historical_landslide_density: Optional[int] = Field(3, description="Prior recorded landslide count within 5km")


class BatchPredictionRequest(BaseModel):
    items: List[PredictionRequest]


@router.post("/predict")
@router.post("/api/v1/predict")
async def predict_single(req: PredictionRequest):
    try:
        engine = get_inference_engine()
        result = engine.predict_one(req.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@router.post("/api/v1/predict/batch")
async def predict_batch(req: BatchPredictionRequest):
    try:
        engine = get_inference_engine()
        results = [engine.predict_one(item.model_dump()) for item in req.items]
        return {"predictions": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch inference error: {str(e)}")
