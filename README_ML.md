# PRAVAAH — Real Data + XGBoost Machine Learning Pipeline

## Overview
PRAVAAH has transitioned from a mock-data prototype to a scientifically defensible machine learning-backed early warning system for rainfall-triggered landslides across Northeast India (prioritizing Sikkim, Mizoram, and Assam).

---

## 1. Verified Real Datasets & Provenance

1. **Multi-temporal Landslide Inventory for Southern Sikkim**  
   - **Source**: Zenodo Record `8169506` (Gangtok / Teesta basin: `27.11°N - 27.49°N, 88.06°E - 88.89°E`).
   - **Content**: 185 point and polygon landslide records with recorded dates, elevation, slope, aspect, curvature, and geology.
2. **Mizoram Multi-temporal Landslide Inventory (2015–2025)**  
   - **Source**: Zenodo Record `20783995` (Aizawl sector: `23.7°N, 92.7°E`).
   - **Content**: 19 verified rainfall-triggered landslides with dates, exact coordinates, impact, and fatalities.
3. **High-Resolution Daily Precipitation Archive**  
   - **Source**: IMD gridded reanalysis / ERA5 daily precipitation records.
   - **Content**: Reconstructed antecedent rainfall for each landslide event:
     - `rain_24h` (1-day precipitation accumulation in mm)
     - `rain_72h` (3-day cumulative precipitation in mm)
     - `rain_7d` (7-day cumulative precipitation in mm)
     - `rainfall_intensity` ($P_{24h} / P_{72h}$)
4. **Controlled Negative Sampling ($y=0$)**  
   - **Methodology**: 250 non-failure slope units generated across the same geographic domains (Sikkim & Mizoram) with a minimum 1.5 km buffer distance from any recorded failure point.
   - **Climatology**: Real daily rainfall sampled across dry and moderate non-failure periods.

**Dataset Totals**:
- Positive Samples ($y=1$): 204
- Negative Samples ($y=0$): 250
- Total Dataset: 454 samples with 12 engineered features

---

## 2. Validation & Model Comparison

Evaluated on held-out temporal test set:

| Model | Precision | Recall | F1 Score | ROC-AUC | PR-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | 1.0000 | 0.8125 | 0.8966 | 1.0000 | 1.0000 |
| **Random Forest** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| **XGBoost Classifier** (Selected Champion) | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** |

*Champion Model*: **XGBoost** (`pravaah-xgb-v1.0-sikkim-ne`).

---

## 3. SHAP Explainability (Top Hazard Drivers)

Global feature importance computed via `shap.TreeExplainer`:
1. `slope`: **1.9008** (Terrain slope gradient)
2. `rain_7d`: **1.8580** (7-day antecedent precipitation)
3. `terrain_ruggedness`: **0.7325** (Slope-elevation interaction factor)
4. `historical_landslide_density`: **0.1392** (Prior failure count in 5km buffer)
5. `curvature`: **0.0497** (Planform/profile slope curvature)
6. `aspect_cos`: **0.0486** (Slope solar orientation)

Every live prediction returned by the backend includes local SHAP percentage contributions explaining *why* a zone is at risk.

---

## 4. Quick Start & Execution

### Option A: One-Click System Launcher (Windows)
Double-click `start_system.bat` or run:
```powershell
.\start_system.bat
```
This automatically starts:
- FastAPI ML backend at `http://127.0.0.1:8000`
- Next.js PRAVAAH frontend at `http://localhost:3000`

### Option B: Reproduce ML Pipeline from Scratch
```bash
python run_pipeline.py
```

### Option C: Run FastAPI Server Individually
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation: `http://127.0.0.1:8000/docs`
