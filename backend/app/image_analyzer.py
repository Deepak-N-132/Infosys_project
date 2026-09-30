"""
Image Analysis and Food Quality Scoring Engine for AI Food Freshness Monitoring Platform.
Provides multi-metric visual feature extraction, surface degradation analysis,
composite Food Quality Index (FQI) scoring, and spoilage risk evaluation.
"""

import numpy as np
from PIL import Image
from scipy.ndimage import laplace
from typing import Dict, Any


def analyze_image_features(image_path: str) -> Dict[str, Any]:
    """
    Extracts advanced visual features from food image:
    - RGB & HSV distribution
    - Brightness and contrast
    - Surface degradation index (Laplacian texture variance)
    - Browning / discoloration area percentage
    - Surface integrity score (0-100)
    """
    with Image.open(image_path) as img:
        img_rgb = img.convert("RGB")
        img_resized = img_rgb.resize((224, 224))
        rgb_arr = np.array(img_resized, dtype=np.float32)

    # 1. Color Metrics
    r_mean = float(np.mean(rgb_arr[:, :, 0]))
    g_mean = float(np.mean(rgb_arr[:, :, 1]))
    b_mean = float(np.mean(rgb_arr[:, :, 2]))
    total_intensity = max(r_mean + g_mean + b_mean, 1e-5)

    r_ratio = round((r_mean / total_intensity) * 100, 1)
    g_ratio = round((g_mean / total_intensity) * 100, 1)
    b_ratio = round((b_mean / total_intensity) * 100, 1)

    # Brightness (perceived luminance)
    brightness = float(np.mean(0.299 * rgb_arr[:, :, 0] + 0.587 * rgb_arr[:, :, 1] + 0.114 * rgb_arr[:, :, 2]))
    contrast = float(np.std(rgb_arr))

    # 2. Surface Degradation Index (Variance of Laplacian)
    gray = 0.299 * rgb_arr[:, :, 0] + 0.587 * rgb_arr[:, :, 1] + 0.114 * rgb_arr[:, :, 2]
    lap_var = float(np.var(laplace(gray)))
    # Normalized degradation: higher variance of irregularities indicates blemishes/spots
    degradation_index = min(max(round((lap_var / 1500.0) * 100, 1), 5.0), 95.0)

    # 3. Browning / Discoloration Detection
    # Convert RGB normalized to HSV approximation
    norm_rgb = rgb_arr / 255.0
    r, g, b = norm_rgb[:, :, 0], norm_rgb[:, :, 1], norm_rgb[:, :, 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    diff = mx - mn + 1e-6

    # Hue calculation (0 to 360)
    hue = np.zeros_like(r)
    mask_r = (mx == r)
    mask_g = (mx == g)
    mask_b = (mx == b)

    hue[mask_r] = (60.0 * ((g[mask_r] - b[mask_r]) / diff[mask_r])) % 360
    hue[mask_g] = (60.0 * ((b[mask_g] - r[mask_g]) / diff[mask_g])) + 120
    hue[mask_b] = (60.0 * ((r[mask_b] - g[mask_b]) / diff[mask_b])) + 240

    saturation = np.where(mx > 0, diff / (mx + 1e-6), 0)
    value = mx

    # Browning/decay pixels: low-to-medium hue (10 to 45 deg), moderate saturation, lower brightness
    browning_mask = (hue >= 10) & (hue <= 45) & (saturation >= 0.25) & (value <= 0.65)
    browning_ratio = round(float(np.sum(browning_mask) / (224 * 224)) * 100, 2)

    # 4. Surface Integrity Score (0 to 100)
    # Higher integrity = lower browning, balanced contrast, good vibrancy
    surface_integrity = round(max(5.0, min(100.0, 100.0 - (browning_ratio * 1.5) - (degradation_index * 0.25))), 1)

    return {
        "color_distribution": {
            "red_percent": r_ratio,
            "green_percent": g_ratio,
            "blue_percent": b_ratio,
            "brightness": round(brightness, 1),
            "contrast": round(contrast, 1),
        },
        "surface_degradation_index": degradation_index,
        "browning_ratio": browning_ratio,
        "surface_integrity": surface_integrity,
    }


def compute_food_quality_score(
    freshness_label: str,
    confidence: float,
    surface_integrity: float,
    browning_ratio: float,
    min_days: int,
    max_days: int
) -> Dict[str, Any]:
    """
    Computes Food Quality Index (FQI 0-100), Letter Grade, Component breakdown,
    and storage recommendations.
    """
    label_lower = freshness_label.lower()

    # Base score by category
    if "fresh" in label_lower and "semi" not in label_lower:
        base = 88.0 + (confidence * 0.10)
    elif "semi" in label_lower or "good" in label_lower:
        base = 60.0 + (confidence * 0.12)
    else:  # Rotten / Spoiled
        base = max(10.0, 40.0 - (confidence * 0.3))

    # Surface integrity modulation (weight ~25%)
    integrity_factor = (surface_integrity - 70.0) * 0.2

    # Browning penalty
    browning_penalty = browning_ratio * 0.35

    # Composite FQI score
    fqi = round(float(np.clip(base + integrity_factor - browning_penalty, 5.0, 99.5)), 1)

    # Determine Letter Grade
    if fqi >= 90.0:
        grade = "A+"
        grade_description = "Premium Quality — Pristine freshness and optimal nutritional value."
    elif fqi >= 80.0:
        grade = "A"
        grade_description = "High Quality — Fresh with excellent appearance and firmness."
    elif fqi >= 65.0:
        grade = "B"
        grade_description = "Good Commercial Quality — Minor blemishes; consume soon."
    elif fqi >= 48.0:
        grade = "C"
        grade_description = "Sub-optimal Quality — Near spoilage boundary; suitable for fast cooking/processing."
    else:
        grade = "F"
        grade_description = "Spoiled / Unsafe — Active microbial decomposition detected. Not fit for consumption."

    # Component breakdown (0-100)
    visual_score = round(float(np.clip(surface_integrity * 0.7 + (100 - browning_ratio * 2) * 0.3, 0, 100)), 1)
    shelf_life_index = round(float(np.clip((max_days / 30.0) * 100.0, 10.0, 100.0)), 1)
    storage_compliance = 92.0 if fqi >= 75 else (70.0 if fqi >= 50 else 35.0)

    # Storage recommendations matrix
    storage_advice = {
        "refrigerated": f"Optimal (1°C - 4°C): Retains quality for up to {max_days} days.",
        "room_temp": f"Ambient (20°C - 24°C): Consume within {max(1, min_days)} to {min_days + 1} days.",
        "frozen": "Freezing (-18°C): Preserves nutritional composition up to 60-90 days."
    }

    return {
        "quality_score": fqi,
        "grade": grade,
        "grade_description": grade_description,
        "components": {
            "visual_score": visual_score,
            "shelf_life_index": shelf_life_index,
            "surface_integrity": surface_integrity,
            "storage_compliance": storage_compliance
        },
        "storage_recommendations": storage_advice
    }


def evaluate_spoilage_risk(
    freshness_label: str,
    confidence: float,
    browning_ratio: float,
    min_days: int,
    max_days: int
) -> Dict[str, Any]:
    """
    Evaluates spoilage probability, severity level, alert status,
    and safety protocols.
    """
    label_lower = freshness_label.lower()

    if "rotten" in label_lower or "spoiled" in label_lower:
        risk_pct = round(float(np.clip(80.0 + (confidence * 0.2), 75.0, 99.9)), 1)
        severity = "Critical"
        alert_code = "RED_ALERT"
        action_directive = "CRITICAL HAZARD: Discard immediately. Sanitize storage bin to avoid fungal spore migration."
    elif "semi" in label_lower:
        risk_pct = round(float(np.clip(45.0 + (browning_ratio * 0.5), 35.0, 70.0)), 1)
        severity = "Moderate"
        alert_code = "YELLOW_WARN"
        action_directive = "MODERATE RISK: Consume within 24-48 hours or transfer to freezing."
    else:  # Fresh
        risk_pct = round(float(np.clip(max(2.0, (100.0 - confidence) * 0.25 + browning_ratio * 0.1), 2.0, 25.0)), 1)
        severity = "Low"
        alert_code = "GREEN_SAFE"
        action_directive = "SAFE: Minimal spoilage probability. Standard cold storage recommended."

    return {
        "spoilage_risk_percent": risk_pct,
        "severity": severity,
        "alert_code": alert_code,
        "action_directive": action_directive,
        "cross_contamination_risk": "High" if severity == "Critical" else ("Low" if severity == "Low" else "Medium"),
    }


def get_workflow_pipeline_metadata() -> list:
    """
    Returns the step-by-step pipeline execution stages for UI visualization.
    """
    return [
        {
            "step": 1,
            "name": "Image Preprocessing",
            "desc": "Bilinear resizing (224x224), channel normalization, RGB spectral decomposition.",
            "status": "completed"
        },
        {
            "step": 2,
            "name": "Visual Feature Extraction",
            "desc": "Surface degradation index via Laplacian filter, browning pixel segmentation, color histograms.",
            "status": "completed"
        },
        {
            "step": 3,
            "name": "Neural Classification",
            "desc": "MobileNetV2 transfer model inference across 24 food/freshness class signatures.",
            "status": "completed"
        },
        {
            "step": 4,
            "name": "Quality Scoring & Spoilage Matrix",
            "desc": "Composite FQI algorithm, grade assignment, and storage compliance recommendations.",
            "status": "completed"
        }
    ]
