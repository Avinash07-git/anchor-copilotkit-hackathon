from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient

from app.config import clear_settings_cache


@pytest.fixture
def client(tmp_path) -> TestClient:
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path / 'anchor-test.db'}"
    os.environ["AUTH_SECRET_KEY"] = "test-secret-key"
    clear_settings_cache()

    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
