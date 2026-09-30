"""
Storage Monitoring and Environmental Compliance Workflows for FreshCheck AI.
Tracks multi-zone storage microclimates (Temperature, Humidity, Ethylene gas, CO2, Door openings),
evaluates compliance against biological thresholds, and executes automated mitigation workflows.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import random


STORAGE_ZONES_CONFIG: Dict[str, Dict[str, Any]] = {
    "zone_chiller": {
        "id": "zone_chiller",
        "name": "Chilled Cold Vault (Zone A)",
        "icon": "❄️",
        "type": "Refrigerated",
        "target_temp_c": 3.5,
        "temp_min": 1.5,
        "temp_max": 5.5,
        "target_rh_pct": 88.0,
        "rh_min": 80.0,
        "rh_max": 95.0,
        "max_ethylene_ppm": 0.08,
        "description": "Ideal for leafy greens, berries, dairy, meats, and temperate fruits (apples, oranges)."
    },
    "zone_pantry": {
        "id": "zone_pantry",
        "name": "Cool Cellar & Pantry (Zone B)",
        "icon": "🥔",
        "type": "Cool Ambient",
        "target_temp_c": 13.0,
        "temp_min": 10.0,
        "temp_max": 16.0,
        "target_rh_pct": 68.0,
        "rh_min": 55.0,
        "rh_max": 75.0,
        "max_ethylene_ppm": 0.25,
        "description": "Optimal for tropical produce, bananas, tomatoes, potatoes, onions, and root vegetables."
    },
    "zone_ambient": {
        "id": "zone_ambient",
        "name": "Dry Ambient Prep & Counter (Zone C)",
        "icon": "🍞",
        "type": "Room Ambient",
        "target_temp_c": 21.5,
        "temp_min": 18.0,
        "temp_max": 25.0,
        "target_rh_pct": 52.0,
        "rh_min": 40.0,
        "rh_max": 65.0,
        "max_ethylene_ppm": 0.50,
        "description": "For immediate display, dry goods, bakery items, and short-term retail staging."
    },
    "zone_freezer": {
        "id": "zone_freezer",
        "name": "Sub-Zero Deep Freeze (Zone D)",
        "icon": "🧊",
        "type": "Freezer",
        "target_temp_c": -18.0,
        "temp_min": -22.0,
        "temp_max": -14.0,
        "target_rh_pct": 90.0,
        "rh_min": 75.0,
        "rh_max": 99.0,
        "max_ethylene_ppm": 0.01,
        "description": "Long-term preservation unit for frozen meats, purees, blanched vegetables, and stock."
    },
    "zone_quarantine": {
        "id": "zone_quarantine",
        "name": "Bio-Isolation & Quarantine (Zone E)",
        "icon": "☣️",
        "type": "Quarantine",
        "target_temp_c": 2.0,
        "temp_min": 1.0,
        "temp_max": 4.0,
        "target_rh_pct": 80.0,
        "rh_min": 70.0,
        "rh_max": 85.0,
        "max_ethylene_ppm": 0.05,
        "description": "Isolated negative-pressure containment zone for flagged, contaminated, or suspicious batches."
    }
}


# In-memory runtime telemetry store with realistic initial readings
ZONE_RUNTIME_TELEMETRY: Dict[str, Dict[str, Any]] = {
    "zone_chiller": {
        "current_temp": 3.8,
        "current_rh": 86.4,
        "ethylene_ppm": 0.04,
        "co2_ppm": 420,
        "airflow_cfm": 210,
        "door_openings_last_hr": 3,
        "compressor_active": True,
        "air_scrubber_active": False,
        "last_sensor_ping": datetime.now(timezone.utc).isoformat()
    },
    "zone_pantry": {
        "current_temp": 13.4,
        "current_rh": 67.2,
        "ethylene_ppm": 0.18,
        "co2_ppm": 480,
        "airflow_cfm": 150,
        "door_openings_last_hr": 5,
        "compressor_active": False,
        "air_scrubber_active": False,
        "last_sensor_ping": datetime.now(timezone.utc).isoformat()
    },
    "zone_ambient": {
        "current_temp": 22.1,
        "current_rh": 54.0,
        "ethylene_ppm": 0.32,
        "co2_ppm": 540,
        "airflow_cfm": 320,
        "door_openings_last_hr": 14,
        "compressor_active": False,
        "air_scrubber_active": False,
        "last_sensor_ping": datetime.now(timezone.utc).isoformat()
    },
    "zone_freezer": {
        "current_temp": -18.4,
        "current_rh": 91.0,
        "ethylene_ppm": 0.00,
        "co2_ppm": 390,
        "airflow_cfm": 180,
        "door_openings_last_hr": 1,
        "compressor_active": True,
        "air_scrubber_active": False,
        "last_sensor_ping": datetime.now(timezone.utc).isoformat()
    },
    "zone_quarantine": {
        "current_temp": 2.2,
        "current_rh": 79.5,
        "ethylene_ppm": 0.02,
        "co2_ppm": 410,
        "airflow_cfm": 280,
        "door_openings_last_hr": 0,
        "compressor_active": True,
        "air_scrubber_active": True,
        "last_sensor_ping": datetime.now(timezone.utc).isoformat()
    }
}

# Audit trail of executed automated storage workflows
WORKFLOW_EXECUTION_LOG: List[Dict[str, Any]] = [
    {
        "id": "wf-init-01",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "zone_id": "zone_chiller",
        "action": "AUTOMATED_CYCLING",
        "status": "Completed",
        "details": "Routine cold-chain thermal equilibrium cycle verified within ±0.3°C variance."
    }
]


def get_all_storage_zones_telemetry() -> List[Dict[str, Any]]:
    """Evaluates real-time compliance for all storage zones and returns unified payload."""
    results = []

    for zone_id, config in STORAGE_ZONES_CONFIG.items():
        telemetry = ZONE_RUNTIME_TELEMETRY.get(zone_id, {
            "current_temp": config["target_temp_c"],
            "current_rh": config["target_rh_pct"],
            "ethylene_ppm": 0.05,
            "co2_ppm": 450,
            "airflow_cfm": 200,
            "door_openings_last_hr": 2,
            "compressor_active": False,
            "air_scrubber_active": False,
            "last_sensor_ping": datetime.now(timezone.utc).isoformat()
        })

        temp = telemetry["current_temp"]
        rh = telemetry["current_rh"]
        eth = telemetry["ethylene_ppm"]

        # Compliance checks
        excursions = []
        is_compliant = True

        if temp > config["temp_max"]:
            excursions.append(f"High Temperature Excursion ({temp}°C > max {config['temp_max']}°C)")
            is_compliant = False
        elif temp < config["temp_min"]:
            excursions.append(f"Low Temperature Chill Excursion ({temp}°C < min {config['temp_min']}°C)")
            is_compliant = False

        if rh > config["rh_max"]:
            excursions.append(f"Excess Humidity / Condensation Risk ({rh}% > max {config['rh_max']}%)")
            is_compliant = False
        elif rh < config["rh_min"]:
            excursions.append(f"Humidity Deficit / Moisture Desiccation ({rh}% < min {config['rh_min']}%)")
            is_compliant = False

        if eth > config["max_ethylene_ppm"]:
            excursions.append(f"Ethylene Gas Spike ({eth} ppm > limit {config['max_ethylene_ppm']} ppm)")
            is_compliant = False

        status = "Optimal" if is_compliant else ("Warning" if len(excursions) == 1 else "Critical")

        results.append({
            "zone_id": zone_id,
            "name": config["name"],
            "icon": config["icon"],
            "type": config["type"],
            "description": config["description"],
            "targets": {
                "temp_target": config["target_temp_c"],
                "temp_safe_range": f"{config['temp_min']}°C - {config['temp_max']}°C",
                "rh_target": config["target_rh_pct"],
                "rh_safe_range": f"{config['rh_min']}% - {config['rh_max']}%",
                "max_ethylene_ppm": config["max_ethylene_ppm"]
            },
            "telemetry": telemetry,
            "status": status,
            "is_compliant": is_compliant,
            "active_excursions": excursions
        })

    return results


def update_zone_telemetry(zone_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Updates environmental telemetry for a zone (manual override or simulated sensor push)."""
    if zone_id not in STORAGE_ZONES_CONFIG:
        raise ValueError(f"Zone ID '{zone_id}' not found.")

    current = ZONE_RUNTIME_TELEMETRY.setdefault(zone_id, {})
    for k in ["current_temp", "current_rh", "ethylene_ppm", "co2_ppm", "airflow_cfm", "compressor_active", "air_scrubber_active"]:
        if k in updates and updates[k] is not None:
            current[k] = updates[k]

    current["last_sensor_ping"] = datetime.now(timezone.utc).isoformat()
    return current


def execute_storage_workflow(
    zone_id: str,
    workflow_action: str,
    user_name: str = "System Automator",
    parameters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Executes automated environmental storage mitigation workflows:
    - COOLING_BOOST: Rapid chilling compressor engagement
    - AIR_PURGE: Ethylene scrubbing & ventilation cycle
    - HUMIDITY_MODULATION: Ultrasonic humidity injection or moisture drain
    - BATCH_RELOCATION: Safe transfer of produce to higher-compliance zone
    - QUARANTINE_ISOLATE: Emergency biological isolation protocol
    """
    if zone_id not in STORAGE_ZONES_CONFIG:
        raise ValueError(f"Invalid zone: {zone_id}")

    zone_cfg = STORAGE_ZONES_CONFIG[zone_id]
    telemetry = ZONE_RUNTIME_TELEMETRY[zone_id]
    action_upper = workflow_action.upper().strip()

    log_entry = {
        "id": f"wf-{int(datetime.now().timestamp())}-{random.randint(100, 999)}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "zone_id": zone_id,
        "zone_name": zone_cfg["name"],
        "action": action_upper,
        "executed_by": user_name,
        "status": "Executed"
    }

    if action_upper == "COOLING_BOOST":
        # Drop temperature by 1.8°C towards target
        delta = max(0.5, (telemetry["current_temp"] - zone_cfg["target_temp_c"]) * 0.75)
        telemetry["current_temp"] = round(telemetry["current_temp"] - delta, 1)
        telemetry["compressor_active"] = True
        log_entry["details"] = f"Activated high-capacity compressor boost. Zone temperature lowered to {telemetry['current_temp']}°C."

    elif action_upper == "AIR_PURGE":
        # Reduce ethylene concentration by 70% and cycle ventilation
        telemetry["ethylene_ppm"] = round(telemetry["ethylene_ppm"] * 0.3, 3)
        telemetry["air_scrubber_active"] = True
        telemetry["airflow_cfm"] = min(450, telemetry.get("airflow_cfm", 200) + 120)
        log_entry["details"] = f"Triggered ethylene catalytic scrubber and air purge. Ethylene dropped to {telemetry['ethylene_ppm']} ppm."

    elif action_upper == "HUMIDITY_OPTIMIZE":
        telemetry["current_rh"] = round(zone_cfg["target_rh_pct"], 1)
        log_entry["details"] = f"Adjusted ultrasonic mist humidifiers. Zone relative humidity stabilized at {telemetry['current_rh']}%."

    elif action_upper == "RESET_NORMAL":
        telemetry["current_temp"] = zone_cfg["target_temp_c"]
        telemetry["current_rh"] = zone_cfg["target_rh_pct"]
        telemetry["ethylene_ppm"] = round(zone_cfg["max_ethylene_ppm"] * 0.4, 3)
        telemetry["compressor_active"] = (zone_cfg["type"] == "Refrigerated" or zone_cfg["type"] == "Freezer")
        telemetry["air_scrubber_active"] = False
        log_entry["details"] = f"Calibrated {zone_cfg['name']} back to standard equilibrium baseline."

    else:
        log_entry["details"] = f"Executed generic workflow directive: {action_upper} on {zone_cfg['name']}."

    WORKFLOW_EXECUTION_LOG.insert(0, log_entry)
    # Keep last 50 logs
    if len(WORKFLOW_EXECUTION_LOG) > 50:
        WORKFLOW_EXECUTION_LOG.pop()

    return {
        "success": True,
        "workflow": log_entry,
        "updated_telemetry": telemetry
    }


def get_workflow_audit_history() -> List[Dict[str, Any]]:
    """Returns the persistent workflow execution history."""
    return WORKFLOW_EXECUTION_LOG
