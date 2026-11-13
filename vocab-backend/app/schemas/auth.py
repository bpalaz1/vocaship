from typing import Literal, Union, Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=1, description="Kullanıcının Adı ve Soyadı")
    username: str = Field(..., min_length=2, description="Kullanıcı adı (Rumuz - non-unique)")
    email: Optional[EmailStr] = Field(None, description="Kullanıcının geçerli e-posta adresi")
    password: str = Field(..., min_length=3, description="Kullanıcı şifresi (en az 3 karakter)")
    plan_tier: str = Field("basic", description="Kullanıcı üyelik planı: basic | plus | pro")


class LoginRequest(BaseModel):
    email: Optional[EmailStr] = Field(None, description="Kullanıcı e-posta adresi")
    username: Optional[str] = Field(None, description="Kullanıcı adı veya e-posta")
    password: str = Field(..., min_length=1, description="Kullanıcı şifresi")


class UserResponse(BaseModel):
    id: str
    full_name: str
    username: str
    email: str
    role: Union[Literal["user", "admin"], str] = "user"
    is_pro: bool = False
    plan_tier: str = "basic"
    avatar_url: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, description="Güncellenecek Ad Soyad")
    username: Optional[str] = Field(None, description="Güncellenecek Kullanıcı Adı (Rumuz)")
    avatar_url: Optional[str] = Field(None, description="Profil avatar URL'i")
    plan_tier: Optional[str] = Field(None, description="Güncellenecek üyelik planı")


class AuthResponse(BaseModel):
    user_id: str
    username: str
    full_name: str
    email: Optional[str] = None
    role: Union[Literal["user", "admin"], str] = "user"
    is_pro: bool = False
    is_educator: bool = False
    plan_tier: str = "basic"
    avatar_url: Optional[str] = None
    token: Optional[str] = ""
    message: Optional[str] = None
    user: Optional[UserResponse] = None
