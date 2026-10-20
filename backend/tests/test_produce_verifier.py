import pytest
import numpy as np
from unittest.mock import patch
from io import BytesIO
from PIL import Image

from app.produce_verifier import (
    verify_produce_domain,
    match_supported_produce,
    compute_normalized_entropy,
    SUPPORTED_PRODUCE
)


def test_match_supported_produce_aliases():
    """Verifies that canonical names and common produce aliases are properly resolved."""
    assert match_supported_produce("Fresh Banana") == "Banana"
    assert match_supported_produce("karela") == "Bittermelon"
    assert match_supported_produce("Bitter Gourd") == "Bittermelon"
    assert match_supported_produce("Aubergine") == "Eggplant"
    assert match_supported_produce("Brinjal") == "Eggplant"
    assert match_supported_produce("Chocolate Cake") is None
    assert match_supported_produce("Pepperoni Pizza") is None


def test_entropy_computation():
    """Verifies normalized Shannon entropy calculation."""
    # Deterministic probability (100% on one class) has zero entropy
    p_certain = np.zeros(24)
    p_certain[0] = 1.0
    assert compute_normalized_entropy(p_certain) == pytest.approx(0.0, abs=1e-5)

    # Uniform probability (equal spread across 24 classes) has maximum entropy (1.0)
    p_uniform = np.full(24, 1.0 / 24.0)
    assert compute_normalized_entropy(p_uniform) == pytest.approx(1.0, abs=1e-4)


def test_gemini_vision_rejects_cake():
    """Verifies that non-produce bakery items (Cake) are rejected with a clear user message."""
    mock_gemini_resp = {
        "source": "gemini_vision",
        "model": "gemini-3-flash-preview",
        "is_produce": False,
        "item_name": "Chocolate Cake",
        "category": "bakery_dessert",
        "is_supported": False,
        "matched_produce": None,
        "confidence": 0.99,
        "reason": "Chocolate frosted layered cake slice."
    }

    with patch("app.produce_verifier.verify_produce_with_gemini", return_value=mock_gemini_resp):
        res = verify_produce_domain("dummy_cake.jpg")
        assert res["is_valid_produce"] is False
        assert res["is_supported"] is False
        assert "Chocolate Cake" in res["rejection_message"]
        assert "AI Storage Advisor" in res["rejection_message"]


def test_gemini_vision_accepts_valid_produce():
    """Verifies that supported agricultural produce items are accepted."""
    mock_gemini_resp = {
        "source": "gemini_vision",
        "model": "gemini-3-flash-preview",
        "is_produce": True,
        "item_name": "Banana",
        "category": "produce",
        "is_supported": True,
        "matched_produce": "Banana",
        "confidence": 0.98,
        "reason": "Fresh yellow banana cluster."
    }

    with patch("app.produce_verifier.verify_produce_with_gemini", return_value=mock_gemini_resp):
        res = verify_produce_domain("dummy_banana.jpg")
        assert res["is_valid_produce"] is True
        assert res["is_supported"] is True
        assert res["matched_produce"] == "Banana"
        assert res["rejection_message"] is None


def test_gemini_vision_identifies_unsupported_produce():
    """Verifies that unsupported produce items (e.g. Apple) receive a helpful message."""
    mock_gemini_resp = {
        "source": "gemini_vision",
        "model": "gemini-3-flash-preview",
        "is_produce": True,
        "item_name": "Fuji Apple",
        "category": "produce",
        "is_supported": False,
        "matched_produce": None,
        "confidence": 0.95,
        "reason": "Red apple fruit."
    }

    with patch("app.produce_verifier.verify_produce_with_gemini", return_value=mock_gemini_resp):
        res = verify_produce_domain("dummy_apple.jpg")
        assert res["is_valid_produce"] is True
        assert res["is_supported"] is False
        assert "Fuji Apple" in res["rejection_message"]
        assert "8 produce types" in res["rejection_message"]


def test_offline_entropy_fallback_rejects_diffused_predictions():
    """Verifies that when Gemini is offline, highly diffused Softmax distributions are flagged as OOD."""
    with patch("app.produce_verifier.verify_produce_with_gemini", return_value=None):
        diffused_preds = np.full(24, 1.0 / 24.0)
        res = verify_produce_domain("dummy.jpg", predictions=diffused_preds)
        assert res["is_valid_produce"] is False
        assert res["source"] == "local_entropy_fallback"
        assert "not recognized as a supported fruit or vegetable" in res["rejection_message"]


def test_offline_color_consistency_fallback_flags_bittermelon_anomaly():
    """Verifies that when Bittermelon is predicted on non-green, high-brightness imagery, it is rejected."""
    with patch("app.produce_verifier.verify_produce_with_gemini", return_value=None):
        # Image has low green (8%) and high red/pastel brightness (225)
        color_dist = {
            "green_percent": 8.0,
            "red_percent": 48.0,
            "blue_percent": 44.0,
            "brightness": 225.0
        }
        res = verify_produce_domain(
            "dummy.jpg",
            predicted_food="Bittermelon",
            color_distribution=color_dist
        )
        assert res["is_valid_produce"] is False
        assert res["source"] == "local_color_consistency_fallback"
        assert "does not match the characteristics of fresh produce" in res["rejection_message"]


def test_predict_endpoint_rejection_integration(client, auth_headers):
    """Verifies that POST /predict returns 400 when an image is flagged as non-produce."""
    # Create a small dummy image in-memory
    img_buffer = BytesIO()
    img = Image.new("RGB", (100, 100), color=(255, 200, 200))
    img.save(img_buffer, format="JPEG")
    img_buffer.seek(0)

    mock_domain_rejection = {
        "is_valid_produce": False,
        "is_supported": False,
        "item_name": "Birthday Cake",
        "category": "bakery_dessert",
        "matched_produce": None,
        "rejection_message": (
            "Unsupported item detected: 'Birthday Cake' (Bakery Dessert). "
            "FreshCheck AI is specialized specifically for raw agricultural produce "
            "(Banana, Bittermelon, Cucumber, Eggplant, Orange, Papaya, Pineapple, Tomato). "
            "For storage guidelines and shelf-life tips on cake, please consult our AI Storage Advisor!"
        ),
        "source": "gemini_vision"
    }

    with patch("app.main.verify_produce_domain", return_value=mock_domain_rejection):
        response = client.post(
            "/predict",
            files={"file": ("cake.jpg", img_buffer, "image/jpeg")},
            headers=auth_headers
        )
        assert response.status_code == 400
        detail = response.json()["detail"]
        assert "Unsupported item detected" in detail
        assert "Birthday Cake" in detail

