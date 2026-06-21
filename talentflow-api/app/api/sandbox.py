import tempfile
import asyncio
from pathlib import Path
from datetime import date
from collections import defaultdict
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional

from app.core.config import settings
from ingest import extract_candidate_from_pdf

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

router = APIRouter()

daily_budget = settings.SANDBOX_DAILY_BUDGET
budget_state = {
    "date": date.today(),
    "count": 0
}

class SandboxExperience(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    description: Optional[str] = None
    is_current: Optional[bool] = False
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class SandboxResponse(BaseModel):
    full_name: str
    skills: List[str]
    experiences: List[SandboxExperience]
    quality_score: int
    quality_alerts: List[str]

@router.post("/extract", response_model=SandboxResponse)
@limiter.limit(f"{settings.SANDBOX_RATE_LIMIT_PER_MINUTE}/minute")
async def extract_resume_sandbox(request: Request, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF são permitidos na Sandbox.")

    today = date.today()
    if budget_state["date"] != today:
        budget_state["date"] = today
        budget_state["count"] = 0

    if budget_state["count"] >= daily_budget:
        raise HTTPException(
            status_code=503, 
            detail="O orçamento diário de processamento da Sandbox foi esgotado. Tente novamente amanhã."
        )

    budget_state["count"] += 1

    tmp_path = ""
    try:
        suffix = Path(file.filename).suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        def sync_extract():
            return extract_candidate_from_pdf(Path(tmp_path))

        extraction = await asyncio.to_thread(sync_extract)
        data = extraction["data"]

        experiences = data.experiences[:2]

        return SandboxResponse(
            full_name=data.full_name,
            skills=data.skills,
            experiences=[SandboxExperience(**exp.model_dump()) for exp in experiences],
            quality_score=int(extraction["quality_score"]),
            quality_alerts=extraction["quality_alerts"] or []
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if tmp_path and Path(tmp_path).exists():
            Path(tmp_path).unlink(missing_ok=True)
