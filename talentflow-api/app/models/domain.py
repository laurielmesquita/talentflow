import uuid
from sqlalchemy import Column, String, Date, Boolean, Text, ForeignKey, Float, DateTime, Table, Integer
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

class Category(Base):
    __tablename__ = "categories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True, nullable=False)
    candidates = relationship("Candidate", secondary=candidate_category, back_populates="categories")

class Skill(Base):
    __tablename__ = "skills"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True, nullable=False)
    candidates = relationship("Candidate", secondary=candidate_skill, back_populates="skills")

class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False, index=True)
    birth_date = Column(Date, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    original_pdf_url = Column(String, nullable=True)
    quality_score = Column(Float, nullable=True)       # 0–100: nota de legibilidade do currículo
    quality_alerts = Column(Text, nullable=True)       # JSON: lista de alertas de campos ausentes
    version = Column(Integer, default=1, nullable=False)   # número da versão
    is_active = Column(Boolean, default=True, nullable=False) # versão ativa
    parent_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=True) # aponta para versão anterior
    deleted_at = Column(DateTime(timezone=True), nullable=True) # soft delete (LGPD audit trail)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    categories = relationship("Category", secondary=candidate_category, back_populates="candidates")
    skills = relationship("Skill", secondary=candidate_skill, back_populates="candidates")
    experiences = relationship("Experience", back_populates="candidate", cascade="all, delete-orphan")
    job_matches = relationship("JobMatch", back_populates="candidate", cascade="all, delete-orphan")

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
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    required_skills = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    matches = relationship("JobMatch", back_populates="job_position", cascade="all, delete-orphan")

class JobMatch(Base):
    __tablename__ = "job_matches"
    job_id = Column(UUID(as_uuid=True), ForeignKey("job_positions.id"), primary_key=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"), primary_key=True)
    match_score = Column(Float, nullable=False)
    match_justification = Column(Text, nullable=True)
    
    job_position = relationship("JobPosition", back_populates="matches")
    candidate = relationship("Candidate", back_populates="job_matches")
