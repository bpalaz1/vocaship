from typing import Literal, Union
from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=1, description="Kullanıcının Adı ve Soyadı")
    username: str = Field(..., min_length=2, description="Benzersiz kullanıcı adı")
    password: str = Field(..., min_length=3, description="Kullanıcı şifresi")


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, description="Kullanıcı adı")
    password: str = Field(..., min_length=1, description="Kullanıcı şifresi")


class AuthResponse(BaseModel):
    user_id: str
    username: str
    full_name: str
    role: Union[Literal["user", "admin"], str] = "user"
    is_pro: bool = False
    is_educator: bool = False
    token: str

