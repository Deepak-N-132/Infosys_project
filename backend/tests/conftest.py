import pytest
import os
import sys

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app, create_access_token
from app.database import User
from datetime import timedelta


@pytest.fixture(scope="session")
def client():
    """Provides a TestClient for FastAPI endpoints."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="session")
def test_user():
    """Returns a test user model or mock user."""
    user = User.find_by_email("test_executive@freshcheck.ai")
    if not user:
        from app.main import get_password_hash
        user = User.create(
            name="Executive Test Director",
            email="test_executive@freshcheck.ai",
            hashed_password=get_password_hash("TestPassword123!"),
            role="Enterprise Manager"
        )
    return user


@pytest.fixture(scope="session")
def auth_headers(test_user):
    """Provides valid JWT Bearer authentication headers for testing protected endpoints."""
    token = create_access_token(
        data={"sub": test_user.email},
        expires_delta=timedelta(hours=2)
    )
    return {"Authorization": f"Bearer {token}"}
