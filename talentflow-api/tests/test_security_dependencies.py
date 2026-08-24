import uuid
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException
from starlette.requests import Request

from app.api.deps import RoleChecker, ScopedSession, get_current_user
from app.models.domain import Candidate, User


def _request(*, cookie_token: str | None = None, query_token: str | None = None) -> Request:
    headers = []
    if cookie_token:
        headers.append((b"cookie", f"token={cookie_token}".encode()))
    query_string = f"token={query_token}".encode() if query_token else b""
    return Request({"type": "http", "headers": headers, "query_string": query_string})


def test_role_checker_allows_configured_role():
    user = MagicMock(spec=User)
    user.role = "Manager"

    assert RoleChecker(["Manager"])(current_user=user) is user


def test_role_checker_rejects_role_outside_allowlist():
    user = MagicMock(spec=User)
    user.role = "Recruiter"

    with pytest.raises(HTTPException) as error:
        RoleChecker(["Manager"])(current_user=user)

    assert error.value.status_code == 403


def test_scoped_session_filters_queries_by_tenant():
    raw_db = MagicMock()
    query = MagicMock()
    query.column_descriptions = [{"entity": Candidate}]
    raw_db.query.return_value = query
    tenant_id = uuid.uuid4()

    ScopedSession(raw_db, tenant_id).query(Candidate)

    raw_db.query.assert_called_once_with(Candidate)
    query.filter.assert_called_once()
    expression = query.filter.call_args.args[0]
    assert expression.left.key == "tenant_id"
    assert expression.left.table.name == Candidate.__tablename__
    assert expression.right.value == tenant_id


def test_scoped_session_sets_tenant_on_new_entity():
    raw_db = MagicMock()
    tenant_id = uuid.uuid4()
    candidate = Candidate(full_name="Teste")

    ScopedSession(raw_db, tenant_id).add(candidate)

    assert candidate.tenant_id == tenant_id
    raw_db.add.assert_called_once_with(candidate)


def test_current_user_accepts_http_only_cookie(monkeypatch):
    user = MagicMock(spec=User)
    user.is_active = True
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = user
    monkeypatch.setattr("app.api.deps.decode_access_token", lambda token: {"sub": "user-1"})

    result = get_current_user(_request(cookie_token="cookie-token"), token=None, db=db)

    assert result is user
    db.query.return_value.filter.assert_called_once()


def test_current_user_rejects_missing_token():
    with pytest.raises(HTTPException) as error:
        get_current_user(_request(), token=None, db=MagicMock())

    assert error.value.status_code == 401
