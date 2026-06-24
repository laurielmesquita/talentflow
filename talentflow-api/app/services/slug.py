import re
import unicodedata
from sqlalchemy.orm import Session
from app.models.domain import JobPosition

def slugify(text: str) -> str:
    """
    Gera um slug URL-friendly a partir de uma string de texto.
    Normaliza acentos, remove caracteres especiais e formata com hifens.
    """
    text = text.lower()
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text).strip('-')
    return text

def generate_slug(title: str, db: Session) -> str:
    """
    Gera um slug único global para uma vaga a partir do seu título.
    Caso o slug já exista no banco de dados, adiciona um sufixo numérico sequencial (-2, -3, etc.).
    """
    base_slug = slugify(title)
    if not base_slug:
        base_slug = "vaga"
    
    slug = base_slug
    counter = 1
    
    # Loop de verificação de unicidade no banco
    while db.query(JobPosition).filter(JobPosition.slug == slug).first() is not None:
        counter += 1
        slug = f"{base_slug}-{counter}"
        
    return slug
