"""
TalentFlow — Backfill de CV Quality Score para candidatos existentes.

Execução:
    source venv/bin/activate
    python backfill_quality_score.py
"""

import json
import sys
import os

# Garante que o módulo 'app' é encontrado quando executado da raiz do projeto
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.domain import Candidate
from app.services.quality_score import calculate_quality_score, score_tier
from ingest import CandidateExtraction, ExperienceItem


def build_extraction_from_candidate(c: Candidate) -> CandidateExtraction:
    """
    Reconstrói um CandidateExtraction a partir dos dados já persistidos no banco.
    Usado exclusivamente para calcular o quality_score de candidatos legados.
    """
    return CandidateExtraction(
        full_name=c.full_name or "",
        email=c.email,
        phone=c.phone,
        birth_date=None,  # não persiste no campo separado atual
        address=c.address,
        categories=[cat.name for cat in c.categories],
        skills=[s.name for s in c.skills],
        experiences=[
            ExperienceItem(
                company_name=e.company_name,
                job_title=e.job_title,
                description=e.description,
                is_current=e.is_current,
            )
            for e in c.experiences
        ],
    )


def run_backfill():
    db = SessionLocal()
    try:
        # Busca apenas candidatos sem score (ou reprocessa todos se --force passado)
        force = "--force" in sys.argv
        if force:
            candidates = db.query(Candidate).all()
            print(f"[backfill] Modo --force: reprocessando TODOS os {len(candidates)} candidato(s).")
        else:
            candidates = db.query(Candidate).filter(Candidate.quality_score == None).all()
            print(f"[backfill] {len(candidates)} candidato(s) sem quality_score encontrado(s).")

        if not candidates:
            print("[backfill] Nenhum candidato para processar. Tudo já está atualizado.")
            return

        updated = 0
        for c in candidates:
            try:
                extraction = build_extraction_from_candidate(c)
                score, alerts = calculate_quality_score(extraction)

                c.quality_score = score
                c.quality_alerts = json.dumps(alerts, ensure_ascii=False) if alerts else None

                tier = score_tier(score)
                status = "✅" if not alerts else "⚠️ "
                print(f"[backfill] {status} '{c.full_name}' → score={score}/100 (tier={tier})")
                if alerts:
                    for alert in alerts:
                        print(f"           {alert}")

                updated += 1
            except Exception as e:
                print(f"[backfill] ❌ Erro ao processar '{c.full_name}': {e}")

        db.commit()
        print(f"\n[backfill] ✅ Concluído: {updated}/{len(candidates)} candidato(s) atualizados.")

    except Exception as e:
        db.rollback()
        print(f"[backfill] ❌ Erro fatal: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_backfill()
