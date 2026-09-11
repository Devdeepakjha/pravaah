"""
PRAVAAH Backend Configuration & Risk Threshold Settings
"""

import os

# Configurable Risk Level Thresholds
RISK_THRESHOLDS = {
    "LOW": (0.0, 20.0),
    "MODERATE": (20.1, 40.0),
    "HIGH": (40.1, 60.0),
    "VERY_HIGH": (60.1, 80.0),
    "EXTREME": (80.1, 100.0)
}

# CORS Allowed Origins
_env_cors = os.getenv("CORS_ORIGINS", "")
if _env_cors:
    # Explicit comma-separated origins from production environment
    CORS_ORIGINS = [origin.strip() for origin in _env_cors.split(",") if origin.strip()]
    # Ensure local development is always included for seamless dual-testing
    for dev_origin in ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"]:
        if dev_origin not in CORS_ORIGINS:
            CORS_ORIGINS.append(dev_origin)
else:
    # Default local dev & common frontend deploy preview origins
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

# Permitted Origin Regex for Vercel Preview Deployments
CORS_ORIGIN_REGEX = os.getenv("CORS_ORIGIN_REGEX", r"https://.*\.vercel\.app|https://.*\.trycloudflare\.com")

API_V1_PREFIX = "/api/v1"

# Weather Provider Configuration
IMD_API_KEY = os.getenv("IMD_API_KEY", "")
IMD_BASE_URL = os.getenv("IMD_BASE_URL", "https://api.imd.gov.in")
WEATHER_CACHE_TTL_SECONDS = int(os.getenv("WEATHER_CACHE_TTL_SECONDS", "600"))
WEATHER_PROVIDER_PREFERENCE = os.getenv("WEATHER_PROVIDER_PREFERENCE", "auto") # auto, imd, demo
