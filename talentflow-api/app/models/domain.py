import uuid
from sqlalchemy import Column, String, Date, Boolean, Text, ForeignKey, Float, DateTime, Table, Integer, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

candidate_category = Table(
    "candidate_category",
    Base.metadata,
    Column("candidate_id", UUID(as_uuid=True), ForeignKey("candidates.id"), primary_key=True),
    Column("category_id", UUID(as_uuid=True), ForeignKey("categories.id"), primary_key=True)
)

candidate_skill = Table(
    "candidate_skill",
    Base.metadata,
    Column("candidate_id", UUID(as_uuid=True), ForeignKey("candidates.id"), primary_key=True),
    Column("skill_id", UUID(as_uuid=True), ForeignKey("skills.id"), primary_key=True)
)

class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    
    # Billing / Stripe
    stripe_customer_id = Column(String, unique=True, index=True, nullable=True)
    stripe_subscription_id = Column(String, unique=True, index=True, nullable=True)
    plan_name = Column(String, nullable=False, default="free")
    plan_status = Column(String, nullable=False, default="active")
    candidate_count_limit = Column(Integer, nullable=False, default=50)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    users = relationship("User", back_populates="tenant")
    candidates = relationship("Candidate", back_populates="tenant")
    job_positions = relationship("JobPosition", back_populates="tenant")
    job_applications = relationship("JobApplication", back_populates="tenant")
    categories = relationship("Category", back_populates="tenant")
    skills = relationship("Skill", back_populates="tenant")
    batch_jobs = relationship("BatchJob", back_populates="tenant")
    invites = relationship("Invite", back_populates="tenant")
    audit_logs = relationship("AuditLog", back_populates="tenant")

class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (
        UniqueConstraint("tenant_id", "name", name="uq_category_tenant_name"),
    )
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    name = Column(String, index=True, nullable=False)
    
    tenant = relationship("Tenant", back_populates="categories")
    candidates = relationship("Candidate", secondary=candidate_category, back_populates="categories")

class Skill(Base):
    __tablename__ = "skills"
    __table_args__ = (
        UniqueConstraint("tenant_id", "name", name="uq_skill_tenant_name"),
    )
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    name = Column(String, index=True, nullable=False)
    
    tenant = relationship("Tenant", back_populates="skills")
    candidates = relationship("Candidate", secondary=candidate_skill, back_populates="skills")

class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    full_name = Column(String, nullable=False, index=True)
    birth_date = Column(Date, nullable=True)
    email = Column(String, index=True, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    original_pdf_url = Column(String, nullable=True)
    pdf_hash = Column(String, index=True, nullable=True) # hash sha255 do arquivo original
    quality_score = Column(Float, nullable=True)       # 0–100: nota de legibilidade do currículo
    quality_alerts = Column(Text, nullable=True)       # JSON: lista de alertas de campos ausentes
    version = Column(Integer, default=1, nullable=False)   # número da versão
    is_active = Column(Boolean, default=True, nullable=False) # versão ativa
    parent_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=True) # aponta para versão anterior
    deleted_at = Column(DateTime(timezone=True), nullable=True) # soft delete (LGPD audit trail)
    is_flagged = Column(Boolean, default=False, nullable=False) # se o candidato foi sinalizado (blacklist)
    flagged_reason = Column(Text, nullable=True)                 # motivo da sinalização
    flagged_at = Column(DateTime(timezone=True), nullable=True) # data/hora da sinalização
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    tenant = relationship("Tenant", back_populates="candidates")
    categories = relationship("Category", secondary=candidate_category, back_populates="candidates")
    skills = relationship("Skill", secondary=candidate_skill, back_populates="candidates")
    experiences = relationship("Experience", back_populates="candidate", cascade="all, delete-orphan")
    job_matches = relationship("JobMatch", back_populates="candidate", cascade="all, delete-orphan")
    job_applications = relationship("JobApplication", back_populates="candidate", cascade="all, delete-orphan")

class Experience(Base):
    __tablename__ = "experiences"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False)
    company_name = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    
    candidate = relationship("Candidate", back_populates="experiences")

class JobPosition(Base):
    __tablename__ = "job_positions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    slug = Column(String, unique=True, index=True, nullable=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=True)
    employment_type = Column(String, nullable=True)
    work_model = Column(String, nullable=True)
    responsibilities = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    benefits = Column(Text, nullable=True)
    application_email = Column(String, nullable=True)
    application_subject = Column(String, nullable=True)
    deadline = Column(Date, nullable=True)
    required_skills = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    tenant = relationship("Tenant", back_populates="job_positions")
    matches = relationship("JobMatch", back_populates="job_position", cascade="all, delete-orphan")
    applications = relationship("JobApplication", back_populates="job_position", cascade="all, delete-orphan")

class JobMatch(Base):
    __tablename__ = "job_matches"
    job_id = Column(UUID(as_uuid=True), ForeignKey("job_positions.id"), primary_key=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"), primary_key=True)
    match_score = Column(Float, nullable=False)
    match_justification = Column(Text, nullable=True)
    
    job_position = relationship("JobPosition", back_populates="matches")
    candidate = relationship("Candidate", back_populates="job_matches")


class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="Recruiter")  # SuperAdmin, Manager, Recruiter
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tenant = relationship("Tenant", back_populates="users")


class Invite(Base):
    __tablename__ = "invites"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    email = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False, default="Recruiter")  # Manager, Recruiter
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tenant = relationship("Tenant", back_populates="invites")
    inviter = relationship("User", foreign_keys=[created_by])


class PasswordReset(Base):
    __tablename__ = "password_resets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class BatchJob(Base):
    __tablename__ = "batch_jobs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending, processing, completed, failed
    total = Column(Integer, nullable=False, default=0)
    processed = Column(Integer, nullable=False, default=0)
    errors = Column(Text, nullable=True)  # JSON-serialized list of error/conflict details
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tenant = relationship("Tenant", back_populates="batch_jobs")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # view, create, update, delete, flag, unflag
    entity_name = Column(String, nullable=False)  # e.g., "Candidate"
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    tenant = relationship("Tenant", back_populates="audit_logs")
    user = relationship("User")


class JobApplication(Base):
    """
    Registro de candidatura de um Candidate a uma JobPosition.
    Criado via endpoint público (/api/public/apply/{job_slug}).
    Possui rastreio completo do pipeline de ingestão de IA:
    extração de PDF, quality score, detecção de divergências e status de verificação OTP.
    """
    __tablename__ = "job_applications"
    __table_args__ = (
        # Um candidato só pode ter uma candidatura ativa por vaga/tenant
        UniqueConstraint("candidate_id", "job_position_id", "tenant_id", name="uq_application_candidate_job_tenant"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    job_position_id = Column(UUID(as_uuid=True), ForeignKey("job_positions.id"), nullable=False)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False)

    # Origem da candidatura
    source = Column(String, nullable=False, default="public_portal")  # public_portal, internal

    # Status do pipeline
    status = Column(String, nullable=False, default="pending")  # pending, processing, reviewing, rejected, accepted

    # OTP / Email verification
    email_verified = Column(Boolean, nullable=False, default=False)
    otp_code = Column(String, nullable=True)                              # código enviado por e-mail
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)       # TTL do OTP (10 min)

    # Dados brutos submetidos pelo candidato no formulário
    form_full_name = Column(String, nullable=True)
    form_email = Column(String, nullable=True)
    form_phone = Column(String, nullable=True)
    form_address = Column(String, nullable=True)
    form_linkedin = Column(String, nullable=True)
    form_cover_letter = Column(Text, nullable=True)

    # Pipeline de IA: PDF
    original_pdf_url = Column(String, nullable=True)     # URL do PDF no Cloudinary
    pdf_hash = Column(String, index=True, nullable=True) # SHA-256 para deduplicação

    # Pipeline de IA: extração e scores
    ai_extracted_data = Column(JSON, nullable=True)      # Dados brutos extraídos pelo Gemini
    quality_score = Column(Float, nullable=True)         # 0–100: legibilidade do currículo
    quality_alerts = Column(JSON, nullable=True)         # Lista de alertas de campos ausentes

    # Divergência entre formulário e PDF extraído
    has_divergence = Column(Boolean, nullable=True)      # Flag: há divergência form x PDF?
    divergence_report = Column(JSON, nullable=True)      # Dict com campos divergentes e valores

    # Timestamps
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    verified_at = Column(DateTime(timezone=True), nullable=True)    # quando o OTP foi validado
    processed_at = Column(DateTime(timezone=True), nullable=True)   # quando a IA finalizou

    # Relationships
    tenant = relationship("Tenant", back_populates="job_applications")
    job_position = relationship("JobPosition", back_populates="applications")
    candidate = relationship("Candidate", back_populates="job_applications")
