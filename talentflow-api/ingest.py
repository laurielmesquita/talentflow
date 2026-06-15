"""
TalentFlow — Ingestor de Currículos via Gemini (LLM structured output).

Fluxo:
  1. Extrai texto do PDF com pypdf.
  2. Envia ao Gemini com response_schema para obter JSON estrito.
  3. Valida com Pydantic antes de persistir no banco.
  4. Em caso de falha de validação ou erro do LLM, loga e descarta — sem dados parciais.

Nenhuma lógica de RegEx ou dados mockados neste arquivo.
"""

import os
from pathlib import Path
from typing import Optional

from google import genai
from google.genai import types
from pypdf import PdfReader
from pydantic import BaseModel, ValidationError
from sqlalchemy.orm import Session


# ---------------------------------------------------------------------------
# Schemas de extração
# ---------------------------------------------------------------------------

class ExperienceItem(BaseModel):
    company: str
    role: str
    start_date: str
    end_date: Optional[str] = None
    description: str


class EducationItem(BaseModel):
    institution: str
    degree: str
    year: Optional[str] = None


class CandidateExtraction(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: list[str]
    experiences: list[ExperienceItem]
    education: list[EducationItem]
    suggested_category: Optional[str] = None


# ---------------------------------------------------------------------------
# Prompt
# ---------------------------------------------------------------------------

EXTRACTION_PROMPT = """\
Você é um parser de currículos altamente especializado. \
Analise o texto abaixo e extraia todas as informações relevantes do candidato.

Retorne SOMENTE o JSON no schema fornecido — sem explicações, sem markdown, sem texto adicional.

Para o campo "suggested_category", escolha a categoria mais adequada dentre: \
Atendimento, Estoque, Técnico, Administração, Serviços Gerais, Vendas, TI, Outro. \
Se não conseguir identificar, deixe null.

Texto do currículo:
{text}
"""


# ---------------------------------------------------------------------------
# Funções públicas
# ---------------------------------------------------------------------------

def extract_text(path: Path) -> str:
    """Extrai texto de todas as páginas de um PDF."""
    reader = PdfReader(path)
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages).strip()


def process_single_pdf(path: Path, db: Session) -> None:
    """
    Processa um único PDF: extrai texto, chama Gemini, valida e persiste.
    Chamado diretamente pelo endpoint de upload via BackgroundTasks.
    Remove o arquivo temporário ao final, independentemente do resultado.
    """
    # Importação local para evitar dependência circular na startup da API
    from app.models.domain import Candidate, Skill, Experience, Category

    api_key = os.environ.get("GEMINI_API_KEY") or _get_key_from_settings()
    if not api_key:
        print(f"[ingest] ERRO: GEMINI_API_KEY não definida. Abortando {path.name}.")
        _cleanup(path)
        return

    client = genai.Client(api_key=api_key)
    print(f"[ingest] Processando: {path.name}")

    response = None  # mantido em escopo para log de erro
    try:
        text = extract_text(path)
        if not text:
            print(f"[ingest] AVISO: PDF sem texto extraível — {path.name}")
            return

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=EXTRACTION_PROMPT.format(text=text[:8000]),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=CandidateExtraction,
            ),
        )

        data = CandidateExtraction.model_validate_json(response.text)

        # Verifica duplicata por nome completo
        existing = db.query(Candidate).filter(Candidate.full_name == data.name).first()
        if existing:
            print(f"[ingest] SKIP: Candidato '{data.name}' já existe no banco.")
            return

        # Cria o candidato
        candidate = Candidate(
            full_name=data.name,
            email=data.email,
            phone=data.phone,
        )
        db.add(candidate)

        # Associa categoria sugerida pelo LLM
        if data.suggested_category:
            cat = db.query(Category).filter(Category.name == data.suggested_category).first()
            if cat:
                candidate.categories.append(cat)

        # Upsert de skills
        for skill_name in data.skills:
            normalized = skill_name.strip().title()
            if not normalized:
                continue
            sk = db.query(Skill).filter(Skill.name == normalized).first()
            if not sk:
                sk = Skill(name=normalized)
                db.add(sk)
            candidate.skills.append(sk)

        # Persiste experiências
        for exp in data.experiences:
            db.add(Experience(
                candidate=candidate,
                company_name=exp.company,
                job_title=exp.role,
                description=exp.description,
            ))

        db.commit()
        db.refresh(candidate)
        print(f"[ingest] OK: '{data.name}' salvo com {len(data.skills)} skill(s) e {len(data.experiences)} experiência(s).")

    except ValidationError as e:
        raw = response.text if response else "N/A"
        print(f"[ingest] ERRO de validação Pydantic em {path.name}:\n{e}")
        print(f"[ingest] Resposta bruta do Gemini: {raw[:500]}")
        db.rollback()
    except Exception as e:
        print(f"[ingest] ERRO inesperado em {path.name}: {type(e).__name__}: {e}")
        db.rollback()
    finally:
        _cleanup(path)


# ---------------------------------------------------------------------------
# Utilitários internos
# ---------------------------------------------------------------------------

def _get_key_from_settings() -> str:
    """Fallback: lê a chave via pydantic-settings se não estiver no environ."""
    try:
        from app.core.config import settings
        return settings.GEMINI_API_KEY
    except Exception:
        return ""


def _cleanup(path: Path) -> None:
    """Remove o arquivo temporário de forma segura."""
    try:
        path.unlink(missing_ok=True)
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Entrypoint CLI (uso via linha de comando)
# ---------------------------------------------------------------------------

def ingest_directory(directory: str) -> None:
    """Processa todos os PDFs de um diretório via CLI."""
    from app.core.database import SessionLocal

    db = SessionLocal()
    try:
        pdf_files = list(Path(directory).glob("*.pdf"))
        if not pdf_files:
            print(f"[ingest] Nenhum PDF encontrado em: {directory}")
            return
        print(f"[ingest] {len(pdf_files)} arquivo(s) encontrado(s). Iniciando...")
        for pdf in pdf_files:
            process_single_pdf(pdf, db)
    finally:
        db.close()


if __name__ == "__main__":
    import sys

    target_dir = sys.argv[1] if len(sys.argv) > 1 else "./curriculos"
    ingest_directory(target_dir)
