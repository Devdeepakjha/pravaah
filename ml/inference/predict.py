"""
PRAVAAH ML Pipeline - Inference Engine & Real-time SHAP Explainer
Executes live inference and local feature contribution explanations:
- Loads best trained model (XGBoost)
- Converts model probability to 0 - 100 risk score
- Computes configurable risk level:
    0 - 20: LOW
    21 - 40: MODERATE
    41 - 60: HIGH
    61 - 80: VERY HIGH
    81 - 100: EXTREME
- Extracts local SHAP explanations for top hazard drivers
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
import shap
from datetime import datetime, timezone

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

MODELS_DIR = os.path.join(ROOT_DIR, "ml", "models")


class LandslidePredictor:
    def __init__(self):
        self.model = joblib.load(os.path.join(MODELS_DIR, "best_model.joblib"))
        self.scaler = joblib.load(os.path.join(MODELS_DIR, "scaler.joblib"))

        with open(os.path.join(MODELS_DIR, "model_metadata.json"), "r") as f:
            self.metadata = json.load(f)

        self.feature_cols = self.metadata["features"]
        self.model_version = self.metadata.get("model_version", "pravaah-xgb-v1.0")

        # TreeExplainer for instantaneous SHAP attribution
        try:
            self.explainer = shap.TreeExplainer(self.model)
        except Exception:
            self.explainer = None

    @staticmethod
    def get_risk_level(score: float) -> str:
        if score <= 20.0:
            return "LOW"
        elif score <= 40.0:
            return "MODERATE"
        elif score <= 60.0:
            return "HIGH"
        elif score <= 80.0:
            return "VERY_HIGH"
        else:
            return "EXTREME"

    def predict_one(self, sample_dict: dict) -> dict:
        """
        Input dictionary with terrain and rainfall values.
        Returns complete API contract dictionary.
        """
        # Ensure all required features are present, with geomorphically sound defaults
        features = {
            "elevation": float(sample_dict.get("elevation", 1200.0)),
            "slope": float(sample_dict.get("slope", 28.0)),
            "curvature": float(sample_dict.get("curvature", 0.0)),
            "aspect_sin": float(sample_dict.get("aspect_sin", np.sin(np.radians(sample_dict.get("aspect", 180.0))))),
            "aspect_cos": float(sample_dict.get("aspect_cos", np.cos(np.radians(sample_dict.get("aspect", 180.0))))),
            "landcover": int(sample_dict.get("landcover", 2)),
            "rain_24h": float(sample_dict.get("rain_24h", 45.0)),
            "rain_72h": float(sample_dict.get("rain_72h", 120.0)),
            "rain_7d": float(sample_dict.get("rain_7d", 220.0)),
            "rainfall_intensity": float(sample_dict.get("rainfall_intensity", sample_dict.get("rain_24h", 45.0) / max(sample_dict.get("rain_72h", 120.0), 1.0))),
            "historical_landslide_density": int(sample_dict.get("historical_landslide_density", 3)),
            "terrain_ruggedness": float(sample_dict.get("terrain_ruggedness", sample_dict.get("slope", 28.0) * (sample_dict.get("elevation", 1200.0) / 1000.0))),
        }

        df_row = pd.DataFrame([features])[self.feature_cols]

        prob = float(self.model.predict_proba(df_row)[0, 1])
        risk_score = round(prob * 100.0, 1)
        risk_level = self.get_risk_level(risk_score)

        # Local SHAP feature contributions
        top_factors = []
        if self.explainer is not None:
            try:
                local_shap = self.explainer.shap_values(df_row)[0]
                total_abs = sum(abs(v) for v in local_shap) + 1e-6
                ranked_idx = np.argsort(np.abs(local_shap))[::-1]

                factor_names_map = {
                    "rain_72h": "72h Cumulative Rainfall",
                    "rain_24h": "24h Rainfall Intensity",
                    "slope": "Terrain Slope Gradient",
                    "historical_landslide_density": "Historical Landslide Density",
                    "rain_7d": "7-Day Antecedent Precipitation",
                    "elevation": "Elevation / Alpine Zone",
                    "terrain_ruggedness": "Terrain Ruggedness Index",
                    "curvature": "Slope Surface Curvature",
                    "landcover": "Land Use / Land Cover Class",
                    "rainfall_intensity": "Instantaneous Rain Intensity Ratio",
                }

                for idx in ranked_idx[:4]:
                    col = self.feature_cols[idx]
                    impact = float(local_shap[idx])
                    pct = round((abs(impact) / total_abs) * 100.0, 1)
                    val = features[col]
                    direction = "elevating" if impact > 0 else "suppressing"

                    desc = ""
                    if col == "rain_72h":
                        desc = f"{val}mm accumulation over 72h significantly increases pore pressure"
                    elif col == "slope":
                        desc = f"{val}° steep angle increases gravitational shear stress"
                    elif col == "rain_24h":
                        desc = f"{val}mm intense downpour triggers rapid saturation"
                    elif col == "historical_landslide_density":
                        desc = f"{int(val)} recorded historical failures in immediate vicinity"
                    elif col == "rain_7d":
                        desc = f"{val}mm prolonged antecedent moisture"
                    else:
                        desc = f"{factor_names_map.get(col, col)} ({val})"

                    top_factors.append({
                        "feature": col,
                        "label": factor_names_map.get(col, col),
                        "value": float(val),
                        "impact": float(round(impact, 3)),
                        "impact_pct": float(pct),
                        "direction": direction,
                        "description": desc
                    })
            except Exception as e:
                print(f"SHAP local error: {e}")

        return {
            "grid_id": str(sample_dict.get("grid_id", "ZONE_CUSTOM")),
            "latitude": float(sample_dict.get("latitude", 27.28)),
            "longitude": float(sample_dict.get("longitude", 88.57)),
            "risk_score": float(risk_score),
            "risk_level": risk_level,
            "rain_24h": float(features["rain_24h"]),
            "rain_72h": float(features["rain_72h"]),
            "rain_7d": float(features["rain_7d"]),
            "slope": float(features["slope"]),
            "elevation": float(features["elevation"]),
            "model_version": self.model_version,
            "prediction_time": datetime.now(timezone.utc).isoformat(),
            "top_factors": top_factors
        }



if __name__ == "__main__":
    predictor = LandslidePredictor()
    test_sample = {
        "grid_id": "SIK_TEST_01",
        "latitude": 27.2807,
        "longitude": 88.5705,
        "elevation": 1268.0,
        "slope": 39.2,
        "rain_24h": 112.5,
        "rain_72h": 268.0,
        "rain_7d": 390.0,
        "historical_landslide_density": 6
    }
    result = predictor.predict_one(test_sample)
    print(json.dumps(result, indent=2))
