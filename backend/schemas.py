from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime


class PromptRequest(BaseModel):
    email: str
    prompt: str


class UserRegister(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if "@" not in v or "." not in v:
            raise ValueError("Email inválido")
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Senha deve ter no mínimo 6 caracteres")
        if len(v) > 128:
            raise ValueError("Senha deve ter no máximo 128 caracteres")
        return v


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    plan: str
    credits: int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UserProfile(BaseModel):
    email: str
    plan: str
    credits: int
    role: str


class HistoryResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    prompt: str
    response: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ChatHistoryResponse(BaseModel):
    id: int
    email: str
    message: str
    response: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ChatRequest(BaseModel):
    email: str
    message: str


class ChatResponse(BaseModel):
    response: str


class GenerateResponse(BaseModel):
    response: str
    credits: Optional[int] = None


class ErrorResponse(BaseModel):
    error: str


class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int
