"""
TalentFlow — Ingestor de Curriculos via Groq + Gemini OCR + pdfplumber + Cloudinary.

Fluxo:
  1. Extrai texto do PDF com pdfplumber.
  2. Se não houver texto selecionável suficiente (ex: PDF escaneado), ativamos o OCR via Gemini.
  3. Extrai a primeira imagem do PDF com PyMuPDF (foto do candidato, ignorando páginas escaneadas inteiras).
  4. Faz upload da foto e do PDF para o Cloudinary.
  5. Envia o texto ao Groq (Llama 3.3 70B) ou as páginas ao Gemini (gemini-2.5-flash) para extração de JSON estruturado.
  6. Valida e persiste no PostgreSQL.
"""

import json
import os
import tempfile
import hashlib
from pathlib import Path
from typing import Optional

import cloudinary
import cloudinary.uploader
import fitz  # PyMuPDF
import pdfplumber
from groq import Groq
from google import genai
from google.genai import types
from pydantic import BaseModel, ValidationError
from sqlalchemy.orm import Session


# ---------------------------------------------------------------------------
# Utilitário de Integridade de Arquivos
# ---------------------------------------------------------------------------

def calculate_file_hash(path: Path) -> str:
    """Calcula o hash SHA-256 do arquivo original para checar integridade e duplicatas exatas."""
    hasher = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


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
    company_name: Optional[str] = None
    job_title: Optional[str] = None
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
    Ignora imagens grandes que cobrem quase a página inteira (páginas escaneadas).
    """
    try:
        doc = fitz.open(path)
        for page in doc:
            image_list = page.get_images(full=True)
            for img_index, img in enumerate(image_list):
                xref = img[0]
                
                # Se a imagem cobrir a maior parte da página, é provavelmente a página escaneada em si e não uma foto
                rects = page.get_image_rects(xref)
                if rects:
                    img_rect = rects[0]
                    page_area = page.rect.width * page.rect.height
                    img_area = img_rect.width * img_rect.height
                    if img_area / page_area > 0.7:
                        # Pula pois é imagem da página inteira (PDF escaneado)
                        continue

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


def process_ocr_via_gemini(path: Path, gemini_api_key: str) -> CandidateExtraction:
    """
    Renderiza as páginas do PDF como imagens e envia para a API do Gemini
    (gemini-2.5-flash) para fazer OCR e extração estruturada de dados.
    """
    print(f"[ingest] Convertendo páginas de {path.name} em imagens para OCR via Gemini...")
    doc = fitz.open(path)
    contents = []

    for i, page in enumerate(doc):
        # Renderiza a página com DPI de 150 para otimização de banda/qualidade
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("png")
        
        contents.append(
            types.Part.from_bytes(
                data=img_bytes,
                mime_type="image/png"
            )
        )
        print(f"[ingest] Página {i + 1} renderizada ({len(img_bytes)} bytes).")

    # Prompt customizado para o modelo multimodal
    prompt_multimodal = (
        "Você é um extrator de dados de currículos em português.\n"
        "A partir das imagens das páginas do currículo fornecidas, realize o OCR do texto e retorne SOMENTE um JSON válido.\n"
        "Não inclua markdown, não inclua explicações, não inclua texto antes ou depois do JSON.\n\n"
        "O JSON deve ter exatamente estes campos:\n"
        "- full_name: string com o nome completo do candidato\n"
        "- email: string ou null\n"
        "- phone: string ou null\n"
        "- birth_date: string no formato YYYY-MM-DD ou null\n"
        "- address: string com cidade e estado ou null\n"
        "- categories: array de strings com áreas de atuação (exemplos: 'Atendimento', 'Tecnologia', 'Vendas', 'Administracao', 'Saude', 'Educacao', 'Servicos Gerais', 'Estoque', 'Tecnico')\n"
        "- skills: array de strings com competências técnicas e comportamentais\n"
        "- experiences: array de objetos, cada um com: company_name (string), job_title (string), start_date (string YYYY-MM ou null), end_date (string YYYY-MM ou null), is_current (boolean), description (string ou null)\n\n"
        "Se um campo não for encontrado no texto, use null ou array vazio conforme o tipo.\n"
        "Retorne apenas o JSON, nada mais."
    )
    contents.append(prompt_multimodal)

    import time
    
    max_attempts = 4
    for attempt in range(1, max_attempts + 1):
        try:
            print(f"[ingest] Chamando API do Gemini (gemini-2.5-flash) - tentativa {attempt}...")
            client = genai.Client(api_key=gemini_api_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=CandidateExtraction,
                    temperature=0.1
                )
            )
            raw_json = response.text
            return CandidateExtraction.model_validate_json(raw_json)
        except Exception as e:
            if attempt == max_attempts:
                raise e
            print(f"[ingest] AVISO: erro na chamada do Gemini ({e}). Retrying em {attempt * 2}s...")
            time.sleep(attempt * 2)


# ---------------------------------------------------------------------------
# Funcao principal de processamento e extracao
# ---------------------------------------------------------------------------

def extract_candidate_from_pdf(path: Path) -> dict:
    """
    Processa o PDF: extrai texto, foto, envia para o Cloudinary, chama a IA (Groq/Gemini)
    e calcula o CV Quality Score. Retorna os dados extraídos sem persistir no banco.
    """
    groq_api_key = os.getenv("GROQ_API_KEY", "")
    gemini_api_key = os.getenv("GEMINI_API_KEY", "")
    try:
        from app.core.config import settings
        if not groq_api_key:
            groq_api_key = settings.GROQ_API_KEY
        if not gemini_api_key:
            gemini_api_key = settings.GEMINI_API_KEY
    except Exception:
        pass

    _configure_cloudinary()

    # 0. Calcula o hash SHA-256 de integridade do arquivo
    pdf_hash = calculate_file_hash(path)

    # 1. Extrai texto e decide se precisa de OCR
    text = extract_text(path)
    is_scanned = not text or len(text.strip()) < 50

    if is_scanned:
        if not gemini_api_key:
            raise ValueError(f"PDF '{path.name}' parece escaneado, mas GEMINI_API_KEY não está configurada. Pulando.")
    else:
        if not groq_api_key:
            raise ValueError(f"GROQ_API_KEY nao definida. Abortando {path.name}.")

    # 2. Extrai e faz upload da foto
    print(f"[ingest] Extraindo foto de {path.name}...")
    photo_url = extract_and_upload_photo(path)
    if photo_url:
        print(f"[ingest] Foto enviada para Cloudinary: {photo_url}")

    # 3. Faz upload do PDF original
    pdf_url = upload_pdf(path)
    if pdf_url:
        print(f"[ingest] PDF enviado para Cloudinary: {pdf_url}")

    # 4. Extrai os dados do candidato (OCR via Gemini ou Texto via Groq)
    if is_scanned:
        data = process_ocr_via_gemini(path, gemini_api_key)
    else:
        print(f"[ingest] Enviando texto ao Groq (Llama 3.3 70B)...")
        client_groq = Groq(api_key=groq_api_key)
        response = client_groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Texto do curriculo:\n\n{text[:8000]}"},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        raw_json = response.choices[0].message.content
        data = CandidateExtraction.model_validate_json(raw_json)

    # 4.5. Calcula o CV Quality Score e emite alertas estruturados
    from app.services.quality_score import calculate_quality_score
    quality_score, quality_alerts = calculate_quality_score(data)

    if quality_alerts:
        print(f"[ingest] ⚠️  {len(quality_alerts)} alerta(s) de qualidade para '{data.full_name}':")
        for alert in quality_alerts:
            print(f"[ingest]    {alert}")
    else:
        print(f"[ingest] ✅ Currículo de '{data.full_name}' sem alertas de qualidade (score: {quality_score}/100).")

    return {
        "data": data,
        "photo_url": photo_url,
        "pdf_url": pdf_url,
        "pdf_hash": pdf_hash,
        "quality_score": quality_score,
        "quality_alerts": quality_alerts
    }


def save_candidate_to_db(db: Session, extraction: dict, parent_id = None, version: int = 1, tenant_id: str = None):
    """
    Persiste as informações extraídas no banco de dados, configurando a versão e o parent_id se necessário.
    """
    from app.models.domain import Candidate, Category, Skill, Experience

    data = extraction["data"]
    photo_url = extraction["photo_url"]
    pdf_url = extraction["pdf_url"]
    pdf_hash = extraction.get("pdf_hash")
    quality_score = extraction["quality_score"]
    quality_alerts = extraction["quality_alerts"]

    candidate = Candidate(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        address=data.address,
        photo_url=photo_url,
        original_pdf_url=pdf_url,
        pdf_hash=pdf_hash,
        quality_score=quality_score,
        quality_alerts=json.dumps(quality_alerts, ensure_ascii=False) if quality_alerts else None,
        version=version,
        parent_id=parent_id,
        is_active=True,
        tenant_id=tenant_id
    )

    if data.birth_date:
        try:
            from datetime import datetime
            candidate.birth_date = datetime.strptime(data.birth_date, "%Y-%m-%d").date()
        except Exception:
            pass

    db.add(candidate)

    # Upsert de categorias
    for cat_name in data.categories:
        normalized = cat_name.strip().title()
        if not normalized:
            continue
        cat = db.query(Category).filter(Category.name == normalized, Category.tenant_id == tenant_id).first()
        if not cat:
            cat = Category(name=normalized, tenant_id=tenant_id)
            db.add(cat)
        if cat not in candidate.categories:
            candidate.categories.append(cat)

    for skill_name in data.skills:
        normalized = skill_name.strip().title()
        if not normalized:
            continue
        sk = db.query(Skill).filter(Skill.name == normalized, Skill.tenant_id == tenant_id).first()
        if not sk:
            sk = Skill(name=normalized, tenant_id=tenant_id)
            db.add(sk)
        if sk not in candidate.skills:
            candidate.skills.append(sk)

    # Persiste experiencias
    for exp in data.experiences:
        db.add(Experience(
            candidate=candidate,
            company_name=exp.company_name.strip() if exp.company_name else "Não informado",
            job_title=exp.job_title.strip() if exp.job_title else "Não informado",
            description=exp.description,
            is_current=exp.is_current,
        ))

    db.commit()
    db.refresh(candidate)
    return candidate


def process_single_pdf(path: Path, db: Session) -> Optional["Candidate"]:
    """
    Processa um unico PDF: extrai texto/foto, faz upload para Cloudinary,
    e persiste no PostgreSQL (se nao for duplicado).
    """
    from app.models.domain import Candidate
    print(f"[ingest] Iniciando processamento: {path.name}")
    try:
        extraction = extract_candidate_from_pdf(path)
        data = extraction["data"]

        # Verifica duplicata por nome
        existing = db.query(Candidate).filter(
            Candidate.full_name == data.full_name,
            Candidate.is_active == True,
            Candidate.deleted_at == None
        ).first()

        if existing:
            print(f"[ingest] SKIP: '{data.full_name}' ja existe no banco.")
            return None

        # Here we don't have a specific tenant_id as it is CLI.
        # It's better to fetch the default tenant_id if available.
        # But for CLI, we might need a default tenant.
        from app.models.domain import Tenant
        default_tenant = db.query(Tenant).first()
        tenant_id = str(default_tenant.id) if default_tenant else None

        candidate = save_candidate_to_db(db, extraction, tenant_id=tenant_id)
        print(f"[ingest] ✅ '{data.full_name}' salvo — {len(data.skills)} skill(s), {len(data.experiences)} experiência(s), quality_score={extraction['quality_score']}/100.")
        return candidate

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
