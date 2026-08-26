from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class TenantClosureRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    confirmation: Literal["ENCERRAR ORGANIZAÇÃO"]


class TenantClosureResponse(BaseModel):
    status: str
    is_owner: bool = False
    requested_at: datetime | None = None
    scheduled_for: datetime | None = None
