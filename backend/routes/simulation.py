"""
PRAVAAH Backend - What-If Rainfall Scenario Simulation Route
Enables operational decision-makers to evaluate the geomorphic response of monitored slopes
under dynamic hypothetical rainfall surges (+20%, +40%, +60%, +100%) without model retraining.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
from backend.services.inference_engine import get_inference_engine
from backend.services.weather_service import get_weather_service
from backend.routes.risk_zones import BASE_SECTORS

router = APIRouter(prefix="/api/v1", tags=["Simulation"])


class SimulationRequest(BaseModel):
    zone_id: str = Field(..., description="Target sector identifier (e.g., 'zone-east-sikkim' or 'SIK_001_SINGTAM')")
    rainfall_delta_percent: Optional[float] = Field(None, description="Percentage increase in 24h rainfall (e.g., 20.0, 40.0, 60.0, 100.0)")
    custom_rain_24h: Optional[float] = Field(None, description="Explicit 24h rainfall value in mm to simulate")
    scenario_type: Optional[str] = Field("MONSOON_SURGE", description="Scenario narrative label (e.g., CLOUDBURST, MONSOON_SURGE)")


class SimulationResponse(BaseModel):
    zone_id: str
    zone_name: str
    district: str
    scenario_type: str
    rainfall_delta_percent: float
    simulated_rain_24h: float
    baseline_rain_24h: float
    simulated_rain_72h: float
    simulated_rain_7d: float
    baseline_risk_score: float
    simulated_risk_score: float
    risk_delta: float
    baseline_risk_level: str
    simulated_risk_level: str
    affected_zones_count: int
    affected_infrastructure: List[str]
    affected_villages: List[str]
    estimated_exposed_population: int
    changed_response_priority: str
    operational_recommendation: str
    model_version: str
    simulation_timestamp: str


@router.post("/simulate", response_model=SimulationResponse)
async def simulate_scenario(req: SimulationRequest):
    """
    Runs dynamic What-If rainfall surge simulation on the target geomorphic sector
    using the champion XGBoost model without retraining.
    """
    # 1. Locate sector
    target_sector = None
    for s in BASE_SECTORS:
        if s["id"] == req.zone_id or s.get("grid_id") == req.zone_id:
            target_sector = s
            break

    if not target_sector:
        raise HTTPException(status_code=404, detail=f"Sector with id '{req.zone_id}' not found in monitored sectors.")

    # 2. Get baseline weather
    weather_svc = get_weather_service()
    weather = weather_svc.get_district_weather(target_sector["district"])
    base_p24 = float(weather.get("rainfall_24h", target_sector["rain_24h"]))
    base_p72 = float(weather.get("rainfall_72h", target_sector["rain_72h"]))
    base_p7d = float(weather.get("rainfall_7d", target_sector["rain_7d"]))

    # 3. Calculate simulated rainfall
    delta_pct = req.rainfall_delta_percent if req.rainfall_delta_percent is not None else 0.0
    if req.custom_rain_24h is not None:
        sim_p24 = max(0.0, float(req.custom_rain_24h))
        delta_pct = round(((sim_p24 - base_p24) / max(base_p24, 1.0)) * 100.0, 1)
    else:
        sim_p24 = max(0.0, round(base_p24 * (1.0 + delta_pct / 100.0), 1))

    rain_diff = sim_p24 - base_p24
    sim_p72 = max(sim_p24, round(base_p72 + rain_diff, 1))
    sim_p7d = max(sim_p72, round(base_p7d + rain_diff, 1))

    engine = get_inference_engine()

    # 4. Predict baseline
    base_input = dict(target_sector)
    base_input["rain_24h"] = base_p24
    base_input["rain_72h"] = base_p72
    base_input["rain_7d"] = base_p7d
    base_pred = engine.predict_one(base_input)

    # 5. Predict simulated
    sim_input = dict(target_sector)
    sim_input["rain_24h"] = sim_p24
    sim_input["rain_72h"] = sim_p72
    sim_input["rain_7d"] = sim_p7d
    sim_pred = engine.predict_one(sim_input)

    base_score = float(base_pred["risk_score"])
    sim_score = float(sim_pred["risk_score"])
    risk_delta = round(sim_score - base_score, 1)

    # 6. Evaluate infrastructure & priority shifts
    if sim_score >= 80.0:
        priority = "P1 — Immediate Evacuation & Complete Corridor Diversion"
        affected_infra = [
            f"{target_sector['impact'].get('criticalRoadImpact', 'Primary Highway')} (High probability of cutoff)",
            "Downstream electrical transmission towers",
            "Local potable water gravity intake"
        ]
        affected_villages = ["Lower river terraces", "Vulnerable scarp toe clusters", "Road construction camps"]
        rec = f"EXTREME SURGE: Simulated rainfall of {sim_p24}mm triggers saturated slope failure threshold. Immediately halt all transit and issue mandatory shelter evacuation."
    elif sim_score >= 55.0:
        priority = "P1 — Urgent Pre-positioning & Tactical Bypass Routing"
        affected_infra = [
            f"{target_sector['impact'].get('criticalRoadImpact', 'Primary Highway')} (Single-lane traffic restriction)",
            "Culverts and slope drainage aprons"
        ]
        affected_villages = ["Highway transit settlements", "Perched hillside hamlets"]
        rec = f"HIGH HAZARD: Rainfall increase of +{delta_pct}% elevates pore pressure. Deploy earthmovers to bypass choke-points and alert village emergency wardens."
    elif sim_score >= 35.0:
        priority = "P2 — Enhanced Drone Patrol & Spotter Stations"
        affected_infra = ["Culverts and roadside ditches"]
        affected_villages = ["Low-lying agricultural terraces"]
        rec = f"MODERATE SENSITIVITY: Slopes remain stable but saturated. Inspect tension cracks hourly."
    else:
        priority = "P3 — Normal Meteorological Watch"
        affected_infra = ["Standard road drainage"]
        affected_villages = ["No immediate settlement risk"]
        rec = "LOW RISK: Simulated rainfall volume is within geomorphic drainage capacity."

    pop_factor = 1.0 + (delta_pct / 100.0) * 0.25 if delta_pct > 0 else 1.0
    exposed_pop = int(target_sector["impact"].get("populationExposed", 5000) * pop_factor)

    from datetime import datetime, timezone
    return SimulationResponse(
        zone_id=target_sector["id"],
        zone_name=target_sector["name"],
        district=target_sector["district"],
        scenario_type=req.scenario_type or "MONSOON_SURGE",
        rainfall_delta_percent=delta_pct,
        simulated_rain_24h=sim_p24,
        baseline_rain_24h=base_p24,
        simulated_rain_72h=sim_p72,
        simulated_rain_7d=sim_p7d,
        baseline_risk_score=base_score,
        simulated_risk_score=sim_score,
        risk_delta=risk_delta,
        baseline_risk_level=base_pred["risk_level"],
        simulated_risk_level=sim_pred["risk_level"],
        affected_zones_count=1 if delta_pct < 50 else 2,
        affected_infrastructure=affected_infra,
        affected_villages=affected_villages,
        estimated_exposed_population=exposed_pop,
        changed_response_priority=priority,
        operational_recommendation=rec,
        model_version=engine.metadata.get("model_version", "pravaah-xgb-v1.0-sikkim-ne"),
        simulation_timestamp=datetime.now(timezone.utc).isoformat()
    )
