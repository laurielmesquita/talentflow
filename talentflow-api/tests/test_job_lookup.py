import uuid
import pytest
from unittest.mock import MagicMock
from app.services.job_lookup import resolve_job_id
from app.models.domain import JobPosition

def test_resolve_job_id_with_valid_uuid():
    """Testa a resolução de vaga quando um UUID válido é fornecido"""
    db_mock = MagicMock()
    mock_job = MagicMock(spec=JobPosition)
    mock_job.id = str(uuid.uuid4())
    db_mock.query.return_value.filter.return_value.first.return_value = mock_job

    resolved_job = resolve_job_id(db_mock, mock_job.id)
    
    assert resolved_job == mock_job
    assert resolved_job.id == mock_job.id

def test_resolve_job_id_with_slug_found():
    """Testa a resolução de vaga quando um slug é fornecido e encontrado no banco"""
    db_mock = MagicMock()
    mock_job = MagicMock(spec=JobPosition)
    mock_job.id = "found-uuid-1234"
    mock_job.slug = "analista-de-estoque"
    
    db_mock.query.return_value.filter.return_value.first.return_value = mock_job
    
    resolved_job = resolve_job_id(db_mock, "analista-de-estoque")
    
    assert resolved_job == mock_job
    assert resolved_job.id == "found-uuid-1234"

def test_resolve_job_id_with_slug_not_found():
    """Testa a resolução de vaga quando o slug não é encontrado no banco"""
    db_mock = MagicMock()
    db_mock.query.return_value.filter.return_value.first.return_value = None
    
    resolved_job = resolve_job_id(db_mock, "slug-inexistente")
    
    assert resolved_job is None
