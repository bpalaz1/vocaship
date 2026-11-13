import os
import logging
from datetime import date
from typing import Dict, Any, Optional, Literal
import jwt
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse

from app.core.database import get_db
from app.core.local_db import LocalDatabaseClient

logger = logging.getLogger("vocaship.quota")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "vorego-super-secret-jwt-key-2026")
JWT_ALGORITHM = "HS256"

MAX_DAILY_CUSTOM_TEXTS = 1
MAX_DAILY_SPEAKING_SESSIONS = 1
MAX_FLASHCARD_POOL = 50

PLAN_LIMITS: Dict[str, Dict[str, Any]] = {
    "basic": {
        "max_daily_texts": 1,
        "max_daily_speaking": 1,
        "max_flashcards": 50,
        "allow_classroom": False,
    },
    "plus": {
        "max_daily_texts": 5,
        "max_daily_speaking": 3,
        "max_flashcards": 500,
        "allow_classroom": False,
    },
    "pro": {
        "max_daily_texts": 999999,
        "max_daily_speaking": 999999,
        "max_flashcards": 999999,
        "allow_classroom": True,
    },
}

_local_quota_db = LocalDatabaseClient()


class QuotaExceededException(HTTPException):
    def __init__(
        self,
        quota_type: Literal["text", "speaking", "flashcards"],
        tier: str = "basic",
        limit: int = 1,
    ):
        payload = {
            "detail": "QUOTA_EXCEEDED",
            "quota_type": quota_type,
            "plan_tier": tier,
            "limit": limit,
            "message": f"{tier.upper()} planınızdaki günlük kullanım sınırına ulaştınız ({limit}). PRO üyeliğe geçerek sınırsız erişebilirsiniz.",
        }
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=payload)
        self.payload = payload


class ProRequiredException(HTTPException):
    def __init__(self):
        payload = {
            "detail": "PRO_REQUIRED",
            "message": "Sınıf açmak ve ödev atamak için PRO Eğitmen hesabı gereklidir.",
        }
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=payload)
        self.payload = payload


def _extract_token_payload(request: Request) -> Optional[Dict[str, Any]]:
    auth_header = request.headers.get("Authorization") or ""
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        if token:
            try:
                return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            except Exception as exc:
                logger.debug(f"[Quota] JWT decode uyarısı: {exc}")
    return None


def get_user_record_from_request(request: Request) -> Optional[Dict[str, Any]]:
    token_data = _extract_token_payload(request)
    user_id = (
        (token_data.get("sub") if token_data else None)
        or request.headers.get("X-User-Id")
        or None
    )
    username = (
        (token_data.get("username") if token_data else None)
        or request.headers.get("X-Username")
        or None
    )

    if not user_id and not username:
        return None

    db = get_db()

    # 1. Primary DB lookup
    try:
        if user_id:
            res = db.table("users").select("*").eq("id", user_id).limit(1).execute()
            if res.data:
                return res.data[0]
        if username:
            res = db.table("users").select("*").eq("username", username.lower()).limit(1).execute()
            if res.data:
                return res.data[0]
    except Exception as exc:
        logger.debug(f"[Quota] Primary DB kullanıcı sorgusu uyarısı: {exc}")

    # 2. Local SQLite lookup
    try:
        if user_id:
            l_res = _local_quota_db.table("users").select("*").eq("id", user_id).limit(1).execute()
            if l_res.data:
                return l_res.data[0]
        if username:
            l_res = (
                _local_quota_db.table("users")
                .select("*")
                .eq("username", username.lower())
                .limit(1)
                .execute()
            )
            if l_res.data:
                return l_res.data[0]
    except Exception as exc:
        logger.debug(f"[Quota] Local DB kullanıcı sorgusu uyarısı: {exc}")

    return None


def _update_user_fields(user_id: str, updates: Dict[str, Any]) -> None:
    db = get_db()
    try:
        db.table("users").update(updates).eq("id", user_id).execute()
    except Exception as exc:
        logger.debug(f"[Quota] Primary DB update uyarısı: {exc}")

    try:
        _local_quota_db.table("users").update(updates).eq("id", user_id).execute()
    except Exception as exc:
        logger.debug(f"[Quota] Local DB update uyarısı: {exc}")


def reset_daily_quota_if_needed(user_row: Dict[str, Any]) -> Dict[str, Any]:
    """
    Eğer last_quota_reset_date < CURRENT_DATE ise daily_custom_texts_used = 0,
    daily_speaking_sessions_used = 0 yapar ve tarihi bugüne günceller.
    """
    today_str = date.today().isoformat()
    last_reset = str(user_row.get("last_quota_reset_date") or "")

    if not last_reset or last_reset < today_str:
        updates = {
            "daily_custom_texts_used": 0,
            "daily_speaking_sessions_used": 0,
            "last_quota_reset_date": today_str,
        }
        user_id = str(user_row.get("id") or "")
        if user_id:
            _update_user_fields(user_id, updates)
        user_row = {**user_row, **updates}

    return user_row


def get_user_plan_tier(request: Request, user_row: Optional[Dict[str, Any]] = None) -> str:
    header_tier = (request.headers.get("X-Plan-Tier") or "").lower().strip()
    if header_tier in ("basic", "plus", "pro"):
        return header_tier

    header_pro = (request.headers.get("X-Is-Pro") or "").lower().strip()
    if header_pro in ("true", "1", "yes"):
        return "pro"

    token_data = _extract_token_payload(request)
    if token_data:
        if token_data.get("role") == "admin" or bool(token_data.get("is_pro")):
            return "pro"
        t_tier = str(token_data.get("plan_tier") or "").lower().strip()
        if t_tier in ("basic", "plus", "pro"):
            return t_tier

    if user_row is None:
        user_row = get_user_record_from_request(request)

    if user_row:
        if bool(user_row.get("is_pro")) or str(user_row.get("role")) == "admin":
            return "pro"
        u_tier = str(user_row.get("plan_tier") or "").lower().strip()
        if u_tier in ("basic", "plus", "pro"):
            return u_tier

    return "basic"


def is_user_pro_or_admin(request: Request, user_row: Optional[Dict[str, Any]] = None) -> bool:
    return get_user_plan_tier(request, user_row) == "pro"


def check_and_consume_quota(
    request: Request,
    quota_type: Literal["text", "speaking", "flashcards"],
    increment: bool = True,
) -> None:
    """
    Kullanıcının günlük kotasını plan_tier ('basic', 'plus', 'pro') bazında kontrol eder:
    - basic: 1 AI hikaye, 1 Speaking seansı, maks. 50 kart
    - plus: 5 AI hikaye, 3 Speaking seansı, maks. 500 kart
    - pro: Sınırsız
    """
    user_row = get_user_record_from_request(request)
    if not user_row:
        # Oturum açmamış / anonim isteklerde mevcut akışı bozma
        return

    user_row = reset_daily_quota_if_needed(user_row)
    tier = get_user_plan_tier(request, user_row)

    if tier == "pro" or str(user_row.get("role")) == "admin":
        return

    limits = PLAN_LIMITS.get(tier, PLAN_LIMITS["basic"])
    user_id = str(user_row.get("id") or "")

    if quota_type == "text":
        used = int(user_row.get("daily_custom_texts_used") or 0)
        max_limit = limits["max_daily_texts"]
        if used >= max_limit:
            raise QuotaExceededException("text", tier=tier, limit=max_limit)
        if increment and user_id:
            _update_user_fields(user_id, {"daily_custom_texts_used": used + 1})

    elif quota_type == "speaking":
        used = int(user_row.get("daily_speaking_sessions_used") or 0)
        max_limit = limits["max_daily_speaking"]
        if used >= max_limit:
            raise QuotaExceededException("speaking", tier=tier, limit=max_limit)
        if increment and user_id:
            _update_user_fields(user_id, {"daily_speaking_sessions_used": used + 1})

    elif quota_type == "flashcards":
        try:
            db = get_db()
            cards_res = db.table("flashcards").select("id", count="exact").execute()
            total_cards = cards_res.count if cards_res.count is not None else len(cards_res.data or [])
            max_limit = limits["max_flashcards"]
            if total_cards >= max_limit:
                raise QuotaExceededException("flashcards", tier=tier, limit=max_limit)
        except QuotaExceededException:
            raise
        except Exception:
            pass


def require_pro_for_classroom(request: Request) -> Optional[Dict[str, Any]]:
    """
    POST /api/v1/classroom/classes için PRO veya admin yetkisi doğrular.
    Basic veya Plus üyeler sınıf açamaz (ProRequiredException döner).
    Sınıf açıldığında kullanıcının is_educator ve is_pro değerini otomatik True yapar.
    """
    user_row = get_user_record_from_request(request)
    tier = get_user_plan_tier(request, user_row)

    if tier != "pro":
        raise ProRequiredException()

    if user_row and user_row.get("id"):
        _update_user_fields(str(user_row["id"]), {"is_educator": True, "is_pro": True, "plan_tier": "pro"})

    return user_row

