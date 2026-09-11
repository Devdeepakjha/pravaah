"""
PRAVAAH - Early Warning & Multi-Channel Alert Engine
Evaluates dynamic hazard criteria (Model Risk + Rainfall Surge + Lifeline Cutoff + Field Reports)
and generates standardized disaster alerts with preview capabilities.
Follows National Disaster Management Authority (NDMA) / CAP formatting.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from backend.services.inference_engine import get_inference_engine
from backend.services.weather_service import get_weather_service
from backend.routes.risk_zones import BASE_SECTORS
from backend.routes.field_reports import load_reports


class AlertEngine:
    """
    Evaluates multi-hazard thresholds to generate regional emergency advisories.
    """

    @staticmethod
    def get_active_alerts() -> List[Dict[str, Any]]:
        engine = get_inference_engine()
        weather_svc = get_weather_service()
        reports = load_reports()

        alerts = []
        now_iso = datetime.now(timezone.utc).isoformat()

        for s in BASE_SECTORS:
            weather = weather_svc.get_district_weather(s["district"])
            p24 = weather.get("rainfall_24h", s["rain_24h"])
            p72 = weather.get("rainfall_72h", s["rain_72h"])
            p7d = weather.get("rainfall_7d", s["rain_7d"])

            pred = engine.predict_one({**s, "rain_24h": p24, "rain_72h": p72, "rain_7d": p7d})
            risk_score = float(pred["risk_score"])
            risk_level = pred["risk_level"]

            matched_reports = [r for r in reports if s["district"].lower() in r.get("district", "").lower()]
            has_critical_evidence = any(r.get("severity") in ["HIGH", "CRITICAL"] for r in matched_reports)

            # Red Alert Condition: Risk >= 60% or (Risk >= 40% and (p24 > 90 or has_critical_evidence))
            if risk_score >= 60.0 or (risk_score >= 35.0 and (p24 >= 90.0 or has_critical_evidence)):
                alerts.append({
                    "id": f"alert-{s['id']}-red",
                    "zoneId": s["id"],
                    "title": f"Flash Hazard Warning: {s['name']}",
                    "severity": "CRITICAL",
                    "level": "RED_ALERT",
                    "targetRegion": f"{s['district']}, {s['state']} ({s['basin']})",
                    "timestamp": now_iso,
                    "riskScore": risk_score,
                    "rainfall24h": p24,
                    "message": (
                        f"CRITICAL HAZARD: Model risk estimated at {risk_score}%. "
                        f"24-hour rainfall has reached {p24}mm, exceeding slope shear threshold. "
                        f"{'Ground tension fractures verified by field observers. ' if has_critical_evidence else ''}"
                        f"Immediate traffic diversions recommended on {s['impact'].get('criticalRoadImpact', 'primary transit corridor')}."
                    ),
                    "actionMandate": s["primaryAction"],
                    "channels": ["Web Dashboard", "CAP Disaster Broadcast", "SMS Gateway (Preview Ready)"],
                    "dataSource": weather.get("source", "DEMO_REPLAY")
                })
            elif risk_score >= 30.0:
                alerts.append({
                    "id": f"alert-{s['id']}-orange",
                    "zoneId": s["id"],
                    "title": f"Precipitation Surge Watch: {s['name']}",
                    "severity": "HIGH",
                    "level": "ORANGE_ALERT",
                    "targetRegion": f"{s['district']}, {s['state']}",
                    "timestamp": now_iso,
                    "riskScore": risk_score,
                    "rainfall24h": p24,
                    "message": (
                        f"ELEVATED RISK: Model risk at {risk_score}%. "
                        f"Antecedent 7-day moisture ({p7d}mm) creating high pore pressure in {s['basin']}. "
                        f"Pre-position road clearance machinery at major transit crossings."
                    ),
                    "actionMandate": "Activate hourly drone and ground watch along vulnerable highway cuts.",
                    "channels": ["Web Dashboard", "CAP Disaster Broadcast"],
                    "dataSource": weather.get("source", "DEMO_REPLAY")
                })

        return alerts

    @staticmethod
    def generate_preview(zone_id: str, channel: str = "sms") -> Dict[str, Any]:
        """
        Generates a non-transmitting broadcast preview for demonstration and verification.
        Does NOT send actual SMS unless configured with official telecom gateway.
        """
        target_sector = None
        for s in BASE_SECTORS:
            if s["id"] == zone_id or s.get("grid_id") == zone_id:
                target_sector = s
                break
        if not target_sector:
            target_sector = BASE_SECTORS[0]

        now_iso = datetime.now(timezone.utc).isoformat()
        now_readable = datetime.now().strftime("%d-%b-%Y %H:%M IST")

        if channel.lower() == "sms":
            sms_body = (
                f"[NDMA PRAVAAH ALERT] {now_readable}: SEVERE LANDSLIDE HAZARD warning for {target_sector['district']} "
                f"({target_sector['name']}). Rainfall 24h: {target_sector['rain_24h']}mm. "
                f"AVOID valley roads. Safe bypass via NH-717A Reshi. Emergency: Dial 1070/112."
            )
            return {
                "channel": "SMS_BROADCAST_PREVIEW",
                "carrier_status": "PREVIEW_ONLY (No external SMS sent)",
                "target_region": f"{target_sector['district']}, {target_sector['state']}",
                "recipient_count_estimate": target_sector["impact"].get("populationExposed", 10000),
                "payload": {
                    "sender_id": "NDMA-PRAVAH",
                    "message_body": sms_body,
                    "char_count": len(sms_body),
                    "encoding": "GSM-7 / UTF-8",
                    "priority": "HIGH_EMERGENCY"
                },
                "timestamp": now_iso,
                "disclaimer": "NOTIFICATION PREVIEW: Demonstration simulation format complying with CAP/NDMA standards."
            }
        else:
            return {
                "channel": "WEB_PUSH_NOTIFICATION",
                "carrier_status": "PREVIEW_READY",
                "target_region": f"{target_sector['district']}, {target_sector['state']}",
                "payload": {
                    "title": f"EMERGENCY WARNING: {target_sector['name']}",
                    "body": f"Slope instability threshold exceeded. {target_sector['primaryAction']}",
                    "icon": "/icon-hazard.png",
                    "badge": "/badge-red.png",
                    "data": {"zoneId": target_sector["id"], "riskLevel": "CRITICAL"}
                },
                "timestamp": now_iso,
                "disclaimer": "NOTIFICATION PREVIEW: In-app broadcast simulation."
            }
