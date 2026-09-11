"""
PRAVAAH Backend - ML Inference Engine Service
Wraps LandslidePredictor from ml.inference.predict
"""

import os
import sys

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from ml.inference.predict import LandslidePredictor

_predictor_instance = None


def get_inference_engine() -> LandslidePredictor:
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = LandslidePredictor()
    return _predictor_instance
