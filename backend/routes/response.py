"""
PRAVAAH Backend - Response Prioritization & Road Connectivity Routes
Exposes decision-support rankings (P1/P2/P3) and alternative bypass routing calculations.
"""

from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter
from backend.services.response_service import calculate_response_priorities
from backend.services.routing_service import get_route_plan, get_all_corridors_status

router = APIRouter(prefix="/api/v1", tags=["Response & Connectivity"])


class RouteRequest(BaseModel):
    origin: Optional[str] = Field("sevoke", description="Starting junction node ID or name (e.g., 'sevoke', 'rangpo')")
    destination: Optional[str] = Field("gangtok", description="Destination node ID or name (e.g., 'gangtok', 'singtam')")


@router.get("/response/priorities")
async def get_response_priorities():
    """
    Returns ranked operational incidents (P1, P2, P3) evaluated using multi-criteria risk,
    population exposure, infrastructure criticality, and verified field evidence.
    """
    incidents = calculate_response_priorities()
    return {
        "count": len(incidents),
        "incidents": incidents,
        "summary": {
            "p1_count": sum(1 for i in incidents if i["priority"] == "P1"),
            "p2_count": sum(1 for i in incidents if i["priority"] == "P2"),
            "p3_count": sum(1 for i in incidents if i["priority"] == "P3"),
        }
    }


@router.get("/roads/status")
async def get_roads_status():
    """
    Returns the real-time operational status of monitored highway corridors and blockades.
    """
    corridors = get_all_corridors_status()
    return {"count": len(corridors), "corridors": corridors}


@router.post("/roads/route")
async def calculate_route(req: RouteRequest):
    """
    Calculates primary route vs alternative safe bypass corridor using graph Dijkstra routing.
    Automatically isolates compromised or blocked highway links.
    """
    plan = get_route_plan(req.origin or "sevoke", req.destination or "gangtok")
    return plan
