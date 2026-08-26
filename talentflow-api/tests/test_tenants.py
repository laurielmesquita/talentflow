from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import MagicMock
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.api.tenants import cancel_closure, request_closure
from app.models.domain import Tenant
from app.schemas.tenant import TenantClosureRequest


def _db_for(tenant):
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = tenant
    return db


def _owner_and_tenant():
    owner = SimpleNamespace(
        id=uuid4(),
        tenant_id=uuid4(),
        hashed_password="hashed-password",
    )
    tenant = Tenant(owner_user_id=owner.id, closure_status="active")
    tenant.id = owner.tenant_id
    return owner, tenant


def test_owner_can_schedule_closure_with_password_and_confirmation(monkeypatch):
    owner, tenant = _owner_and_tenant()
    db = _db_for(tenant)
    monkeypatch.setattr("app.api.tenants.verify_password", lambda password, hashed: password == "correct")

    result = request_closure(
        TenantClosureRequest(current_password="correct", confirmation="ENCERRAR ORGANIZAÇÃO"),
        db=db,
        current_user=owner,
    )

    assert result.status == "pending"
    assert result.scheduled_for - result.requested_at == timedelta(days=30)
    assert tenant.closure_status == "pending"
    db.commit.assert_called_once()


def test_closure_requires_owner():
    owner, tenant = _owner_and_tenant()
    other_user = SimpleNamespace(id=uuid4(), tenant_id=owner.tenant_id, hashed_password="hashed-password")

    with pytest.raises(HTTPException) as error:
        request_closure(
            TenantClosureRequest(current_password="correct", confirmation="ENCERRAR ORGANIZAÇÃO"),
            db=_db_for(tenant),
            current_user=other_user,
        )

    assert error.value.status_code == 403


def test_closure_rejects_wrong_password(monkeypatch):
    owner, tenant = _owner_and_tenant()
    db = _db_for(tenant)
    monkeypatch.setattr("app.api.tenants.verify_password", lambda password, hashed: False)

    with pytest.raises(HTTPException) as error:
        request_closure(
            TenantClosureRequest(current_password="wrong", confirmation="ENCERRAR ORGANIZAÇÃO"),
            db=db,
            current_user=owner,
        )

    assert error.value.status_code == 400
    db.commit.assert_not_called()


def test_owner_can_cancel_pending_closure():
    owner, tenant = _owner_and_tenant()
    tenant.closure_status = "pending"
    tenant.closure_requested_at = "requested"
    tenant.closure_scheduled_for = "scheduled"
    db = _db_for(tenant)

    result = cancel_closure(db=db, current_user=owner)

    assert result.status == "active"
    assert tenant.closure_requested_at is None
    assert tenant.closure_scheduled_for is None
    db.commit.assert_called_once()


def test_closure_cannot_be_scheduled_twice(monkeypatch):
    owner, tenant = _owner_and_tenant()
    tenant.closure_status = "pending"
    db = _db_for(tenant)
    monkeypatch.setattr("app.api.tenants.verify_password", lambda password, hashed: True)

    with pytest.raises(HTTPException) as error:
        request_closure(
            TenantClosureRequest(current_password="correct", confirmation="ENCERRAR ORGANIZAÇÃO"),
            db=db,
            current_user=owner,
        )

    assert error.value.status_code == 409
    db.commit.assert_not_called()
