"""
Produce Domain Verification and Out-of-Distribution (OOD) Protection Engine.

Protects FreshCheck AI from misclassifying non-produce items (e.g. cake, pastries,
pizza, cooked dishes, desserts, or non-food objects) as arbitrary produce classes (like Bittermelon).
Integrates Gemini Multimodal Vision verification with robust local fallback safeguards.
"""

import os
import json
import re
import math
import numpy as np
from typing import Dict, Any, Optional, Tuple, List
from pathlib import Path

# Supported produce items in the fine-tuned freshness model
SUPPORTED_PRODUCE = [
    "Banana",
    "Bittermelon",
    "Cucumber",
    "Eggplant",
    "Orange",
    "Papaya",
    "Pineapple",
    "Tomato"
]

# Canonical normalization map for produce common names and synonyms
PRODUCE_ALIASES = {
    "banana": "Banana",
    "bananas": "Banana",
    "plantain": "Banana",
    "bittermelon": "Bittermelon",
    "bitter melon": "Bittermelon",
    "bitter gourd": "Bittermelon",
    "karela": "Bittermelon",
    "momordica": "Bittermelon",
    "cucumber": "Cucumber",
    "cucumbers": "Cucumber",
    "eggplant": "Eggplant",
    "eggplants": "Eggplant",
    "brinjal": "Eggplant",
    "aubergine": "Eggplant",
    "orange": "Orange",
    "oranges": "Orange",
    "tangerine": "Orange",
    "mandarin": "Orange",
    "clementine": "Orange",
    "papaya": "Papaya",
    "papayas": "Papaya",
    "pawpaw": "Papaya",
    "pineapple": "Pineapple",
    "pineapples": "Pineapple",
    "ananas": "Pineapple",
    "tomato": "Tomato",
    "tomatoes": "Tomato",
}

# Known non-produce food keywords for fast offline heuristic checks
NON_PRODUCE_KEYWORDS = {
    "cake", "cupcake", "pastry", "pie", "tart", "cookie", "biscuit", "brownie",
    "bread", "toast", "croissant", "muffin", "donut", "doughnut", "waffle", "pancake",
    "pizza", "burger", "sandwich", "pasta", "noodle", "curry", "soup", "stew",
    "rice", "biryani", "fried", "chips", "crisps", "snack", "candy", "chocolate",
    "ice cream", "dessert", "pudding", "custard", "plate", "fork", "spoon", "knife"
}

# Gemini vision candidate models (prioritizing active models with available quota)
VISION_CANDIDATE_MODELS = [
    "gemini-3-flash-preview",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest"
]


def match_supported_produce(item_name: str) -> Optional[str]:
    """Check if an item name corresponds to one of the 8 supported produce types."""
    if not item_name:
        return None
    cleaned = item_name.strip().lower()
    for alias, canonical in PRODUCE_ALIASES.items():
        if alias in cleaned:
            return canonical
    return None


def compute_normalized_entropy(probabilities: np.ndarray) -> float:
    """
    Computes normalized Shannon entropy of prediction probability distribution (0.0 to 1.0).
    High entropy indicates high uncertainty / out-of-distribution item.
    """
    p = np.array(probabilities, dtype=np.float64)
    p = p[p > 1e-12]
    if len(p) <= 1:
        return 0.0
    entropy = -np.sum(p * np.log2(p))
    max_entropy = np.log2(len(probabilities))
    return float(entropy / max_entropy) if max_entropy > 0 else 0.0


def verify_produce_with_gemini(file_path: str) -> Optional[Dict[str, Any]]:
    """
    Calls Gemini Multimodal Vision to verify whether the image is genuine fresh agricultural
    produce (fruit/vegetable) or a non-produce item (e.g. cake, pastry, cooked meal, non-food).
    Returns None if Gemini is unavailable, offline, or quota exhausted.
    """
    try:
        # Import lazily to avoid circular dependencies
        from backend.app.storage_chatbot import get_gemini_api_key, is_gemini_configured, GENAI_AVAILABLE
        from google import genai
        from google.genai import types
    except Exception:
        return None

    api_key = get_gemini_api_key()
    if not api_key or not is_gemini_configured() or not GENAI_AVAILABLE:
        return None

    # Read image bytes and determine mime type
    ext = Path(file_path).suffix.lower()
    mime_type = "image/png" if ext == ".png" else "image/jpeg"
    try:
        with open(file_path, "rb") as f:
            image_bytes = f.read()
    except Exception:
        return None

    prompt = (
        "You are an expert food scientist and computer vision verifier for FreshCheck AI, "
        "an agricultural food freshness monitoring platform.\n"
        "FreshCheck AI specializes STRICTLY in raw fresh agricultural produce (fruits and vegetables).\n"
        "Specifically, the supported produce categories are:\n"
        "- Banana\n"
        "- Bittermelon (Bitter Gourd / Karela)\n"
        "- Cucumber\n"
        "- Eggplant (Brinjal / Aubergine)\n"
        "- Orange\n"
        "- Papaya\n"
        "- Pineapple\n"
        "- Tomato\n\n"
        "Analyze the provided image carefully and determine:\n"
        "1. What exact item is shown in the image?\n"
        "2. Is this item a raw/fresh agricultural fruit or vegetable (produce)?\n"
        "   - If it is bakery, cake, pastry, cookie, bread, dessert, pizza, cooked meal, meat, "
        "packaged snack, or non-food object, 'is_produce' MUST BE FALSE.\n"
        "3. Which category does it belong to: 'produce', 'bakery_dessert', 'cooked_meal', 'beverage', 'packaged_food', or 'non_food'?\n"
        "4. If it is produce, does it match one of the 8 supported items listed above?\n\n"
        "Respond ONLY with a valid JSON object matching this schema:\n"
        "{\n"
        '  "is_produce": true or false,\n'
        '  "item_name": "Exact Name (e.g. Cake, Banana, Pizza, Bitter Gourd)",\n'
        '  "category": "produce" | "bakery_dessert" | "cooked_meal" | "beverage" | "packaged_food" | "non_food",\n'
        '  "matched_produce": "Banana" | "Bittermelon" | "Cucumber" | "Eggplant" | "Orange" | "Papaya" | "Pineapple" | "Tomato" | null,\n'
        '  "confidence": 0.0 to 1.0,\n'
        '  "reason": "Brief explanation of what was visually identified"\n'
        "}"
    )

    client = genai.Client(api_key=api_key)

    for model_name in VISION_CANDIDATE_MODELS:
        try:
            resp = client.models.generate_content(
                model=model_name,
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                    prompt
                ],
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    max_output_tokens=600,
                    automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
                )
            )
            raw_text = resp.text or ""
            # Strip markdown json code block if present
            cleaned = re.sub(r"^```(?:json)?\s*", "", raw_text.strip(), flags=re.MULTILINE)
            cleaned = re.sub(r"```$", "", cleaned.strip(), flags=re.MULTILINE).strip()

            parsed = json.loads(cleaned)
            is_produce = bool(parsed.get("is_produce", False))
            item_name = str(parsed.get("item_name", "Unknown item")).strip()
            category = str(parsed.get("category", "unknown")).strip()
            matched = match_supported_produce(parsed.get("matched_produce") or item_name)

            return {
                "source": "gemini_vision",
                "model": model_name,
                "is_produce": is_produce,
                "item_name": item_name,
                "category": category,
                "is_supported": matched is not None,
                "matched_produce": matched,
                "confidence": float(parsed.get("confidence", 0.95)),
                "reason": str(parsed.get("reason", ""))
            }
        except Exception:
            # Try next candidate vision model if quota or unavailable
            continue

    return None


def verify_produce_domain(
    file_path: str,
    predictions: Optional[np.ndarray] = None,
    predicted_food: Optional[str] = None,
    color_distribution: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Complete domain verification for an uploaded food image.
    Uses Gemini Multimodal Vision as primary verifier, with local feature and
    entropy safeguards as fallback.

    Returns:
    {
        "is_valid_produce": bool,
        "is_supported": bool,
        "item_name": str,
        "category": str,
        "matched_produce": Optional[str],
        "rejection_message": Optional[str],
        "source": str
    }
    """
    # 1. Primary: Gemini Multimodal Vision Check
    gemini_result = verify_produce_with_gemini(file_path)

    if gemini_result is not None:
        is_produce = gemini_result["is_produce"]
        item_name = gemini_result["item_name"]
        category = gemini_result["category"]
        is_supported = gemini_result["is_supported"]
        matched_produce = gemini_result["matched_produce"]

        if not is_produce:
            # Friendly category name
            cat_display = category.replace("_", " ").title()
            rejection_message = (
                f"Unsupported item detected: '{item_name}' ({cat_display}). "
                "FreshCheck AI is specialized specifically for raw agricultural produce "
                "(Banana, Bittermelon, Cucumber, Eggplant, Orange, Papaya, Pineapple, Tomato). "
                f"For storage guidelines and shelf-life tips on {item_name.lower()}, "
                "please consult our AI Storage Advisor!"
            )
            return {
                "is_valid_produce": False,
                "is_supported": False,
                "item_name": item_name,
                "category": category,
                "matched_produce": None,
                "rejection_message": rejection_message,
                "source": "gemini_vision"
            }

        if not is_supported:
            rejection_message = (
                f"Unsupported produce detected: '{item_name}'. "
                "FreshCheck AI currently has trained computer vision models for 8 produce types: "
                "Banana, Bittermelon, Cucumber, Eggplant, Orange, Papaya, Pineapple, and Tomato. "
                f"While '{item_name}' is a healthy produce item, it is not yet in our trained model. "
                "You can still ask the AI Storage Advisor for personalized storage tips!"
            )
            return {
                "is_valid_produce": True,
                "is_supported": False,
                "item_name": item_name,
                "category": "unsupported_produce",
                "matched_produce": None,
                "rejection_message": rejection_message,
                "source": "gemini_vision"
            }

        return {
            "is_valid_produce": True,
            "is_supported": True,
            "item_name": item_name,
            "category": "produce",
            "matched_produce": matched_produce,
            "rejection_message": None,
            "source": "gemini_vision"
        }

    # 2. Fallback: Local Out-of-Distribution (OOD) & Visual Consistency Check
    # Triggered when Gemini is offline or quota exhausted
    if predictions is not None and len(predictions) > 0:
        entropy = compute_normalized_entropy(predictions)
        top_prob = float(np.max(predictions)) * 100

        # Highly uncertain / diffused probability distribution indicates non-produce/OOD image
        if entropy > 0.88 or top_prob < 35.0:
            return {
                "is_valid_produce": False,
                "is_supported": False,
                "item_name": "Unrecognized Item",
                "category": "unknown",
                "matched_produce": None,
                "rejection_message": (
                    "Image not recognized as a supported fruit or vegetable. "
                    "FreshCheck AI is trained to detect freshness for: "
                    "Banana, Bittermelon, Cucumber, Eggplant, Orange, Papaya, Pineapple, and Tomato. "
                    "Please ensure the image clearly shows one of these fresh produce items."
                ),
                "source": "local_entropy_fallback"
            }

    # Check visual color profile consistency against predicted food
    # For instance, Bittermelon and Cucumber require green/yellow hues.
    # A dessert or cake falsely tagged as Bittermelon often has low green (< 18%)
    # and high pastel / brightness / red hues.
    if predicted_food and color_distribution:
        green_pct = color_distribution.get("green_percent", 0.0)
        red_pct = color_distribution.get("red_percent", 0.0)
        brightness = color_distribution.get("brightness", 0.0)

        if predicted_food in ["Bittermelon", "Cucumber"] and green_pct < 18.0 and (red_pct > 35.0 or brightness > 200.0):
            return {
                "is_valid_produce": False,
                "is_supported": False,
                "item_name": "Non-Produce Item",
                "category": "bakery_or_cooked",
                "matched_produce": None,
                "rejection_message": (
                    "Visual analysis indicates this image does not match the characteristics of fresh produce. "
                    "FreshCheck AI is specialized for agricultural fruits and vegetables "
                    "(Banana, Bittermelon, Cucumber, Eggplant, Orange, Papaya, Pineapple, Tomato). "
                    "Please upload a clear image of supported fresh produce."
                ),
                "source": "local_color_consistency_fallback"
            }

    # Default valid if no anomaly detected
    return {
        "is_valid_produce": True,
        "is_supported": True,
        "item_name": predicted_food or "Produce",
        "category": "produce",
        "matched_produce": predicted_food,
        "rejection_message": None,
        "source": "default_pass"
    }
