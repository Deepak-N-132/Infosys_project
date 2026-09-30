"""
Recommendation Engine for FreshCheck AI Platform (Milestone 3).
Provides multi-tier recommendation workflows:
1. FEFO (First-Expired, First-Out) consumption & sales prioritization.
2. Dynamic retail markdown & discount pricing engine.
3. Culinary repurposing & food preservation action directives.
4. Ethylene gas compatibility & storage segregation matrix.
5. Smart recipe utilization engine.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


# Ethylene emission and sensitivity matrix
ETHYLENE_MATRIX = {
    "emitters": ["banana", "apple", "tomato", "papaya", "avocado", "mango", "melon", "peach", "pear"],
    "sensitive": ["cucumber", "bittermelon", "eggplant", "lettuce", "spinach", "cabbage", "broccoli", "carrot", "potato", "cauliflower", "watermelon"]
}

# Culinary repurposing strategies mapped by produce type
REPURPOSING_DATABASE: Dict[str, Dict[str, Any]] = {
    "banana": {
        "title": "Ripe Banana Repurposing Protocols",
        "methods": [
            {"action": "Artisan Banana Bread / Muffins", "time_needed": "45 mins", "shelf_extension": "+5 days", "desc": "Mash overripe bananas into high-moisture batter with walnuts and cinnamon."},
            {"action": "Flash-Freeze Smoothie Chunks", "time_needed": "10 mins", "shelf_extension": "+90 days", "desc": "Peel, slice into 1-inch discs, and seal in freezer bags for dairy-free smoothies."},
            {"action": "Dehydrated Banana Chips", "time_needed": "3 hours", "shelf_extension": "+180 days", "desc": "Bake thin slices at 100°C until crisp for zero-waste pantry snacks."}
        ]
    },
    "tomato": {
        "title": "Softening Tomato Utilization Matrix",
        "methods": [
            {"action": "Slow-Simmered Pomodoro / Marinara", "time_needed": "30 mins", "shelf_extension": "+14 days", "desc": "Blanch, peel, and simmer with garlic, olive oil, and basil; freeze in jars."},
            {"action": "Oven-Roasted Tomato Confit", "time_needed": "1 hour", "shelf_extension": "+21 days", "desc": "Roast halved tomatoes with rosemary and submerged in olive oil at 140°C."},
            {"action": "Dehydrated Sun-Dried Style Slices", "time_needed": "4 hours", "shelf_extension": "+120 days", "desc": "Slice, salt lightly, and dehydrate for savory umami seasoning."}
        ]
    },
    "cucumber": {
        "title": "Crisp Cucumber Rescue Recipes",
        "methods": [
            {"action": "Quick Refrigerator Pickles", "time_needed": "15 mins", "shelf_extension": "+30 days", "desc": "Pack sliced cucumbers into boiled vinegar, dill, and mustard seed brine."},
            {"action": "Chilled Gazpacho / Cold Soup", "time_needed": "10 mins", "shelf_extension": "+4 days", "desc": "Blend with olive oil, mint, garlic, and yogurt for a refreshing summer dish."},
            {"action": "Hydrating Detox Infusions", "time_needed": "5 mins", "shelf_extension": "+2 days", "desc": "Muddle with mint and citrus in ice water pitchers."}
        ]
    },
    "bittermelon": {
        "title": "Bittermelon Preservation Directives",
        "methods": [
            {"action": "Spiced Stir-Fry with Onions", "time_needed": "20 mins", "shelf_extension": "+4 days", "desc": "Salt thin slices to draw out bitterness, then sauté with caramelized onions and cumin."},
            {"action": "Fermented Mustard Brine Pickles", "time_needed": "25 mins", "shelf_extension": "+60 days", "desc": "Submerge blanched coins into spicy vinegar and chili brine."}
        ]
    },
    "eggplant": {
        "title": "Culinary Eggplant Repurposing",
        "methods": [
            {"action": "Smoky Baba Ghanoush Spread", "time_needed": "35 mins", "shelf_extension": "+7 days", "desc": "Char whole eggplants over flame, scoop flesh, and emulsify with tahini and lemon."},
            {"action": "Baked Eggplant Caponata", "time_needed": "40 mins", "shelf_extension": "+10 days", "desc": "Stew with capers, celery, and sweet-sour tomato reductions."}
        ]
    },
    "orange": {
        "title": "Citrus Utilization & Zest Preservation",
        "methods": [
            {"action": "Cold-Pressed Vitamin Immunity Juice", "time_needed": "10 mins", "shelf_extension": "+5 days", "desc": "Juice pulp and freeze in ice cube trays for instant citrus boosts."},
            {"action": "Candied Orange Peel Preserves", "time_needed": "1 hour", "shelf_extension": "+90 days", "desc": "Boil peel juliennes in rich sugar syrup, dry, and dust with granulated sugar."},
            {"action": "Dehydrated Citrus Wheels", "time_needed": "3 hours", "shelf_extension": "+180 days", "desc": "Dehydrate thin wheels for tea infusions and culinary garnishes."}
        ]
    },
    "papaya": {
        "title": "Tropical Papaya Waste-Reduction Options",
        "methods": [
            {"action": "Spiced Papaya Jam / Chutney", "time_needed": "30 mins", "shelf_extension": "+45 days", "desc": "Cook diced ripe papaya with ginger, lime juice, and brown sugar."},
            {"action": "Frozen Tropical Popsicles", "time_needed": "10 mins", "shelf_extension": "+60 days", "desc": "Puree with coconut milk and pour into popsicle molds."}
        ]
    },
    "pineapple": {
        "title": "Pineapple Extended Life Strategies",
        "methods": [
            {"action": "Tepache Fermented Probiotic Drink", "time_needed": "3 days", "shelf_extension": "+14 days", "desc": "Ferment pineapple rind and core with piloncillo and cinnamon in spring water."},
            {"action": "Caramelized Grilled Pineapple Rings", "time_needed": "15 mins", "shelf_extension": "+5 days", "desc": "Grill with brown sugar glaze for desserts or savory burger toppings."}
        ]
    }
}


def parse_expiry_days(expiry_str: str) -> int:
    """Parses expiry date string to days remaining."""
    if not expiry_str:
        return 7
    try:
        # Check if date format YYYY-MM-DD
        exp_date = datetime.strptime(expiry_str[:10], "%Y-%m-%d").date()
        today = datetime.now(timezone.utc).date()
        days_left = (exp_date - today).days
        return days_left
    except Exception:
        # Try checking if it's already an integer
        try:
            return int(expiry_str)
        except Exception:
            return 3


def generate_fefo_priority_queue(inventory_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Ranks inventory according to First-Expired, First-Out (FEFO) discipline.
    Assigns urgency tiers, markdown recommendations, and time windows.
    """
    ranked_queue = []

    for item in inventory_items:
        days_left = parse_expiry_days(item.get("expiry", ""))
        name = item.get("name", "Produce Item")
        status = item.get("status", "Fresh")
        storage = item.get("storage", "Refrigerated")

        # Urgency assignment
        if days_left <= 0 or "rotten" in status.lower():
            urgency = "URGENT_HAZARD"
            urgency_label = "Decomposed / Immediate Action"
            markdown_pct = 100
            pricing_directive = "Dispose or Compost — Zero commercial value"
            dispatch_window = "Immediate (0 hours)"
            badge_color = "#ef4444"
        elif days_left <= 1:
            urgency = "CRITICAL_FEFO"
            urgency_label = "Consume Today (Critical)"
            markdown_pct = 50
            pricing_directive = "50% Flash Sale — Clearance to prevent loss"
            dispatch_window = "Within 12-24 hours"
            badge_color = "#f97316"
        elif days_left <= 2:
            urgency = "HIGH_FEFO"
            urgency_label = "Priority Rotation"
            markdown_pct = 30
            pricing_directive = "30% Markdown — Move to front of shelf"
            dispatch_window = "Within 48 hours"
            badge_color = "#eab308"
        elif days_left <= 4:
            urgency = "MODERATE_FEFO"
            urgency_label = "Standard Circulation"
            markdown_pct = 15
            pricing_directive = "15% Promotional Incentive"
            dispatch_window = "Within 3-4 days"
            badge_color = "#3b82f6"
        else:
            urgency = "STABLE"
            urgency_label = "Optimal Reserve"
            markdown_pct = 0
            pricing_directive = "Full Retail Value"
            dispatch_window = f"{days_left} days remaining"
            badge_color = "#10b981"

        ranked_queue.append({
            "item_id": str(item.get("id", "")),
            "name": name,
            "category": item.get("category", "General"),
            "qty": item.get("qty", "1 unit"),
            "days_left": days_left,
            "status": status,
            "storage": storage,
            "urgency": urgency,
            "urgency_label": urgency_label,
            "badge_color": badge_color,
            "markdown_pct": markdown_pct,
            "pricing_directive": pricing_directive,
            "dispatch_window": dispatch_window
        })

    # Sort ascending by days_left (lowest days = highest FEFO priority)
    ranked_queue.sort(key=lambda x: x["days_left"])
    return ranked_queue


def check_ethylene_conflicts(inventory_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Detects if high ethylene emitting fruits are stored in the same compartment
    as ethylene-sensitive vegetables or greens.
    """
    conflicts = []

    # Group by storage location
    storage_groups: Dict[str, List[Dict[str, Any]]] = {}
    for item in inventory_items:
        storage_loc = (item.get("storage") or "Default Storage").strip()
        storage_groups.setdefault(storage_loc, []).append(item)

    for storage_loc, items in storage_groups.items():
        emitters_found = []
        sensitives_found = []

        for item in items:
            name_lower = (item.get("name") or "").lower()
            for emitter in ETHYLENE_MATRIX["emitters"]:
                if emitter in name_lower:
                    emitters_found.append(item.get("name"))
                    break
            for sensitive in ETHYLENE_MATRIX["sensitive"]:
                if sensitive in name_lower:
                    sensitives_found.append(item.get("name"))
                    break

        if emitters_found and sensitives_found:
            conflicts.append({
                "storage_location": storage_loc,
                "severity": "High Incompatibility",
                "ethylene_emitters": list(set(emitters_found)),
                "ethylene_sensitive_items": list(set(sensitives_found)),
                "risk_description": (
                    f"Cross-gas hazard detected in '{storage_loc}'. Emitters ({', '.join(emitters_found)}) produce high ethylene, "
                    f"triggering rapid senescence and premature decay in sensitive produce ({', '.join(sensitives_found)})."
                ),
                "action_directive": (
                    f"Physical Segregation Required: Relocate {', '.join(sensitives_found)} to a separate perforated crisper or cool pantry zone."
                )
            })

    return conflicts


def get_culinary_repurposing_recommendations(inventory_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Matches inventory items nearing expiry with proven culinary repurposing methods.
    """
    repurposing_list = []

    for item in inventory_items:
        days_left = parse_expiry_days(item.get("expiry", ""))
        name_lower = (item.get("name") or "").lower()

        # Prioritize items with <= 3 days left
        if days_left <= 3:
            matched_methods = None
            for produce_key, data in REPURPOSING_DATABASE.items():
                if produce_key in name_lower:
                    matched_methods = data
                    break

            if matched_methods:
                repurposing_list.append({
                    "item_id": str(item.get("id", "")),
                    "produce_name": item.get("name"),
                    "days_left": days_left,
                    "title": matched_methods["title"],
                    "methods": matched_methods["methods"]
                })
            else:
                # General culinary repurposing fallback
                repurposing_list.append({
                    "item_id": str(item.get("id", "")),
                    "produce_name": item.get("name"),
                    "days_left": days_left,
                    "title": f"Zero-Waste Culinary Action for {item.get('name')}",
                    "methods": [
                        {"action": "Simmer into Vegetable/Stock Base", "time_needed": "40 mins", "shelf_extension": "+7 days in fridge / +90 days frozen", "desc": "Simmer trimmed produce with aromatics into nutritious cooking stock."},
                        {"action": "Quick Pickle or Lacto-Ferment", "time_needed": "20 mins", "shelf_extension": "+30 days", "desc": "Submerge produce in 3% salt brine or vinegar brine with peppercorns."},
                        {"action": "Diced Freezer Packs", "time_needed": "10 mins", "shelf_extension": "+60 days", "desc": "Chop, blanch if necessary, and flash freeze in portioned vacuum bags."}
                    ]
                })

    return repurposing_list


def generate_comprehensive_recommendations(inventory_items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Executes all recommendation workflows across active inventory.
    """
    fefo_queue = generate_fefo_priority_queue(inventory_items)
    ethylene_conflicts = check_ethylene_conflicts(inventory_items)
    repurposing_plans = get_culinary_repurposing_recommendations(inventory_items)

    urgent_count = sum(1 for q in fefo_queue if q["urgency"] in ["URGENT_HAZARD", "CRITICAL_FEFO"])
    markdown_candidates = sum(1 for q in fefo_queue if q["markdown_pct"] > 0 and q["urgency"] != "URGENT_HAZARD")

    return {
        "success": True,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "total_items_analyzed": len(inventory_items),
            "urgent_interventions_count": urgent_count,
            "markdown_candidates_count": markdown_candidates,
            "ethylene_conflicts_count": len(ethylene_conflicts),
            "repurposing_plans_count": len(repurposing_plans)
        },
        "fefo_queue": fefo_queue,
        "markdown_recommendations": [q for q in fefo_queue if q["markdown_pct"] > 0],
        "ethylene_conflicts": ethylene_conflicts,
        "culinary_repurposing": repurposing_plans
    }
