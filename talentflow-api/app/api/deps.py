from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.domain import User
from app.services.auth import decode_access_token
from typing import Generator, List

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get a SQLAlchemy database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to validate the JWT access token and return the authenticated user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas ou sessão expirada.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
        
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este usuário foi desativado pelo administrador."
        )
        
    return user


class RoleChecker:
    """
    Dependency class to restrict access based on user roles.
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não possui permissão para executar esta ação."
            )
        return current_user

from typing import Any

class ScopedSession:
    """
    Wrapper para Session do SQLAlchemy que injeta automaticamente o filtro de tenant_id nas consultas
    e preenche o tenant_id em novas instâncias.
    """
    def __init__(self, db: Session, tenant_id: Any):
        self.db = db
        self.tenant_id = tenant_id

    def query(self, *entities):
        q = self.db.query(*entities)
        for entity in entities:
            # Filtra automaticamente classes mapeadas que possuem tenant_id
            if isinstance(entity, type) and hasattr(entity, "tenant_id"):
                q = q.filter(entity.tenant_id == self.tenant_id)
        return q

    def add(self, instance):
        # Auto-popula o tenant_id se estiver ausente no momento da inserção
        if hasattr(instance, "tenant_id") and not getattr(instance, "tenant_id", None):
            instance.tenant_id = self.tenant_id
        return self.db.add(instance)

    def commit(self):
        return self.db.commit()

    def rollback(self):
        return self.db.rollback()

    def refresh(self, instance):
        return self.db.refresh(instance)

    def delete(self, instance):
        return self.db.delete(instance)

    def execute(self, *args, **kwargs):
        return self.db.execute(*args, **kwargs)


def get_scoped_db(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
) -> ScopedSession:
    """
    Dependência de banco de dados que retorna um ScopedSession atrelado ao tenant_id do usuário atual.
    """
    return ScopedSession(db, current_user.tenant_id)
