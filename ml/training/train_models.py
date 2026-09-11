"""
PRAVAAH ML Pipeline - Model Training
Trains baseline and advanced models on the time-aware splits:
1. Logistic Regression (Linear baseline with L2 penalty)
2. Random Forest (Non-linear Bagging ensemble)
3. XGBoost (Gradient Boosted Decision Trees)

Serializes models, preprocessor scaler, and training metadata to ml/models/.
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

PROCESSED_DATA_DIR = os.path.join(ROOT_DIR, "ml", "data", "processed")
MODELS_DIR = os.path.join(ROOT_DIR, "ml", "models")


def train_all_models():
    os.makedirs(MODELS_DIR, exist_ok=True)

    data_file = os.path.join(PROCESSED_DATA_DIR, "landslide_features.csv")
    splits_file = os.path.join(PROCESSED_DATA_DIR, "splits.json")

    df = pd.read_csv(data_file)
    with open(splits_file, "r") as f:
        splits = json.load(f)

    feature_cols = splits["features"]
    target_col = "landslide"

    train_idx = splits["train_indices"]
    val_idx = splits["val_indices"]
    test_idx = splits["test_indices"]

    df_train = df.iloc[train_idx]
    df_val = df.iloc[val_idx]
    df_test = df.iloc[test_idx]

    X_train = df_train[feature_cols].copy()
    y_train = df_train[target_col].copy()

    X_val = df_val[feature_cols].copy()
    y_val = df_val[target_col].copy()

    X_test = df_test[feature_cols].copy()
    y_test = df_test[target_col].copy()

    print(f"Training dataset size: {len(X_train)} ({int(y_train.sum())} positive, {int((y_train == 0).sum())} negative)")
    print(f"Validation dataset size: {len(X_val)} ({int(y_val.sum())} positive, {int((y_val == 0).sum())} negative)")
    print(f"Test dataset size: {len(X_test)} ({int(y_test.sum())} positive, {int((y_test == 0).sum())} negative)")

    # Preprocessing: Fit scaler only on training data (prevent data leakage)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    # 1. Logistic Regression
    print("Training Logistic Regression...")
    log_reg = LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)
    log_reg.fit(X_train_scaled, y_train)

    # 2. Random Forest
    print("Training Random Forest Classifier...")
    rf = RandomForestClassifier(
        n_estimators=120,
        max_depth=5,
        min_samples_split=4,
        class_weight="balanced",
        random_state=42
    )
    rf.fit(X_train, y_train)

    # 3. XGBoost
    print("Training XGBoost Classifier...")
    pos_weight = float((y_train == 0).sum()) / max(float(y_train.sum()), 1.0)
    xgb = XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.06,
        subsample=0.85,
        colsample_bytree=0.85,
        scale_pos_weight=pos_weight,
        eval_metric="logloss",
        random_state=42
    )
    xgb.fit(
        X_train,
        y_train,
        eval_set=[(X_val, y_val)],
        verbose=False
    )

    # Serialize trained models & scaler
    joblib.dump(log_reg, os.path.join(MODELS_DIR, "logistic_regression.joblib"))
    joblib.dump(rf, os.path.join(MODELS_DIR, "random_forest.joblib"))
    joblib.dump(xgb, os.path.join(MODELS_DIR, "xgboost_model.joblib"))
    joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler.joblib"))

    # Save feature metadata
    metadata = {
        "model_version": "pravaah-xgb-v1.0-sikkim-ne",
        "features": feature_cols,
        "n_features": len(feature_cols),
        "target": target_col,
        "classes": [0, 1],
        "class_names": ["No Landslide", "Landslide Event"],
        "train_samples": len(X_train),
        "val_samples": len(X_val),
        "test_samples": len(X_test),
        "created_at": "2026-09-11"
    }
    with open(os.path.join(MODELS_DIR, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Models and preprocessors saved to {MODELS_DIR}")
    return {
        "log_reg": log_reg,
        "rf": rf,
        "xgb": xgb,
        "scaler": scaler,
        "feature_cols": feature_cols,
        "data": (X_train, y_train, X_val, y_val, X_test, y_test, X_train_scaled, X_val_scaled, X_test_scaled)
    }


if __name__ == "__main__":
    train_all_models()
