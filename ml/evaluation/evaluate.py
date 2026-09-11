"""
PRAVAAH ML Pipeline - Model Evaluation & Comparison
Evaluates Logistic Regression, Random Forest, and XGBoost on held-out test data:
- Precision
- Recall (Prominently reported for early warning / life safety)
- F1 Score
- ROC-AUC
- PR-AUC (Precision-Recall AUC, crucial for imbalanced hazard detection)
- Confusion Matrix

Computes SHAP feature importance for XGBoost and saves artifacts to ml/artifacts/.
Selects and saves champion model to ml/models/best_model.joblib.
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
import shap
from sklearn.metrics import (
    precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix
)

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

PROCESSED_DATA_DIR = os.path.join(ROOT_DIR, "ml", "data", "processed")
MODELS_DIR = os.path.join(ROOT_DIR, "ml", "models")
ARTIFACTS_DIR = os.path.join(ROOT_DIR, "ml", "artifacts")


def evaluate_models():
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    data_file = os.path.join(PROCESSED_DATA_DIR, "landslide_features.csv")
    splits_file = os.path.join(PROCESSED_DATA_DIR, "splits.json")

    df = pd.read_csv(data_file)
    with open(splits_file, "r") as f:
        splits = json.load(f)

    feature_cols = splits["features"]
    test_idx = splits["test_indices"]
    df_test = df.iloc[test_idx]

    X_test = df_test[feature_cols].copy()
    y_test = df_test["landslide"].copy()

    # Load models
    log_reg = joblib.load(os.path.join(MODELS_DIR, "logistic_regression.joblib"))
    rf = joblib.load(os.path.join(MODELS_DIR, "random_forest.joblib"))
    xgb = joblib.load(os.path.join(MODELS_DIR, "xgboost_model.joblib"))
    scaler = joblib.load(os.path.join(MODELS_DIR, "scaler.joblib"))

    X_test_scaled = scaler.transform(X_test)

    models = {
        "Logistic Regression": (log_reg, X_test_scaled),
        "Random Forest": (rf, X_test),
        "XGBoost": (xgb, X_test)
    }

    comparison = {}
    for name, (model, X) in models.items():
        y_pred = model.predict(X)
        y_prob = model.predict_proba(X)[:, 1]

        p = float(precision_score(y_test, y_pred, zero_division=0))
        r = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        roc_auc = float(roc_auc_score(y_test, y_prob))
        pr_auc = float(average_precision_score(y_test, y_prob))
        cm = confusion_matrix(y_test, y_pred).tolist()

        comparison[name] = {
            "Precision": round(p, 4),
            "Recall": round(r, 4),
            "F1": round(f1, 4),
            "ROC-AUC": round(roc_auc, 4),
            "PR-AUC": round(pr_auc, 4),
            "Confusion_Matrix": {
                "True_Negative": cm[0][0],
                "False_Positive": cm[0][1],
                "False_Negative": cm[1][0],
                "True_Positive": cm[1][1]
            }
        }

    # Save comparison table
    with open(os.path.join(ARTIFACTS_DIR, "comparison_table.json"), "w") as f:
        json.dump(comparison, f, indent=2)

    # Print Table
    print("\n" + "=" * 70)
    print("MODEL PERFORMANCE COMPARISON ON HELD-OUT TEST DATA")
    print("=" * 70)
    print(f"{'Model':<22} | {'Precision':<9} | {'Recall':<8} | {'F1':<7} | {'ROC-AUC':<9} | {'PR-AUC':<8}")
    print("-" * 70)
    for name, m in comparison.items():
        print(f"{name:<22} | {m['Precision']:<9.4f} | {m['Recall']:<8.4f} | {m['F1']:<7.4f} | {m['ROC-AUC']:<9.4f} | {m['PR-AUC']:<8.4f}")
    print("=" * 70)

    # Select champion model: XGBoost prioritized when performance is equivalent
    if comparison["XGBoost"]["PR-AUC"] >= comparison["Random Forest"]["PR-AUC"] and comparison["XGBoost"]["Recall"] >= comparison["Random Forest"]["Recall"]:
        best_name = "XGBoost"
    else:
        best_name = max(comparison.keys(), key=lambda k: comparison[k]["PR-AUC"] + comparison[k]["Recall"])
    print(f"\nChampion model selected for PRAVAAH pipeline: {best_name}")

    champion_model = xgb if "XGBoost" in best_name else (rf if "Random Forest" in best_name else log_reg)
    joblib.dump(champion_model, os.path.join(MODELS_DIR, "best_model.joblib"))


    # Compute SHAP values for XGBoost
    print("\nComputing SHAP values for XGBoost model...")
    explainer = shap.TreeExplainer(xgb)
    shap_values = explainer.shap_values(X_test)

    # Global feature importance from mean |SHAP|
    mean_abs_shap = np.abs(shap_values).mean(axis=0)
    shap_df = pd.DataFrame({
        "feature": feature_cols,
        "mean_abs_shap": mean_abs_shap
    }).sort_values("mean_abs_shap", ascending=False)

    shap_importance = {row["feature"]: round(float(row["mean_abs_shap"]), 4) for _, row in shap_df.iterrows()}
    with open(os.path.join(ARTIFACTS_DIR, "shap_feature_importance.json"), "w") as f:
        json.dump(shap_importance, f, indent=2)

    print("\nTop Contributing Features (SHAP Global Importance):")
    for feat, val in list(shap_importance.items())[:6]:
        print(f" - {feat:<28}: {val}")

    return comparison, shap_importance


if __name__ == "__main__":
    evaluate_models()
