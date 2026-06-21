from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import SessionLocal
from app.models.domain import JobPosition, Candidate, JobMatch, User

from app.api.deps import get_current_user, get_scoped_db, ScopedSession
router = APIRouter(dependencies=[Depends(get_current_user)])


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
def list_jobs(db: ScopedSession = Depends(get_scoped_db)):
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
def get_job(job_id: str, db: ScopedSession = Depends(get_scoped_db)):
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
def create_job(job: JobCreate, db: ScopedSession = Depends(get_scoped_db)):
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
def update_job(job_id: str, job_update: JobUpdate, db: ScopedSession = Depends(get_scoped_db)):
    db_job = db.query(JobPosition).filter(JobPosition.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Vaga não encontrada")
    
    update_data = job_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_job, key, value)
        
    # Invalida o cache de matches para esta vaga
    db.query(JobMatch).filter(JobMatch.job_id == job_id).delete()
    
    db.commit()
    db.refresh(db_job)
    return {"id": str(db_job.id), "message": "Vaga atualizada com sucesso"}

@router.delete("/jobs/{job_id}")
def delete_job(job_id: str, db: ScopedSession = Depends(get_scoped_db)):
    db_job = db.query(JobPosition).filter(JobPosition.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Vaga não encontrada")
    
    db.delete(db_job)
    db.commit()
    return {"message": "Vaga excluída com sucesso"}

@router.get("/jobs/{job_id}/match")
async def match_candidates(job_id: str, db: ScopedSession = Depends(get_scoped_db)):
    import asyncio
    from app.services.match_engine import generate_match_justification

    job = db.query(JobPosition).filter(JobPosition.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Vaga não encontrada")
        
    candidates = db.query(Candidate).options(
        selectinload(Candidate.skills),
        selectinload(Candidate.experiences)
    ).filter(
        Candidate.is_active == True,
        Candidate.deleted_at == None
    ).all()
    
    req_skills = [s.strip().lower() for s in job.required_skills.split(",")] if job.required_skills else []
    
    # Calcular scores on-the-fly
    candidate_scores = []
    for c in candidates:
        cand_skills = [s.name.lower() for s in c.skills]
        matched = set(req_skills).intersection(set(cand_skills))
        
        score = 0
        if req_skills:
            score = int((len(matched) / len(req_skills)) * 100)
            
        candidate_scores.append((c, score, matched, cand_skills))
        
    # Ordenar por score e pegar os top 20
    candidate_scores.sort(key=lambda x: x[1], reverse=True)
    top_candidates = candidate_scores[:20]
    
    # Buscar cache existente de matches para a vaga
    existing_matches = db.query(JobMatch).filter(JobMatch.job_id == job.id).all()
    match_by_candidate = {str(m.candidate_id): m for m in existing_matches}
    
    results = []
    new_db_matches = []
    llm_requests = []
    
    for c, score, matched, cand_skills in top_candidates:
        cand_id_str = str(c.id)
        current_job = "Não informado"
        if c.experiences:
            current_job = c.experiences[0].job_title
            
        db_match = match_by_candidate.get(cand_id_str)
        if db_match:
            # Match já está em cache
            results.append({
                "candidate_id": cand_id_str,
                "full_name": c.full_name,
                "current_job": current_job,
                "photo_url": c.photo_url,
                "match_score": int(db_match.match_score),
                "matched_skills": list(matched),
                "total_skills_cand": len(cand_skills),
                "match_justification": db_match.match_justification
            })
        else:
            # Match não está em cache
            if score == 0:
                justification = "O candidato não possui as competências técnicas obrigatórias especificadas para esta vaga."
                new_db_match = JobMatch(
                    job_id=job.id,
                    candidate_id=c.id,
                    match_score=0.0,
                    match_justification=justification
                )
                db.add(new_db_match)
                new_db_matches.append(new_db_match)
                
                results.append({
                    "candidate_id": cand_id_str,
                    "full_name": c.full_name,
                    "current_job": current_job,
                    "photo_url": c.photo_url,
                    "match_score": 0,
                    "matched_skills": list(matched),
                    "total_skills_cand": len(cand_skills),
                    "match_justification": justification
                })
            else:
                # Necessita chamada à IA
                cand_exps = [
                    {"company_name": e.company_name, "job_title": e.job_title, "description": e.description}
                    for e in c.experiences
                ]
                llm_requests.append({
                    "candidate": c,
                    "score": score,
                    "matched_skills": list(matched),
                    "cand_skills": cand_skills,
                    "cand_exps": cand_exps,
                    "current_job": current_job
                })
                
    # Executar chamadas de IA concorrentemente se houver requisições pendentes
    if llm_requests:
        sem = asyncio.Semaphore(3)

        async def run_llm(req):
            async with sem:
                just = await asyncio.to_thread(
                    generate_match_justification,
                    job_title=job.title,
                    job_description=job.description,
                    required_skills=job.required_skills or "",
                    candidate_name=req["candidate"].full_name,
                    candidate_skills=req["cand_skills"],
                    candidate_experiences=req["cand_exps"],
                    matched_skills=req["matched_skills"],
                    score=req["score"]
                )
                return req, just

        tasks = [run_llm(req) for req in llm_requests]
        llm_results = await asyncio.gather(*tasks)
        
        for req, justification in llm_results:
            c = req["candidate"]
            score = req["score"]
            
            new_db_match = JobMatch(
                job_id=job.id,
                candidate_id=c.id,
                match_score=float(score),
                match_justification=justification
            )
            db.add(new_db_match)
            new_db_matches.append(new_db_match)
            
            results.append({
                "candidate_id": str(c.id),
                "full_name": c.full_name,
                "current_job": req["current_job"],
                "photo_url": c.photo_url,
                "match_score": score,
                "matched_skills": req["matched_skills"],
                "total_skills_cand": len(req["cand_skills"]),
                "match_justification": justification
            })
            
    if new_db_matches:
        try:
            db.commit()
        except Exception as e:
            print(f"[MatchAPI] Erro ao salvar matches no banco: {e}")
            db.rollback()
            
    # Garantir ordenação decrescente pelo score
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return {"job_title": job.title, "matches": results}

