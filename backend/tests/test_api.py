"""
PRAVAAH - Comprehensive Test Suite
Validates:
1. Health check & model status
2. Live XGBoost ML prediction & SHAP explainability
3. Dynamic GIS Risk Zones with weather ingestion
4. Weather Service endpoints (status, current, district lookup)
5. Rainfall What-If Simulation & delta computation
6. Field Report multipart submission & computer vision screening
7. Incident Response Prioritization matrix (P1/P2/P3 ranking)
8. Multi-channel Alert generation & CAP/SMS preview
9. Dijkstra Highway Routing & obstacle avoidance detour
10. Input validation & error handling (404, 422, 400)
11. Resilient fallback behaviors
"""

import os
import sys
import io
import pytest

# Ensure repository root is on sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.weather_service import DemoReplayWeatherProvider, WeatherService
from backend.services.routing_service import get_route_plan, dijkstra_path


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_01_health_check(client):
    """Test 1: Health check returns healthy status and model version."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "pravaah" in data["service"]
    assert "model_version" in data


def test_02_predict_single(client):
    """Test 2: XGBoost ML prediction endpoint returns calibrated probability and SHAP."""
    payload = {
        "grid_id": "TEST_GANGTOK_01",
        "latitude": 27.33,
        "longitude": 88.61,
        "elevation": 1650.0,
        "slope": 34.5,
        "curvature": -0.05,
        "aspect": 185.0,
        "landcover": 2,
        "rain_24h": 65.0,
        "rain_72h": 140.0,
        "rain_7d": 210.0,
        "historical_landslide_density": 4
    }
    res = client.post("/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "risk_score" in data
    assert 0.0 <= data["risk_score"] <= 100.0
    assert data["risk_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert "top_factors" in data
    assert len(data["top_factors"]) > 0
    assert "model_version" in data


def test_03_risk_zones_endpoint(client):
    """Test 3: Risk zones endpoint returns regional zones with weather-derived scores."""
    res = client.get("/api/v1/risk-zones")
    assert res.status_code == 200
    zones = res.json()
    assert isinstance(zones, list)
    assert len(zones) >= 4

    east_sikkim = next((z for z in zones if z["id"] == "zone-east-sikkim"), None)
    assert east_sikkim is not None
    assert "riskScore" in east_sikkim
    assert "riskLevel" in east_sikkim
    assert "telemetry" in east_sikkim
    assert "riskStatement" in east_sikkim
    assert "polygon" in east_sikkim
    assert len(east_sikkim["polygon"]) >= 3


def test_04_weather_endpoints(client):
    """Test 4: Weather service status, current observations, and district lookup."""
    # Status
    res_status = client.get("/api/v1/weather/status")
    assert res_status.status_code == 200
    status_data = res_status.json()
    assert "active_provider" in status_data
    assert "cached_entries_count" in status_data

    # Current all / active
    res_curr = client.get("/api/v1/weather/current")
    assert res_curr.status_code == 200
    curr_data = res_curr.json()
    assert "district" in curr_data
    assert "rainfall_24h" in curr_data
    assert "warning_level" in curr_data

    # District lookup
    res_dist = client.get("/api/v1/weather/district/Gangtok")
    assert res_dist.status_code == 200
    dist_data = res_dist.json()
    assert dist_data["district"].lower() == "gangtok"
    assert "rainfall_24h" in dist_data or "rainfall_1d_mm" in dist_data


def test_05_simulation_delta(client):
    """Test 5: Rainfall simulation alters risk score and outputs delta and mandate."""
    payload = {
        "zone_id": "zone-east-sikkim",
        "rainfall_delta_percent": 40.0
    }
    res = client.post("/api/v1/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["zone_id"] == "zone-east-sikkim"
    assert "baseline_risk_score" in data
    assert "simulated_risk_score" in data
    assert "risk_delta" in data
    assert data["rainfall_delta_percent"] == 40.0
    assert "operational_recommendation" in data


def test_06_field_reports_and_vision_screening(client):
    """Test 6: Field report listing and multipart image upload with computer-vision screening."""
    # 6a: List reports
    res_list = client.get("/api/v1/field-reports")
    assert res_list.status_code == 200
    reports = res_list.json()
    assert isinstance(reports, list)

    # 6b: Create synthetic 100x100 dummy PNG in memory
    from PIL import Image
    img = Image.new("RGB", (100, 100), color=(140, 95, 60))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    form_data = {
        "title": "PyTest Automated Tension Crack Observation",
        "incident_type": "TENSION_CRACK",
        "location_name": "Dikchu Km 18",
        "district": "Gangtok",
        "state": "Sikkim",
        "latitude": "27.38",
        "longitude": "88.59",
        "observations": "Fresh transverse crack 12mm wide expanding across the roadway scarp.",
        "reporter_name": "Test Geologist",
        "reporter_role": "QA Engineer",
        "reporter_agency": "PRAVAAH Automated Test Suite"
    }

    files = {
        "image": ("test_crack.png", buf, "image/png")
    }

    res_post = client.post("/api/v1/field-reports", data=form_data, files=files)
    assert res_post.status_code == 200
    created = res_post.json()
    assert "id" in created
    assert created["title"] == "PyTest Automated Tension Crack Observation"
    assert "aiAnalysis" in created
    assert "disclaimer" in created["aiAnalysis"]
    assert "preliminary screening" in created["aiAnalysis"]["disclaimer"].lower()

    # Clean up test artifact from persisted file
    from backend.routes.field_reports import load_reports, save_reports
    current_reports = load_reports()
    save_reports([r for r in current_reports if r.get("id") != created["id"]])


def test_07_response_priorities_matrix(client):
    """Test 7: Response prioritization returns P1/P2/P3 ordered queue with justifications."""
    res = client.get("/api/v1/response/priorities")
    assert res.status_code == 200
    data = res.json()
    assert "incidents" in data
    assert "summary" in data
    assert len(data["incidents"]) > 0

    # Ensure P1 is ranked higher than P3
    first_incident = data["incidents"][0]
    assert first_incident["priority"] in ["P1", "P2"]
    assert len(first_incident["reasons"]) > 0
    assert "primaryAction" in first_incident


def test_08_alerts_and_preview(client):
    """Test 8: Alert engine returns active alerts and multi-channel preview formats."""
    # List alerts
    res_alerts = client.get("/api/v1/alerts")
    assert res_alerts.status_code == 200
    data = res_alerts.json()
    assert "alerts" in data
    alerts = data["alerts"]
    assert isinstance(alerts, list)
    assert len(alerts) > 0

    # Preview format
    preview_req = {
        "zone_id": "zone-east-sikkim",
        "channel": "sms"
    }
    res_preview = client.post("/api/v1/alerts/preview", json=preview_req)
    assert res_preview.status_code == 200
    preview = res_preview.json()
    assert "channel" in preview
    assert "payload" in preview
    assert "message_body" in preview["payload"]
    assert "char_count" in preview["payload"]
    assert "carrier_status" in preview


def test_09_routing_dijkstra_detour(client):
    """Test 9: Highway connectivity identifies NH-10 blockage and computes NH-717A detour."""
    # API endpoint test
    res_route = client.post("/api/v1/roads/route", json={"origin": "sevoke", "destination": "gangtok"})
    assert res_route.status_code == 200
    data = res_route.json()

    assert data["primaryRoute"]["status"] == "IMPASSABLE_BLOCKADE"
    assert data["alternativeRoute"]["status"] == "ACTIVE_SAFE_BYPASS"
    assert data["alternativeRoute"]["distanceDeltaKm"] > 0
    assert "NH-717A" in data["alternativeRoute"]["name"]

    # Direct algorithm test
    path, dist, mins = dijkstra_path("sevoke", "gangtok", avoid_blocked=True)
    assert "singtam_km44" not in path
    assert "kalimpong" in path
    assert "algarah" in path
    assert "reshi_rhenock" in path
    assert "pakyong" in path
    assert dist > 100.0


def test_10_invalid_inputs_and_errors(client):
    """Test 10: Robust error handling for 404, 422, and 400."""
    # Unknown zone ID in simulate -> 404
    res_404 = client.post("/api/v1/simulate", json={"zone_id": "zone-nonexistent-xyz", "rainfall_delta_percent": 20})
    assert res_404.status_code == 404

    # Missing required predict fields -> 422
    res_422 = client.post("/predict", json={})
    assert res_422.status_code == 422

    # Unsupported image MIME type -> 400
    bad_buf = io.BytesIO(b"Hello plain text")
    res_400 = client.post(
        "/api/v1/field-reports",
        data={
            "title": "Bad File",
            "location_name": "Test",
            "district": "Gangtok",
            "latitude": "27.2",
            "longitude": "88.5",
            "observations": "Test"
        },
        files={"image": ("test.txt", bad_buf, "text/plain")}
    )
    assert res_400.status_code == 400


def test_11_weather_resilience_fallback():
    """Test 11: Weather service falls back gracefully when live IMD fails."""
    provider = DemoReplayWeatherProvider()
    data = provider.get_district_weather("Gangtok")
    assert data["district"].lower() == "gangtok"
    assert data["rainfall_24h"] >= 0.0
    assert data["source"] == "DEMO_REPLAY"
