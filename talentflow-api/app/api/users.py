from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import RoleChecker, ScopedSession, get_scoped_db
from app.models.domain import User
from app.schemas.user import UserCreateRequest, UserResponse, UserUpdateRequest
from app.services.auth import hash_password


router = APIRouter(prefix="/users", tags=["users"])
_manager_admin = RoleChecker(["Manager", "SuperAdmin"])


def _get_user_or_404(db: ScopedSession, user_id: UUID) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")
    return user


def _active_manager_count(db: ScopedSession) -> int:
    return db.query(User).filter(User.role == "Manager", User.is_active == True).count()


def _protect_super_admin_grant(requested_role: str | None, current_user: User):
    if requested_role == "SuperAdmin" and current_user.role != "SuperAdmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A função Super Admin só pode ser concedida por um Super Admin.",
        )


def _protect_last_manager(db: ScopedSession, user: User, *, next_role: str | None = None, next_active: bool | None = None):
    role = next_role if next_role is not None else user.role
    is_active = next_active if next_active is not None else user.is_active
    removes_manager = user.role == "Manager" and user.is_active and (role != "Manager" or not is_active)
    if removes_manager and _active_manager_count(db) <= 1:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A organização precisa manter pelo menos um gerente ativo.",
        )


def _protect_owner(user: User, *, next_role: str | None = None, next_active: bool | None = None):
    is_owner = getattr(user, "owned_tenant", None) is not None
    if is_owner and ((next_role is not None and next_role != "Manager") or next_active is False):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Transfira a propriedade da organização antes de alterar o acesso do proprietário.",
        )


@router.get("", response_model=list[UserResponse])
def list_users(
    db: ScopedSession = Depends(get_scoped_db),
    _current_user: User = Depends(_manager_admin),
):
    return db.query(User).order_by(User.created_at.asc()).all()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreateRequest,
    db: ScopedSession = Depends(get_scoped_db),
    _current_user: User = Depends(_manager_admin),
):
    _protect_super_admin_grant(payload.role, _current_user)
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Este e-mail já está cadastrado.")

    user = User(
        email=payload.email,
        phone=payload.phone.strip() if payload.phone else None,
        full_name=payload.full_name.strip(),
        hashed_password=hash_password(payload.password),
        role=payload.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    payload: UserUpdateRequest,
    db: ScopedSession = Depends(get_scoped_db),
    current_user: User = Depends(_manager_admin),
):
    user = _get_user_or_404(db, user_id)
    changes = payload.model_dump(exclude_unset=True)
    _protect_super_admin_grant(changes.get("role"), current_user)

    if user.id == current_user.id and (changes.get("role") is not None or changes.get("is_active") is False):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Você não pode remover seu próprio acesso administrativo.")

    if "email" in changes and changes["email"] != user.email:
        if db.query(User).filter(User.email == changes["email"], User.id != user.id).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Este e-mail já está cadastrado.")

    _protect_last_manager(
        db,
        user,
        next_role=changes.get("role"),
        next_active=changes.get("is_active"),
    )
    _protect_owner(user, next_role=changes.get("role"), next_active=changes.get("is_active"))

    if "full_name" in changes:
        user.full_name = changes["full_name"].strip()
    if "email" in changes:
        user.email = changes["email"]
    if "phone" in changes:
        user.phone = changes["phone"].strip() if changes["phone"] else None
    if "password" in changes and changes["password"] is not None:
        user.hashed_password = hash_password(changes["password"])
    if "role" in changes and changes["role"] is not None:
        user.role = changes["role"]
    if "is_active" in changes and changes["is_active"] is not None:
        user.is_active = changes["is_active"]

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_user(
    user_id: UUID,
    db: ScopedSession = Depends(get_scoped_db),
    current_user: User = Depends(_manager_admin),
):
    user = _get_user_or_404(db, user_id)
    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Você não pode remover seu próprio acesso.")
    _protect_owner(user, next_active=False)
    _protect_last_manager(db, user, next_active=False)
    user.is_active = False
    db.commit()
