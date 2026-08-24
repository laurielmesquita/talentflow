from types import SimpleNamespace
from unittest.mock import MagicMock
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.api.candidates import get_candidate
from app.api.dashboard import get_dashboard_stats
from app.api.jobs import get_job, list_jobs
from app.models.domain import Candidate, Category, JobPosition


def _tenant_expression_seen(query_mock, model) -> bool:
    return any(
        model.__tablename__ in str(expression)
        and "tenant_id" in str(expression)
        for call in query_mock.filter.call_args_list
        for expression in call.args
    )


def test_candidate_from_another_tenant_is_not_found():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    with pytest.raises(HTTPException) as error:
        get_candidate(str(uuid4()), db=db, current_user=MagicMock())

    assert error.value.status_code == 404


def test_job_from_another_tenant_is_not_found():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    with pytest.raises(HTTPException) as error:
        get_job(str(uuid4()), db=db)

    assert error.value.status_code == 404


def test_job_listing_uses_the_scoped_query():
    db = MagicMock()
    job = SimpleNamespace(
        id=uuid4(),
        slug="analista-de-dados",
        title="Analista de Dados",
        description="Descrição",
        location=None,
        employment_type=None,
        work_model=None,
        responsibilities=None,
        requirements=None,
        benefits=None,
        application_email=None,
        application_subject=None,
        deadline=None,
        required_skills=None,
        is_active=True,
        created_at=None,
    )
    db.query.return_value.order_by.return_value.all.return_value = [job]

    result = list_jobs(db=db)

    db.query.assert_called_once_with(JobPosition)
    assert result[0].id == str(job.id)
    assert result[0].title == job.title


def test_dashboard_applies_tenant_filter_to_all_aggregate_queries():
    tenant_id = uuid4()
    db = MagicMock()
    db.tenant_id = tenant_id

    candidate_query = MagicMock()
    candidate_query.filter.return_value.first.return_value = SimpleNamespace(
        total=2, added_today=1, avg_quality=85.0, flagged_count=0, uncategorized=1
    )
    job_query = MagicMock()
    job_query.filter.return_value.first.return_value = SimpleNamespace(
        total=1, active=1, upcoming=0
    )
    category_count_query = MagicMock()
    category_count_query.filter.return_value.count.return_value = 0
    top_category_query = MagicMock()
    top_category_query.join.return_value.join.return_value.filter.return_value.group_by.return_value.order_by.return_value.first.return_value = None
    db.db.query.side_effect = [
        candidate_query,
        job_query,
        category_count_query,
        top_category_query,
    ]
    db.query.return_value.filter.return_value.order_by.return_value.limit.return_value.all.return_value = []

    result = get_dashboard_stats(db=db)

    assert result["candidates"]["total"] == 2
    assert _tenant_expression_seen(candidate_query, Candidate)
    assert _tenant_expression_seen(job_query, JobPosition)
    assert _tenant_expression_seen(category_count_query, Category)
    assert any(
        "tenant_id" in str(expression)
        for call in top_category_query.join.return_value.join.return_value.filter.call_args_list
        for expression in call.args
    )
