from fastapi import APIRouter, Depends
from sqlalchemy import func, case
from datetime import datetime, timezone, timedelta, date

from app.models.domain import Candidate, Category, JobPosition, candidate_category
from app.api.deps import get_current_user, get_scoped_db, ScopedSession

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: ScopedSession = Depends(get_scoped_db)
):
    # 1. Candidatos consolidados
    time_24h_ago = datetime.now(timezone.utc) - timedelta(days=1)
    
    candidate_stats = db.query(
        func.count(Candidate.id).label("total"),
        func.count(case((Candidate.created_at >= time_24h_ago, Candidate.id))).label("added_today"),
        func.avg(Candidate.quality_score).label("avg_quality"),
        func.count(case((Candidate.is_flagged == True, Candidate.id))).label("flagged_count"),
        func.count(case((~Candidate.categories.any(), Candidate.id))).label("uncategorized")
    ).filter(
        Candidate.is_active == True,
        Candidate.deleted_at == None
    ).first()

    avg_quality = round(float(candidate_stats.avg_quality), 1) if candidate_stats.avg_quality is not None else 0.0

    # 2. Vagas (Jobs) consolidadas
    today = date.today()
    seven_days_later = today + timedelta(days=7)
    
    job_stats = db.query(
        func.count(JobPosition.id).label("total"),
        func.count(case((JobPosition.is_active == True, JobPosition.id))).label("active"),
        func.count(case((
            (JobPosition.is_active == True) & 
            (JobPosition.deadline >= today) & 
            (JobPosition.deadline <= seven_days_later), 
            JobPosition.id
        ))).label("upcoming")
    ).first()

    # 3. Categorias
    total_categories = db.query(Category).count()
    
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
            "total": candidate_stats.total,
            "added_today": candidate_stats.added_today,
            "average_quality": avg_quality,
            "flagged_count": candidate_stats.flagged_count
        },
        "jobs": {
            "total": job_stats.total,
            "active": job_stats.active,
            "upcoming_deadlines": job_stats.upcoming
        },
        "categories": {
            "total": total_categories,
            "uncategorized": candidate_stats.uncategorized,
            "top_category": {
                "name": top_category_name,
                "count": top_category_count
            }
        },
        "recent_candidates": recent_candidates
    }
