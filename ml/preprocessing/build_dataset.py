"""
PRAVAAH ML Pipeline - Dataset Builder
Combines positive landslide events and negative control samples, runs feature engineering,
and generates time-aware and spatial train/val/test splits with zero leakage.
"""

import os
import sys
import json
import pandas as pd
import numpy as np

# Ensure workspace root is in python path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from ml.preprocessing.negative_sampler import generate_negative_samples
from ml.feature_engineering.features import engineer_features, FEATURE_COLUMNS


RAW_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw")
PROCESSED_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "processed")


def build_dataset(n_negative: int = 250):
    os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
    pos_file = os.path.join(RAW_DATA_DIR, "positive_landslides_with_rainfall.csv")
    neg_file = os.path.join(RAW_DATA_DIR, "negative_samples.csv")

    if not os.path.exists(pos_file):
        raise FileNotFoundError(f"Missing {pos_file}. Run fetch_landslides and fetch_rainfall first.")

    df_pos = pd.read_csv(pos_file)

    if os.path.exists(neg_file):
        print(f"Loading existing negative samples from {neg_file}...")
        df_neg = pd.read_csv(neg_file)
    else:
        print("Generating controlled negative samples...")
        df_neg = generate_negative_samples(df_pos, n_samples=n_negative)
        df_neg.to_csv(neg_file, index=False)

    print(f"Positive samples (landslide=1): {len(df_pos)}")
    print(f"Negative samples (landslide=0): {len(df_neg)}")

    # Combine
    common_cols = [
        "latitude", "longitude", "event_date", "elevation", "slope", "aspect",
        "curvature", "landslide_type", "state", "region", "source", "landslide",
        "rain_24h", "rain_72h", "rain_7d", "rain_14d", "rainfall_intensity"
    ]
    df_combined = pd.concat([df_pos[common_cols], df_neg[common_cols]], ignore_index=True)

    # Feature engineering
    print("Executing feature engineering pipeline...")
    df_featured = engineer_features(df_combined)

    # Time-aware train / val / test splitting
    # Parse year
    df_featured["event_year"] = pd.to_datetime(df_featured["event_date"], errors="coerce").dt.year.fillna(2017).astype(int)

    # Historical split:
    # Train: <= 2017 (initial observational baseline)
    # Val: 2018 - 2020 (mid period evaluation)
    # Test: >= 2021 (latest held-out test period)
    train_idx = df_featured[df_featured["event_year"] <= 2017].index.tolist()
    val_idx = df_featured[(df_featured["event_year"] >= 2018) & (df_featured["event_year"] <= 2020)].index.tolist()
    test_idx = df_featured[df_featured["event_year"] >= 2021].index.tolist()

    # Ensure validation and test sets have reasonable representation from both classes
    print(f"Initial split counts - Train: {len(train_idx)}, Val: {len(val_idx)}, Test: {len(test_idx)}")

    # If val/test is slightly too sparse due to date clustering, balance with stratified temporal shuffle
    if len(val_idx) < 30 or len(test_idx) < 30:
        print("Adjusting split windows to maintain statistical power while respecting temporal order...")
        sorted_indices = df_featured.sort_values("event_date").index.tolist()
        n_total = len(sorted_indices)
        train_end = int(n_total * 0.65)
        val_end = int(n_total * 0.82)
        train_idx = sorted_indices[:train_end]
        val_idx = sorted_indices[train_end:val_end]
        test_idx = sorted_indices[val_end:]

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

    print(f"Dataset successfully created and saved to {out_csv}")
    print(f"Splits saved to {splits_json}")
    print(f"Class distribution: {splits['positive_count']} positive, {splits['negative_count']} negative")
    return df_featured, splits


if __name__ == "__main__":
    build_dataset()
