"""
PRAVAAH - Operational Response Prioritization Service
Evaluates multi-criteria operational priorities (P1, P2, P3) for monitored sectors:
Response Priority = f(Model Risk, Population Exposure, Critical Facilities, Road Cutoff, Field Evidence)
Provides explainable justifications and actionable disaster management recommendations.
"""

from typing import List, Dict, Any
from backend.services.inference_engine import get_inference_engine
from backend.services.weather_service import get_weather_service
from backend.routes.risk_zones import BASE_SECTORS
from backend.routes.field_reports import load_reports


def calculate_response_priorities() -> List[Dict[str, Any]]:
    """
    Computes and ranks operational incidents into P1, P2, P3.
    Incorporates XGBoost risk probability, field survey evidence, road status, and exposed lifelines.
    """
    engine = get_inference_engine()
    weather_svc = get_weather_service()
    field_reports = load_reports()

    incidents = []

    for sector in BASE_SECTORS:
        # Dynamic weather
        weather = weather_svc.get_district_weather(sector["district"])
        p24 = weather.get("rainfall_24h", sector["rain_24h"])
        p72 = weather.get("rainfall_72h", sector["rain_72h"])
        p7d = weather.get("rainfall_7d", sector["rain_7d"])

        # Model risk
        feat = dict(sector)
        feat["rain_24h"] = p24
        feat["rain_72h"] = p72
        feat["rain_7d"] = p7d
        pred = engine.predict_one(feat)
        risk_score = float(pred["risk_score"])
        risk_level = pred["risk_level"]

        # Associated field reports in this district/sector
        matched_reports = [
            r for r in field_reports
            if r.get("district", "").lower() in sector["district"].lower()
            or sector["district"].lower() in r.get("district", "").lower()
        ]

        # Highest field evidence severity
        has_critical_field = any(r.get("severity") == "CRITICAL" for r in matched_reports)
        has_high_field = any(r.get("severity") == "HIGH" for r in matched_reports)
        field_notes = [r.get("title", "") for r in matched_reports[:2]]

        # Road status
        active_blockades = sector["impact"].get("activeBlockadesCount", 0)
        road_impact = sector["impact"].get("criticalRoadImpact", "Primary arterial corridor")
        pop_exposed = sector["impact"].get("populationExposed", 5000)

        # Priority calculation
        # P1: Risk >= 60% OR (Risk >= 40% AND (has_critical_field OR active_blockades > 0))
        # P2: Risk >= 30% OR has_high_field
        # P3: All other monitored zones
        if risk_score >= 60.0 or (risk_score >= 35.0 and (has_critical_field or active_blockades > 0)):
            priority = "P1"
            priority_label = "P1 — Immediate Attention"
            priority_class = "CRITICAL"
        elif risk_score >= 25.0 or has_high_field:
            priority = "P2"
            priority_label = "P2 — High Priority"
            priority_class = "HIGH"
        else:
            priority = "P3"
            priority_label = "P3 — Monitor"
            priority_class = "MODERATE"

        reasons = [
            f"Estimated Landslide Risk: {risk_score}% ({risk_level})",
            f"Village Exposure: {pop_exposed:,} residents in {sector['name']}",
            f"Critical Lifeline: {road_impact} ({active_blockades} active blockades)",
            f"Facilities at Risk: {sector['impact'].get('facilitiesExposed', 'Local civil infrastructure')}"
        ]

        if field_notes:
            reasons.append(f"Field Evidence Verified: {', '.join(field_notes)}")
        else:
            reasons.append("Field Evidence: Regular patrol surveillance active")

        # Actionable recommendation
        if priority == "P1":
            rec = f"Inspect slope immediately, divert transit to bypass corridor, and prepare pre-emptive evacuation for lower terraces."
        elif priority == "P2":
            rec = f"Maintain hourly patrol along vulnerable cut-slopes and clear debris from culvert aprons."
        else:
            rec = f"Continue telemetry monitoring; ensure regional drainage channels remain unobstructed."

        incidents.append({
            "id": f"resp-{sector['id']}",
            "zoneId": sector["id"],
            "zoneName": sector["name"],
            "district": sector["district"],
            "state": sector["state"],
            "basin": sector["basin"],
            "priority": priority,
            "priorityLabel": priority_label,
            "priorityClass": priority_class,
            "riskScore": risk_score,
            "riskLevel": risk_level,
            "center": sector["center"],
            "reasons": reasons,
            "fieldReportsCount": len(matched_reports),
            "activeBlockades": active_blockades,
            "populationExposed": pop_exposed,
            "recommendedAction": rec,
            "primaryAction": sector["primaryAction"]
        })

    # Sort P1 first, then P2, then P3, then descending risk score
    priority_weights = {"P1": 1, "P2": 2, "P3": 3}
    incidents.sort(key=lambda x: (priority_weights.get(x["priority"], 9), -x["riskScore"]))
    return incidents
