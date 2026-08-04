from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.core.database import SessionLocal
from app.models.domain import JobPosition
from app.api.deps import get_db

router = APIRouter()

from app.schemas.job import PublicJobResponse

def _serialize_public_job(j: JobPosition) -> PublicJobResponse:
    return PublicJobResponse(
        id=str(j.id),
        slug=j.slug,
        title=j.title,
        description=j.description,
        location=j.location,
        employment_type=j.employment_type,
        work_model=j.work_model,
        responsibilities=j.responsibilities,
        requirements=j.requirements,
        benefits=j.benefits,
        deadline=j.deadline.isoformat() if j.deadline else None,
        required_skills=j.required_skills,
        created_at=j.created_at.isoformat() if j.created_at else None
    )

@router.get("/public/vagas", response_model=List[PublicJobResponse])
def list_public_jobs(db: Session = Depends(get_db)):
    """
    Retorna a listagem de todas as vagas ativas no portal público.
    Não exige autenticação. Filtra vagas inativas ou com prazo vencido.
    """
    today = date.today()
    jobs = db.query(JobPosition).filter(
        JobPosition.is_active == True,
        (JobPosition.deadline == None) | (JobPosition.deadline >= today)
    ).order_by(JobPosition.created_at.desc()).all()
    
    return [_serialize_public_job(j) for j in jobs]

@router.get("/public/vagas/{slug}", response_model=PublicJobResponse)
def get_public_job(slug: str, db: Session = Depends(get_db)):
    """
    Retorna os detalhes de uma vaga pública específica identificada pelo slug semântico ou ID.
    Não exige autenticação.
    """
    from app.services.job_lookup import resolve_job_id
    job = resolve_job_id(db, slug, must_be_active=True)

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Vaga não encontrada ou não está mais ativa."
        )
        
    return _serialize_public_job(job)
