"""
PRAVAAH Backend - Weather API Routes
Exposes live IMD and verified historical replay meteorological telemetry.
Never exposes API secrets to the client.
"""

from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from backend.services.weather_service import get_weather_service

router = APIRouter(prefix="/api/v1/weather", tags=["Weather"])


@router.get("/status")
async def get_weather_provider_status():
    """
    Returns current active weather provider status, connection health, and cache statistics.
    """
    service = get_weather_service()
    return service.get_status()


@router.get("/current")
async def get_current_weather(
    lat: float = Query(27.2400, description="Latitude in decimal degrees (default: East Sikkim / Singtam)"),
    lon: float = Query(88.5100, description="Longitude in decimal degrees (default: East Sikkim / Singtam)")
):
    """
    Retrieves current rainfall, antecedent precipitation, and hazard warning state for coordinates.
    """
    try:
        service = get_weather_service()
        data = service.get_current_weather(lat, lon)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch weather telemetry: {str(e)}")


@router.get("/district/{district}")
async def get_district_weather(district: str):
    """
    Retrieves meteorological observations and IMD warning levels for a named district
    (e.g., Gangtok, Mangan, Aizawl, Champhai, Haflong, Koloriang).
    """
    try:
        service = get_weather_service()
        data = service.get_district_weather(district)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch district weather for {district}: {str(e)}")
