from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import or_, func
from sqlalchemy.orm import Session, selectinload
from pathlib import Path
from typing import Optional, List
import tempfile
import json
import os
from pydantic import BaseModel

from app.core.database import SessionLocal
from app.models.domain import Candidate, Category, Skill, Experience
from app.services.quality_score import score_tier

from app.api.deps import get_current_user
router = APIRouter(dependencies=[Depends(get_current_user)])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def extract_cloudinary_public_id(url: str, is_raw: bool = False) -> Optional[str]:
    if not url or "cloudinary.com" not in url:
        return None
    try:
        parts = url.split("/upload/")
        if len(parts) < 2:
            return None
        subparts = parts[1].split("/")
        if subparts[0].startswith("v") and len(subparts) > 1:
            public_id_with_ext = "/".join(subparts[1:])
        else:
            public_id_with_ext = "/".join(subparts)
        
        if is_raw:
            return public_id_with_ext
        else:
            return os.path.splitext(public_id_with_ext)[0]
    except Exception:
        return None


class ReplaceRequest(BaseModel):
    action: str  # "replace" | "keep_both"
    extracted_data: dict
    photo_url: Optional[str] = None
    original_pdf_url: Optional[str] = None
    pdf_hash: Optional[str] = None
    quality_score: Optional[float] = None
    quality_alerts: Optional[list] = None


class FlagRequest(BaseModel):
    reason: str


@router.get("/candidates")
def list_candidates(
    category: Optional[str] = None,
    q: Optional[str] = None,
    include_archived: bool = False,
    db: Session = Depends(get_db)
):
    """
    Lista candidatos com filtros de categoria e busca textual (nome, skills, cargo, empresa).
    Filtra por padrão apenas os ativos (is_active=True) e não excluídos (deleted_at=None).
    """
    query = db.query(Candidate).options(
        selectinload(Candidate.categories),
        selectinload(Candidate.experiences),
        selectinload(Candidate.skills)
    )

    if not include_archived:
        query = query.filter(Candidate.is_active == True, Candidate.deleted_at == None)

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
            "quality_score": c.quality_score,
            "quality_tier": score_tier(c.quality_score) if c.quality_score is not None else None,
            "quality_alerts": json.loads(c.quality_alerts) if c.quality_alerts else [],
            "version": c.version,
            "is_active": c.is_active,
            "is_flagged": c.is_flagged,
            "flagged_reason": c.flagged_reason,
            "flagged_at": c.flagged_at.isoformat() if c.flagged_at else None
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
        "address": c.address,
        "categories": [cat.name for cat in c.categories],
        "skills": [s.name for s in c.skills],
        "experiences": [
            {"company": e.company_name, "title": e.job_title, "desc": e.description}
            for e in c.experiences
        ],
        "added_at": c.created_at.isoformat() if c.created_at else None,
        "pdf_url": c.original_pdf_url,
        "photo_url": c.photo_url,
        "quality_score": c.quality_score,
        "quality_tier": score_tier(c.quality_score) if c.quality_score is not None else None,
        "quality_alerts": json.loads(c.quality_alerts) if c.quality_alerts else [],
        "version": c.version,
        "is_active": c.is_active,
        "parent_id": str(c.parent_id) if c.parent_id else None,
        "is_flagged": c.is_flagged,
        "flagged_reason": c.flagged_reason,
        "flagged_at": c.flagged_at.isoformat() if c.flagged_at else None
    }


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF são aceitos.")

    contents = await file.read()
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(contents)
        tmp_path = Path(tmp.name)

    try:
        from ingest import extract_candidate_from_pdf, save_candidate_to_db, _cleanup
        
        # 1. Extrai dados do PDF de forma síncrona
        extraction = extract_candidate_from_pdf(tmp_path)
        data = extraction["data"]
        pdf_hash = extraction.get("pdf_hash")

        # 1.5. Verifica integridade do arquivo por hash SHA-256 (duplicata exata)
        if pdf_hash:
            identical_candidate = db.query(Candidate).filter(
                Candidate.pdf_hash == pdf_hash,
                Candidate.is_active == True,
                Candidate.deleted_at == None
            ).first()
            if identical_candidate:
                raise HTTPException(
                    status_code=409,
                    detail={
                        "status": "identical",
                        "existing_candidate": {
                            "id": str(identical_candidate.id),
                            "full_name": identical_candidate.full_name,
                            "added_at": identical_candidate.created_at.isoformat() if identical_candidate.created_at else None
                        }
                    }
                )

        # 2. Verifica duplicata no banco por nome (apenas perfis ativos)
        existing = db.query(Candidate).filter(
            Candidate.full_name == data.full_name,
            Candidate.is_active == True,
            Candidate.deleted_at == None
        ).first()

        if existing:
            # Serializa os dados existentes
            existing_data = {
                "id": str(existing.id),
                "full_name": existing.full_name,
                "email": existing.email,
                "phone": existing.phone,
                "address": existing.address,
                "version": existing.version,
                "added_at": existing.created_at.isoformat() if existing.created_at else None,
                "skills": [s.name for s in existing.skills],
                "experiences": [
                    {
                        "company_name": e.company_name,
                        "job_title": e.job_title,
                        "description": e.description,
                        "is_current": e.is_current
                    }
                    for e in existing.experiences
                ]
            }

            extracted_serialized = {
                "full_name": data.full_name,
                "email": data.email,
                "phone": data.phone,
                "address": data.address,
                "categories": data.categories,
                "skills": data.skills,
                "experiences": [
                    {
                        "company_name": e.company_name,
                        "job_title": e.job_title,
                        "description": e.description,
                        "is_current": e.is_current
                    }
                    for e in data.experiences
                ]
            }

            raise HTTPException(
                status_code=409,
                detail={
                    "status": "conflict",
                    "existing_candidate": existing_data,
                    "extracted_data": extracted_serialized,
                    "photo_url": extraction["photo_url"],
                    "original_pdf_url": extraction["pdf_url"],
                    "pdf_hash": pdf_hash,
                    "quality_score": extraction["quality_score"],
                    "quality_alerts": extraction["quality_alerts"]
                }
            )

        # 3. Salva e persiste normalmente
        candidate = save_candidate_to_db(db, extraction)
        return {
            "status": "success",
            "id": str(candidate.id),
            "full_name": candidate.full_name
        }
    finally:
        from ingest import _cleanup
        _cleanup(tmp_path)


@router.post("/candidates/{candidate_id}/replace")
def replace_candidate(
    candidate_id: str,
    req: ReplaceRequest,
    db: Session = Depends(get_db)
):
    # Encontra candidato existente
    existing = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.is_active == True,
        Candidate.deleted_at == None
    ).first()

    if not existing:
        raise HTTPException(status_code=404, detail="Candidato existente não encontrado")

    from ingest import save_candidate_to_db, CandidateExtraction, ExperienceItem

    ext = req.extracted_data
    exps = [
        ExperienceItem(
            company_name=e.get("company_name"),
            job_title=e.get("job_title"),
            description=e.get("description"),
            is_current=e.get("is_current", False)
        )
        for e in ext.get("experiences", [])
    ]

    data = CandidateExtraction(
        full_name=ext.get("full_name"),
        email=ext.get("email"),
        phone=ext.get("phone"),
        address=ext.get("address"),
        categories=ext.get("categories", []),
        skills=ext.get("skills", []),
        experiences=exps
    )

    photo_url = req.photo_url or existing.photo_url

    extraction = {
        "data": data,
        "photo_url": photo_url,
        "pdf_url": req.original_pdf_url,
        "pdf_hash": req.pdf_hash,
        "quality_score": req.quality_score,
        "quality_alerts": req.quality_alerts
    }

    if req.action == "replace":
        # Substituir: soft-deleta o existente
        existing.deleted_at = func.now()
        existing.is_active = False

        # Persiste o novo candidato com versão=1, parent_id=None
        new_candidate = save_candidate_to_db(db, extraction, parent_id=None, version=1)

    elif req.action == "keep_both":
        # Manter ambos: arquiva o existente
        existing.is_active = False

        # Persiste o novo com version=anterior+1, parent_id=anterior.id
        new_candidate = save_candidate_to_db(db, extraction, parent_id=existing.id, version=existing.version + 1)

    else:
        raise HTTPException(status_code=400, detail="Ação inválida. Use 'replace' ou 'keep_both'.")

    return {
        "status": "success",
        "id": str(new_candidate.id),
        "version": new_candidate.version
    }


@router.get("/candidates/{candidate_id}/versions")
def get_candidate_versions(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidato não encontrado")

    # Encontra a raiz do histórico
    root = c
    visited = set()
    while root.parent_id is not None and root.parent_id not in visited:
        visited.add(root.id)
        parent = db.query(Candidate).filter(Candidate.id == root.parent_id).first()
        if not parent:
            break
        root = parent

    # Coleta todas as versões descendentes a partir da raiz
    versions = [root]
    current = root
    visited_desc = set()
    while current.id not in visited_desc:
        visited_desc.add(current.id)
        child = db.query(Candidate).filter(Candidate.parent_id == current.id).first()
        if not child:
            break
        versions.append(child)
        current = child

    return {
        "versions": [
            {
                "id": str(v.id),
                "version": v.version,
                "is_active": v.is_active,
                "deleted_at": v.deleted_at.isoformat() if v.deleted_at else None,
                "added_at": v.created_at.isoformat() if v.created_at else None,
                "photo_url": v.photo_url,
                "quality_score": v.quality_score,
            }
            for v in versions
        ]
    }


@router.delete("/candidates/{candidate_id}", status_code=204)
def delete_candidate(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidato não encontrado")

    # Deleta mídias associadas no Cloudinary
    from ingest import _configure_cloudinary
    import cloudinary.uploader

    _configure_cloudinary()

    if c.photo_url:
        photo_id = extract_cloudinary_public_id(c.photo_url, is_raw=False)
        if photo_id:
            try:
                cloudinary.uploader.destroy(photo_id, resource_type="image")
            except Exception as e:
                print(f"[delete] Erro ao deletar foto no Cloudinary: {e}")

    if c.original_pdf_url:
        pdf_id = extract_cloudinary_public_id(c.original_pdf_url, is_raw=True)
        if pdf_id:
            try:
                cloudinary.uploader.destroy(pdf_id, resource_type="raw")
            except Exception as e:
                print(f"[delete] Erro ao deletar PDF no Cloudinary: {e}")

    # Remove o candidato do banco
    db.delete(c)
    db.commit()
    return


@router.post("/candidates/{candidate_id}/flag")
def flag_candidate(
    candidate_id: str,
    req: FlagRequest,
    db: Session = Depends(get_db)
):
    c = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.deleted_at == None
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidato não encontrado")

    c.is_flagged = True
    c.flagged_reason = req.reason.strip()
    c.flagged_at = func.now()

    db.commit()
    db.refresh(c)

    return {
        "status": "success",
        "id": str(c.id),
        "is_flagged": c.is_flagged,
        "flagged_reason": c.flagged_reason,
        "flagged_at": c.flagged_at.isoformat() if c.flagged_at else None
    }


@router.post("/candidates/{candidate_id}/unflag")
def unflag_candidate(
    candidate_id: str,
    db: Session = Depends(get_db)
):
    c = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.deleted_at == None
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidato não encontrado")

    c.is_flagged = False
    c.flagged_reason = None
    c.flagged_at = None

    db.commit()
    db.refresh(c)

    return {
        "status": "success",
        "id": str(c.id),
        "is_flagged": c.is_flagged
    }
