from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from app.core import database as db_module
from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.services.telemetry_service import record_telemetry, fetch_recent_telemetry

router = APIRouter()

ADMIN_EMAIL = "bpalaz1@gmail.com"


class TelemetryPingPayload(BaseModel):
    country_code: Optional[str] = None
    city: Optional[str] = None
    user_id: Optional[str] = None
    path: Optional[str] = None


def _get_field(obj: Any, key: str, default: str = "") -> str:
    if isinstance(obj, dict):
        val = obj.get(key)
    else:
        val = getattr(obj, key, None)
    return str(val).strip() if val is not None else default


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Yalnızca bpalaz1@gmail.com veya role=='admin' hesabına erişim izni verir."""
    email = _get_field(current_user, "email").lower()
    role = _get_field(current_user, "role").lower()
    if email != ADMIN_EMAIL and role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu alana yalnızca sistem yöneticisi erişebilir.",
        )
    return current_user


def _parse_dt(raw: Any) -> Optional[datetime]:
    if not raw:
        return None
    try:
        s = str(raw).strip()
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        dt = datetime.fromisoformat(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        return None


def _recommendation_for_event(event_type: str, severity: str) -> str:
    et = (event_type or "").upper()
    if "DB_FALLBACK" in et or "DATABASE" in et:
        return "Render ortam değişkenlerindeki SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY değerlerini doğrulayın."
    if "QUOTA" in et:
        return "Ücretsiz plan limitine takılan kullanıcıları inceleyin; PRO dönüşüm fırsatlarını değerlendirin."
    if "GEMINI" in et or "AI" in et:
        return "Gemini API anahtarı kotasını ve rate-limit durumunu Google AI Studio üzerinden kontrol edin."
    if "500" in et or severity == "critical":
        return "Render sunucu loglarını kontrol edip hata fırlatan endpoint'i inceleyin."
    return "Anomali takibini sürdürün; tekrar ederse ilgili endpoint loglarını inceleyin."


@router.post("/ping", status_code=status.HTTP_200_OK)
async def telemetry_ping(
    request: Request,
    payload: Optional[TelemetryPingPayload] = None,
):
    """
    Herkese açık hafif ziyaret & coğrafi konum kaydı.
    Hata olursa ana akışı asla yavaşlatmaz veya bloklamaz.
    """
    try:
        raw_country = (
            (payload.country_code if payload else None)
            or request.headers.get("x-vercel-ip-country")
            or request.headers.get("cf-ipcountry")
            or "TR"
        )
        raw_city = (
            (payload.city if payload else None)
            or request.headers.get("x-vercel-ip-city")
            or ""
        )
        raw_uid = payload.user_id if payload else None
        raw_path = (payload.path if payload else None) or "/"

        record_telemetry(
            event_type="visit",
            severity="info",
            message="Site ziyareti",
            country_code=raw_country,
            city=raw_city,
            user_id=raw_uid,
            path=raw_path,
        )
        return {"ok": True, "country_code": str(raw_country).strip().upper()}
    except Exception:
        return {"ok": True}


@router.get("/overview", status_code=status.HTTP_200_OK)
async def get_admin_overview(
    db: Any = Depends(get_db),
    _admin: dict = Depends(require_admin),
):
    """
    Admin Kontrol & Erken Uyarı Merkezi için tek çağrıda tüm sistem özetini döner.
    """
    now_utc = datetime.now(timezone.utc)
    today_str = date.today().isoformat()
    cutoff_24h = now_utc - timedelta(hours=24)

    # 1. Sistem Sağlığı
    is_fallback = type(db).__name__ in ("FallbackDB", "FallbackDatabaseClient")
    system_health = {
        "db_mode": "fallback" if is_fallback else "supabase",
        "db_error": db_module.DB_INIT_ERROR,
        "server_time": now_utc.isoformat(),
    }

    # 2 & 3. Kullanıcı Özeti & Bugünkü Kota Tüketimi
    users_rows: List[Dict[str, Any]] = []
    try:
        res = db.table("users").select("*").execute()
        users_rows = res.data or []
    except Exception:
        users_rows = []

    total_users = len(users_rows)
    pro_users = 0
    free_users = 0
    active_today_ids = set()

    custom_texts_today = 0
    ai_stories_today = 0
    speaking_sessions_today = 0
    quota_consumers: List[Dict[str, Any]] = []

    for u in users_rows:
        uid = str(u.get("id") or "")
        role = str(u.get("role") or "user").lower().strip()
        sub_status = str(u.get("subscription_status") or "").lower().strip()
        plan_tier = str(u.get("plan_tier") or "").lower().strip()
        is_pro_user = (
            role == "admin"
            or bool(u.get("is_pro"))
            or plan_tier == "pro"
            or sub_status in ("active", "trial")
        )
        if is_pro_user:
            pro_users += 1
        else:
            free_users += 1

        last_reset = str(u.get("last_quota_reset_date") or "").strip()
        created_at = str(u.get("created_at") or "").strip()
        is_reset_today = last_reset.startswith(today_str)

        if is_reset_today or created_at.startswith(today_str):
            if uid:
                active_today_ids.add(uid)

        texts_used = int(u.get("daily_custom_texts_used") or 0) if is_reset_today else 0
        stories_used = int(u.get("daily_ai_stories_used") or 0) if is_reset_today else 0
        speaking_used = int(u.get("daily_speaking_sessions_used") or 0) if is_reset_today else 0

        custom_texts_today += texts_used
        ai_stories_today += stories_used
        speaking_sessions_today += speaking_used

        total_u_today = texts_used + stories_used + speaking_used
        if total_u_today > 0:
            if uid:
                active_today_ids.add(uid)
            quota_consumers.append(
                {
                    "id": uid,
                    "username": u.get("username") or "",
                    "full_name": u.get("full_name") or u.get("username") or "Kullanıcı",
                    "email": u.get("email") or "",
                    "plan_tier": "pro" if is_pro_user else "free",
                    "custom_texts": texts_used,
                    "ai_stories": stories_used,
                    "speaking_sessions": speaking_used,
                    "total_today": total_u_today,
                }
            )

    quota_consumers.sort(key=lambda item: item["total_today"], reverse=True)

    # 4. Canlı Dersler (class_sessions)
    active_rooms: List[Dict[str, Any]] = []
    try:
        sess_res = db.table("class_sessions").select("*").execute()
        all_sessions = sess_res.data or []
        for s in all_sessions:
            st = str(s.get("status") or "").lower().strip()
            if st in ("live", "active", "in_progress", "ongoing"):
                active_rooms.append(
                    {
                        "id": str(s.get("id") or ""),
                        "class_id": str(s.get("class_id") or ""),
                        "title": s.get("title") or s.get("class_name") or "Canlı Ders",
                        "status": st,
                        "started_at": s.get("started_at") or s.get("session_date_utc") or s.get("created_at"),
                    }
                )
    except Exception:
        active_rooms = []

    # 5 & 6. Telemetri: Ülkeler (7g & 24s) ve Erken Uyarılar (24s)
    telemetry_7d = fetch_recent_telemetry(db, hours=168)
    country_counts_7d: Dict[str, int] = {}
    country_counts_24h: Dict[str, int] = {}
    warning_items: List[Dict[str, Any]] = []

    for ev in telemetry_7d:
        ev_dt = _parse_dt(ev.get("created_at"))
        is_24h = bool(ev_dt and ev_dt >= cutoff_24h)
        ev_uid = str(ev.get("user_id") or "").strip()
        if is_24h and ev_uid:
            active_today_ids.add(ev_uid)

        cc = str(ev.get("country_code") or "").strip().upper()
        if cc and cc not in ("UNKNOWN", "XX", "NULL", "NONE"):
            country_counts_7d[cc] = country_counts_7d.get(cc, 0) + 1
            if is_24h:
                country_counts_24h[cc] = country_counts_24h.get(cc, 0) + 1

        sev = str(ev.get("severity") or "info").lower().strip()
        if is_24h and sev in ("critical", "warning"):
            et = str(ev.get("event_type") or "RISK")
            warning_items.append(
                {
                    "id": str(ev.get("id") or f"warn-{len(warning_items)}"),
                    "severity": sev,
                    "event_type": et,
                    "message": str(ev.get("message") or et),
                    "recommendation": _recommendation_for_event(et, sev),
                    "path": ev.get("path"),
                    "user_id": ev_uid or None,
                    "country_code": cc or None,
                    "created_at": ev.get("created_at") or now_utc.isoformat(),
                }
            )

    # Eğer FallbackDB aktifse en üst sıraya otomatik KRİTİK RİSK alarmı ekle
    if is_fallback:
        warning_items.insert(
            0,
            {
                "id": "critical-db-fallback",
                "severity": "critical",
                "event_type": "DB_FALLBACK",
                "message": f"KRİTİK RİSK: Backend geçici FallbackDB modunda çalışıyor! ({db_module.DB_INIT_ERROR or 'Supabase bağlantısı kurulamadı'})",
                "recommendation": _recommendation_for_event("DB_FALLBACK", "critical"),
                "path": "/health",
                "user_id": None,
                "country_code": None,
                "created_at": now_utc.isoformat(),
            },
        )

    total_country_hits_7d = sum(country_counts_7d.values())
    total_country_hits_24h = sum(country_counts_24h.values())
    countries_list = [
        {
            "country": cc,
            "count": cnt,
            "count_24h": country_counts_24h.get(cc, 0),
            "percentage": round((cnt / total_country_hits_7d) * 100, 1) if total_country_hits_7d > 0 else 0.0,
        }
        for cc, cnt in sorted(country_counts_7d.items(), key=lambda kv: kv[1], reverse=True)
    ]

    critical_count = sum(1 for w in warning_items if w["severity"] == "critical")
    warning_count = sum(1 for w in warning_items if w["severity"] == "warning")
    if is_fallback or critical_count > 0 or warning_count >= 10:
        risk_score = "HIGH"
    elif warning_count > 0:
        risk_score = "MEDIUM"
    else:
        risk_score = "LOW"

    return {
        "system_health": system_health,
        "users_summary": {
            "total_users": total_users,
            "pro_users": pro_users,
            "free_users": free_users,
            "active_today_count": len(active_today_ids),
        },
        "quota_usage_today": {
            "custom_texts_today": custom_texts_today,
            "ai_stories_today": ai_stories_today,
            "speaking_sessions_today": speaking_sessions_today,
            "top_quota_users": quota_consumers[:5],
        },
        "live_classes": {
            "active_sessions_count": len(active_rooms),
            "active_rooms": active_rooms,
        },
        "countries": countries_list,
        "countries_meta": {
            "total_7d": total_country_hits_7d,
            "total_24h": total_country_hits_24h,
        },
        "early_warnings": {
            "risk_score": risk_score,
            "critical_count": critical_count,
            "warning_count": warning_count,
            "items": warning_items[:40],
        },
    }
