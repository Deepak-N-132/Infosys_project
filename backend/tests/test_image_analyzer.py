import pytest
from app.image_analyzer import (
    compute_food_quality_score,
    evaluate_spoilage_risk
)


def test_quality_score_computation():
    """Verifies FQI composite score and letter grade generation."""
    fresh_eval = compute_food_quality_score(
        freshness_label="Fresh",
        confidence=95.0,
        surface_integrity=92.0,
        browning_ratio=2.5,
        min_days=5,
        max_days=10
    )
    assert fresh_eval["quality_score"] >= 80.0
    assert fresh_eval["grade"] in ["A+", "A"]

    rotten_eval = compute_food_quality_score(
        freshness_label="Rotten",
        confidence=98.0,
        surface_integrity=20.0,
        browning_ratio=65.0,
        min_days=0,
        max_days=0
    )
    assert rotten_eval["quality_score"] < 45.0
    assert rotten_eval["grade"] == "F"


def test_spoilage_risk_evaluation():
    """Verifies severity codes and safety protocols across fresh and spoiled produce."""
    safe_eval = evaluate_spoilage_risk(
        freshness_label="Fresh",
        confidence=95.0,
        browning_ratio=1.0,
        min_days=7,
        max_days=14
    )
    assert safe_eval["severity"] == "Low"
    assert safe_eval["alert_code"] == "GREEN_SAFE"

    hazard_eval = evaluate_spoilage_risk(
        freshness_label="Rotten",
        confidence=96.0,
        browning_ratio=45.0,
        min_days=0,
        max_days=0
    )
    assert hazard_eval["severity"] == "Critical"
    assert hazard_eval["alert_code"] == "RED_ALERT"


def test_weighted_freshness_scoring():
    """Verifies Section 7 weighted scoring model (Visual 40%, Storage 25%, Shelf-Life 20%, Product Age 15%)."""
    from app.image_analyzer import compute_weighted_freshness_score

    score_result = compute_weighted_freshness_score(
        visual_condition_score=92.0,
        storage_condition_score=88.0,
        shelf_life_score=85.0,
        product_age_days=2.0,
        max_shelf_life_days=10.0
    )
    # Expected weighted: 92*0.40 + 88*0.25 + 85*0.20 + 80*0.15 = 36.8 + 22.0 + 17.0 + 12.0 = 87.8
    assert "freshness_score" in score_result
    assert score_result["freshness_score"] >= 80.0
    assert score_result["freshness_category"] in ["Fresh", "Good"]
    assert score_result["breakdown"]["visual_condition_40pct"] == 36.8
    assert score_result["breakdown"]["storage_conditions_25pct"] == 22.0
    assert score_result["breakdown"]["shelf_life_prediction_20pct"] == 17.0
    assert score_result["breakdown"]["product_age_15pct"] == 12.0
