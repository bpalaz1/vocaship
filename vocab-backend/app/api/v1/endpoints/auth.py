import os
import uuid
import random
import logging
from datetime import datetime, date, timedelta, timezone
from typing import Dict, Any, Optional, List

import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, status, Depends, Request
from supabase_auth.errors import AuthApiError

from app.core.config import settings
from app.core.database import get_db, get_supabase_client
from app.core.local_db import LocalDatabaseClient
from app.services.quota_service import evaluate_user_trial_and_plan, compute_trial_days_left
from app.services.email_service import send_verification_email, send_password_reset_email
from app.schemas.auth import (
    RegisterRequest,
    VerifyEmailRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageOkResponse,
    LoginRequest,
    AuthResponse,
    UserResponse,
    UpdateProfileRequest,
)

logger = logging.getLogger("vocaship.auth")

router = APIRouter()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "vorego-super-secret-jwt-key-2026")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 43200)

# In-memory / Local fallback cache in case remote Supabase schema lacks new columns or is offline
_local_auth_db = LocalDatabaseClient()
_PENDING_VERIFICATION_CODES: Dict[str, str] = {}
_PENDING_RESET_CODES: Dict[str, tuple[str, datetime]] = {}


def _generate_verification_code() -> str:
    return f"{random.randint(100000, 999999)}"


def _send_verification_email(to_email: str, full_name: str, code: str) -> bool:
    return send_verification_email(to_email=to_email, full_name=full_name, code=code)


def hash_password(plain_password: str) -> str:
    pwd_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, password_hash: str) -> bool:
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            password_hash.encode("utf-8"),
        )
    except Exception:
        return False


def create_access_token(
    user_id: str,
    username: str,
    role: str,
    is_pro: bool = False,
    email: Optional[str] = None,
    plan_tier: str = "free",
) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "username": username,
        "email": email or "",
        "role": role,
        "is_pro": is_pro,
        "plan_tier": plan_tier,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


# =========================================================================
# TOKEN DOĞRULAMA & GÜVENLİK BAĞIMLILIĞI (JWT + Supabase Uyumlu)
# =========================================================================
def get_current_user(request: Request) -> Dict[str, Any]:
    """
    Hem backend tarafindan uretilen JWT belirteclerini hem de dogrudan
    Supabase tarafindan saglanan erisim belirteclerini dogrular.
    """
    auth_header = request.headers.get("Authorization") or ""
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yetkilendirme başlığı (Authorization: Bearer <token>) eksik veya geçersiz.",
        )
    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz yetkilendirme belirteci.",
        )

    # 1. Yerel / Backend JWT Decode kontrolü
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id:
            user_row = evaluate_user_trial_and_plan(_find_user_by_id(str(user_id)) or {})
            sub_status = user_row.get("subscription_status")
            trial_ends_at = user_row.get("trial_ends_at")
            trial_days_left = user_row.get("trial_days_left")
            if str(sub_status or "").lower() == "expired":
                p_tier = "free"
                is_pro_flag = False
            else:
                raw_tier = str(user_row.get("plan_tier") or payload.get("plan_tier") or ("pro" if (payload.get("is_pro") or user_row.get("is_pro")) else "free")).lower().strip()
                is_pro_flag = bool(user_row.get("is_pro") if "is_pro" in user_row else (payload.get("is_pro") or raw_tier == "pro")) or str(payload.get("role") or user_row.get("role") or "") == "admin"
                p_tier = "pro" if is_pro_flag else "free"
            return {
                "id": str(user_id),
                "username": payload.get("username") or user_row.get("username") or "",
                "email": payload.get("email") or user_row.get("email") or "",
                "full_name": user_row.get("full_name") or payload.get("username") or "",
                "role": payload.get("role") or user_row.get("role") or "user",
                "is_pro": is_pro_flag,
                "plan_tier": p_tier,
                "subscription_status": sub_status,
                "trial_ends_at": trial_ends_at,
                "trial_days_left": trial_days_left,
                "avatar_url": user_row.get("avatar_url"),
            }
    except Exception as jwt_err:
        logger.debug(f"[Auth] Yerel JWT decode basarisiz, Supabase Auth deneniyor: {jwt_err}")

    # 2. Supabase Auth get_user kontrolü
    supabase_client = get_supabase_client()
    if supabase_client:
        try:
            user_res = supabase_client.auth.get_user(token)
            if user_res and user_res.user:
                sb_user = user_res.user
                user_id = str(sb_user.id)
                meta = getattr(sb_user, "user_metadata", {}) or {}
                user_row = evaluate_user_trial_and_plan(_find_user_by_id(user_id) or {})
                sub_status = user_row.get("subscription_status")
                trial_ends_at = user_row.get("trial_ends_at")
                trial_days_left = user_row.get("trial_days_left")
                if str(sub_status or "").lower() == "expired":
                    p_tier = "free"
                    is_pro_flag = False
                else:
                    raw_tier = str(user_row.get("plan_tier") or meta.get("plan_tier") or ("pro" if (meta.get("is_pro") or user_row.get("is_pro")) else "free")).lower().strip()
                    is_pro_flag = bool(user_row.get("is_pro") if "is_pro" in user_row else (meta.get("is_pro") or raw_tier == "pro")) or str(meta.get("role") or user_row.get("role") or "") == "admin"
                    p_tier = "pro" if is_pro_flag else "free"
                return {
                    "id": user_id,
                    "username": meta.get("username") or user_row.get("username") or "",
                    "email": sb_user.email or user_row.get("email") or "",
                    "full_name": meta.get("full_name") or user_row.get("full_name") or "",
                    "role": meta.get("role") or user_row.get("role") or "user",
                    "is_pro": is_pro_flag,
                    "plan_tier": p_tier,
                    "subscription_status": sub_status,
                    "trial_ends_at": trial_ends_at,
                    "trial_days_left": trial_days_left,
                    "avatar_url": meta.get("avatar_url") or user_row.get("avatar_url"),
                }
        except Exception as sb_err:
            logger.debug(f"[Auth] Supabase get_user basarisiz: {sb_err}")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Oturum süresi dolmuş veya geçersiz belirteç.",
    )


# =========================================================================
# KULLANICI ARAMA YARDIMCILARI
# =========================================================================
def _find_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    clean_id = str(user_id).strip()
    db = get_db()
    try:
        res = db.table("users").select("*").eq("id", clean_id).limit(1).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as exc:
        logger.warning(f"[Auth] Supabase DB id sorgusu hatası: {exc}")
    return None


def _find_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    normalized = email.strip().lower()
    db = get_db()
    try:
        res = db.table("users").select("*").eq("email", normalized).limit(1).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as exc:
        logger.warning(f"[Auth] Supabase DB email sorgusu hatası: {exc}")
    return None


def _find_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """
    NOT: Username benzersiz (unique) degildir!
    Geriye donuk uyumluluk icin ilk eslesen kaydi dondurur.
    """
    normalized = username.strip().lower()
    db = get_db()
    try:
        res = db.table("users").select("*").eq("username", normalized).limit(1).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as exc:
        logger.warning(f"[Auth] Supabase DB username sorgusu hatası: {exc}")
    return None


# =========================================================================
# 1. SADE KAYIT & E-POSTA DOĞRULAMA ENDPOINT'LERİ (UNIQUE Email, Non-Unique Username)
# =========================================================================
@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_200_OK)
def register_user(payload: RegisterRequest) -> AuthResponse:
    """
    Sade kayıt akışı: Yalnızca Ad Soyad, Kullanıcı Adı, E-posta ve Şifre alır.
    Tüm yeni kullanıcılar otomatik plan_tier='free', is_pro=False, email_verified=False
    olarak oluşturulur ve 6 haneli e-posta doğrulama kodu üretilir.
    """
    clean_email = str(payload.email).strip().lower()
    raw_username = (payload.username or "").strip()
    if "@" in raw_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kullanıcı adı (rumuz) e-posta adresi veya '@' içeremez.",
        )
    clean_username = raw_username or clean_email.split("@")[0]
    clean_full_name = payload.full_name.strip()

    if not clean_username or len(clean_username) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kullanıcı adı (rumuz) en az 2 karakter olmalıdır.",
        )
    if not clean_full_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ad ve soyad alanı boş bırakılamaz.",
        )
    if len(payload.password) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Şifre en az 3 karakter olmalıdır.",
        )

    plan_tier = "free"
    is_pro_val = False
    verification_code = _generate_verification_code()
    _PENDING_VERIFICATION_CODES[clean_email] = verification_code

    # E-posta tekilliği kontrolü (UNIQUE yalnızca email üzerindedir; username tekrarlanabilir)
    existing_user_by_email = _find_user_by_email(clean_email)
    if existing_user_by_email:
        already_verified = bool(
            existing_user_by_email.get("email_verified")
            or existing_user_by_email.get("email_confirmed")
            or existing_user_by_email.get("email_confirmed_at")
        )
        if already_verified:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bu e-posta adresi ile kayıtlı bir hesap zaten mevcut. Lütfen giriş yapın.",
            )

        # Doğrulanmamış yarım kalmış kayıt için yeni kod üretip doğrudan Supabase'de güncelle
        user_id = str(existing_user_by_email.get("id"))
        pwd_hash = hash_password(payload.password)
        normalized_username = clean_username.strip().lower()
        refresh_candidates = [
            {
                "full_name": clean_full_name,
                "username": normalized_username,
                "password_hash": pwd_hash,
                "plan_tier": plan_tier,
                "is_pro": is_pro_val,
                "is_educator": False,
                "email_verified": False,
                "email_confirmed": False,
                "verification_code": verification_code,
            },
            {
                "full_name": clean_full_name,
                "username": normalized_username,
                "password_hash": pwd_hash,
                "plan_tier": plan_tier,
                "is_pro": is_pro_val,
                "email_verified": False,
            },
            {
                "full_name": clean_full_name,
                "username": normalized_username,
                "password_hash": pwd_hash,
            },
        ]
        db = get_db()
        refreshed = False
        last_refresh_err = ""
        for upd_payload in refresh_candidates:
            try:
                upd_res = db.table("users").update(upd_payload).eq("id", user_id).execute()
                if upd_res.data and len(upd_res.data) > 0:
                    refreshed = True
                    break
            except Exception as exc:
                last_refresh_err = str(exc)
        if not refreshed:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Kayıt güncellenirken veritabanı hatası oluştu: {last_refresh_err or 'Kullanıcı kaydı güncellenemedi.'}",
            )

        sent = _send_verification_email(clean_email, clean_full_name, verification_code)
        user_resp = UserResponse(
            id=user_id,
            full_name=clean_full_name,
            username=clean_username,
            email=clean_email,
            role="user",
            is_pro=False,
            plan_tier=plan_tier,
            email_verified=False,
            avatar_url=existing_user_by_email.get("avatar_url"),
        )
        return AuthResponse(
            user_id=user_id,
            username=clean_username,
            full_name=clean_full_name,
            email=clean_email,
            role="user",
            is_pro=False,
            is_educator=False,
            plan_tier=plan_tier,
            email_verified=False,
            requires_email_verification=True,
            verification_sent=sent,
            dev_verification_code=None if sent else verification_code,
            avatar_url=existing_user_by_email.get("avatar_url"),
            token="",
            message="Doğrulama kodu e-posta adresinize gönderildi. Lütfen 6 haneli kodu girin.",
            user=user_resp,
        )

    user_id = str(uuid.uuid4())
    supabase_client = get_supabase_client()

    # 1. Supabase Auth servisine kayıt (varsa)
    if supabase_client:
        try:
            sign_up_payload = {
                "email": clean_email,
                "password": payload.password,
                "options": {
                    "data": {
                        "full_name": clean_full_name,
                        "username": clean_username,
                        "plan_tier": plan_tier,
                        "is_pro": False,
                    }
                },
            }
            res = supabase_client.auth.sign_up(sign_up_payload)
            if res and res.user:
                user_id = str(res.user.id)
                logger.info(f"[Auth] Supabase kullanıcısı oluşturuldu: {clean_email} ({user_id})")
        except Exception as exc:
            logger.warning(f"[Auth] Supabase sign_up uyarısı: {exc}")

    # 2. Doğrudan Supabase public.users Tablosu Kalıcı Kaydı (SQLite fallback yok!)
    pwd_hash = hash_password(payload.password)
    today_str = date.today().isoformat()
    normalized_username = clean_username.strip().lower()

    full_user_record: Dict[str, Any] = {
        "id": user_id,
        "email": clean_email,
        "username": normalized_username,
        "full_name": clean_full_name,
        "password_hash": pwd_hash,
        "role": "user",
        "is_pro": False,
        "is_educator": False,
        "plan_tier": plan_tier,
        "avatar_url": None,
        "email_confirmed": False,
        "email_verified": False,
        "verification_code": verification_code,
        "daily_custom_texts_used": 0,
        "daily_ai_stories_used": 0,
        "daily_speaking_sessions_used": 0,
        "last_quota_reset_date": today_str,
    }

    core_supabase_record: Dict[str, Any] = {
        "id": user_id,
        "email": clean_email,
        "username": normalized_username,
        "full_name": clean_full_name,
        "password_hash": pwd_hash,
        "role": "user",
        "is_pro": False,
        "is_educator": False,
        "plan_tier": plan_tier,
        "email_verified": False,
    }

    minimal_supabase_record: Dict[str, Any] = {
        "id": user_id,
        "email": clean_email,
        "username": normalized_username,
        "full_name": clean_full_name,
        "password_hash": pwd_hash,
    }

    db = get_db()
    supabase_saved = False
    last_db_error = ""
    for candidate_payload in (full_user_record, core_supabase_record, minimal_supabase_record):
        try:
            ins_res = db.table("users").insert(candidate_payload).execute()
            if ins_res.data and len(ins_res.data) > 0:
                supabase_saved = True
                break
        except Exception as exc:
            last_db_error = str(exc)
            logger.warning(f"[Auth] Supabase users insert hatası ({list(candidate_payload.keys())}): {exc}")
            try:
                upd_res = db.table("users").update(candidate_payload).eq("id", user_id).execute()
                if upd_res.data and len(upd_res.data) > 0:
                    supabase_saved = True
                    break
            except Exception as upd_exc:
                last_db_error = str(upd_exc)
                logger.warning(f"[Auth] Supabase users update hatası: {upd_exc}")

    if not supabase_saved:
        logger.error(f"[Auth] Kullanıcı Supabase users tablosuna yazılamadı: {clean_email} ({user_id}) -> {last_db_error}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hesap kalıcı veritabanına (Supabase) kaydedilemedi: {last_db_error or 'Bilinmeyen veritabanı hatası'}",
        )

    sent = _send_verification_email(clean_email, clean_full_name, verification_code)

    user_resp = UserResponse(
        id=user_id,
        full_name=clean_full_name,
        username=clean_username,
        email=clean_email,
        role="user",
        is_pro=False,
        plan_tier=plan_tier,
        email_verified=False,
        avatar_url=None,
    )

    return AuthResponse(
        user_id=user_id,
        username=clean_username,
        full_name=clean_full_name,
        email=clean_email,
        role="user",
        is_pro=False,
        is_educator=False,
        plan_tier=plan_tier,
        email_verified=False,
        requires_email_verification=True,
        verification_sent=sent,
        dev_verification_code=None if sent else verification_code,
        avatar_url=None,
        token="",
        message="Kayıt oluşturuldu! Devam etmek için e-postanıza gönderilen 6 haneli kodu girin.",
        user=user_resp,
    )


@router.post("/verify-email", response_model=AuthResponse, status_code=status.HTTP_200_OK)
def verify_email_code(payload: VerifyEmailRequest) -> AuthResponse:
    """
    6 haneli doğrulama kodunu (veya test ortamı için '000000') doğrular,
    email_verified = True yapar ve kullanıcının oturum token'ını döndürür.
    """
    clean_email = str(payload.email).strip().lower()
    clean_code = str(payload.code).strip()

    user_row = _find_user_by_email(clean_email)
    if not user_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bu e-posta adresiyle eşleşen bir kayıt bulunamadı.",
        )

    expected_code = str(
        user_row.get("verification_code")
        or _PENDING_VERIFICATION_CODES.get(clean_email)
        or ""
    ).strip()

    is_valid = (clean_code == "000000") or (bool(expected_code) and clean_code == expected_code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doğrulama kodu geçersiz. Lütfen e-postanızdaki 6 haneli kodu kontrol edin.",
        )

    user_id = str(user_row.get("id") or "")
    db = get_db()
    verified_saved = False
    last_verify_err = ""
    for verify_updates in (
        {"email_verified": True, "email_confirmed": True, "verification_code": None},
        {"email_verified": True},
        {"email_confirmed": True},
    ):
        try:
            upd_res = db.table("users").update(verify_updates).eq("id", user_id).execute()
            if upd_res.data and len(upd_res.data) > 0:
                verified_saved = True
                break
        except Exception as exc:
            last_verify_err = str(exc)
    if not verified_saved and last_verify_err:
        logger.warning(f"[Auth] Supabase email_verified güncelleme uyarısı: {last_verify_err}")

    _PENDING_VERIFICATION_CODES.pop(clean_email, None)

    evaluated = evaluate_user_trial_and_plan(user_row)
    final_username = str(evaluated.get("username") or clean_email.split("@")[0])
    final_full_name = str(evaluated.get("full_name") or final_username)
    final_role = str(evaluated.get("role") or "user")
    final_is_pro = bool(evaluated.get("is_pro", False)) or final_role == "admin"
    final_is_educator = bool(evaluated.get("is_educator", False))
    final_plan_tier = "pro" if final_is_pro else "free"

    token = create_access_token(
        user_id=user_id,
        username=final_username,
        role=final_role,
        is_pro=final_is_pro,
        email=clean_email,
        plan_tier=final_plan_tier,
    )

    user_resp = UserResponse(
        id=user_id,
        full_name=final_full_name,
        username=final_username,
        email=clean_email,
        role=final_role,
        is_pro=final_is_pro,
        plan_tier=final_plan_tier,
        email_verified=True,
        subscription_status=evaluated.get("subscription_status"),
        trial_ends_at=evaluated.get("trial_ends_at"),
        trial_days_left=evaluated.get("trial_days_left"),
        avatar_url=evaluated.get("avatar_url"),
    )

    return AuthResponse(
        user_id=user_id,
        username=final_username,
        full_name=final_full_name,
        email=clean_email,
        role=final_role,
        is_pro=final_is_pro,
        is_educator=final_is_educator,
        plan_tier=final_plan_tier,
        email_verified=True,
        requires_email_verification=False,
        subscription_status=evaluated.get("subscription_status"),
        trial_ends_at=evaluated.get("trial_ends_at"),
        trial_days_left=evaluated.get("trial_days_left"),
        avatar_url=evaluated.get("avatar_url"),
        token=token,
        message="E-posta adresiniz doğrulandı! VocaShip'e hoş geldiniz.",
        user=user_resp,
    )


# =========================================================================
# 2. GİRİŞ ENDPOINT'İ (E-posta Onay Kontrollü)
# =========================================================================
@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
def login_user(payload: LoginRequest) -> AuthResponse:
    """
    Kullanicinin e-posta veya kullanici adi ve sifre ile giris yapmasini saglar.
    """
    # 1. Esnek Giriş Kimliği (identifier | email | username)
    raw_identifier = (
        payload.identifier
        or payload.email
        or payload.username
        or ""
    )
    clean_identifier = str(raw_identifier).strip().lower()
    if not clean_identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Giriş yapmak için lütfen e-posta adresinizi veya kullanıcı adınızı girin.",
        )

    # Hem Supabase hem SQLite içinde email VEYA username eşleşmesiyle ara
    user_row: Optional[Dict[str, Any]] = None
    if "@" in clean_identifier:
        user_row = _find_user_by_email(clean_identifier) or _find_user_by_username(clean_identifier)
    else:
        user_row = _find_user_by_username(clean_identifier) or _find_user_by_email(clean_identifier)

    target_email = (
        str(user_row.get("email") or "").strip().lower()
        if user_row and user_row.get("email")
        else (clean_identifier if "@" in clean_identifier else "")
    )

    supabase_client = get_supabase_client()
    is_confirmed = False
    password_verified_by_supabase = False

    # 2. Supabase Auth ile Giriş Denemesi (varsa)
    if supabase_client and target_email:
        try:
            sign_in_res = supabase_client.auth.sign_in_with_password({
                "email": target_email,
                "password": payload.password,
            })
            if sign_in_res and sign_in_res.user:
                sb_user = sign_in_res.user
                confirmed_at = getattr(sb_user, "email_confirmed_at", None) or getattr(sb_user, "confirmed_at", None)
                if not confirmed_at:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="E-posta adresiniz henüz doğrulanmamış. Lütfen 6 haneli doğrulama kodunu girin.",
                    )
                is_confirmed = True
                password_verified_by_supabase = True
                if not user_row:
                    user_row = _find_user_by_id(str(sb_user.id)) or _find_user_by_email(target_email)
                if not user_row:
                    meta = getattr(sb_user, "user_metadata", {}) or {}
                    user_row = {
                        "id": str(sb_user.id),
                        "email": target_email,
                        "username": meta.get("username") or target_email.split("@")[0],
                        "full_name": meta.get("full_name") or target_email.split("@")[0],
                        "role": meta.get("role", "user"),
                        "is_pro": bool(meta.get("is_pro", False)),
                        "is_educator": bool(meta.get("is_educator", False)),
                        "avatar_url": meta.get("avatar_url"),
                    }
        except AuthApiError as auth_err:
            err_msg = str(auth_err).lower()
            if "not confirmed" in err_msg or "unconfirmed" in err_msg or "email_not_confirmed" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="E-posta adresiniz henüz doğrulanmamış. Lütfen 6 haneli doğrulama kodunu girin.",
                )
            logger.info(f"[Auth] Supabase sign_in AuthApiError (yerel/DB kontrol edilecek): {auth_err}")
        except HTTPException:
            raise
        except Exception as exc:
            logger.warning(f"[Auth] Supabase sign_in genel hatası: {exc}")

    # 3. Hesap Yoksa 404, Şifre Yanlışsa 401 Döndür
    if not user_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bu e-posta veya kullanıcı adıyla kayıtlı hesap bulunamadı. Lütfen önce Kayıt Ol sekmesinden hesap oluşturun.",
        )

    if not password_verified_by_supabase:
        stored_hash = user_row.get("password_hash")
        if not stored_hash or not verify_password(payload.password, str(stored_hash)):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Girilen şifre hatalı. Şifrenizi hatırlamıyorsanız 'Şifremi Unuttum?' bağlantısını kullanın.",
            )

        is_seed_user = target_email in ("user@quizwise.com", "pro@vocaship.com")
        has_email_confirmed = bool(
            user_row.get("email_verified")
            or user_row.get("email_confirmed")
            or user_row.get("email_confirmed_at")
        )
        if not is_seed_user and not has_email_confirmed and not is_confirmed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="E-posta adresiniz henüz doğrulanmamış. Lütfen 6 haneli doğrulama kodunu girin.",
            )

    user_row = evaluate_user_trial_and_plan(user_row)
    final_user_id = str(user_row.get("id") or "")
    final_email = str(user_row.get("email") or target_email)
    final_username = str(user_row.get("username") or final_email.split("@")[0])
    final_full_name = str(user_row.get("full_name") or final_username)
    final_role = str(user_row.get("role") or "user")
    final_is_pro = bool(user_row.get("is_pro", False))
    final_is_educator = bool(user_row.get("is_educator", False))
    final_avatar = user_row.get("avatar_url")
    final_sub_status = user_row.get("subscription_status")
    final_trial_ends_at = user_row.get("trial_ends_at")
    final_trial_days_left = user_row.get("trial_days_left")
    if final_trial_days_left is None and final_sub_status:
        final_trial_days_left = compute_trial_days_left(final_sub_status, final_trial_ends_at)
    final_plan_tier = "pro" if (final_is_pro or final_role == "admin") else "free"

    token = create_access_token(
        user_id=final_user_id,
        username=final_username,
        role=final_role,
        is_pro=final_is_pro,
        email=final_email,
        plan_tier=final_plan_tier,
    )

    user_resp = UserResponse(
        id=final_user_id,
        full_name=final_full_name,
        username=final_username,
        email=final_email,
        role=final_role,
        is_pro=final_is_pro,
        plan_tier=final_plan_tier,
        subscription_status=final_sub_status,
        trial_ends_at=final_trial_ends_at,
        trial_days_left=final_trial_days_left,
        avatar_url=final_avatar,
    )

    return AuthResponse(
        user_id=final_user_id,
        username=final_username,
        full_name=final_full_name,
        email=final_email,
        role=final_role,
        is_pro=final_is_pro,
        is_educator=final_is_educator,
        plan_tier=final_plan_tier,
        subscription_status=final_sub_status,
        trial_ends_at=final_trial_ends_at,
        trial_days_left=final_trial_days_left,
        avatar_url=final_avatar,
        token=token,
        message="Giriş başarılı.",
        user=user_resp,
    )


# =========================================================================
# 2B. ŞİFREMİ UNUTTUM & ŞİFRE SIFIRLAMA ENDPOINT'LERİ
# =========================================================================
@router.post("/forgot-password", response_model=MessageOkResponse, status_code=status.HTTP_200_OK)
def forgot_password(payload: ForgotPasswordRequest) -> MessageOkResponse:
    """
    Kayıtlı e-posta adresine 15 dakika geçerli 6 haneli tek kullanımlık
    şifre sıfırlama kodu üretip gönderir. E-posta sağlayıcısı bağlı değilse
    geliştirme/test kolaylığı için dev_code döner.
    """
    clean_email = str(payload.email).strip().lower()
    user_row = _find_user_by_email(clean_email)
    dev_code: Optional[str] = None

    if user_row:
        user_id = str(user_row.get("id") or "")
        full_name = str(user_row.get("full_name") or user_row.get("username") or "Kullanıcı")
        reset_code = _generate_verification_code()
        expires_dt = datetime.now(timezone.utc) + timedelta(minutes=15)
        expires_iso = expires_dt.isoformat()
        _PENDING_RESET_CODES[clean_email] = (reset_code, expires_dt)

        updates = {
            "reset_code": reset_code,
            "reset_code_expires_at": expires_iso,
        }
        db = get_db()
        try:
            db.table("users").update(updates).eq("id", user_id).execute()
        except Exception:
            pass
        try:
            _local_auth_db.table("users").update(updates).eq("id", user_id).execute()
        except Exception as exc:
            logger.warning(f"[Auth] Yerel DB reset_code kayıt uyarısı: {exc}")

        sent = send_password_reset_email(to_email=clean_email, full_name=full_name, code=reset_code)
        if not sent:
            dev_code = reset_code

    return MessageOkResponse(
        ok=True,
        message="Eğer bu e-posta sistemde kayıtlıysa şifre sıfırlama kodu gönderildi.",
        dev_code=dev_code,
    )


@router.post("/reset-password", response_model=MessageOkResponse, status_code=status.HTTP_200_OK)
def reset_password(payload: ResetPasswordRequest) -> MessageOkResponse:
    """
    6 haneli şifre sıfırlama kodunu doğrular, yeni şifreyi bcrypt ile hash'ler
    ve kullanıcı kaydını günceller.
    """
    clean_email = str(payload.email).strip().lower()
    clean_code = str(payload.code).strip()
    new_password = payload.new_password

    if len(new_password) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yeni şifre en az 3 karakter olmalıdır.",
        )

    user_row = _find_user_by_email(clean_email)
    if not user_row:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz veya süresi dolmuş sıfırlama kodu.",
        )

    now_utc = datetime.now(timezone.utc)
    db_code = str(user_row.get("reset_code") or "").strip()
    db_exp_raw = user_row.get("reset_code_expires_at")
    mem_entry = _PENDING_RESET_CODES.get(clean_email)

    matched = False
    has_email_provider = bool(
        (os.getenv("RESEND_API_KEY") or "").strip()
        or (
            (os.getenv("SMTP_HOST") or "").strip()
            and (os.getenv("SMTP_USER") or "").strip()
            and (os.getenv("SMTP_PASS") or os.getenv("SMTP_PASSWORD") or "").strip()
        )
    )
    if not has_email_provider and clean_code == "000000":
        matched = True
    elif db_code and clean_code == db_code:
        if db_exp_raw:
            try:
                exp_dt = datetime.fromisoformat(str(db_exp_raw).replace("Z", "+00:00"))
                if exp_dt.tzinfo is None:
                    exp_dt = exp_dt.replace(tzinfo=timezone.utc)
                if exp_dt >= now_utc:
                    matched = True
            except Exception:
                matched = True
        else:
            matched = True
    elif mem_entry:
        mem_code, mem_exp = mem_entry
        if clean_code == mem_code and mem_exp >= now_utc:
            matched = True

    if not matched:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doğrulama kodu geçersiz veya 15 dakikalık süresi dolmuş.",
        )

    user_id = str(user_row.get("id") or "")
    new_hash = hash_password(new_password)
    clear_updates = {
        "password_hash": new_hash,
        "reset_code": None,
        "reset_code_expires_at": None,
    }
    db = get_db()
    try:
        db.table("users").update(clear_updates).eq("id", user_id).execute()
    except Exception:
        try:
            db.table("users").update({"password_hash": new_hash}).eq("id", user_id).execute()
        except Exception:
            pass
    try:
        _local_auth_db.table("users").update(clear_updates).eq("id", user_id).execute()
    except Exception as exc:
        logger.warning(f"[Auth] Yerel DB şifre güncelleme uyarısı: {exc}")

    supabase_client = get_supabase_client()
    if supabase_client and user_id:
        try:
            supabase_client.auth.admin.update_user_by_id(user_id, {"password": new_password})
        except Exception:
            pass

    _PENDING_RESET_CODES.pop(clean_email, None)

    return MessageOkResponse(
        ok=True,
        message="Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.",
    )


# =========================================================================
# 3. PROFİL GÜNCELLEME ENDPOINT'İ (PATCH /api/v1/auth/profile)
# =========================================================================
@router.patch("/profile", response_model=UserResponse, status_code=status.HTTP_200_OK)
def update_user_profile(
    payload: UpdateProfileRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> UserResponse:
    """
    Yalnizca oturum acmis kullanicinin username (NON-UNIQUE), full_name ve avatar_url
    bilgilerini guvenli sekilde gunceller.
    Username icin hicbir benzersizlik sarti aranmaz.
    """
    user_id = str(current_user["id"])
    update_data: Dict[str, Any] = {}
    meta_data: Dict[str, Any] = {}

    if payload.full_name is not None:
        clean_fn = payload.full_name.strip()
        if not clean_fn:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ad ve soyad alanı boş bırakılamaz.",
            )
        update_data["full_name"] = clean_fn
        meta_data["full_name"] = clean_fn

    if payload.username is not None:
        clean_un = payload.username.strip()
        if len(clean_un) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Kullanıcı adı (rumuz) en az 2 karakter olmalıdır.",
            )
        # ÖNEMLİ: Username için benzersizlik (UNIQUE) kontrolü KESİNLİKLE YAPILMAZ!
        update_data["username"] = clean_un
        meta_data["username"] = clean_un

    if payload.avatar_url is not None:
        clean_avatar = payload.avatar_url.strip()
        update_data["avatar_url"] = clean_avatar
        meta_data["avatar_url"] = clean_avatar

    if payload.email is not None:
        clean_email = str(payload.email).strip().lower()
        if clean_email:
            update_data["email"] = clean_email
            meta_data["email"] = clean_email

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Güncellenecek en az bir alan belirtilmelidir.",
        )

    db = get_db()
    # 1. Primary DB (Supabase / Fallback) güncelleme
    try:
        db.table("users").update(update_data).eq("id", user_id).execute()
    except Exception as exc:
        logger.warning(f"[Auth] users tablosu profile güncelleme uyarısı: {exc}")

    # 2. Yerel SQLite DB güncelleme
    try:
        _local_auth_db.table("users").update(update_data).eq("id", user_id).execute()
    except Exception as exc:
        logger.warning(f"[Auth] Yerel DB profile güncelleme uyarısı: {exc}")

    # 3. Supabase Auth user_metadata senkronizasyonu
    supabase_client = get_supabase_client()
    if supabase_client and meta_data:
        try:
            supabase_client.auth.admin.update_user_by_id(user_id, {"user_metadata": meta_data})
        except Exception as exc:
            logger.debug(f"[Auth] Supabase auth metadata güncelleme uyarısı: {exc}")

    # Güncel kullanıcı kaydını getir
    updated_user = evaluate_user_trial_and_plan(_find_user_by_id(user_id) or {})

    final_full_name = str(update_data.get("full_name") or updated_user.get("full_name") or current_user.get("full_name") or "")
    final_username = str(update_data.get("username") or updated_user.get("username") or current_user.get("username") or "")
    final_email = str(update_data.get("email") or updated_user.get("email") or current_user.get("email") or "")
    final_role = str(updated_user.get("role") or current_user.get("role") or "user")
    final_is_pro = bool(updated_user.get("is_pro", current_user.get("is_pro", False)))
    final_avatar = update_data.get("avatar_url", updated_user.get("avatar_url"))
    final_sub_status = updated_user.get("subscription_status") or current_user.get("subscription_status")
    final_trial_ends_at = updated_user.get("trial_ends_at") or current_user.get("trial_ends_at")
    final_trial_days_left = updated_user.get("trial_days_left")
    if final_trial_days_left is None and final_sub_status:
        final_trial_days_left = compute_trial_days_left(final_sub_status, final_trial_ends_at)

    p_tier = "pro" if (final_is_pro or final_role == "admin") else "free"

    return UserResponse(
        id=user_id,
        full_name=final_full_name,
        username=final_username,
        email=final_email,
        role=final_role,
        is_pro=final_is_pro,
        plan_tier=p_tier,
        subscription_status=final_sub_status,
        trial_ends_at=final_trial_ends_at,
        trial_days_left=final_trial_days_left,
        avatar_url=final_avatar,
    )


# =========================================================================
# 4. KULLANICI PROFİL GETİR (GET /api/v1/auth/profile & GET /api/v1/auth/me)
# =========================================================================
@router.get("/profile", response_model=UserResponse, status_code=status.HTTP_200_OK)
@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)) -> UserResponse:
    """
    Oturum acmis kullanicinin profil, deneme ve abonelik bilgilerini dondurur.
    """
    user_id = str(current_user["id"])
    user_row = evaluate_user_trial_and_plan(_find_user_by_id(user_id) or {})
    final_sub_status = user_row.get("subscription_status") or current_user.get("subscription_status")
    final_trial_ends_at = user_row.get("trial_ends_at") or current_user.get("trial_ends_at")
    final_trial_days_left = user_row.get("trial_days_left")
    if final_trial_days_left is None and final_sub_status:
        final_trial_days_left = compute_trial_days_left(final_sub_status, final_trial_ends_at)
    final_is_pro = bool(user_row.get("is_pro", current_user.get("is_pro", False))) or str(user_row.get("role") or current_user.get("role") or "") == "admin"
    p_tier = "pro" if final_is_pro else "free"
    return UserResponse(
        id=user_id,
        full_name=str(user_row.get("full_name") or current_user.get("full_name") or ""),
        username=str(user_row.get("username") or current_user.get("username") or ""),
        email=str(user_row.get("email") or current_user.get("email") or ""),
        role=str(user_row.get("role") or current_user.get("role") or "user"),
        is_pro=final_is_pro,
        plan_tier=p_tier,
        subscription_status=final_sub_status,
        trial_ends_at=final_trial_ends_at,
        trial_days_left=final_trial_days_left,
        avatar_url=user_row.get("avatar_url") or current_user.get("avatar_url"),
    )


# =========================================================================
# 5. TEST MODU PRO YÜKSELTME
# =========================================================================
@router.post("/upgrade-pro", response_model=AuthResponse, status_code=status.HTTP_200_OK)
def upgrade_user_to_pro(payload: Dict[str, Any]) -> AuthResponse:
    """
    Test modu için kullanıcıyı anında PRO ve Eğitmen (is_pro=True, is_educator=True) seviyesine yükseltir.
    """
    username = str(payload.get("username") or "").strip().lower()
    user_id = str(payload.get("user_id") or "").strip()

    user_row = _find_user_by_id(user_id) if user_id else (_find_user_by_username(username) if username else None)
    db = get_db()

    if user_row and user_row.get("id"):
        target_id = str(user_row["id"])
        try:
            db.table("users").update({"is_pro": True, "is_educator": True}).eq("id", target_id).execute()
        except Exception:
            pass
        try:
            _local_auth_db.table("users").update({"is_pro": True, "is_educator": True}).eq("id", target_id).execute()
        except Exception:
            pass
        final_user_id = target_id
        final_username = str(user_row.get("username") or username or "pro_user")
        final_email = str(user_row.get("email") or f"{final_username}@vocaship.local")
        final_full_name = str(user_row.get("full_name") or final_username)
        final_role = str(user_row.get("role") or "user")
        final_avatar = user_row.get("avatar_url")
    else:
        final_user_id = user_id or str(uuid.uuid4())
        final_username = username or "pro_educator"
        final_email = f"{final_username}@vocaship.local"
        final_full_name = str(payload.get("full_name") or "PRO Eğitmen")
        final_role = "user"
        final_avatar = None

    token = create_access_token(
        user_id=final_user_id,
        username=final_username,
        role=final_role,
        is_pro=True,
        email=final_email,
    )

    user_resp = UserResponse(
        id=final_user_id,
        full_name=final_full_name,
        username=final_username,
        email=final_email,
        role=final_role,
        is_pro=True,
        avatar_url=final_avatar,
    )

    return AuthResponse(
        user_id=final_user_id,
        username=final_username,
        full_name=final_full_name,
        email=final_email,
        role=final_role,
        is_pro=True,
        is_educator=True,
        avatar_url=final_avatar,
        token=token,
        user=user_resp,
    )
