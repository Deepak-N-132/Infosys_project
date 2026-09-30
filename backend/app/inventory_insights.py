"""
Inventory Insights and Freshness Analytics Engine for FreshCheck AI (Milestone 3).
Computes inventory health indices, waste risk exposure, financial and environmental savings,
and category-level shelf-life distribution.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone
import math


def compute_inventory_insights(
    inventory_items: List[Dict[str, Any]],
    historical_scans: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Computes global inventory health score, waste risk exposure,
    category distribution, and environmental savings.
    """
    total_items = len(inventory_items)

    if total_items == 0:
        return {
            "success": True,
            "inventory_health_score": 100.0,
            "health_grade": "A+",
            "total_items": 0,
            "risk_exposure": {
                "critical": {"count": 0, "percent": 0.0, "label": "< 24 Hours (Immediate Action)"},
                "high": {"count": 0, "percent": 0.0, "label": "24-48 Hours (Markdown Candidate)"},
                "moderate": {"count": 0, "percent": 0.0, "label": "3-5 Days (Active Rotation)"},
                "optimal": {"count": 0, "percent": 0.0, "label": "> 5 Days (Stable Reserve)"}
            },
            "financial_environmental_impact": {
                "waste_prevented_kg": 0.0,
                "co2_avoided_kg": 0.0,
                "economic_value_protected_usd": 0.0
            },
            "category_metrics": {},
            "urgent_interventions": [],
            "freshness_distribution": {"Fresh": 0, "Semi-Fresh": 0, "Rotten": 0}
        }

    # 1. Evaluate risk tiers and parsed expiry days
    critical_count = 0
    high_count = 0
    moderate_count = 0
    optimal_count = 0

    category_buckets: Dict[str, Dict[str, Any]] = {}
    freshness_counts = {"Fresh": 0, "Semi-Fresh": 0, "Rotten": 0}
    urgent_items = []
    total_health_points = 0.0

    today = datetime.now(timezone.utc).date()

    for item in inventory_items:
        # Days left calculation
        exp_raw = item.get("expiry", "")
        days_left = 5
        try:
            exp_date = datetime.strptime(str(exp_raw)[:10], "%Y-%m-%d").date()
            days_left = (exp_date - today).days
        except Exception:
            try:
                days_left = int(exp_raw)
            except Exception:
                days_left = 5

        status = str(item.get("status", "Fresh"))
        status_clean = "Rotten" if "rotten" in status.lower() or "spoiled" in status.lower() else (
            "Semi-Fresh" if "semi" in status.lower() else "Fresh"
        )
        freshness_counts[status_clean] = freshness_counts.get(status_clean, 0) + 1

        # Health score contribution
        if status_clean == "Rotten" or days_left <= 0:
            critical_count += 1
            pts = 10.0
            urgent_items.append({
                "id": str(item.get("id")),
                "name": item.get("name"),
                "days_left": days_left,
                "urgency": "Hazard / Immediate Disposal",
                "storage": item.get("storage")
            })
        elif days_left <= 2:
            high_count += 1
            pts = 45.0
            urgent_items.append({
                "id": str(item.get("id")),
                "name": item.get("name"),
                "days_left": days_left,
                "urgency": "Consume Within 48 Hours",
                "storage": item.get("storage")
            })
        elif days_left <= 5:
            moderate_count += 1
            pts = 80.0
        else:
            optimal_count += 1
            pts = 98.0

        total_health_points += pts

        # Category aggregation
        cat = str(item.get("category", "General Produce")).capitalize()
        if cat not in category_buckets:
            category_buckets[cat] = {"count": 0, "total_days": 0, "fresh_count": 0}
        category_buckets[cat]["count"] += 1
        category_buckets[cat]["total_days"] += max(0, days_left)
        if status_clean == "Fresh":
            category_buckets[cat]["fresh_count"] += 1

    # 2. Overall Health Score
    health_score = round(total_health_points / total_items, 1)
    if health_score >= 88.0:
        health_grade = "A+ (Superior Quality)"
    elif health_score >= 75.0:
        health_grade = "A (High Freshness)"
    elif health_score >= 60.0:
        health_grade = "B (Good Commercial)"
    elif health_score >= 45.0:
        health_grade = "C (Marginal / High Spoilage Pressure)"
    else:
        health_grade = "Critical Attention Required"

    # 3. Environmental and Financial Impact Modeling
    # Each kg of food waste saved prevents ~2.5 kg CO2e and represents ~$3.80 value
    waste_prevented_kg = round(total_items * 0.45 * (health_score / 100.0) * 1.8, 1)
    co2_avoided_kg = round(waste_prevented_kg * 2.52, 1)
    economic_value_usd = round(waste_prevented_kg * 3.85, 2)

    # 4. Category breakdown
    category_metrics = {}
    for cat_name, data in category_buckets.items():
        cnt = data["count"]
        category_metrics[cat_name] = {
            "item_count": cnt,
            "avg_shelf_life_days": round(data["total_days"] / cnt, 1),
            "fresh_pct": round((data["fresh_count"] / cnt) * 100, 1)
        }

    # 5. Historical Scan Analytics (from predictions)
    scan_count = len(historical_scans)
    avg_scan_fqi = 0.0
    scan_grade_breakdown = {"A+": 0, "A": 0, "B": 0, "C": 0, "F": 0}

    if scan_count > 0:
        fqi_sum = sum(getattr(s, "quality_score", 85.0) if hasattr(s, "quality_score") else s.get("quality_score", 85.0) for s in historical_scans)
        avg_scan_fqi = round(fqi_sum / scan_count, 1)
        for s in historical_scans:
            g = getattr(s, "grade", "A") if hasattr(s, "grade") else s.get("grade", "A")
            if g in scan_grade_breakdown:
                scan_grade_breakdown[g] += 1
            else:
                scan_grade_breakdown["B"] += 1

    return {
        "success": True,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "inventory_health_score": health_score,
        "health_grade": health_grade,
        "total_items": total_items,
        "risk_exposure": {
            "critical": {
                "count": critical_count,
                "percent": round((critical_count / total_items) * 100, 1),
                "label": "< 24 Hours (Immediate Action)"
            },
            "high": {
                "count": high_count,
                "percent": round((high_count / total_items) * 100, 1),
                "label": "24-48 Hours (Markdown Candidate)"
            },
            "moderate": {
                "count": moderate_count,
                "percent": round((moderate_count / total_items) * 100, 1),
                "label": "3-5 Days (Active Rotation)"
            },
            "optimal": {
                "count": optimal_count,
                "percent": round((optimal_count / total_items) * 100, 1),
                "label": "> 5 Days (Stable Reserve)"
            }
        },
        "financial_environmental_impact": {
            "waste_prevented_kg": waste_prevented_kg,
            "co2_avoided_kg": co2_avoided_kg,
            "economic_value_protected_usd": economic_value_usd
        },
        "category_metrics": category_metrics,
        "freshness_distribution": freshness_counts,
        "urgent_interventions": urgent_items[:5],
        "scan_analytics": {
            "total_scans_logged": scan_count,
            "average_scan_quality_score": avg_scan_fqi,
            "grade_breakdown": scan_grade_breakdown
        }
    }
