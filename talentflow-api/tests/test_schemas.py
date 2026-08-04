import pytest
from app.schemas.extraction import CandidateExtraction, ExperienceItem
from app.schemas.job import JobResponse, PublicJobResponse

def test_experience_item_validation():
    """Testa se o schema ExperienceItem valida dados de experiência corretamente"""
    exp = ExperienceItem(
        company_name="Space Square",
        job_title="Desenvolvedor Senior",
        description="Arquitetura FastAPI e Next.js",
        is_current=True,
        start_date="2024-01-01",
        end_date=None
    )
    assert exp.company_name == "Space Square"
    assert exp.is_current is True

def test_candidate_extraction_validation():
    """Testa a estruturação canônica de extração de candidatos"""
    extraction = CandidateExtraction(
        full_name="Lauriel Mesquita",
        email="lauriel@spacesquare.com",
        phone="+5511999999999",
        skills=["Python", "FastAPI", "Next.js", "TypeScript"],
        experiences=[
            ExperienceItem(
                company_name="Space Square",
                job_title="Fundador & Diretor de Tecnologia",
                is_current=True
            )
        ]
    )
    assert extraction.full_name == "Lauriel Mesquita"
    assert len(extraction.skills) == 4
    assert len(extraction.experiences) == 1
    assert extraction.experiences[0].job_title == "Fundador & Diretor de Tecnologia"
