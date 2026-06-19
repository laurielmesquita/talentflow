from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str
    email: str

class InviteRequest(BaseModel):
    email: EmailStr
    role: str # SuperAdmin, Manager, Recruiter

class InviteVerifyResponse(BaseModel):
    email: EmailStr
    role: str
    token: str

class InviteAcceptRequest(BaseModel):
    token: str
    full_name: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

