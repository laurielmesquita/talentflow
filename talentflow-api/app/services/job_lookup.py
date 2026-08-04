import uuid
from typing import Optional
from sqlalchemy.orm import Session
from app.models.domain import JobPosition


def resolve_job_id(db: Session, identifier: str, must_be_active: bool = False) -> Optional[JobPosition]:
    """
    Busca uma vaga no banco pelo ID (UUID) ou pelo slug semântico.
    Se must_be_active=True, filtra apenas vagas ativas (útil para portais públicos).
    """
    is_uuid = False
    try:
        uuid.UUID(identifier)
        is_uuid = True
    except ValueError:
        pass

    query = db.query(JobPosition)
    if is_uuid:
        query = query.filter(JobPosition.id == identifier)
    else:
        query = query.filter(JobPosition.slug == identifier)

    if must_be_active:
        query = query.filter(JobPosition.is_active == True)

    return query.first()
