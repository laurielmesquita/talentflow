from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy import or_
from sqlalchemy.orm import Session
from pathlib import Path
from typing import Optional
import tempfile

from app.core.database import SessionLocal
from app.models.domain import Candidate, Category, Skill, Experience

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/candidates")
def list_candidates(
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Lista candidatos com filtros de categoria e busca textual (nome, skills, cargo, empresa).
    """
    query = db.query(Candidate)

    if category:
        query = query.join(Candidate.categories).filter(Category.name == category)

    if q:
        search_filter = f"%{q}%"
        query = query.outerjoin(Candidate.skills).outerjoin(Candidate.experiences).filter(
            or_(
                Candidate.full_name.ilike(search_filter),
                Skill.name.ilike(search_filter),
                Experience.job_title.ilike(search_filter),
                Experience.company_name.ilike(search_filter)
            )
        ).distinct()

    candidates = query.order_by(Candidate.created_at.desc()).limit(50).all()
    results = []

    for c in candidates:
        cats = [cat.name for cat in c.categories]

        # Pega o cargo da primeira experiência listada, se houver
        current_job = "Não informado"
        if c.experiences:
            current_job = c.experiences[0].job_title

        # Pega até 3 skills como resumo
        skills = [s.name for s in c.skills[:3]]

        results.append({
            "id": str(c.id),
            "full_name": c.full_name,
            "current_job": current_job,
            "categories": cats,
            "match_score": 88,  # Placeholder para o motor de match futuro
            "added_at": c.created_at.isoformat() if c.created_at else None,
            "skills": skills,
            "photo_url": c.photo_url,
        })

    return {"candidates": results, "total": len(results)}


@router.get("/candidates/{candidate_id}")
def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidato não encontrado")

    return {
        "id": str(c.id),
        "full_name": c.full_name,
        "email": c.email,
        "phone": c.phone,
        "categories": [cat.name for cat in c.categories],
        "skills": [s.name for s in c.skills],
        "experiences": [
            {"company": e.company_name, "title": e.job_title, "desc": e.description}
            for e in c.experiences
        ],
        "added_at": c.created_at.isoformat() if c.created_at else None,
        "pdf_url": c.original_pdf_url,
        "photo_url": c.photo_url,
    }


@router.post("/upload", status_code=202)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF são aceitos.")

    contents = await file.read()
    # Salva em arquivo temporário para processamento em background
    tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    tmp.write(contents)
    tmp.close()

    # Importação lazy para evitar dependência circular e erro de import na startup
    from ingest import process_single_pdf

    background_tasks.add_task(process_single_pdf, Path(tmp.name), db)

    return {"status": "processing", "filename": file.filename}
