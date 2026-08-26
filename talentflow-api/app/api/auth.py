import secrets
import hmac
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, RoleChecker
from app.api.sandbox import limiter
from app.models.domain import User, PasswordReset, Tenant
from app.schemas.auth import (
    LoginRequest, TokenResponse, 
    ForgotPasswordRequest, ResetPasswordRequest,
    ChangePasswordRequest, RegisterRequest
)
from app.services.auth import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.services.email import send_reset_password_email

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_token_cookie(response: Response, token: str):
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.SECRET_KEY is not None,  # Secure em produção (quando SECRET_KEY está definida)
        max_age=3600 * 4,  # 4 horas (mesmo do JWT)
        path="/",
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """
    Autentica o usuário e retorna o token JWT de acesso.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos."
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sua conta foi desativada pelo administrador."
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role, "email": user.email, "name": user.full_name}
    )
    _set_token_cookie(response, access_token)
    return TokenResponse(
        access_token=access_token,
        role=user.role,
        full_name=user.full_name,
        email=user.email
    )



@router.post("/forgot-password")
@limiter.limit("5/minute")
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Gera um token de redefinição de senha e envia por e-mail.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    
    # Prática de segurança: retornar sucesso mesmo se o e-mail não existir
    # para evitar varredura de usuários (User Enumeration).
    if not user:
        return {"message": "Se este e-mail estiver cadastrado, um link de recuperação será enviado."}

    # Desativa tokens anteriores
    db.query(PasswordReset).filter(
        PasswordReset.email == payload.email, 
        PasswordReset.is_used == False
    ).update({"is_used": True})

    # Criação do token seguro
    token = secrets.token_urlsafe(32)
    # TTL encurtado de 2h para 15min para reduzir a janela de risco caso o
    # token (enviado via URL no e-mail) vaze em logs/proxies/histórico do
    # navegador. O redesign de UX para colar OTP manual está fora desta rodada.
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    reset_record = PasswordReset(
        email=payload.email,
        token=token,
        expires_at=expires_at
    )
    
    db.add(reset_record)
    db.commit()

    # Envio do e-mail
    send_reset_password_email(to_email=payload.email, token=token)

    return {"message": "Se este e-mail estiver cadastrado, um link de recuperação será enviado."}


@router.post("/reset-password")
@limiter.limit("10/minute")
def reset_password(request: Request, payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Redefine a senha do usuário com base no token recebido por e-mail.
    """
    # Busca por token via unique index (O(log n), já protege contra timing
    # leakage de enumeração a nível de banco — o índice é unique indexado).
    # Mantemos hmac.compare_digest como blindagem adicional pós-fetch.
    reset_record = db.query(PasswordReset).filter(
        PasswordReset.token == payload.token,
        PasswordReset.is_used == False
    ).first()

    if not reset_record or not hmac.compare_digest(reset_record.token or "", payload.token or ""):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de redefinição inválido ou já utilizado."
        )

    # Verifica expiração
    now = datetime.now(timezone.utc)
    expires_at = reset_record.expires_at.replace(tzinfo=timezone.utc) if reset_record.expires_at.tzinfo is None else reset_record.expires_at
    if now > expires_at:
        reset_record.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este token expirou."
        )

    # Atualiza a senha
    user = db.query(User).filter(User.email == reset_record.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )

    user.hashed_password = hash_password(payload.password)
    reset_record.is_used = True
    db.commit()

    return {"message": "Senha redefinida com sucesso!"}


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permite ao usuário autenticado alterar sua própria senha.
    """
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A senha atual informada está incorreta."
        )
    
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    
    return {"message": "Senha alterada com sucesso!"}


@router.post("/register", response_model=TokenResponse)
@limiter.limit("3/hour")
def register(request: Request, payload: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    """
    Registra uma nova empresa (Tenant) e o usuário administrador principal dela.
    """
    # Verifica se o e-mail já existe
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este e-mail já está cadastrado no sistema."
        )

    try:
        # Criação do novo Tenant
        tenant = Tenant(
            name=payload.company_name,
            plan_name="free",
            plan_status="active",
            candidate_count_limit=settings.PLAN_LIMITS["free"]
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)

        # Criação do usuário administrador do Tenant
        user = User(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
            role="Manager",
            is_active=True,
            tenant_id=tenant.id
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        tenant.owner_user_id = user.id
        db.commit()

        # Login automático
        access_token = create_access_token(
            data={"sub": str(user.id), "role": user.role, "email": user.email, "name": user.full_name}
        )
        _set_token_cookie(response, access_token)
        return TokenResponse(
            access_token=access_token,
            role=user.role,
            full_name=user.full_name,
            email=user.email
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao criar conta: {str(e)}"
        )


@router.post("/logout")
def logout(response: Response):
    """
    Limpa o cookie HttpOnly de autenticação.
    Necessário porque o cookie HttpOnly não pode ser removido via JavaScript.
    """
    response.delete_cookie(key="token", path="/")
    return {"message": "Sessão encerrada."}
