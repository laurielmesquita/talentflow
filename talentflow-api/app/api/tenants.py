from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user, get_db
from app.models.domain import Tenant, User
from app.schemas.tenant import (
    TenantClosureRequest,
    TenantClosureResponse,
    TenantOwnerTransferRequest,
    TenantOwnerTransferResponse,
)
from app.services.auth import verify_password


router = APIRouter(prefix="/tenant", tags=["tenant"])


def _get_current_tenant(db, current_user: User) -> Tenant:
    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organização não encontrada.")
    return tenant


def _require_owner(tenant: Tenant, current_user: User):
    if tenant.owner_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Somente o proprietário pode gerenciar o encerramento da organização.",
        )


@router.post("/owner", response_model=TenantOwnerTransferResponse)
def transfer_owner(
    payload: TenantOwnerTransferRequest,
    db=Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tenant = _get_current_tenant(db, current_user)
    _require_owner(tenant, current_user)
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A senha atual informada está incorreta.")
    if payload.target_user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="O novo Owner precisa ser outro usuário.")

    target = db.query(User).filter(
        User.id == payload.target_user_id,
        User.tenant_id == tenant.id,
        User.is_active == True,
        User.role.in_(["Manager", "SuperAdmin"]),
    ).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selecione um gerente ou Super Admin ativo da organização.")

    tenant.owner_user_id = target.id
    db.commit()
    return TenantOwnerTransferResponse(owner_user_id=target.id, owner_name=target.full_name)


@router.get("/closure", response_model=TenantClosureResponse)
def get_closure_status(
    db=Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tenant = _get_current_tenant(db, current_user)
    return TenantClosureResponse(
        status=tenant.closure_status,
        is_owner=tenant.owner_user_id == current_user.id,
        requested_at=tenant.closure_requested_at,
        scheduled_for=tenant.closure_scheduled_for,
    )


@router.post("/closure", response_model=TenantClosureResponse)
def request_closure(
    payload: TenantClosureRequest,
    db=Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tenant = _get_current_tenant(db, current_user)
    _require_owner(tenant, current_user)

    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A senha atual informada está incorreta.")
    if tenant.closure_status == "pending":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Já existe um encerramento agendado para esta organização.")

    now = datetime.now(timezone.utc)
    tenant.closure_status = "pending"
    tenant.closure_requested_at = now
    tenant.closure_scheduled_for = now + timedelta(days=30)
    db.commit()
    db.refresh(tenant)
    return TenantClosureResponse(
        status=tenant.closure_status,
        is_owner=True,
        requested_at=tenant.closure_requested_at,
        scheduled_for=tenant.closure_scheduled_for,
    )


@router.delete("/closure", response_model=TenantClosureResponse)
def cancel_closure(
    db=Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tenant = _get_current_tenant(db, current_user)
    _require_owner(tenant, current_user)
    if tenant.closure_status != "pending":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Não há encerramento pendente para cancelar.")

    tenant.closure_status = "active"
    tenant.closure_requested_at = None
    tenant.closure_scheduled_for = None
    db.commit()
    db.refresh(tenant)
    return TenantClosureResponse(status=tenant.closure_status, is_owner=True)
