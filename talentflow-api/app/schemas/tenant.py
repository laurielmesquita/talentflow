from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class TenantClosureRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    confirmation: Literal["ENCERRAR ORGANIZAÇÃO"]


class TenantClosureResponse(BaseModel):
    status: str
    is_owner: bool = False
    requested_at: datetime | None = None
    scheduled_for: datetime | None = None


class TenantOwnerTransferRequest(BaseModel):
    target_user_id: UUID
    current_password: str = Field(min_length=1, max_length=128)


class TenantOwnerTransferResponse(BaseModel):
    owner_user_id: UUID
    owner_name: str
