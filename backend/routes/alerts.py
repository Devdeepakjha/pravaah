"""
PRAVAAH Backend - Alert Management & Notification Preview Routes
"""

from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter
from backend.services.alert_service import AlertEngine

router = APIRouter(prefix="/api/v1/alerts", tags=["Alerts"])


class AlertPreviewRequest(BaseModel):
    zone_id: Optional[str] = Field("zone-east-sikkim", description="Target zone identifier")
    channel: Optional[str] = Field("sms", description="Notification channel: 'sms' or 'web'")


@router.get("")
@router.get("/")
async def get_active_alerts():
    """
    Returns dynamically evaluated emergency alerts and warning states across monitored sectors.
    """
    alerts = AlertEngine.get_active_alerts()
    return {"count": len(alerts), "alerts": alerts}


@router.post("/preview")
async def preview_alert_broadcast(req: AlertPreviewRequest):
    """
    Simulates / previews an emergency alert payload across SMS or Web channels
    without transmitting actual telecom messages.
    """
    preview = AlertEngine.generate_preview(req.zone_id or "zone-east-sikkim", req.channel or "sms")
    return preview
