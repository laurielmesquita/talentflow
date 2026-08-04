from typing import Dict, Any
from app.core.config import settings


def get_plan_features(plan_type: str = "free") -> Dict[str, Any]:
    """
    Retorna o mapa de recursos e feature flags disponíveis para o plano do tenant.
    """
    plan_key = (plan_type or "free").lower()
    return settings.PLAN_FEATURES.get(plan_key, settings.PLAN_FEATURES["free"])


def check_feature_access(plan_type: str, feature_name: str) -> bool:
    """
    Verifica se o plano especificado possui acesso à feature solicitada.
    """
    features = get_plan_features(plan_type)
    value = features.get(feature_name)
    if isinstance(value, bool):
        return value
    return value is not None
