"""
TalentFlow — CV Quality Score Engine (v1.0)

Responsabilidade única: calcular a pontuação de qualidade/legibilidade
de um currículo com base nos campos extraídos, e emitir alertas estruturados
para cada campo ausente ou insuficiente.

Critérios de pontuação:
  - full_name   : 20 pts (obrigatório — sem nome, score = 0)
  - email       : 15 pts
  - phone       : 15 pts
  - address     : 10 pts
  - categories  : 10 pts (ao menos 1 item)
  - skills      : 15 pts (ao menos 3 itens para pontuar integralmente)
  - experiences : 15 pts (ao menos 1 item)

Score máximo: 100 pts.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    # Evita import circular — usado apenas para type hints
    from ingest import CandidateExtraction


# ---------------------------------------------------------------------------
# Pesos e thresholds
# ---------------------------------------------------------------------------

_WEIGHTS = {
    "full_name": 20,
    "email": 15,
    "phone": 15,
    "address": 10,
    "categories": 10,
    "skills": 15,
    "experiences": 15,
}

_FIELD_LABELS = {
    "full_name": "Nome completo",
    "email": "E-mail",
    "phone": "Telefone",
    "address": "Endereço / Localização",
    "categories": "Área de atuação",
    "skills": "Competências / Skills",
    "experiences": "Histórico profissional",
}

# Número mínimo de itens para considerar como "preenchido" em campos de lista
_MIN_SKILLS = 3
_MIN_CATEGORIES = 1
_MIN_EXPERIENCES = 1


# ---------------------------------------------------------------------------
# Engine principal
# ---------------------------------------------------------------------------

def calculate_quality_score(data: "CandidateExtraction") -> tuple[float, list[str]]:
    """
    Calcula o CV Quality Score de 0–100 e retorna uma lista de alertas
    para campos ausentes ou insuficientes.

    Args:
        data: Instância de CandidateExtraction já validada pelo Pydantic.

    Returns:
        Tupla (score: float, alerts: list[str]).
        - score: valor de 0.0 a 100.0.
        - alerts: lista de mensagens descritivas para exibição no sistema.
    """
    score: float = 0.0
    alerts: list[str] = []

    # ── full_name (obrigatório — sem nome, score colapsa para 0) ──────────
    if data.full_name and data.full_name.strip():
        score += _WEIGHTS["full_name"]
    else:
        alerts.append(_alert("full_name", "campo obrigatório ausente — candidato não pôde ser identificado"))
        # Sem nome não faz sentido avaliar o restante
        return 0.0, alerts

    candidate_name = data.full_name.strip()

    # ── email ──────────────────────────────────────────────────────────────
    if data.email and data.email.strip():
        score += _WEIGHTS["email"]
    else:
        alerts.append(_alert("email", candidate_name))

    # ── phone ──────────────────────────────────────────────────────────────
    if data.phone and data.phone.strip():
        score += _WEIGHTS["phone"]
    else:
        alerts.append(_alert("phone", candidate_name))

    # ── address ────────────────────────────────────────────────────────────
    if data.address and data.address.strip():
        score += _WEIGHTS["address"]
    else:
        alerts.append(_alert("address", candidate_name))

    # ── categories ─────────────────────────────────────────────────────────
    valid_cats = [c for c in (data.categories or []) if c and c.strip()]
    if len(valid_cats) >= _MIN_CATEGORIES:
        score += _WEIGHTS["categories"]
    else:
        alerts.append(_alert("categories", candidate_name, detail="nenhuma área de atuação identificada"))

    # ── skills ─────────────────────────────────────────────────────────────
    valid_skills = [s for s in (data.skills or []) if s and s.strip()]
    if len(valid_skills) >= _MIN_SKILLS:
        score += _WEIGHTS["skills"]
    elif valid_skills:
        # Pontuação parcial: 1–2 skills valem metade
        partial = round(_WEIGHTS["skills"] * (len(valid_skills) / _MIN_SKILLS), 1)
        score += partial
        alerts.append(
            _alert(
                "skills",
                candidate_name,
                detail=f"apenas {len(valid_skills)} skill(s) identificada(s) — mínimo recomendado: {_MIN_SKILLS}",
            )
        )
    else:
        alerts.append(_alert("skills", candidate_name, detail="nenhuma competência/skill identificada"))

    # ── experiences ────────────────────────────────────────────────────────
    valid_exps = data.experiences or []
    if len(valid_exps) >= _MIN_EXPERIENCES:
        score += _WEIGHTS["experiences"]
    else:
        alerts.append(_alert("experiences", candidate_name, detail="histórico profissional não encontrado"))

    return round(score, 1), alerts


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _alert(field: str, candidate_name: str = "", detail: str = "") -> str:
    """
    Gera uma mensagem de alerta padronizada para um campo ausente/insuficiente.

    Formato: [QUALITY ALERT] Campo '<Label>' está sem informação devida
             em '<Candidato>'. <detalhe opcional>
    """
    label = _FIELD_LABELS.get(field, field)
    base = f"[QUALITY ALERT] Campo '{label}' está sem a informação devida"
    if candidate_name:
        base += f" em '{candidate_name}'"
    if detail:
        base += f". {detail.capitalize()}"
    base += "."
    return base


def score_tier(score: float) -> str:
    """
    Retorna o tier textual do score para uso na API e frontend.
    - 'high'   : 80–100
    - 'medium' : 50–79
    - 'low'    : 0–49
    """
    if score >= 80:
        return "high"
    elif score >= 50:
        return "medium"
    return "low"
