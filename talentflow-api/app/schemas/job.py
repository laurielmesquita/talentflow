from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime


class JobResponse(BaseModel):
    id: str
    slug: str
    title: str
    description: str
    location: Optional[str] = None
    employment_type: Optional[str] = None
    work_model: Optional[str] = None
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    application_email: Optional[str] = None
    application_subject: Optional[str] = None
    deadline: Optional[str] = None
    required_skills: Optional[str] = None
    is_active: bool
    created_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PublicJobResponse(BaseModel):
    id: str
    slug: str
    title: str
    description: str
    location: Optional[str] = None
    employment_type: Optional[str] = None
    work_model: Optional[str] = None
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    deadline: Optional[str] = None
    required_skills: Optional[str] = None
    created_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
