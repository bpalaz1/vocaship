import os
import uuid
import logging
from datetime import datetime, date, timedelta, timezone
from typing import Dict, Any, Optional

import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, status

from app.core.database import get_db
from app.core.local_db import LocalDatabaseClient
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse

logger = logging.getLogger("vocaship.auth")

router = APIRouter()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "vorego-super-secret-jwt-key-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30

# In-memory / Local fallback cache in case remote Supabase schema lacks new columns
_local_auth_db = LocalDatabaseClient()


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
    user_id: str, username: str, role: str, is_pro: bool = False
) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "is_pro": is_pro,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def _find_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    normalized = username.strip().lower()
    db = get_db()

    # 1. Try primary database (Supabase or active fallback) with username column
    try:
        res = db.table("users").select("*").eq("username", normalized).limit(1).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as exc:
        logger.warning(f"[Auth] Supabase username sorgusu uyarısı (sütun eksik olabilir): {exc}")

    # 2. Fallback: Try matching synthetic email f"{normalized}@vorego.local" if username column is missing
    try:
        synthetic_email = f"{normalized}@vorego.local"
        res_email = db.table("users").select("*").eq("email", synthetic_email).limit(1).execute()
        if res_email.data and len(res_email.data) > 0:
            return res_email.data[0]
    except Exception as exc:
        logger.warning(f"[Auth] Supabase email fallback sorgusu uyarısı: {exc}")

    # 3. Check local SQLite auth mirror
    try:
        local_res = (
            _local_auth_db.table("users")
            .select("*")
            .eq("username", normalized)
            .limit(1)
            .execute()
        )
        if local_res.data and len(local_res.data) > 0:
            return local_res.data[0]
    except Exception as exc:
        logger.warning(f"[Auth] Yerel DB username sorgusu uyarısı: {exc}")

    return None


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_200_OK)
def register_user(payload: RegisterRequest) -> AuthResponse:
    """
    Sıfır bürokrasiyle (e-posta onaysız) Ad Soyad + Kullanıcı Adı + Şifre ile kayıt.
    """
    clean_username = payload.username.strip().lower()
    clean_full_name = payload.full_name.strip()

    if not clean_username or len(clean_username) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kullanıcı adı en az 2 karakter olmalıdır.",
        )

    existing_user = _find_user_by_username(clean_username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu kullanıcı adı zaten alınmış. Lütfen farklı bir kullanıcı adı seçin.",
        )

    user_id = str(uuid.uuid4())
    pwd_hash = hash_password(payload.password)
    today_str = date.today().isoformat()
    synthetic_email = f"{clean_username}@vorego.local"

    full_user_record: Dict[str, Any] = {
        "id": user_id,
        "email": synthetic_email,
        "username": clean_username,
        "full_name": clean_full_name,
        "password_hash": pwd_hash,
        "role": "user",
        "is_pro": False,
        "is_educator": False,
        "daily_custom_texts_used": 0,
        "daily_speaking_sessions_used": 0,
        "last_quota_reset_date": today_str,
    }

    db = get_db()
    saved_row: Optional[Dict[str, Any]] = None

    # 1. Try inserting full record into primary DB (Supabase)
    try:
        insert_res = db.table("users").insert(full_user_record).execute()
        if insert_res.data and len(insert_res.data) > 0:
            saved_row = insert_res.data[0]
    except Exception as exc:
        logger.warning(
            f"[Auth] Supabase tam şema kaydı başarısız oldu (eksik sütun olabilir, güvenli fallback deneniyor): {exc}"
        )
        # 2. Safe Fallback if Supabase users table lacks newer columns
        try:
            minimal_record = {
                "id": user_id,
                "email": synthetic_email,
                "full_name": clean_full_name,
                "is_pro": False,
                "is_educator": False,
            }
            min_res = db.table("users").insert(minimal_record).execute()
            if min_res.data and len(min_res.data) > 0:
                saved_row = {**full_user_record, **min_res.data[0]}
        except Exception as min_exc:
            logger.warning(f"[Auth] Supabase minimal kayıt uyarısı: {min_exc}")

    # 3. Ensure local SQLite mirror has the record if primary DB did not save it
    if not saved_row:
        try:
            local_res = _local_auth_db.table("users").insert(full_user_record).execute()
            if local_res.data:
                saved_row = local_res.data[0]
        except Exception as local_exc:
            logger.warning(f"[Auth] Yerel DB kayıt uyarısı: {local_exc}")

    if not saved_row:
        saved_row = full_user_record

    final_user_id = str(saved_row.get("id") or user_id)
    final_username = str(saved_row.get("username") or clean_username)
    final_full_name = str(saved_row.get("full_name") or clean_full_name)
    final_role = str(saved_row.get("role") or "user")
    final_is_pro = bool(saved_row.get("is_pro", False))
    final_is_educator = bool(saved_row.get("is_educator", False))

    token = create_access_token(
        user_id=final_user_id,
        username=final_username,
        role=final_role,
        is_pro=final_is_pro,
    )

    return AuthResponse(
        user_id=final_user_id,
        username=final_username,
        full_name=final_full_name,
        role=final_role,
        is_pro=final_is_pro,
        is_educator=final_is_educator,
        token=token,
    )


@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
def login_user(payload: LoginRequest) -> AuthResponse:
    """
    Kullanıcı adı ve şifre doğrulaması yapar; doğruysa profil ve JWT token döner.
    """
    clean_username = payload.username.strip().lower()
    user_row = _find_user_by_username(clean_username)

    if not user_row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı.",
        )

    stored_hash = user_row.get("password_hash")

    # If primary DB lacked password_hash column, check local SQLite mirror
    if not stored_hash:
        try:
            local_res = (
                _local_auth_db.table("users")
                .select("*")
                .eq("username", clean_username)
                .limit(1)
                .execute()
            )
            if local_res.data and len(local_res.data) > 0:
                stored_hash = local_res.data[0].get("password_hash")
                user_row = {**local_res.data[0], **user_row, "password_hash": stored_hash}
        except Exception as exc:
            logger.warning(f"[Auth] Yerel şifre doğrulama yedek sorgusu uyarısı: {exc}")

    if not stored_hash or not verify_password(payload.password, str(stored_hash)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı.",
        )

    final_user_id = str(user_row.get("id") or "")
    final_username = str(user_row.get("username") or clean_username)
    final_full_name = str(user_row.get("full_name") or final_username)
    final_role = str(user_row.get("role") or "user")
    final_is_pro = bool(user_row.get("is_pro", False))
    final_is_educator = bool(user_row.get("is_educator", False))

    token = create_access_token(
        user_id=final_user_id,
        username=final_username,
        role=final_role,
        is_pro=final_is_pro,
    )

    return AuthResponse(
        user_id=final_user_id,
        username=final_username,
        full_name=final_full_name,
        role=final_role,
        is_pro=final_is_pro,
        is_educator=final_is_educator,
        token=token,
    )


@router.post("/upgrade-pro", response_model=AuthResponse, status_code=status.HTTP_200_OK)
def upgrade_user_to_pro(payload: Dict[str, Any]) -> AuthResponse:
    """
    Test modu için kullanıcıyı anında PRO ve Eğitmen (is_pro=True, is_educator=True) seviyesine yükseltir.
    """
    username = str(payload.get("username") or "").strip().lower()
    user_id = str(payload.get("user_id") or "").strip()

    user_row = _find_user_by_username(username) if username else None
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
        final_full_name = str(user_row.get("full_name") or final_username)
        final_role = str(user_row.get("role") or "user")
    else:
        final_user_id = user_id or str(uuid.uuid4())
        final_username = username or "pro_educator"
        final_full_name = str(payload.get("full_name") or "PRO Eğitmen")
        final_role = "user"

    token = create_access_token(
        user_id=final_user_id,
        username=final_username,
        role=final_role,
        is_pro=True,
    )

    return AuthResponse(
        user_id=final_user_id,
        username=final_username,
        full_name=final_full_name,
        role=final_role,
        is_pro=True,
        is_educator=True,
        token=token,
    )
