from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy import or_, func
from sqlalchemy.orm import Session, selectinload
from pathlib import Path
from typing import Optional, List
import tempfile
import json
import os
import asyncio
from pydantic import BaseModel
from uuid import UUID

from app.core.database import SessionLocal
from app.models.domain import Candidate, Category, Skill, Experience, BatchJob, User, JobMatch, AuditLog
from app.services.quality_score import score_tier

from app.api.deps import get_current_user, get_scoped_db, ScopedSession
router = APIRouter(dependencies=[Depends(get_current_user)])



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
    category_id: Optional[UUID] = None,
    q: Optional[str] = None,
    include_archived: bool = False,
    db: ScopedSession = Depends(get_scoped_db)
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

    if category_id:
        query = query.join(Candidate.categories).filter(Category.id == category_id)
    elif category:
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
def get_candidate(
    candidate_id: str, 
    db: ScopedSession = Depends(get_scoped_db),
    current_user: User = Depends(get_current_user)
):
    c = db.query(Candidate).filter(
        Candidate.id == candidate_id
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidato não encontrado")

    # Registrar log de auditoria
    log = AuditLog(
        user_id=current_user.id,
        action="view",
        entity_name="Candidate",
        entity_id=c.id
    )
    db.add(log)
    db.commit()

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
    db: ScopedSession = Depends(get_scoped_db),
    current_user: User = Depends(get_current_user)
):
    # Billing Quota Check
    tenant = current_user.tenant
    active_candidates_count = db.query(Candidate).filter(
        Candidate.is_active == True, 
        Candidate.deleted_at == None
    ).count()
    
    if active_candidates_count >= tenant.candidate_count_limit:
        raise HTTPException(
            status_code=402, 
            detail=f"Limite do plano excedido ({tenant.candidate_count_limit} candidatos). Faça o upgrade para continuar adicionando."
        )

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
        candidate = save_candidate_to_db(db.db, extraction, tenant_id=db.tenant_id)
        
        # Registrar log de auditoria
        log = AuditLog(
            user_id=current_user.id,
            action="create",
            entity_name="Candidate",
            entity_id=candidate.id
        )
        db.add(log)
        db.commit()

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
    db: ScopedSession = Depends(get_scoped_db),
    current_user: User = Depends(get_current_user)
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

    # Invalida cache de matches do candidato que está sendo desativado/arquivado
    db.query(JobMatch).filter(JobMatch.candidate_id == existing.id).delete()

    if req.action == "replace":
        # Substituir: soft-deleta o existente
        existing.deleted_at = func.now()
        existing.is_active = False

        # Persiste o novo candidato com versão=1, parent_id=None
        new_candidate = save_candidate_to_db(db.db, extraction, parent_id=None, version=1, tenant_id=db.tenant_id)

    elif req.action == "keep_both":
        # Manter ambos: arquiva o existente
        existing.is_active = False

        # Persiste o novo com version=anterior+1, parent_id=anterior.id
        new_candidate = save_candidate_to_db(db.db, extraction, parent_id=existing.id, version=existing.version + 1, tenant_id=db.tenant_id)

    else:
        raise HTTPException(status_code=400, detail="Ação inválida. Use 'replace' ou 'keep_both'.")

    # Registrar logs de auditoria
    log_existing = AuditLog(
        user_id=current_user.id,
        action="update",
        entity_name="Candidate",
        entity_id=existing.id
    )
    log_new = AuditLog(
        user_id=current_user.id,
        action="create",
        entity_name="Candidate",
        entity_id=new_candidate.id
    )
    db.add(log_existing)
    db.add(log_new)
    db.commit()

    return {
        "status": "success",
        "id": str(new_candidate.id),
        "version": new_candidate.version
    }


@router.get("/candidates/{candidate_id}/versions")
def get_candidate_versions(
    candidate_id: str, 
    db: ScopedSession = Depends(get_scoped_db)
):
    c = db.query(Candidate).filter(
        Candidate.id == candidate_id
    ).first()
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
def delete_candidate(
    candidate_id: str, 
    db: ScopedSession = Depends(get_scoped_db),
    current_user: User = Depends(get_current_user)
):
    c = db.query(Candidate).filter(
        Candidate.id == candidate_id
    ).first()
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

    # Registrar log de auditoria
    log = AuditLog(
        user_id=current_user.id,
        action="delete",
        entity_name="Candidate",
        entity_id=c.id
    )
    db.add(log)

    # Remove o candidato do banco
    db.delete(c)
    db.commit()
    return


@router.post("/candidates/{candidate_id}/flag")
def flag_candidate(
    candidate_id: str,
    req: FlagRequest,
    db: ScopedSession = Depends(get_scoped_db),
    current_user: User = Depends(get_current_user)
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

    log = AuditLog(
        user_id=current_user.id,
        action="flag",
        entity_name="Candidate",
        entity_id=c.id
    )
    db.add(log)

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
    db: ScopedSession = Depends(get_scoped_db),
    current_user: User = Depends(get_current_user)
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

    log = AuditLog(
        user_id=current_user.id,
        action="unflag",
        entity_name="Candidate",
        entity_id=c.id
    )
    db.add(log)

    db.commit()
    db.refresh(c)

    return {
        "status": "success",
        "id": str(c.id),
        "is_flagged": c.is_flagged
    }


# ===========================================================================
# Ingestão em Lote e Background Tasks (Fase 1B)
# ===========================================================================

BATCH_SEMAPHORE = asyncio.Semaphore(2)


def update_batch_job_progress(batch_id: str, filename: str, error_msg: Optional[str] = None):
    """
    Atualiza com segurança o progresso de um BatchJob.
    Trabalha com uma nova sessão do banco para evitar conflitos no escopo do request.
    """
    db = SessionLocal()
    try:
        batch_job = db.query(BatchJob).filter(BatchJob.id == batch_id).first()
        if not batch_job:
            return
        
        batch_job.processed += 1
        
        if error_msg:
            current_errors = []
            if batch_job.errors:
                try:
                    current_errors = json.loads(batch_job.errors)
                except Exception:
                    current_errors = [batch_job.errors]
            current_errors.append({"filename": filename, "error": error_msg})
            batch_job.errors = json.dumps(current_errors)
            
        if batch_job.processed >= batch_job.total:
            batch_job.status = "completed"
            
        db.commit()
    except Exception as e:
        print(f"[BatchJob] Erro ao atualizar progresso do lote {batch_id}: {e}")
    finally:
        db.close()


def run_extraction_and_save(file_path: Path, filename: str, batch_id: str, tenant_id: str) -> bool:
    """
    Executa a extração síncrona de um PDF e persiste no banco de dados.
    Verifica duplicatas por hash de arquivo e conflitos de nome.
    """
    from ingest import extract_candidate_from_pdf, save_candidate_to_db
    
    db = SessionLocal()
    try:
        # 1. Garante que o lote ainda existe
        batch_job = db.query(BatchJob).filter(BatchJob.id == batch_id).first()
        if not batch_job:
            return False

        error_msg = None
        
        try:
            # 2. Extrai dados estruturados
            extraction = extract_candidate_from_pdf(file_path)
            data = extraction["data"]
            pdf_hash = extraction.get("pdf_hash")

            # 3. Verifica duplicata exata de arquivo (hash SHA-256)
            if pdf_hash:
                identical = db.query(Candidate).filter(
                    Candidate.pdf_hash == pdf_hash,
                    Candidate.is_active == True,
                    Candidate.deleted_at == None,
                    Candidate.tenant_id == tenant_id
                ).first()
                if identical:
                    error_msg = "Arquivo duplicado (currículo idêntico já cadastrado)"

            # 4. Verifica conflito de nome do candidato
            if not error_msg:
                existing = db.query(Candidate).filter(
                    Candidate.full_name == data.full_name,
                    Candidate.is_active == True,
                    Candidate.deleted_at == None,
                    Candidate.tenant_id == tenant_id
                ).first()
                if existing:
                    error_msg = f"Candidato '{data.full_name}' já cadastrado (conflito de nome)"

            # 5. Salva no banco de dados se não houver conflitos
            if not error_msg:
                save_candidate_to_db(db, extraction, tenant_id=tenant_id)
                update_batch_job_progress(batch_id, filename)
                return True
            else:
                update_batch_job_progress(batch_id, filename, error_msg=error_msg)
                return False

        except Exception as e:
            update_batch_job_progress(batch_id, filename, error_msg=f"Erro de processamento: {str(e)}")
            return False

    finally:
        db.close()


async def process_single_file(file_path: Path, filename: str, batch_id: str, tenant_id: str):
    """
    Envolve a execução da extração síncrona dentro do semáforo global
    e executa em thread pool para evitar o bloqueio do event loop.
    """
    async with BATCH_SEMAPHORE:
        loop = asyncio.get_running_loop()
        # Executa em pool de threads padrão (executor None)
        return await loop.run_in_executor(None, run_extraction_and_save, file_path, filename, batch_id, tenant_id)


async def process_batch_uploads_task(batch_id: str, file_info: List[dict], tenant_id: str):
    """
    Task de Background que consome arquivos do lote de forma sequencial,
    garantindo que não haja race conditions de gravação para o mesmo lote,
    enquanto respeita o semáforo de concorrência global.
    """
    db = SessionLocal()
    try:
        batch_job = db.query(BatchJob).filter(BatchJob.id == batch_id).first()
        if not batch_job:
            return
        batch_job.status = "processing"
        db.commit()
    except Exception as e:
        print(f"[BatchJob] Erro ao iniciar processamento do lote {batch_id}: {e}")
    finally:
        db.close()

    for info in file_info:
        temp_path = Path(info["temp_path"])
        filename = info["filename"]
        try:
            await process_single_file(temp_path, filename, batch_id, tenant_id)
        except Exception as e:
            update_batch_job_progress(batch_id, filename, error_msg=f"Erro inesperado: {str(e)}")
        finally:
            # Garante limpeza do arquivo temporário
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except Exception as ex:
                    print(f"[BatchJob] Erro ao remover arquivo temporário {temp_path}: {ex}")


@router.post("/batches/upload", status_code=202)
async def upload_batch_resumes(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    db: ScopedSession = Depends(get_scoped_db)
):
    """
    Inicia o upload de múltiplos currículos em lote.
    Valida formatos, salva arquivos temporariamente, cria um BatchJob
    e agenda o processamento assíncrono em background.
    """
    # 1. Validação prévia de formato
    for file in files:
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail=f"Apenas arquivos PDF são aceitos. O arquivo '{file.filename}' é inválido."
            )

    # 2. Cria registro do lote no banco
    batch_job = BatchJob(
        status="pending", 
        total=len(files), 
        processed=0, 
        errors=None
        # tenant_id injetado auto via ScopedSession.add
    )
    db.add(batch_job)
    db.commit()
    db.refresh(batch_job)

    # 3. Copia arquivos para diretório temporário para processamento diferido
    file_info = []
    for file in files:
        contents = await file.read()
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        file_info.append({"temp_path": tmp_path, "filename": file.filename})

    # 4. Inicia processador em background
    background_tasks.add_task(process_batch_uploads_task, str(batch_job.id), file_info, str(db.tenant_id))

    return {
        "batch_id": str(batch_job.id),
        "total": len(files),
        "status": batch_job.status
    }


@router.get("/batches/{batch_id}")
def get_batch_job_status(
    batch_id: str, 
    db: ScopedSession = Depends(get_scoped_db)
):
    """
    Consulta o estado de processamento de um lote de upload.
    Retorna percentual de progresso e detalhamento de erros de parsing/duplicidade.
    """
    batch_job = db.query(BatchJob).filter(
        BatchJob.id == batch_id
    ).first()
    if not batch_job:
        raise HTTPException(status_code=404, detail="Lote de processamento não encontrado")

    errors_list = []
    if batch_job.errors:
        try:
            errors_list = json.loads(batch_job.errors)
        except Exception:
            errors_list = [{"error": batch_job.errors}]

    return {
        "id": str(batch_job.id),
        "status": batch_job.status,
        "total": batch_job.total,
        "processed": batch_job.processed,
        "errors": errors_list,
        "created_at": batch_job.created_at.isoformat() if batch_job.created_at else None
    }

