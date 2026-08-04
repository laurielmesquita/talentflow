import pytest
from app.services.features import get_plan_features, check_feature_access
from app.core.config import settings

def test_get_plan_features_defaults():
    """Testa se get_plan_features retorna o mapa correto para planos Free, Pro e Enterprise"""
    free_features = get_plan_features("free")
    assert free_features["candidate_limit"] == 50
    assert free_features["batch_upload"] is False
    assert free_features["api_access"] is False

    pro_features = get_plan_features("pro")
    assert pro_features["candidate_limit"] == 500
    assert pro_features["batch_upload"] is True
    assert pro_features["api_access"] is True

    enterprise_features = get_plan_features("enterprise")
    assert enterprise_features["candidate_limit"] == 999999
    assert enterprise_features["batch_upload"] is True

def test_check_feature_access():
    """Testa a checagem booleana de acesso às features por plano"""
    assert check_feature_access("free", "smart_match") is True
    assert check_feature_access("free", "batch_upload") is False
    assert check_feature_access("pro", "batch_upload") is True
    assert check_feature_access("enterprise", "api_access") is True
    assert check_feature_access("free", "feature_inexistente") is False
