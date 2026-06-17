from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import SessionLocal
from app.models.domain import JobPosition, Candidate, JobMatch

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from datetime import date

class JobCreate(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    employment_type: Optional[str] = None
    work_model: Optional[str] = None
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    application_email: Optional[str] = None
    application_subject: Optional[str] = None
    deadline: Optional[date] = None
    required_skills: Optional[str] = None

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    work_model: Optional[str] = None
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    application_email: Optional[str] = None
    application_subject: Optional[str] = None
    deadline: Optional[date] = None
    required_skills: Optional[str] = None
    is_active: Optional[bool] = None

@router.get("/jobs")
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(JobPosition).order_by(JobPosition.created_at.desc()).all()
    return [{
        "id": str(j.id),
        "title": j.title,
        "description": j.description,
        "location": j.location,
        "employment_type": j.employment_type,
        "work_model": j.work_model,
        "responsibilities": j.responsibilities,
        "requirements": j.requirements,
        "benefits": j.benefits,
        "application_email": j.application_email,
        "application_subject": j.application_subject,
        "deadline": j.deadline.isoformat() if j.deadline else None,
        "required_skills": j.required_skills,
        "is_active": j.is_active,
        "created_at": j.created_at.isoformat() if j.created_at else None
    } for j in jobs]

@router.get("/jobs/{job_id}")
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(JobPosition).filter(JobPosition.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Vaga não encontrada")
    return {
        "id": str(job.id),
        "title": job.title,
        "description": job.description,
        "location": job.location,
        "employment_type": job.employment_type,
        "work_model": job.work_model,
        "responsibilities": job.responsibilities,
        "requirements": job.requirements,
        "benefits": job.benefits,
        "application_email": job.application_email,
        "application_subject": job.application_subject,
        "deadline": job.deadline.isoformat() if job.deadline else None,
        "required_skills": job.required_skills,
        "is_active": job.is_active,
        "created_at": job.created_at.isoformat() if job.created_at else None
    }

@router.post("/jobs")
def create_job(job: JobCreate, db: Session = Depends(get_db)):
    db_job = JobPosition(
        title=job.title,
        description=job.description,
        location=job.location,
        employment_type=job.employment_type,
        work_model=job.work_model,
        responsibilities=job.responsibilities,
        requirements=job.requirements,
        benefits=job.benefits,
        application_email=job.application_email,
        application_subject=job.application_subject,
        deadline=job.deadline,
        required_skills=job.required_skills
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return {"id": str(db_job.id), "message": "Vaga criada com sucesso"}

@router.put("/jobs/{job_id}")
def update_job(job_id: str, job_update: JobUpdate, db: Session = Depends(get_db)):
    db_job = db.query(JobPosition).filter(JobPosition.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Vaga não encontrada")
    
    update_data = job_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_job, key, value)
        
    db.commit()
    db.refresh(db_job)
    return {"id": str(db_job.id), "message": "Vaga atualizada com sucesso"}

@router.delete("/jobs/{job_id}")
def delete_job(job_id: str, db: Session = Depends(get_db)):
    db_job = db.query(JobPosition).filter(JobPosition.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Vaga não encontrada")
    
    db.delete(db_job)
    db.commit()
    return {"message": "Vaga excluída com sucesso"}

@router.get("/jobs/{job_id}/match")
def match_candidates(job_id: str, db: Session = Depends(get_db)):
    job = db.query(JobPosition).filter(JobPosition.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Vaga não encontrada")
        
    candidates = db.query(Candidate).options(selectinload(Candidate.skills)).all()
    req_skills = [s.strip().lower() for s in job.required_skills.split(",")] if job.required_skills else []
    
    results = []
    for c in candidates:
        cand_skills = [s.name.lower() for s in c.skills]
        matched = set(req_skills).intersection(set(cand_skills))
        
        score = 0
        if req_skills:
            score = int((len(matched) / len(req_skills)) * 100)
            
        results.append({
            "candidate_id": str(c.id),
            "full_name": c.full_name,
            "match_score": score,
            "matched_skills": list(matched),
            "total_skills_cand": len(cand_skills)
        })
        
    # Sort by highest score
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return {"job_title": job.title, "matches": results[:20]} # Top 20
