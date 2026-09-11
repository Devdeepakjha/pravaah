"""
PRAVAAH ML Pipeline - Dataset Builder (Audited Observational Edition)
1. Ingests genuine positive landslide events (deduplicated).
2. Generates genuine observational negative samples (>1.5km buffer, real DEM, real archive rain).
3. Explicitly labels provenance:
   - Positive: 'recorded_landslide_in_inventory'
   - Negative: 'no_recorded_landslide_in_inventory'
4. Enforces strict temporal splits (Train <= 2017, Val 2018-2020, Test >= 2021).
5. Runs feature engineering and saves processed dataset & splits metadata.
"""

import os
import sys
import json
import pandas as pd
import numpy as np

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from ml.preprocessing.negative_sampler import generate_observational_negatives
from ml.feature_engineering.features import engineer_features, FEATURE_COLUMNS

RAW_DATA_DIR = os.path.join(ROOT_DIR, "ml", "data", "raw")
PROCESSED_DATA_DIR = os.path.join(ROOT_DIR, "ml", "data", "processed")


def build_dataset(n_negative: int = 150):
    os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
    pos_file = os.path.join(RAW_DATA_DIR, "positive_landslides_with_rainfall.csv")
    neg_file = os.path.join(RAW_DATA_DIR, "observational_negatives.csv")

    if not os.path.exists(pos_file):
        raise FileNotFoundError(f"Missing {pos_file}. Run fetch_landslides and fetch_rainfall first.")

    df_pos = pd.read_csv(pos_file)
    # Deduplicate positive events strictly on coordinate + date
    initial_pos_len = len(df_pos)
    df_pos = df_pos.drop_duplicates(subset=["latitude", "longitude", "event_date"]).copy()
    if len(df_pos) < initial_pos_len:
        print(f"Deduplicated positive events: removed {initial_pos_len - len(df_pos)} duplicate(s).")

    df_pos["provenance"] = "recorded_landslide_in_inventory"

    # Generate or load genuine observational negatives
    if os.path.exists(neg_file):
        print(f"Loading existing observational negatives from {neg_file}...")
        df_neg = pd.read_csv(neg_file)
    else:
        print(f"Sampling {n_negative} observational non-event units (real DEM & archive rainfall)...")
        df_neg = generate_observational_negatives(df_pos, target_count=n_negative)
        df_neg.to_csv(neg_file, index=False)

    df_neg["provenance"] = "no_recorded_landslide_in_inventory"
    df_neg = df_neg.drop_duplicates(subset=["latitude", "longitude", "event_date"]).copy()

    print(f"Audited Positive samples (landslide=1): {len(df_pos)}")
    print(f"Audited Negative samples (landslide=0): {len(df_neg)}")

    common_cols = [
        "latitude", "longitude", "event_date", "elevation", "slope", "aspect",
        "curvature", "landslide_type", "state", "region", "source", "landslide",
        "provenance", "rain_24h", "rain_72h", "rain_7d", "rain_14d", "rainfall_intensity"
    ]
    df_combined = pd.concat([df_pos[common_cols], df_neg[common_cols]], ignore_index=True)

    # Feature engineering
    print("Executing feature engineering pipeline on audited dataset...")
    df_featured = engineer_features(df_combined)

    # Time-aware train / val / test splitting
    df_featured["event_year"] = pd.to_datetime(df_featured["event_date"], errors="coerce").dt.year.fillna(2017).astype(int)

    train_mask = df_featured["event_year"] <= 2017
    val_mask = (df_featured["event_year"] >= 2018) & (df_featured["event_year"] <= 2020)
    test_mask = df_featured["event_year"] >= 2021

    train_idx = df_featured[train_mask].index.tolist()
    val_idx = df_featured[val_mask].index.tolist()
    test_idx = df_featured[test_mask].index.tolist()

    print(f"Temporal Split Counts -> Train (<=2017): {len(train_idx)}, Val (2018-2020): {len(val_idx)}, Test (>=2021): {len(test_idx)}")

    splits = {
        "train_indices": train_idx,
        "val_indices": val_idx,
        "test_indices": test_idx,
        "features": FEATURE_COLUMNS,
        "total_samples": len(df_featured),
        "positive_count": int((df_featured["landslide"] == 1).sum()),
        "negative_count": int((df_featured["landslide"] == 0).sum())
    }

    out_csv = os.path.join(PROCESSED_DATA_DIR, "landslide_features.csv")
    df_featured.to_csv(out_csv, index=False)

    splits_json = os.path.join(PROCESSED_DATA_DIR, "splits.json")
    with open(splits_json, "w") as f:
        json.dump(splits, f, indent=2)

    print(f"Audited dataset saved to {out_csv}")
    print(f"Splits saved to {splits_json}")
    return df_featured, splits


if __name__ == "__main__":
    build_dataset(n_negative=150)
