import uuid
from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    role: str
    store_address: str | None
    orders_count: int

    model_config = {"from_attributes": True}


class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str = "BRANCH"