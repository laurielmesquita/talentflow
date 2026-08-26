from types import SimpleNamespace
from unittest.mock import MagicMock
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.api.users import _protect_owner, create_user, deactivate_user, update_user
from app.models.domain import User
from app.schemas.user import UserCreateRequest, UserUpdateRequest


def _query_for(*results):
    db = MagicMock()
    queries = []
    for result in results:
        query = MagicMock()
        query.filter.return_value.first.return_value = result
        query.filter.return_value.count.return_value = result
        queries.append(query)
    db.query.side_effect = queries
    return db


def test_create_user_hashes_password_and_creates_recruiter(monkeypatch):
    db = _query_for(None)
    db.query.return_value.filter.return_value.first.return_value = None
    created = []
    db.add.side_effect = created.append
    monkeypatch.setattr("app.api.users.hash_password", lambda password: f"hashed:{password}")

    result = create_user(
        UserCreateRequest(full_name="Ana Silva", email="ana@example.com", password="password-123"),
        db=db,
        _current_user=SimpleNamespace(role="Manager"),
    )

    assert result in created
    assert result.role == "Recruiter"
    assert result.hashed_password == "hashed:password-123"
    assert result.tenant_id is None
    db.commit.assert_called_once()


def test_manager_cannot_grant_super_admin_role():
    db = MagicMock()

    with pytest.raises(HTTPException) as error:
        create_user(
            UserCreateRequest(full_name="Ana Silva", email="ana@example.com", password="password-123", role="SuperAdmin"),
            db=db,
            _current_user=SimpleNamespace(role="Manager"),
        )

    assert error.value.status_code == 403
    db.query.assert_not_called()


def test_owner_cannot_be_deactivated_before_transfer():
    owner = SimpleNamespace(owned_tenant=object())

    with pytest.raises(HTTPException) as error:
        _protect_owner(owner, next_active=False)

    assert error.value.status_code == 409


def test_deactivate_user_cannot_remove_last_active_manager():
    target = User(role="Manager", is_active=True)
    target.id = uuid4()
    db = _query_for(target, 1)

    with pytest.raises(HTTPException) as error:
        deactivate_user(target.id, db=db, current_user=SimpleNamespace(id=uuid4()))

    assert error.value.status_code == 409
    assert target.is_active is True
    db.commit.assert_not_called()


def test_update_user_cannot_disable_own_access():
    current = User(role="Manager", is_active=True)
    current.id = uuid4()
    db = _query_for(current)

    with pytest.raises(HTTPException) as error:
        update_user(
            current.id,
            UserUpdateRequest(is_active=False),
            db=db,
            current_user=current,
        )

    assert error.value.status_code == 400
    db.commit.assert_not_called()


def test_update_user_rejects_duplicate_email():
    target = User(role="Recruiter", is_active=True, email="old@example.com")
    target.id = uuid4()
    other = User(role="Recruiter", is_active=True, email="new@example.com")
    db = _query_for(target, other)

    with pytest.raises(HTTPException) as error:
        update_user(
            target.id,
            UserUpdateRequest(email="new@example.com"),
            db=db,
            current_user=SimpleNamespace(id=uuid4()),
        )

    assert error.value.status_code == 409
    db.commit.assert_not_called()
