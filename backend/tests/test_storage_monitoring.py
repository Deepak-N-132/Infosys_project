import pytest
from app.storage_monitoring import (
    get_all_storage_zones_telemetry,
    update_zone_telemetry,
    execute_storage_workflow,
    STORAGE_ZONES_CONFIG
)


def test_storage_zones_telemetry_structure():
    """Verifies that all defined storage zones report valid telemetry."""
    zones = get_all_storage_zones_telemetry()
    assert len(zones) == 5
    for z in zones:
        assert "zone_id" in z
        assert "targets" in z
        assert "telemetry" in z
        assert "status" in z


def test_zone_telemetry_update():
    """Verifies sensor calibration and telemetry updates."""
    updated = update_zone_telemetry("zone_chiller", {"current_temp": 4.1})
    assert updated["current_temp"] == 4.1


def test_cooling_boost_workflow():
    """Verifies COOLING_BOOST workflow actively modulates chiller temperature."""
    result = execute_storage_workflow("zone_chiller", "COOLING_BOOST", user_name="Test Runner")
    assert result["success"] is True
    assert result["workflow"]["action"] == "COOLING_BOOST"
    assert result["updated_telemetry"]["compressor_active"] is True
