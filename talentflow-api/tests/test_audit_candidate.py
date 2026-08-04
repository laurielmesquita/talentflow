import uuid
import pytest
from unittest.mock import MagicMock
from app.api.candidates import get_candidate, list_candidates
from app.models.domain import Candidate, User, Tenant

def test_get_candidate_returns_original_pdf_url():
    """Testa se o detalhe do candidato retorna os campos pdf_url e original_pdf_url corretamente para a auditoria de CV."""
    db_mock = MagicMock()
    user_mock = MagicMock(spec=User)
    user_mock.id = str(uuid.uuid4())

    mock_candidate = MagicMock(spec=Candidate)
    mock_candidate.id = str(uuid.uuid4())
    mock_candidate.full_name = "Candidato Teste Auditoria"
    mock_candidate.original_pdf_url = "https://res.cloudinary.com/demo/raw/upload/v1/curriculo_teste.pdf"
    mock_candidate.photo_url = "https://res.cloudinary.com/demo/image/upload/v1/foto_teste.jpg"
    mock_candidate.categories = []
    mock_candidate.skills = []
    mock_candidate.experiences = []
    mock_candidate.created_at = None
    mock_candidate.quality_score = 85.5
    mock_candidate.quality_alerts = "[]"
    mock_candidate.version = 1
    mock_candidate.is_active = True
    mock_candidate.parent_id = None
    mock_candidate.is_flagged = False
    mock_candidate.flagged_reason = None
    mock_candidate.flagged_at = None

    db_mock.query.return_value.filter.return_value.first.return_value = mock_candidate
    
    response = get_candidate(mock_candidate.id, db=db_mock, current_user=user_mock)
    
    assert response["pdf_url"] == mock_candidate.original_pdf_url
    assert response["original_pdf_url"] == mock_candidate.original_pdf_url
    assert response["quality_score"] == 85.5
    assert response["full_name"] == "Candidato Teste Auditoria"

def test_list_candidates_includes_original_pdf_url():
    """Testa se a listagem de candidatos inclui original_pdf_url e pdf_url em cada item do payload."""
    db_mock = MagicMock()
    db_mock.tenant_id = str(uuid.uuid4())

    mock_candidate = MagicMock(spec=Candidate)
    mock_candidate.id = str(uuid.uuid4())
    mock_candidate.full_name = "Candidato da Tabela"
    mock_candidate.original_pdf_url = "https://res.cloudinary.com/demo/raw/upload/v1/curriculo_tabela.pdf"
    mock_candidate.photo_url = None
    mock_candidate.categories = []
    mock_candidate.skills = []
    mock_candidate.experiences = []
    mock_candidate.created_at = None
    mock_candidate.quality_score = 92.0
    mock_candidate.quality_alerts = "[]"
    mock_candidate.version = 1
    mock_candidate.is_active = True
    mock_candidate.is_flagged = False
    mock_candidate.flagged_reason = None
    mock_candidate.flagged_at = None

    # Configura os mocks das queries de listagem
    db_mock.query.return_value.filter.return_value.count.return_value = 1
    db_mock.query.return_value.options.return_value.filter.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = [mock_candidate]
    
    mock_stats = MagicMock()
    mock_stats.total = 1
    mock_stats.active = 1
    mock_stats.flagged = 0
    mock_stats.avg_quality = 92.0
    db_mock.db.query.return_value.filter.return_value.one.return_value = mock_stats

    response = list_candidates(page=1, limit=10, db=db_mock)

    assert len(response["candidates"]) == 1
    cand = response["candidates"][0]
    assert cand["pdf_url"] == "https://res.cloudinary.com/demo/raw/upload/v1/curriculo_tabela.pdf"
    assert cand["original_pdf_url"] == "https://res.cloudinary.com/demo/raw/upload/v1/curriculo_tabela.pdf"
    assert cand["quality_score"] == 92.0
