"""
TalentFlow — Public Apply Router (Step 6)

Endpoints públicos para o fluxo de candidatura via portal externo.
Não exige autenticação JWT.

Fluxo:
  1. POST /api/public/apply/{job_slug}
     - Recebe form data + PDF
     - Valida vaga ativa
     - Inicia pipeline de IA em background (extração PDF, quality score)
     - Persiste JobApplication com status="pending"
     - Cria ou reutiliza Candidate no tenant da vaga
     - Envia OTP por e-mail para verificação de identidade
     - Retorna application_id e instrução de verificação

  2. POST /api/public/apply/verify-otp
     - Recebe application_id + otp_code
     - Valida OTP e TTL
     - Marca email_verified=True e status="reviewing"
     - Retorna confirmação final ao candidato
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from pathlib import Path
from typing import Optional
from datetime import datetime, timezone, timedelta
import tempfile
import random
import string
import json

from app.core.database import SessionLocal
from app.models.domain import JobPosition, Candidate, JobApplication
from app.api.deps import get_db
from app.services.email import send_email
from app.core.config import settings

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _generate_otp(length: int = 6) -> str:
    """Gera um código OTP numérico de 6 dígitos."""
    return "".join(random.choices(string.digits, k=length))


def _detect_divergences(form_data: dict, ai_data: dict) -> tuple[bool, dict]:
    """
    Compara os dados submetidos pelo candidato no formulário com os extraídos pelo Gemini do PDF.
    Retorna (has_divergence: bool, divergence_report: dict).
    """
    fields_to_compare = {
        "full_name": ("form_full_name", "full_name"),
        "email": ("form_email", "email"),
        "phone": ("form_phone", "phone"),
    }

    report = {}
    has_divergence = False

    for field_label, (form_key, ai_key) in fields_to_compare.items():
        form_val = (form_data.get(form_key) or "").strip().lower()
        ai_val = (ai_data.get(ai_key) or "").strip().lower()

        if form_val and ai_val and form_val != ai_val:
            has_divergence = True
            report[field_label] = {
                "form_value": form_data.get(form_key),
                "pdf_value": ai_data.get(ai_key),
                "severity": "high" if field_label in ("full_name",) else "medium",
            }

    return has_divergence, report


def _run_ai_pipeline_background(application_id: str, tmp_path: Path, tenant_id: str, form_data: dict):
    """
    Tarefa de background: extrai o PDF com Gemini, calcula quality score,
    detecta divergências e atualiza o JobApplication.
    Executada de forma assíncrona pelo FastAPI BackgroundTasks.
    """
    db: Session = SessionLocal()
    try:
        application = db.query(JobApplication).filter(JobApplication.id == application_id).first()
        if not application:
            return

        # Importa o pipeline de ingestão existente
        from ingest import extract_candidate_from_pdf, save_candidate_to_db

        extraction = extract_candidate_from_pdf(tmp_path)
        ai_data = extraction.get("data")
        pdf_hash = extraction.get("pdf_hash")
        pdf_url = extraction.get("pdf_url")
        quality_score = extraction.get("quality_score")
        quality_alerts = extraction.get("quality_alerts", [])

        # Converte dataclass → dict para persistência JSON
        if ai_data:
            ai_dict = {
                "full_name": ai_data.full_name,
                "email": ai_data.email,
                "phone": ai_data.phone,
                "address": ai_data.address,
                "categories": ai_data.categories,
                "skills": ai_data.skills,
                "experiences": [
                    {
                        "company_name": e.company_name,
                        "job_title": e.job_title,
                        "description": e.description,
                        "is_current": e.is_current,
                    }
                    for e in ai_data.experiences
                ],
            }
        else:
            ai_dict = {}

        # Detecta divergências entre o formulário e o PDF
        has_divergence, divergence_report = _detect_divergences(form_data, ai_dict)

        # Cria ou atualiza o Candidate no tenant da vaga
        # — verifica se já existe por e-mail dentro do tenant
        candidate = db.query(Candidate).filter(
            Candidate.tenant_id == tenant_id,
            Candidate.email == (form_data.get("form_email") or "").lower(),
            Candidate.deleted_at == None,
        ).first()

        if not candidate:
            candidate = save_candidate_to_db(db, extraction, tenant_id=tenant_id)
        
        # Vincula o candidato à candidatura e persiste dados do pipeline
        application.candidate_id = candidate.id
        application.ai_extracted_data = ai_dict
        application.quality_score = quality_score
        application.quality_alerts = quality_alerts
        application.has_divergence = has_divergence
        application.divergence_report = divergence_report if has_divergence else None
        application.original_pdf_url = pdf_url
        application.pdf_hash = pdf_hash
        application.processed_at = datetime.now(timezone.utc)
        application.status = "processing"

        db.commit()

    except Exception as e:
        print(f"[ERROR] AI pipeline falhou para application {application_id}: {e}")
        db: Session = SessionLocal()
        try:
            app_row = db.query(JobApplication).filter(JobApplication.id == application_id).first()
            if app_row:
                app_row.status = "error"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()
        try:
            from ingest import _cleanup
            _cleanup(tmp_path)
        except Exception:
            pass


# ---------------------------------------------------------------------------
# Endpoint 1: Submissão de candidatura
# ---------------------------------------------------------------------------

@router.post("/public/apply/{job_slug}", status_code=202)
async def apply_to_job(
    job_slug: str,
    background_tasks: BackgroundTasks,
    # Dados do formulário
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    address: Optional[str] = Form(None),
    linkedin: Optional[str] = Form(None),
    cover_letter: Optional[str] = Form(None),
    # PDF do currículo
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Recebe a candidatura pública para uma vaga.
    
    1. Valida a vaga (ativa + prazo).
    2. Persiste um JobApplication com status='pending'.
    3. Lança pipeline de IA em background (extração PDF → quality score → divergência).
    4. Envia OTP por e-mail para verificação de identidade.
    5. Retorna application_id para o frontend completar o fluxo de OTP.
    """
    # 1. Validar a vaga
    from datetime import date
    today = date.today()
    job = db.query(JobPosition).filter(
        JobPosition.slug == job_slug,
        JobPosition.is_active == True,
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Vaga não encontrada ou encerrada.")

    if job.deadline and job.deadline < today:
        raise HTTPException(status_code=410, detail="O prazo para inscrições nesta vaga foi encerrado.")

    # 2. Validar o PDF
    if not (resume.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF são aceitos.")

    # 3. Criar o placeholder da candidatura (status=pending)
    otp = _generate_otp()
    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    # Cria um candidato placeholder para associar à candidatura
    # (o pipeline de IA vai criar/vincular o candidato definitivo em background)
    placeholder_candidate = db.query(Candidate).filter(
        Candidate.tenant_id == job.tenant_id,
        Candidate.email == email.lower(),
        Candidate.deleted_at == None,
    ).first()

    if not placeholder_candidate:
        placeholder_candidate = Candidate(
            tenant_id=job.tenant_id,
            full_name=full_name,
            email=email.lower(),
            phone=phone,
            address=address,
        )
        db.add(placeholder_candidate)
        db.flush()  # garante ID sem commit

    application = JobApplication(
        tenant_id=job.tenant_id,
        job_position_id=job.id,
        candidate_id=placeholder_candidate.id,
        source="public_portal",
        status="pending",
        otp_code=otp,
        otp_expires_at=otp_expires_at,
        form_full_name=full_name,
        form_email=email.lower(),
        form_phone=phone,
        form_address=address,
        form_linkedin=linkedin,
        form_cover_letter=cover_letter,
        email_verified=False,
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    # 4. Salvar o PDF em disco temporário para o background task
    contents = await resume.read()
    tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    tmp.write(contents)
    tmp.flush()
    tmp_path = Path(tmp.name)
    tmp.close()

    form_snapshot = {
        "form_full_name": full_name,
        "form_email": email.lower(),
        "form_phone": phone,
        "form_address": address,
    }

    # 5. Lançar pipeline de IA em background
    background_tasks.add_task(
        _run_ai_pipeline_background,
        str(application.id),
        tmp_path,
        str(job.tenant_id),
        form_snapshot,
    )

    # 6. Enviar OTP por e-mail
    background_tasks.add_task(
        _send_otp_email,
        to_email=email,
        full_name=full_name,
        otp_code=otp,
        job_title=job.title,
    )

    return {
        "status": "pending_verification",
        "application_id": str(application.id),
        "message": "Candidatura recebida! Verifique seu e-mail para confirmar sua inscrição.",
    }


# ---------------------------------------------------------------------------
# Endpoint 2: Verificação de OTP
# ---------------------------------------------------------------------------

class OTPVerifyRequest(BaseModel):
    application_id: str
    otp_code: str


@router.post("/public/apply/verify-otp")
def verify_otp(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    """
    Valida o OTP enviado por e-mail ao candidato.
    Ao confirmar, a candidatura transita para status='reviewing'.
    """
    application = db.query(JobApplication).filter(
        JobApplication.id == payload.application_id,
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada.")

    if application.email_verified:
        return {"status": "already_verified", "message": "E-mail já confirmado anteriormente."}

    if application.otp_code != payload.otp_code:
        raise HTTPException(status_code=422, detail="Código OTP inválido.")

    if application.otp_expires_at and datetime.now(timezone.utc) > application.otp_expires_at:
        raise HTTPException(status_code=410, detail="Código OTP expirado. Solicite um novo.")

    # Confirma verificação
    application.email_verified = True
    application.verified_at = datetime.now(timezone.utc)
    application.status = "reviewing"
    application.otp_code = None  # limpa o código por segurança
    db.commit()

    return {
        "status": "verified",
        "message": "E-mail confirmado com sucesso! Sua candidatura está em análise.",
    }


# ---------------------------------------------------------------------------
# Endpoint 3: Status da candidatura (polling pelo frontend)
# ---------------------------------------------------------------------------

@router.get("/public/apply/status/{application_id}")
def get_application_status(application_id: str, db: Session = Depends(get_db)):
    """
    Retorna o status atual de uma candidatura.
    Usado pelo frontend para polling após submissão.
    """
    application = db.query(JobApplication).filter(
        JobApplication.id == application_id,
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada.")

    return {
        "application_id": str(application.id),
        "status": application.status,
        "email_verified": application.email_verified,
        "has_divergence": application.has_divergence,
        "quality_score": application.quality_score,
        "applied_at": application.applied_at.isoformat() if application.applied_at else None,
        "verified_at": application.verified_at.isoformat() if application.verified_at else None,
        "processed_at": application.processed_at.isoformat() if application.processed_at else None,
    }


# ---------------------------------------------------------------------------
# Helper: Envio de e-mail com OTP
# ---------------------------------------------------------------------------

def _send_otp_email(to_email: str, full_name: str, otp_code: str, job_title: str) -> bool:
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Confirme sua candidatura — TalentFlow</title>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 40px 20px; }}
            .card {{ max-width: 520px; margin: 0 auto; background: rgba(17,24,39,0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 40px; }}
            .logo {{ font-size: 22px; font-weight: 800; color: #7c3aed; margin-bottom: 28px; }}
            h2 {{ font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }}
            p {{ font-size: 15px; color: #9ca3af; line-height: 1.6; margin-bottom: 20px; }}
            .otp-box {{ background: rgba(124,58,237,0.12); border: 2px dashed rgba(124,58,237,0.4); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }}
            .otp {{ font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #a78bfa; font-family: monospace; }}
            .note {{ font-size: 13px; color: #6b7280; margin-top: 8px; }}
            .footer {{ font-size: 12px; color: #4b5563; text-align: center; margin-top: 32px; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="logo">✦ TalentFlow</div>
            <h2>Confirme sua candidatura</h2>
            <p>Olá, <strong style="color:#e5e7eb">{full_name}</strong>! Recebemos sua candidatura para a vaga <strong style="color:#e5e7eb">"{job_title}"</strong>.</p>
            <p>Para confirmar sua inscrição, utilize o código abaixo. Ele é válido por <strong>10 minutos</strong>.</p>
            <div class="otp-box">
                <div class="otp">{otp_code}</div>
                <div class="note">Código de verificação único</div>
            </div>
            <p>Se você não realizou essa inscrição, ignore este e-mail.</p>
            <div class="footer">TalentFlow &bull; Plataforma de Gestão de Talentos</div>
        </div>
    </body>
    </html>
    """
    return send_email(
        to_email=to_email,
        subject=f"🔐 Confirme sua candidatura: {job_title}",
        html_content=html,
    )
