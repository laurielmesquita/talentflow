"""
TalentFlow — Ingestor de Curriculos via Groq + pdfplumber + Cloudinary.

Fluxo:
  1. Extrai texto do PDF com pdfplumber (suporte a PDFs com texto selecionavel).
  2. Extrai a primeira imagem do PDF com PyMuPDF (foto do candidato).
  3. Faz upload da foto e do PDF para o Cloudinary.
  4. Envia o texto ao Groq (Llama 3.1 70B) solicitando JSON estruturado.
  5. Valida e persiste no PostgreSQL.
"""

import json
import os
import tempfile
from pathlib import Path
from typing import Optional

import cloudinary
import cloudinary.uploader
import fitz  # PyMuPDF
import pdfplumber
from groq import Groq
from pydantic import BaseModel, ValidationError
from sqlalchemy.orm import Session


# ---------------------------------------------------------------------------
# Configuracao do Cloudinary
# ---------------------------------------------------------------------------

def _configure_cloudinary():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", ""),
        api_key=os.getenv("CLOUDINARY_API_KEY", ""),
        api_secret=os.getenv("CLOUDINARY_API_SECRET", ""),
        secure=True,
    )


# ---------------------------------------------------------------------------
# Schemas de validacao Pydantic
# ---------------------------------------------------------------------------

class ExperienceItem(BaseModel):
    company_name: str
    job_title: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None


class CandidateExtraction(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    address: Optional[str] = None
    categories: list[str] = []
    skills: list[str] = []
    experiences: list[ExperienceItem] = []


# ---------------------------------------------------------------------------
# Prompt para o Groq
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """Voce e um extrator de dados de curriculos em portugues.
A partir do texto bruto do curriculo fornecido, retorne SOMENTE um JSON valido.
Nao inclua markdown, nao inclua explicacoes, nao inclua texto antes ou depois do JSON.

O JSON deve ter exatamente estes campos:
- full_name: string com o nome completo do candidato
- email: string ou null
- phone: string ou null
- birth_date: string no formato YYYY-MM-DD ou null
- address: string com cidade e estado ou null
- categories: array de strings com areas de atuacao (exemplos: "Atendimento", "Tecnologia", "Vendas", "Administracao", "Saude", "Educacao", "Servicos Gerais", "Estoque", "Tecnico")
- skills: array de strings com competencias tecnicas e comportamentais
- experiences: array de objetos, cada um com: company_name (string), job_title (string), start_date (string YYYY-MM ou null), end_date (string YYYY-MM ou null), is_current (boolean), description (string ou null)

Se um campo nao for encontrado no texto, use null ou array vazio conforme o tipo.
Retorne apenas o JSON, nada mais."""


# ---------------------------------------------------------------------------
# Funcoes de extracao
# ---------------------------------------------------------------------------

def extract_text(path: Path) -> str:
    """Extrai texto de todas as paginas do PDF com pdfplumber."""
    pages_text = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text)
    return "\n".join(pages_text).strip()


def extract_and_upload_photo(path: Path) -> Optional[str]:
    """
    Extrai a primeira imagem do PDF (geralmente a foto do candidato)
    e faz upload para o Cloudinary. Retorna a URL publica ou None.
    """
    try:
        doc = fitz.open(path)
        for page in doc:
            image_list = page.get_images(full=True)
            for img_index, img in enumerate(image_list):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]

                # Filtra imagens muito pequenas (icones, logos de fundo)
                if len(image_bytes) < 5000:
                    continue

                # Salva temporariamente e faz upload
                with tempfile.NamedTemporaryFile(suffix=f".{image_ext}", delete=False) as tmp:
                    tmp.write(image_bytes)
                    tmp_path = tmp.name

                result = cloudinary.uploader.upload(
                    tmp_path,
                    folder="talentflow/photos",
                    resource_type="image",
                )
                Path(tmp_path).unlink(missing_ok=True)
                return result.get("secure_url")
    except Exception as e:
        print(f"[ingest] AVISO: nao foi possivel extrair foto — {e}")
    return None


def upload_pdf(path: Path) -> Optional[str]:
    """Faz upload do PDF original para o Cloudinary. Retorna a URL publica."""
    try:
        result = cloudinary.uploader.upload(
            str(path),
            folder="talentflow/resumes",
            resource_type="raw",
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"[ingest] AVISO: nao foi possivel fazer upload do PDF — {e}")
    return None


# ---------------------------------------------------------------------------
# Funcao principal de processamento
# ---------------------------------------------------------------------------

def process_single_pdf(path: Path, db: Session) -> None:
    """
    Processa um unico PDF: extrai texto e foto, faz upload para Cloudinary,
    chama o Groq, valida com Pydantic e persiste no PostgreSQL.
    Chamado pelo endpoint de upload via BackgroundTasks.
    """
    from app.models.domain import Candidate, Skill, Experience, Category

    print(f"[ingest] Iniciando processamento: {path.name}")

    groq_api_key = os.getenv("GROQ_API_KEY", "")
    if not groq_api_key:
        try:
            from app.core.config import settings
            groq_api_key = settings.GROQ_API_KEY
        except Exception:
            pass

    if not groq_api_key:
        print(f"[ingest] ERRO: GROQ_API_KEY nao definida. Abortando {path.name}.")
        _cleanup(path)
        return

    _configure_cloudinary()

    try:
        # 1. Extrai texto
        text = extract_text(path)
        if not text:
            print(f"[ingest] AVISO: PDF sem texto extraivel (provavelmente escaneado) — {path.name}")
            _cleanup(path)
            return

        # 2. Extrai e faz upload da foto
        print(f"[ingest] Extraindo foto de {path.name}...")
        photo_url = extract_and_upload_photo(path)
        if photo_url:
            print(f"[ingest] Foto enviada para Cloudinary: {photo_url}")

        # 3. Faz upload do PDF original
        pdf_url = upload_pdf(path)
        if pdf_url:
            print(f"[ingest] PDF enviado para Cloudinary: {pdf_url}")

        # 4. Chama o Groq
        print(f"[ingest] Enviando texto ao Groq (Llama 3.1 70B)...")
        client = Groq(api_key=groq_api_key)
        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Texto do curriculo:\n\n{text[:8000]}"},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )

        raw_json = response.choices[0].message.content
        data = CandidateExtraction.model_validate_json(raw_json)

        # 5. Verifica duplicata por nome
        existing = db.query(Candidate).filter(Candidate.full_name == data.full_name).first()
        if existing:
            print(f"[ingest] SKIP: '{data.full_name}' ja existe no banco.")
            _cleanup(path)
            return

        # 6. Persiste candidato
        candidate = Candidate(
            full_name=data.full_name,
            email=data.email,
            phone=data.phone,
            address=data.address,
            photo_url=photo_url,
            original_pdf_url=pdf_url,
        )
        db.add(candidate)

        # 7. Upsert de categorias
        for cat_name in data.categories:
            normalized = cat_name.strip().title()
            if not normalized:
                continue
            cat = db.query(Category).filter(Category.name == normalized).first()
            if not cat:
                cat = Category(name=normalized)
                db.add(cat)
            if cat not in candidate.categories:
                candidate.categories.append(cat)

        # 8. Upsert de skills
        for skill_name in data.skills:
            normalized = skill_name.strip().title()
            if not normalized:
                continue
            sk = db.query(Skill).filter(Skill.name == normalized).first()
            if not sk:
                sk = Skill(name=normalized)
                db.add(sk)
            if sk not in candidate.skills:
                candidate.skills.append(sk)

        # 9. Persiste experiencias
        for exp in data.experiences:
            db.add(Experience(
                candidate=candidate,
                company_name=exp.company_name,
                job_title=exp.job_title,
                description=exp.description,
                is_current=exp.is_current,
            ))

        db.commit()
        db.refresh(candidate)
        print(f"[ingest] OK: '{data.full_name}' salvo com {len(data.skills)} skill(s) e {len(data.experiences)} experiencia(s).")

    except ValidationError as e:
        print(f"[ingest] ERRO de validacao Pydantic em {path.name}: {e}")
        db.rollback()
    except Exception as e:
        print(f"[ingest] ERRO inesperado em {path.name}: {type(e).__name__}: {e}")
        db.rollback()
    finally:
        _cleanup(path)


# ---------------------------------------------------------------------------
# Utilitarios internos
# ---------------------------------------------------------------------------

def _cleanup(path: Path) -> None:
    """Remove o arquivo temporario de forma segura."""
    try:
        path.unlink(missing_ok=True)
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Entrypoint CLI
# ---------------------------------------------------------------------------

def ingest_directory(directory: str) -> None:
    """Processa todos os PDFs de um diretorio via CLI."""
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
