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
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "*"
]

API_V1_PREFIX = "/api/v1"
