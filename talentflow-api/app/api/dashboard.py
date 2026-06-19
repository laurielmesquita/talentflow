from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta, date

from app.core.database import SessionLocal
from app.models.domain import Candidate, Category, JobPosition, candidate_category

from app.api.deps import get_current_user
router = APIRouter(dependencies=[Depends(get_current_user)])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Candidatos
    total_candidates = db.query(Candidate).filter(
        Candidate.is_active == True, 
        Candidate.deleted_at == None
    ).count()
    
    # Ingestão nas últimas 24h
    time_24h_ago = datetime.now(timezone.utc) - timedelta(days=1)
    added_today = db.query(Candidate).filter(
        Candidate.is_active == True,
        Candidate.deleted_at == None,
        Candidate.created_at >= time_24h_ago
    ).count()
    
    # Média de score de qualidade (0-100)
    avg_quality = db.query(func.avg(Candidate.quality_score)).filter(
        Candidate.is_active == True,
        Candidate.deleted_at == None
    ).scalar()
    avg_quality = round(float(avg_quality), 1) if avg_quality is not None else 0.0
    
    # Candidatos em Blacklist
    flagged_count = db.query(Candidate).filter(
        Candidate.is_active == True,
        Candidate.deleted_at == None,
        Candidate.is_flagged == True
    ).count()
    
    # 2. Vagas (Jobs)
    total_jobs = db.query(JobPosition).count()
    active_jobs = db.query(JobPosition).filter(JobPosition.is_active == True).count()
    
    # Vagas vencendo nos próximos 7 dias
    today = date.today()
    seven_days_later = today + timedelta(days=7)
    upcoming_deadlines = db.query(JobPosition).filter(
        JobPosition.is_active == True,
        JobPosition.deadline >= today,
        JobPosition.deadline <= seven_days_later
    ).count()
    
    # 3. Categorias
    total_categories = db.query(Category).count()
    
    # Candidatos sem nenhuma categoria (ponto cego/não organizados)
    uncategorized_count = db.query(Candidate).filter(
        Candidate.is_active == True,
        Candidate.deleted_at == None
    ).filter(~Candidate.categories.any()).count()
    
    # Categoria mais populosa
    top_cat_query = db.query(
        Category.name,
        func.count(candidate_category.c.candidate_id).label("count")
    ).join(
        candidate_category, Category.id == candidate_category.c.category_id
    ).join(
        Candidate, Candidate.id == candidate_category.c.candidate_id
    ).filter(
        Candidate.is_active == True,
        Candidate.deleted_at == None
    ).group_by(
        Category.name
    ).order_by(
        func.count(candidate_category.c.candidate_id).desc()
    ).first()
    
    top_category_name = top_cat_query[0] if top_cat_query else "Nenhuma"
    top_category_count = top_cat_query[1] if top_cat_query else 0
    
    # 4. Ingestão Recente (Últimos 5 candidatos)
    recent_candidates_list = db.query(Candidate).filter(
        Candidate.is_active == True,
        Candidate.deleted_at == None
    ).order_by(
        Candidate.created_at.desc()
    ).limit(5).all()
    
    recent_candidates = []
    for c in recent_candidates_list:
        current_job = "Não informado"
        if c.experiences:
            # Pega o cargo mais recente
            current_job = c.experiences[0].job_title
            
        recent_candidates.append({
            "id": str(c.id),
            "full_name": c.full_name,
            "current_job": current_job,
            "quality_score": c.quality_score,
            "photo_url": c.photo_url,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
        
    return {
        "candidates": {
            "total": total_candidates,
            "added_today": added_today,
            "average_quality": avg_quality,
            "flagged_count": flagged_count
        },
        "jobs": {
            "total": total_jobs,
            "active": active_jobs,
            "upcoming_deadlines": upcoming_deadlines
        },
        "categories": {
            "total": total_categories,
            "uncategorized": uncategorized_count,
            "top_category": {
                "name": top_category_name,
                "count": top_category_count
            }
        },
        "recent_candidates": recent_candidates
    }
