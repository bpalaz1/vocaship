from typing import Literal, Union, Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=1, description="Kullanıcının Adı ve Soyadı")
    username: str = Field(..., min_length=2, description="Kullanıcı adı (Rumuz - non-unique)")
    email: EmailStr = Field(..., description="Kullanıcının geçerli e-posta adresi (UNIQUE)")
    password: str = Field(..., min_length=3, description="Kullanıcı şifresi (en az 3 karakter)")


class VerifyEmailRequest(BaseModel):
    email: EmailStr = Field(..., description="Doğrulanacak e-posta adresi")
    code: str = Field(..., min_length=4, max_length=12, description="6 haneli doğrulama kodu")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Şifre sıfırlama kodu gönderilecek e-posta adresi")


class ResetPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Kullanıcı e-posta adresi")
    code: str = Field(..., min_length=4, max_length=12, description="6 haneli şifre sıfırlama kodu")
    new_password: str = Field(..., min_length=3, description="Yeni şifre (en az 3 karakter)")


class MessageOkResponse(BaseModel):
    ok: bool = True
    message: str
    dev_code: Optional[str] = None


class LoginRequest(BaseModel):
    identifier: Optional[str] = Field(None, description="E-posta adresi veya kullanıcı adı")
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
    plan_tier: str = "free"
    email_verified: bool = True
    subscription_status: Optional[str] = None
    trial_ends_at: Optional[str] = None
    trial_days_left: Optional[int] = None
    avatar_url: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, description="Güncellenecek Ad Soyad")
    username: Optional[str] = Field(None, description="Güncellenecek Kullanıcı Adı (Rumuz)")
    email: Optional[EmailStr] = Field(None, description="Güncellenecek e-posta adresi")
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
    plan_tier: str = "free"
    email_verified: bool = True
    requires_email_verification: bool = False
    verification_sent: bool = False
    dev_verification_code: Optional[str] = None
    subscription_status: Optional[str] = None
    trial_ends_at: Optional[str] = None
    trial_days_left: Optional[int] = None
    avatar_url: Optional[str] = None
    token: Optional[str] = ""
    message: Optional[str] = None
    user: Optional[UserResponse] = None
