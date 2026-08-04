import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    """Testa se o endpoint raiz GET / responde com status ok e versão 2.3.0"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "TalentFlow API"
    assert data["version"] == "2.3.0"
    assert data["docs"] == "/docs"

def test_health_endpoint():
    """Testa se o endpoint GET /health responde adequadamente"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "2.3.0"

def test_api_health_endpoint():
    """Testa se o endpoint GET /api/health responde adequadamente"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "2.3.0"
