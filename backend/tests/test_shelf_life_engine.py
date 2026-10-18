import pytest
from app.shelf_life_engine import (
    calculate_dynamic_shelf_life,
    get_produce_profile,
    PRODUCE_KINETIC_PROFILES
)


def test_produce_profile_lookup():
    """Verifies profile retrieval for known and fallback produce."""
    banana_profile = get_produce_profile("banana")
    assert banana_profile["name"] == "Banana"
    assert banana_profile["optimal_temp_c"] == 13.5

    fallback_profile = get_produce_profile("unknown_exotic_fruit")
    assert fallback_profile["name"] == "General Produce"


def test_shelf_life_decay_kinetics():
    """Verifies Arrhenius decay dynamics and temperature acceleration."""
    # Under optimal temperature (13.5 C)
    res_optimal = calculate_dynamic_shelf_life(
        food_name="Banana",
        freshness_label="Fresh",
        quality_score=90.0,
        storage_temp_c=13.5,
        storage_rh_pct=90.0
    )
    # Under elevated ambient temperature (28 C)
    res_hot = calculate_dynamic_shelf_life(
        food_name="Banana",
        freshness_label="Fresh",
        quality_score=90.0,
        storage_temp_c=28.0,
        storage_rh_pct=90.0
    )

    assert res_optimal["predicted_remaining_days"] > res_hot["predicted_remaining_days"]
    assert res_hot["kinetics"]["arrhenius_velocity_multiplier"] > res_optimal["kinetics"]["arrhenius_velocity_multiplier"]


def test_chilling_injury_warning():
    """Verifies detection of cold stress / chilling injury on tropical produce."""
    # Bananas stored at cold chiller temperature (3.0 C) should trigger chilling injury warning
    res_chilled = calculate_dynamic_shelf_life(
        food_name="Banana",
        freshness_label="Fresh",
        quality_score=88.0,
        storage_temp_c=3.0,
        storage_rh_pct=85.0
    )
    assert res_chilled["kinetics"]["chilling_injury"] is True
    assert res_chilled["kinetics"]["chilling_injury_warning"] is not None


def test_rotten_produce_shelf_life():
    """Verifies terminal decomposition response for spoiled items."""
    res_rotten = calculate_dynamic_shelf_life(
        food_name="Tomato",
        freshness_label="Rotten",
        quality_score=20.0,
        storage_temp_c=4.0
    )
    assert res_rotten["predicted_remaining_days"] == 0.0
    assert "Expired" in res_rotten["status"]


def test_packaging_and_storage_duration_effects():
    """Verifies that MAP/vacuum packaging extends shelf-life and duration reduces remaining days."""
    res_open = calculate_dynamic_shelf_life(
        food_name="Apple",
        freshness_label="Fresh",
        quality_score=90.0,
        storage_temp_c=4.0,
        packaging_type="Open Air",
        storage_duration_days=0.0
    )
    res_map = calculate_dynamic_shelf_life(
        food_name="Apple",
        freshness_label="Fresh",
        quality_score=90.0,
        storage_temp_c=4.0,
        packaging_type="MAP/Vacuum",
        storage_duration_days=0.0
    )
    # MAP packaging should yield higher remaining shelf-life than open air
    assert res_map["predicted_remaining_days"] > res_open["predicted_remaining_days"]
    assert res_map["kinetics"]["packaging_type"] == "MAP/Vacuum"

    # With 10 days already elapsed
    res_aged = calculate_dynamic_shelf_life(
        food_name="Apple",
        freshness_label="Fresh",
        quality_score=90.0,
        storage_temp_c=4.0,
        packaging_type="MAP/Vacuum",
        storage_duration_days=10.0
    )
    assert res_aged["predicted_remaining_days"] < res_map["predicted_remaining_days"]
