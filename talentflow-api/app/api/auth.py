import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, RoleChecker
from app.models.domain import User, PasswordReset, Tenant
from app.schemas.auth import (
    LoginRequest, TokenResponse, 
    ForgotPasswordRequest, ResetPasswordRequest,
    ChangePasswordRequest, RegisterRequest
)
from app.services.auth import hash_password, verify_password, create_access_token
from app.services.email import send_reset_password_email

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Autentica o usuário e retorna o token JWT de acesso.
    """
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos."
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sua conta foi desativada pelo administrador."
        )

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=access_token,
        role=user.role,
        full_name=user.full_name,
        email=user.email
    )



@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Gera um token de redefinição de senha e envia por e-mail.
    """
    user = db.query(User).filter(User.email == request.email).first()
    
    # Prática de segurança: retornar sucesso mesmo se o e-mail não existir
    # para evitar varredura de usuários (User Enumeration).
    if not user:
        return {"message": "Se este e-mail estiver cadastrado, um link de recuperação será enviado."}

    # Desativa tokens anteriores
    db.query(PasswordReset).filter(
        PasswordReset.email == request.email, 
        PasswordReset.is_used == False
    ).update({"is_used": True})

    # Criação do token seguro
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=2) # 2 horas de validade

    reset_record = PasswordReset(
        email=request.email,
        token=token,
        expires_at=expires_at
    )
    
    db.add(reset_record)
    db.commit()

    # Envio do e-mail
    send_reset_password_email(to_email=request.email, token=token)

    return {"message": "Se este e-mail estiver cadastrado, um link de recuperação será enviado."}


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Redefine a senha do usuário com base no token recebido por e-mail.
    """
    reset_record = db.query(PasswordReset).filter(
        PasswordReset.token == request.token, 
        PasswordReset.is_used == False
    ).first()
    
    if not reset_record:
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

    user.hashed_password = hash_password(request.password)
    reset_record.is_used = True
    db.commit()

    return {"message": "Senha redefinida com sucesso!"}


@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permite ao usuário autenticado alterar sua própria senha.
    """
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A senha atual informada está incorreta."
        )
    
    current_user.hashed_password = hash_password(request.new_password)
    db.commit()
    
    return {"message": "Senha alterada com sucesso!"}


@router.post("/register", response_model=TokenResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registra uma nova empresa (Tenant) e o usuário administrador principal dela.
    """
    # Verifica se o e-mail já existe
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este e-mail já está cadastrado no sistema."
        )

    try:
        # Criação do novo Tenant
        tenant = Tenant(
            name=request.company_name,
            plan_name="free",
            plan_status="active",
            candidate_count_limit=50
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)

        # Criação do usuário administrador do Tenant
        user = User(
            email=request.email,
            full_name=request.full_name,
            hashed_password=hash_password(request.password),
            role="Manager",
            is_active=True,
            tenant_id=tenant.id
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Login automático
        access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
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

