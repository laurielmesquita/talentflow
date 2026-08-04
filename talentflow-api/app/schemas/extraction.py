from pydantic import BaseModel
from typing import Optional, List


class ExperienceItem(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[bool] = False
    description: Optional[str] = None


class CandidateExtraction(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    address: Optional[str] = None
    categories: List[str] = []
    skills: List[str] = []
    experiences: List[ExperienceItem] = []
