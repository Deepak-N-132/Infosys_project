"""
Shelf-Life Prediction Engine for FreshCheck AI Platform.
Implements kinetic degradation models based on Arrhenius and Q10 temperature coefficient dynamics,
relative humidity penalty functions, ethylene-accelerated ripening, and visual quality scores.
"""

import math
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta, timezone


# Biological characteristics, optimal storage parameters, and ethylene sensitivity
PRODUCE_KINETIC_PROFILES: Dict[str, Dict[str, Any]] = {
    "banana": {
        "name": "Banana",
        "category": "Fruits",
        "optimal_temp_c": 13.5,
        "min_safe_temp_c": 12.0,  # Below this, chilling injury occurs
        "optimal_rh_pct": 90.0,
        "baseline_shelf_life_days": 6.0,
        "q10_factor": 2.2,
        "ethylene_producer": "High",
        "ethylene_sensitive": "High",
        "decay_mode": "enzymatic_browning_and_softening",
        "chilling_injury_temp": 11.5,
        "preservation_tips": "Store unbundled at 13-15°C. Keep away from ethylene-sensitive greens."
    },
    "tomato": {
        "name": "Tomato",
        "category": "Vegetables",
        "optimal_temp_c": 12.0,
        "min_safe_temp_c": 10.0,
        "optimal_rh_pct": 88.0,
        "baseline_shelf_life_days": 8.0,
        "q10_factor": 2.1,
        "ethylene_producer": "Moderate",
        "ethylene_sensitive": "Moderate",
        "decay_mode": "softening_and_stem_mold",
        "chilling_injury_temp": 9.0,
        "preservation_tips": "Store stem-down at cool ambient room temperature (12-16°C). Avoid deep chilling to retain aroma."
    },
    "cucumber": {
        "name": "Cucumber",
        "category": "Vegetables",
        "optimal_temp_c": 10.5,
        "min_safe_temp_c": 8.0,
        "optimal_rh_pct": 95.0,
        "baseline_shelf_life_days": 9.0,
        "q10_factor": 2.0,
        "ethylene_producer": "Very Low",
        "ethylene_sensitive": "High",  # Will yellow rapidly near bananas or tomatoes
        "decay_mode": "pitting_and_yellowing",
        "chilling_injury_temp": 7.0,
        "preservation_tips": "Keep wrapped to prevent rapid moisture loss. Never co-locate with bananas or apples."
    },
    "bittermelon": {
        "name": "Bittermelon",
        "category": "Vegetables",
        "optimal_temp_c": 11.0,
        "min_safe_temp_c": 9.0,
        "optimal_rh_pct": 90.0,
        "baseline_shelf_life_days": 5.0,
        "q10_factor": 2.3,
        "ethylene_producer": "Low",
        "ethylene_sensitive": "High",
        "decay_mode": "yellowing_and_dehiscence",
        "chilling_injury_temp": 7.5,
        "preservation_tips": "High respiration rate; refrigerate in perforated breathable film."
    },
    "eggplant": {
        "name": "Eggplant",
        "category": "Vegetables",
        "optimal_temp_c": 11.0,
        "min_safe_temp_c": 8.5,
        "optimal_rh_pct": 92.0,
        "baseline_shelf_life_days": 6.5,
        "q10_factor": 2.1,
        "ethylene_producer": "Low",
        "ethylene_sensitive": "High",
        "decay_mode": "calyx_browning_and_skin_pitting",
        "chilling_injury_temp": 8.0,
        "preservation_tips": "Sensitive to both ethylene and severe cold. Store in cool pantry zone."
    },
    "orange": {
        "name": "Orange",
        "category": "Fruits",
        "optimal_temp_c": 5.0,
        "min_safe_temp_c": 3.0,
        "optimal_rh_pct": 88.0,
        "baseline_shelf_life_days": 21.0,
        "q10_factor": 1.7,
        "ethylene_producer": "Very Low",
        "ethylene_sensitive": "Low",
        "decay_mode": "green_blue_mold_and_rind_shrinkage",
        "chilling_injury_temp": 2.0,
        "preservation_tips": "Tolerates cold chiller storage (3-6°C) exceptionally well. Ensure good air circulation."
    },
    "papaya": {
        "name": "Papaya",
        "category": "Fruits",
        "optimal_temp_c": 12.0,
        "min_safe_temp_c": 10.0,
        "optimal_rh_pct": 90.0,
        "baseline_shelf_life_days": 6.0,
        "q10_factor": 2.4,
        "ethylene_producer": "Moderate",
        "ethylene_sensitive": "Moderate",
        "decay_mode": "anthracnose_spots_and_rapid_softening",
        "chilling_injury_temp": 9.0,
        "preservation_tips": "Do not refrigerate under 10°C until fully ripe. Wrap individual fruits in tissue."
    },
    "pineapple": {
        "name": "Pineapple",
        "category": "Fruits",
        "optimal_temp_c": 8.5,
        "min_safe_temp_c": 7.0,
        "optimal_rh_pct": 88.0,
        "baseline_shelf_life_days": 14.0,
        "q10_factor": 1.9,
        "ethylene_producer": "Low",
        "ethylene_sensitive": "Low",
        "decay_mode": "internal_browning_and_base_mold",
        "chilling_injury_temp": 6.5,
        "preservation_tips": "Store upright at 8-10°C. Once cut, refrigerate tightly sealed at 2-4°C."
    },
    "apple": {
        "name": "Apple",
        "category": "Fruits",
        "optimal_temp_c": 2.5,
        "min_safe_temp_c": 0.5,
        "optimal_rh_pct": 92.0,
        "baseline_shelf_life_days": 28.0,
        "q10_factor": 1.8,
        "ethylene_producer": "Very High",
        "ethylene_sensitive": "Moderate",
        "decay_mode": "flesh_mealy_softening_and_scab",
        "chilling_injury_temp": -0.5,
        "preservation_tips": "Potent ethylene emitter. Store isolated in cold crisper drawer at 1-3°C."
    },
    "strawberry": {
        "name": "Strawberry",
        "category": "Fruits",
        "optimal_temp_c": 1.0,
        "min_safe_temp_c": 0.0,
        "optimal_rh_pct": 95.0,
        "baseline_shelf_life_days": 5.0,
        "q10_factor": 2.5,
        "ethylene_producer": "Very Low",
        "ethylene_sensitive": "Moderate",
        "decay_mode": "gray_botrytis_mold_and_leakage",
        "chilling_injury_temp": -0.5,
        "preservation_tips": "Keep chilled immediately at 0-2°C. Do not wash until right before consumption."
    },
    "potato": {
        "name": "Potato",
        "category": "Vegetables",
        "optimal_temp_c": 10.0,
        "min_safe_temp_c": 7.0,
        "optimal_rh_pct": 90.0,
        "baseline_shelf_life_days": 45.0,
        "q10_factor": 1.6,
        "ethylene_producer": "Very Low",
        "ethylene_sensitive": "Moderate",
        "decay_mode": "sprouting_and_solanine_greening",
        "chilling_injury_temp": 4.0,  # Cold sweetening
        "preservation_tips": "Keep in dark, cool, well-ventilated dry space. Never store in cold fridge (<6°C)."
    },
    "default_produce": {
        "name": "General Produce",
        "category": "Produce",
        "optimal_temp_c": 6.0,
        "min_safe_temp_c": 2.0,
        "optimal_rh_pct": 85.0,
        "baseline_shelf_life_days": 7.0,
        "q10_factor": 2.0,
        "ethylene_producer": "Low",
        "ethylene_sensitive": "Moderate",
        "decay_mode": "respiration_depletion",
        "chilling_injury_temp": 1.0,
        "preservation_tips": "Maintain stable temperature between 3°C and 8°C with moderate humidity."
    }
}


def get_produce_profile(food_name: str) -> Dict[str, Any]:
    """Finds matching produce profile or returns default."""
    name_clean = (food_name or "").lower().strip()
    for key, profile in PRODUCE_KINETIC_PROFILES.items():
        if key in name_clean or name_clean in key:
            return profile
    return PRODUCE_KINETIC_PROFILES["default_produce"]


def calculate_dynamic_shelf_life(
    food_name: str,
    freshness_label: str,
    quality_score: float = 85.0,
    storage_temp_c: float = 4.0,
    storage_rh_pct: float = 80.0,
    ethylene_exposure_ppm: float = 0.05,
    min_days_baseline: Optional[int] = None,
    max_days_baseline: Optional[int] = None,
    air_circulation: str = "Medium",
    light_exposure: str = "Low Light"
) -> Dict[str, Any]:
    """
    Computes rigorous dynamic shelf life based on Arrhenius/Q10 kinetics,
    observed visual quality score, and environmental microclimate.
    """
    profile = get_produce_profile(food_name)
    fresh_clean = freshness_label.lower().strip()

    # 1. Base potential shelf-life from profile or trained class mapping
    if max_days_baseline and max_days_baseline > 0:
        base_days = float(max_days_baseline)
    else:
        base_days = float(profile["baseline_shelf_life_days"])

    # If already rotten / spoiled
    if "rotten" in fresh_clean or "spoiled" in fresh_clean:
        return {
            "predicted_remaining_days": 0.0,
            "predicted_remaining_hours": 0.0,
            "status": "Expired / Spoiled",
            "decay_stage": "Terminal Decomposition",
            "quality_index": quality_score,
            "kinetics": {
                "arrhenius_velocity_multiplier": 5.0,
                "q10_factor": profile["q10_factor"],
                "temperature_stress": "Critical",
                "chilling_injury": False
            },
            "decay_trajectory": [
                {"day": 0, "quality": round(quality_score, 1), "status": "Decomposed"}
            ],
            "scenario_comparisons": {
                "refrigerated_4c": 0.0,
                "cool_cellar_13c": 0.0,
                "ambient_22c": 0.0,
                "deep_freeze_minus18c": 0.0
            },
            "recommendation_directive": "Dispose immediately to prevent fungal spore cross-contamination."
        }

    # 2. Quality Score Scaling (FQI factor)
    # Higher initial quality = more resilient shelf life
    # Fresh starts at 80-100; Semi-fresh at 50-75
    quality_factor = max(0.15, min(1.2, quality_score / 85.0))

    if "semi" in fresh_clean:
        # Produce has consumed 50-70% of its lifespan
        quality_factor = min(quality_factor, 0.45)

    # 3. Arrhenius & Q10 Temperature Multiplier
    # Rate k(T) = k_optimal * Q10 ^ ((T - T_optimal) / 10)
    optimal_t = profile["optimal_temp_c"]
    q10 = profile["q10_factor"]
    temp_diff = storage_temp_c - optimal_t

    # Chilling injury check (e.g. bananas in cold fridge turn black)
    chilling_injury = False
    if storage_temp_c < profile["min_safe_temp_c"]:
        chilling_injury = True
        # Cold temperature stress accelerates surface breakdown
        chilling_penalty_rate = 1.0 + (profile["min_safe_temp_c"] - storage_temp_c) * 0.18
        decay_multiplier = chilling_penalty_rate
    elif temp_diff > 0:
        # Above optimal temperature, decay accelerates exponentially
        decay_multiplier = math.pow(q10, temp_diff / 10.0)
    else:
        # Between safe min and optimal: shelf life is near max or slightly extended
        decay_multiplier = max(0.75, math.pow(q10, temp_diff / 10.0))

    # 4. Relative Humidity (RH) Penalty
    # Deviation from optimal RH causes desiccation (< optimal) or mold acceleration (> 95%)
    optimal_rh = profile["optimal_rh_pct"]
    rh_diff = abs(storage_rh_pct - optimal_rh)
    rh_penalty = 1.0 + (rh_diff / 100.0) * 0.45
    if storage_rh_pct > 95.0 and profile["category"] != "Leafy Greens":
        # Excess condensation triggers mold growth
        rh_penalty += 0.25

    # 5. Ethylene Acceleration Factor
    # If sensitive, ethylene drastically accelerates senescence
    ethylene_penalty = 1.0
    if profile["ethylene_sensitive"] == "High":
        ethylene_penalty += ethylene_exposure_ppm * 2.8
    elif profile["ethylene_sensitive"] == "Moderate":
        ethylene_penalty += ethylene_exposure_ppm * 1.4

    # 6. Combined kinetic decay rate
    total_degradation_velocity = decay_multiplier * rh_penalty * ethylene_penalty

    # Dynamic remaining days
    remaining_days = (base_days * quality_factor) / max(0.2, total_degradation_velocity)
    remaining_days = round(max(0.2, remaining_days), 1)
    remaining_hours = round(remaining_days * 24.0, 1)

    # 7. Multi-Scenario Shelf Life Comparisons
    def simulate_zone_days(target_temp: float, target_rh: float, eth_ppm: float) -> float:
        t_diff = target_temp - optimal_t
        if target_temp < profile["min_safe_temp_c"] and target_temp >= 0:
            d_mult = 1.0 + (profile["min_safe_temp_c"] - target_temp) * 0.18
        elif target_temp < 0:
            # Freezing state (-18C)
            return round(base_days * 10.0, 1)  # Preserves up to months
        elif t_diff > 0:
            d_mult = math.pow(q10, t_diff / 10.0)
        else:
            d_mult = max(0.75, math.pow(q10, t_diff / 10.0))
        rh_p = 1.0 + (abs(target_rh - optimal_rh) / 100.0) * 0.45
        tot_v = d_mult * rh_p * (1.0 + eth_ppm * 1.5)
        sim_days = (base_days * quality_factor) / max(0.2, tot_v)
        return round(max(0.5, sim_days), 1)

    scenario_comparisons = {
        "refrigerated_4c": simulate_zone_days(4.0, 88.0, 0.02),
        "cool_cellar_13c": simulate_zone_days(13.0, 70.0, 0.05),
        "ambient_22c": simulate_zone_days(22.0, 55.0, 0.12),
        "deep_freeze_minus18c": simulate_zone_days(-18.0, 90.0, 0.0)
    }

    # 8. Projected Decay Curve (Day 0 to End of Life)
    decay_trajectory: List[Dict[str, Any]] = []
    projection_horizon = min(30, int(math.ceil(remaining_days)) + 2)
    step = 1 if projection_horizon <= 14 else max(1, projection_horizon // 10)

    for day in range(0, projection_horizon + 1, step):
        # Exponential kinetic decay: Q(t) = Q0 * exp(-k * t)
        decay_k = 0.693 / max(0.5, remaining_days)
        projected_fqi = max(10.0, quality_score * math.exp(-decay_k * day))
        if projected_fqi >= 80.0:
            st = "Peak Fresh"
        elif projected_fqi >= 60.0:
            st = "Good Commercial"
        elif projected_fqi >= 40.0:
            st = "Near Expiry / Markdown"
        else:
            st = "Spoiled / Unfit"

        decay_trajectory.append({
            "day": day,
            "quality": round(projected_fqi, 1),
            "status": st,
            "hours": day * 24
        })

    # Status classification
    if remaining_days <= 1.5:
        decay_stage = "Immediate Consumption (Critical)"
    elif remaining_days <= 3.5:
        decay_stage = "Near Maturation (Consume Soon)"
    else:
        decay_stage = "Stable Shelf-Life"

    return {
        "predicted_remaining_days": remaining_days,
        "predicted_remaining_hours": remaining_hours,
        "status": "Active",
        "decay_stage": decay_stage,
        "quality_index": round(quality_score, 1),
        "kinetics": {
            "arrhenius_velocity_multiplier": round(total_degradation_velocity, 2),
            "q10_factor": q10,
            "optimal_temp_c": optimal_t,
            "current_temp_c": storage_temp_c,
            "chilling_injury": chilling_injury,
            "chilling_injury_warning": (
                f"Warning: {profile['name']} stored at {storage_temp_c}°C is below safe threshold {profile['min_safe_temp_c']}°C (Chilling injury risk)."
                if chilling_injury else None
            ),
            "ethylene_acceleration_pct": round((ethylene_penalty - 1.0) * 100, 1)
        },
        "scenario_comparisons": scenario_comparisons,
        "decay_trajectory": decay_trajectory,
        "optimal_envelope": {
            "temperature_range": f"{profile['min_safe_temp_c']}°C - {profile['optimal_temp_c'] + 2.0}°C",
            "humidity_range": f"{profile['optimal_rh_pct'] - 5}% - {profile['optimal_rh_pct'] + 5}% RH",
            "storage_zone_recommendation": (
                "Chiller Cold Zone (3-5°C)" if profile["optimal_temp_c"] <= 5.0
                else "Cool Cellar / Pantry (12-14°C)" if profile["optimal_temp_c"] >= 10.0
                else "Dry Ambient Counter"
            )
        },
        "preservation_tips": profile["preservation_tips"]
    }
