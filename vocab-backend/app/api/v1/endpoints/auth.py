import os
import uuid
import logging
from datetime import datetime, date, timedelta, timezone
from typing import Dict, Any, Optional, List

import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, status, Depends, Request
from supabase_auth.errors import AuthApiError

from app.core.database import get_db, get_supabase_client
from app.core.local_db import LocalDatabaseClient
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserResponse,
    UpdateProfileRequest,
)

logger = logging.getLogger("vocaship.auth")

router = APIRouter()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "vorego-super-secret-jwt-key-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30

# In-memory / Local fallback cache in case remote Supabase schema lacks new columns or is offline
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
    user_id: str,
    username: str,
    role: str,
    is_pro: bool = False,
    email: Optional[str] = None,
    plan_tier: str = "basic",
) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS)
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
            user_row = _find_user_by_id(str(user_id)) or {}
            p_tier = str(user_row.get("plan_tier") or payload.get("plan_tier") or ("pro" if (payload.get("is_pro") or user_row.get("is_pro")) else "basic")).lower().strip()
            if p_tier not in ("basic", "plus", "pro"):
                p_tier = "basic"
            is_pro_flag = bool(payload.get("is_pro") or user_row.get("is_pro", False) or p_tier == "pro")
            return {
                "id": str(user_id),
                "username": payload.get("username") or user_row.get("username") or "",
                "email": payload.get("email") or user_row.get("email") or "",
                "full_name": user_row.get("full_name") or payload.get("username") or "",
                "role": payload.get("role") or user_row.get("role") or "user",
                "is_pro": is_pro_flag,
                "plan_tier": p_tier,
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
                user_row = _find_user_by_id(user_id) or {}
                p_tier = str(user_row.get("plan_tier") or meta.get("plan_tier") or ("pro" if (meta.get("is_pro") or user_row.get("is_pro")) else "basic")).lower().strip()
                if p_tier not in ("basic", "plus", "pro"):
                    p_tier = "basic"
                is_pro_flag = bool(meta.get("is_pro") or user_row.get("is_pro", False) or p_tier == "pro")
                return {
                    "id": user_id,
                    "username": meta.get("username") or user_row.get("username") or "",
                    "email": sb_user.email or user_row.get("email") or "",
                    "full_name": meta.get("full_name") or user_row.get("full_name") or "",
                    "role": meta.get("role") or user_row.get("role") or "user",
                    "is_pro": is_pro_flag,
                    "plan_tier": p_tier,
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
    # 1. Primary DB (Supabase / Fallback)
    try:
        res = db.table("users").select("*").eq("id", clean_id).limit(1).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as exc:
        logger.debug(f"[Auth] DB id sorgusu: {exc}")

    # 2. Local DB
    try:
        local_res = _local_auth_db.table("users").select("*").eq("id", clean_id).limit(1).execute()
        if local_res.data and len(local_res.data) > 0:
            return local_res.data[0]
    except Exception as exc:
        logger.debug(f"[Auth] Yerel DB id sorgusu: {exc}")

    return None


def _find_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    normalized = email.strip().lower()
    db = get_db()
    # 1. Primary DB (Supabase / Fallback)
    try:
        res = db.table("users").select("*").eq("email", normalized).limit(1).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as exc:
        logger.debug(f"[Auth] DB email sorgusu: {exc}")

    # 2. Local DB
    try:
        local_res = _local_auth_db.table("users").select("*").eq("email", normalized).limit(1).execute()
        if local_res.data and len(local_res.data) > 0:
            return local_res.data[0]
    except Exception as exc:
        logger.debug(f"[Auth] Yerel DB email sorgusu: {exc}")

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
        logger.debug(f"[Auth] DB username sorgusu: {exc}")

    try:
        local_res = _local_auth_db.table("users").select("*").eq("username", normalized).limit(1).execute()
        if local_res.data and len(local_res.data) > 0:
            return local_res.data[0]
    except Exception as exc:
        logger.debug(f"[Auth] Yerel DB username sorgusu: {exc}")

    return None


# =========================================================================
# 1. KAYIT ENDPOINT'İ (E-posta Onaylı & Non-Unique Username)
# =========================================================================
@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_200_OK)
def register_user(payload: RegisterRequest) -> AuthResponse:
    """
    Kullaniciyi secilen plan (basic, plus, pro) ile kaydeder ve beklemeden aninda token ile oturum acar.
    """
    clean_username = payload.username.strip()
    clean_full_name = payload.full_name.strip()
    clean_email = str(payload.email).strip().lower() if payload.email else f"{clean_username.lower()}@vocaship.local"

    # plan_tier kontrolü ('basic' | 'plus' | 'pro')
    raw_plan = str(payload.plan_tier or "basic").lower().strip()
    plan_tier = raw_plan if raw_plan in ("basic", "plus", "pro") else "basic"
    is_pro_val = (plan_tier == "pro")

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

    # E-posta daha once alinmis mi kontrolu (Tekil Kimlik)
    existing_user_by_email = _find_user_by_email(clean_email)
    if existing_user_by_email:
        # Eğer varsa kullanıcı bilgilerini güncelle ve doğrudan oturum açtır
        user_id = str(existing_user_by_email.get("id"))
        updates = {
            "plan_tier": plan_tier,
            "is_pro": is_pro_val,
            "is_educator": is_pro_val,
        }
        db = get_db()
        try:
            db.table("users").update(updates).eq("id", user_id).execute()
        except Exception:
            pass
        try:
            _local_auth_db.table("users").update(updates).eq("id", user_id).execute()
        except Exception:
            pass
        
        token = create_access_token(
            user_id=user_id,
            username=clean_username,
            role="user",
            is_pro=is_pro_val,
            email=clean_email,
            plan_tier=plan_tier,
        )
        user_resp = UserResponse(
            id=user_id,
            full_name=clean_full_name,
            username=clean_username,
            email=clean_email,
            role="user",
            is_pro=is_pro_val,
            plan_tier=plan_tier,
            avatar_url=existing_user_by_email.get("avatar_url"),
        )
        return AuthResponse(
            user_id=user_id,
            username=clean_username,
            full_name=clean_full_name,
            email=clean_email,
            role="user",
            is_pro=is_pro_val,
            is_educator=is_pro_val,
            plan_tier=plan_tier,
            avatar_url=existing_user_by_email.get("avatar_url"),
            token=token,
            message="Kayıt başarılı! Oturumunuz açıldı.",
            user=user_resp,
        )

    user_id = str(uuid.uuid4())
    supabase_client = get_supabase_client()

    # 1. Supabase Auth servisine kayıt
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
                        "is_pro": is_pro_val,
                    }
                },
            }
            res = supabase_client.auth.sign_up(sign_up_payload)
            if res and res.user:
                user_id = str(res.user.id)
                logger.info(f"[Auth] Supabase kullanıcısı başarıyla kaydedildi: {clean_email} ({user_id})")
        except Exception as exc:
            logger.warning(f"[Auth] Supabase sign_up uyarısı: {exc}")

    # 2. Veritabanı Kullanıcı Profil Tablosu Kaydı (public.users)
    pwd_hash = hash_password(payload.password)
    today_str = date.today().isoformat()

    full_user_record: Dict[str, Any] = {
        "id": user_id,
        "email": clean_email,
        "username": clean_username,
        "full_name": clean_full_name,
        "password_hash": pwd_hash,
        "role": "user",
        "is_pro": is_pro_val,
        "is_educator": is_pro_val,
        "plan_tier": plan_tier,
        "avatar_url": None,
        "email_confirmed": 1,
        "daily_custom_texts_used": 0,
        "daily_speaking_sessions_used": 0,
        "last_quota_reset_date": today_str,
    }

    db = get_db()
    # Supabase public.users
    try:
        db.table("users").insert(full_user_record).execute()
    except Exception as exc:
        logger.warning(f"[Auth] Supabase users tablosu kaydı: {exc}")
        try:
            db.table("users").update(full_user_record).eq("id", user_id).execute()
        except Exception:
            pass

    # Yerel SQLite veritabanı yedeği
    try:
        _local_auth_db.table("users").insert(full_user_record).execute()
    except Exception:
        try:
            _local_auth_db.table("users").update(full_user_record).eq("email", clean_email).execute()
        except Exception as local_exc:
            logger.warning(f"[Auth] Yerel DB kayıt uyarısı: {local_exc}")

    # 3. Yanıt Oluşturma: Doğrudan oturum açtıran access token üret
    token = create_access_token(
        user_id=user_id,
        username=clean_username,
        role="user",
        is_pro=is_pro_val,
        email=clean_email,
        plan_tier=plan_tier,
    )

    user_resp = UserResponse(
        id=user_id,
        full_name=clean_full_name,
        username=clean_username,
        email=clean_email,
        role="user",
        is_pro=is_pro_val,
        plan_tier=plan_tier,
        avatar_url=None,
    )

    return AuthResponse(
        user_id=user_id,
        username=clean_username,
        full_name=clean_full_name,
        email=clean_email,
        role="user",
        is_pro=is_pro_val,
        is_educator=is_pro_val,
        plan_tier=plan_tier,
        avatar_url=None,
        token=token,
        message="Kayıt başarılı! Oturumunuz açıldı.",
        user=user_resp,
    )


# =========================================================================
# 2. GİRİŞ ENDPOINT'İ (E-posta Onay Kontrollü)
# =========================================================================
@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
def login_user(payload: LoginRequest) -> AuthResponse:
    """
    Kullanicinin e-posta ve sifre ile giris yapmasini saglar.
    E-posta dogrulanmamissa oturum actirmaz ve HTTP 403 Forbidden doner.
    """
    # 1. Giriş yapılacak e-posta adresini belirle
    target_email = ""
    if payload.email:
        target_email = str(payload.email).strip().lower()
    elif payload.username:
        candidate = payload.username.strip().lower()
        if "@" in candidate:
            target_email = candidate
        else:
            # Kullanıcı adı ile eşleşen kullanıcıyı bul
            user_row = _find_user_by_username(candidate)
            if user_row and user_row.get("email"):
                target_email = str(user_row["email"]).strip().lower()

    if not target_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Giriş yapmak için lütfen geçerli bir e-posta adresi belirtin.",
        )

    supabase_client = get_supabase_client()
    user_row: Optional[Dict[str, Any]] = None
    is_confirmed = False

    # 2. Supabase Auth ile Giriş Denemesi
    if supabase_client:
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
                        detail="E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzdaki aktivasyon linkine tıklayın.",
                    )
                is_confirmed = True
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
                    detail="E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzdaki aktivasyon linkine tıklayın.",
                )
            logger.info(f"[Auth] Supabase sign_in AuthApiError (yerel DB kontrol edilecek): {auth_err}")
        except HTTPException:
            raise
        except Exception as exc:
            logger.warning(f"[Auth] Supabase sign_in genel hatası: {exc}")

    # 3. Fallback: Yerel veya Veritabanı Şifre Doğrulaması
    if not user_row:
        user_row = _find_user_by_email(target_email)
        if not user_row:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-posta veya şifre hatalı.",
            )

        stored_hash = user_row.get("password_hash")
        if not stored_hash or not verify_password(payload.password, str(stored_hash)):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-posta veya şifre hatalı.",
            )

        # Yerel doğrulama durumunda e-posta kontrolü
        # Seeded varsayılan kullanıcılar (user@quizwise.com vb.) hariç
        is_seed_user = target_email in ("user@quizwise.com", "pro@vocaship.com")
        has_email_confirmed = bool(user_row.get("email_confirmed") or user_row.get("email_confirmed_at"))
        if not is_seed_user and not has_email_confirmed and not is_confirmed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzdaki aktivasyon linkine tıklayın.",
            )

    final_user_id = str(user_row.get("id") or "")
    final_email = str(user_row.get("email") or target_email)
    final_username = str(user_row.get("username") or final_email.split("@")[0])
    final_full_name = str(user_row.get("full_name") or final_username)
    final_role = str(user_row.get("role") or "user")
    final_is_pro = bool(user_row.get("is_pro", False))
    final_is_educator = bool(user_row.get("is_educator", False))
    final_avatar = user_row.get("avatar_url")
    final_plan_tier = str(user_row.get("plan_tier") or ("pro" if final_is_pro else "basic")).lower().strip()
    if final_plan_tier not in ("basic", "plus", "pro"):
        final_plan_tier = "basic"
    if final_is_pro and final_plan_tier != "pro":
        final_plan_tier = "pro"

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
        avatar_url=final_avatar,
        token=token,
        message="Giriş başarılı.",
        user=user_resp,
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
    updated_user = _find_user_by_id(user_id) or {}

    final_full_name = str(update_data.get("full_name") or updated_user.get("full_name") or current_user.get("full_name") or "")
    final_username = str(update_data.get("username") or updated_user.get("username") or current_user.get("username") or "")
    final_email = str(updated_user.get("email") or current_user.get("email") or "")
    final_role = str(updated_user.get("role") or current_user.get("role") or "user")
    final_is_pro = bool(updated_user.get("is_pro", current_user.get("is_pro", False)))
    final_avatar = update_data.get("avatar_url", updated_user.get("avatar_url"))

    p_tier = str(update_data.get("plan_tier") or updated_user.get("plan_tier") or current_user.get("plan_tier") or ("pro" if final_is_pro else "basic")).lower()

    return UserResponse(
        id=user_id,
        full_name=final_full_name,
        username=final_username,
        email=final_email,
        role=final_role,
        is_pro=final_is_pro,
        plan_tier=p_tier,
        avatar_url=final_avatar,
    )


# =========================================================================
# 4. KULLANICI PROFİL GETİR (GET /api/v1/auth/profile & GET /api/v1/auth/me)
# =========================================================================
@router.get("/profile", response_model=UserResponse, status_code=status.HTTP_200_OK)
@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)) -> UserResponse:
    """
    Oturum acmis kullanicinin profil bilgilerini dondurur.
    """
    user_id = str(current_user["id"])
    user_row = _find_user_by_id(user_id) or {}
    p_tier = str(user_row.get("plan_tier") or current_user.get("plan_tier") or ("pro" if (current_user.get("is_pro") or user_row.get("is_pro")) else "basic")).lower()
    return UserResponse(
        id=user_id,
        full_name=str(user_row.get("full_name") or current_user.get("full_name") or ""),
        username=str(user_row.get("username") or current_user.get("username") or ""),
        email=str(user_row.get("email") or current_user.get("email") or ""),
        role=str(user_row.get("role") or current_user.get("role") or "user"),
        is_pro=bool(user_row.get("is_pro", current_user.get("is_pro", False))),
        plan_tier=p_tier,
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
