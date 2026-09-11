"""
PRAVAAH - Real Data + XGBoost ML Pipeline Runner
Single-command runner to reproduce the entire scientific workflow:
1. Data Ingestion: Real Sikkim & Mizoram landslide inventories
2. Rainfall Enrichment: Historical antecedent daily precipitation (IMD/ERA5)
3. Negative Sampling: Controlled spatial buffer (>1.5km) & regional climatology
4. Feature Engineering: Topographic + Hydrological indicators
5. Baseline Comparison: Logistic Regression vs Random Forest vs XGBoost
6. SHAP Explainability: TreeExplainer feature attributions
7. Model Serialization: Saves champion model to ml/models/best_model.joblib
"""

import os
import sys

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from ml.data_ingestion.fetch_landslides import run as run_fetch_landslides
from ml.data_ingestion.fetch_rainfall import enrich_landslides_with_rainfall
from ml.preprocessing.build_dataset import build_dataset
from ml.training.train_models import train_all_models
from ml.evaluation.evaluate import evaluate_models
from ml.inference.predict import LandslidePredictor


def main():
    print("=" * 75)
    print("PRAVAAH — SCIENTIFIC ML PIPELINE EXECUTION (MILESTONE A)")
    print("=" * 75)

    print("\n[Step 1/5] Ingesting Real Landslide Inventories (Zenodo 8169506 & 20783995)...")
    run_fetch_landslides()

    print("\n[Step 2/5] Reconstructing Historical Antecedent Rainfall (P24h, P72h, P7d)...")
    enrich_landslides_with_rainfall()

    print("\n[Step 3/5] Constructing Controlled Negative Samples & Engineering Features...")
    build_dataset(n_negative=250)

    print("\n[Step 4/5] Training Baseline Models (LogReg, Random Forest, XGBoost)...")
    train_all_models()

    print("\n[Step 5/5] Evaluating Models, Computing Metrics & Calculating SHAP Explanations...")
    comparison, shap_imp = evaluate_models()

    print("\n[Verification] Running Sample Test Inference with SHAP...")
    predictor = LandslidePredictor()
    sample = {
        "grid_id": "DEMO_EVAL_01",
        "latitude": 27.2807,
        "longitude": 88.5705,
        "elevation": 1268.0,
        "slope": 39.2,
        "rain_24h": 112.5,
        "rain_72h": 268.0,
        "rain_7d": 390.0,
        "historical_landslide_density": 8
    }
    pred = predictor.predict_one(sample)
    print(f"Predicted Risk Score: {pred['risk_score']}% ({pred['risk_level']})")
    print(f"Model Version: {pred['model_version']}")
    print("Top Contributing Factors (SHAP):")
    for f in pred["top_factors"]:
        print(f"  * {f['label']}: {f['description']} (Impact: {f['direction']} {f['impact_pct']}%)")

    print("\n" + "=" * 75)
    print("PIPELINE COMPLETED SUCCESSFULLY!")
    print("Start the backend server using: uvicorn backend.main:app --port 8000 --reload")
    print("=" * 75)


if __name__ == "__main__":
    main()
