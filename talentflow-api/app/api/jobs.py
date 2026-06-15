from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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

class JobCreate(BaseModel):
    title: str
    description: str
    required_skills: str

@router.get("/jobs")
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(JobPosition).order_by(JobPosition.created_at.desc()).all()
    return [{
        "id": str(j.id),
        "title": j.title,
        "description": j.description,
        "required_skills": j.required_skills,
        "is_active": j.is_active,
        "created_at": j.created_at.isoformat() if j.created_at else None
    } for j in jobs]

@router.post("/jobs")
def create_job(job: JobCreate, db: Session = Depends(get_db)):
    db_job = JobPosition(
        title=job.title,
        description=job.description,
        required_skills=job.required_skills
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return {"id": str(db_job.id), "message": "Vaga criada com sucesso"}

@router.get("/jobs/{job_id}/match")
def match_candidates(job_id: str, db: Session = Depends(get_db)):
    job = db.query(JobPosition).filter(JobPosition.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Vaga não encontrada")
        
    candidates = db.query(Candidate).all()
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
