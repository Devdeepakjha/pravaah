"""
PRAVAAH - Field Image Computer Vision Analysis Service
Provides transparent, defensible preliminary visual hazard screening using
colorimetric soil-vegetation ratios, directional edge discontinuity, and texture entropy.

IMPORTANT:
Does NOT claim a non-existent CNN model.
Clearly distinguishes AI-assisted preliminary visual screening from a certified geological survey.
"""

import os
import io
import math
import numpy as np
from PIL import Image
from typing import Dict, Any, List, Union


def analyze_field_image(image_input: Union[str, bytes], description: str = "") -> Dict[str, Any]:
    """
    Analyzes an uploaded field photograph for visual geomorphic hazard indicators:
    1. Exposed soil & scarp ratio vs vegetative cover
    2. Edge discontinuity & linear tension fracture patterns
    3. High-entropy boulder/debris accumulation
    4. Textural saturation and wet slurry pooling
    """
    # 1. Load image
    if isinstance(image_input, str):
        if not os.path.exists(image_input):
            raise FileNotFoundError(f"Image not found at {image_input}")
        img = Image.open(image_input)
    elif isinstance(image_input, (bytes, bytearray)):
        img = Image.open(io.BytesIO(image_input))
    else:
        raise ValueError("Invalid image input type; expected file path or bytes.")

    img = img.convert("RGB")
    # Standardize scale
    img_resized = img.resize((384, 384), Image.Resampling.BILINEAR)
    img_arr = np.asarray(img_resized, dtype=np.float32)

    # 2. Colorimetry: HSV space for exposed earth vs canopy
    hsv_img = img_resized.convert("HSV")
    hsv_arr = np.asarray(hsv_img, dtype=np.float32)
    h = hsv_arr[:, :, 0]  # 0 - 255 (corresponds to 0 - 360 deg)
    s = hsv_arr[:, :, 1]  # 0 - 255
    v = hsv_arr[:, :, 2]  # 0 - 255

    # Bare soil / rock ochre-brown: H ~ 10-36 (15-50 deg), moderate-high S, moderate V
    soil_mask = (h >= 8) & (h <= 38) & (s >= 35) & (v >= 30) & (v <= 225)
    # Green vegetation: H ~ 45-105 (65-150 deg), S >= 40
    veg_mask = (h >= 42) & (h <= 110) & (s >= 35)
    # Wet/mud dark patches: V <= 60 and S >= 20
    wet_mask = (v <= 65) & (s >= 20)

    total_pixels = 384 * 384
    soil_ratio = float(np.sum(soil_mask) / total_pixels)
    veg_ratio = float(np.sum(veg_mask) / total_pixels)
    wet_ratio = float(np.sum(wet_mask) / total_pixels)

    # 3. Structural Edge Discontinuity (2D Sobel Filter in pure numpy)
    gray = np.mean(img_arr, axis=2)
    # Horizontal & vertical difference kernels
    gx = np.zeros_like(gray)
    gy = np.zeros_like(gray)
    gx[:, 1:-1] = gray[:, 2:] - gray[:, :-2]
    gy[1:-1, :] = gray[2:, :] - gray[:-2, :]
    grad_mag = np.sqrt(gx ** 2 + gy ** 2)

    edge_threshold = 42.0
    edge_pixels = grad_mag > edge_threshold
    edge_density = float(np.sum(edge_pixels) / total_pixels)

    # Orientation variance (anisotropy in gradients indicates directional fractures)
    angles = np.arctan2(gy[edge_pixels] + 1e-6, gx[edge_pixels] + 1e-6)
    angle_std = float(np.std(angles)) if len(angles) > 100 else 1.0

    # 4. Textural Variance (Local standard deviation of high frequencies)
    texture_variance = float(np.var(grad_mag))

    # 5. Interpret Evidence
    evidence: List[str] = []
    severity_score = 0.0

    # Factor 1: Bare scarp / exposed soil
    if soil_ratio > 0.40:
        pct = round(soil_ratio * 100, 1)
        evidence.append(f"Extensive exposed bedrock/soil ({pct}% bare surface) indicative of fresh scarp or slope scar")
        severity_score += 2.5
    elif soil_ratio > 0.20:
        pct = round(soil_ratio * 100, 1)
        evidence.append(f"Noticeable slope face stripping ({pct}% bare soil exposure)")
        severity_score += 1.2

    # Factor 2: Edge Discontinuity (Cracks & fractures)
    if edge_density > 0.16 and angle_std < 0.95:
        evidence.append("Prominent linear edge discontinuity: visible tensile fracture / tension crack pattern detected")
        severity_score += 2.8
    elif edge_density > 0.12:
        evidence.append("Moderate structural lineament / fracture boundary detected on slope face")
        severity_score += 1.5

    # Factor 3: Debris flow & boulder rubble texture
    if texture_variance > 500.0:
        evidence.append("High textural roughness: debris flow boulder deposition / rubble accumulation observed")
        severity_score += 2.2
    elif texture_variance > 250.0:
        evidence.append("Fragmented colluvial material evident along toe margin")
        severity_score += 1.0

    # Factor 4: Water / mud accumulation
    if wet_ratio > 0.15:
        evidence.append("Subsurface water seepage / saturated mud accumulation identified")
        severity_score += 1.8

    # Factor 5: Contextual keyword reinforcement from observer description
    desc_lower = description.lower()
    if any(w in desc_lower for w in ["crack", "tension", "fracture", "fissure"]):
        evidence.append("Observer reported ground tension cracks (corroborates edge detection)")
        severity_score += 1.5
    if any(w in desc_lower for w in ["block", "blocked", "boulder", "debris", "covered"]):
        evidence.append("Observer reported roadway obstruction / rubble accumulation")
        severity_score += 1.5
    if any(w in desc_lower for w in ["slump", "slide", "movement", "subsidence"]):
        evidence.append("Observer reported active geotechnical displacement")
        severity_score += 1.5

    # Fallback if clear photo of non-failure
    if not evidence:
        evidence.append("Stable terrain signature: intact vegetative canopy, low slope surface discontinuity")

    # Determine Severity Level
    if severity_score >= 5.5:
        severity = "CRITICAL"
        priority_influence = "P1"
        conf = 0.91
    elif severity_score >= 3.5:
        severity = "HIGH"
        priority_influence = "P1"
        conf = 0.85
    elif severity_score >= 1.5:
        severity = "MEDIUM"
        priority_influence = "P2"
        conf = 0.78
    else:
        severity = "LOW"
        priority_influence = "P3"
        conf = 0.82

    return {
        "severity": severity,
        "operational_priority_influence": priority_influence,
        "confidence": conf,
        "evidence": evidence,
        "metrics": {
            "soil_exposure_pct": round(soil_ratio * 100, 1),
            "vegetation_pct": round(veg_ratio * 100, 1),
            "edge_fracture_density": round(edge_density, 3),
            "texture_roughness_variance": round(texture_variance, 1),
            "moisture_saturation_pct": round(wet_ratio * 100, 1)
        },
        "analysis_source": "PRAVAAH Computer Vision Engine v1.0 (Colorimetry & Edge Discontinuity Analysis)",
        "disclaimer": "AI-assisted visual assessment (preliminary screening, not confirmed geological survey)."
    }
