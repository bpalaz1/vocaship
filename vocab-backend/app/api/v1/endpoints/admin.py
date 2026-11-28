from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from app.core import database as db_module
from app.core.database import get_db
from app.core.runtime_guard import runtime_guard
from app.api.v1.endpoints.auth import get_current_user
from app.services.telemetry_service import (
    record_telemetry,
    fetch_recent_telemetry,
    clear_warning_telemetry,
)

router = APIRouter()

ADMIN_EMAIL = "bpalaz1@gmail.com"
BOT_UA_KEYWORDS = (
    "bot",
    "crawler",
    "spider",
    "vercel",
    "uptime",
    "health",
    "headless",
    "curl",
    "python",
)


class TelemetryPingPayload(BaseModel):
    country_code: Optional[str] = None
    city: Optional[str] = None
    user_id: Optional[str] = None
    path: Optional[str] = None


class ToggleAiGuardPayload(BaseModel):
    enabled: Optional[bool] = None


class SuspendUserPayload(BaseModel):
    user_id: Optional[str] = None
    ip: Optional[str] = None
    reason: Optional[str] = None


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
    Bot/sunucu pinglerini User-Agent filtresiyle eler; hata olursa ana akışı asla bloklamaz.
    """
    try:
        ua = (request.headers.get("user-agent") or "").strip().lower()
        if not ua or any(kw in ua for kw in BOT_UA_KEYWORDS):
            return {"status": "ignored_bot"}

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
            meta = ev.get("metadata") if isinstance(ev.get("metadata"), dict) else {}
            resolved_endpoint = str(
                ev.get("endpoint")
                or ev.get("path")
                or meta.get("endpoint")
                or meta.get("path")
                or ""
            ).strip() or None
            resolved_detail = str(
                ev.get("detail")
                or ev.get("message")
                or meta.get("detail")
                or et
            ).strip()
            warning_items.append(
                {
                    "id": str(ev.get("id") or f"warn-{len(warning_items)}"),
                    "severity": sev,
                    "event_type": et,
                    "endpoint": resolved_endpoint,
                    "detail": resolved_detail,
                    "message": resolved_detail,
                    "recommendation": _recommendation_for_event(et, sev),
                    "path": resolved_endpoint,
                    "user_id": ev_uid or None,
                    "ip": str(meta.get("ip") or "").strip() or None,
                    "country_code": cc or None,
                    "created_at": ev.get("created_at") or now_utc.isoformat(),
                }
            )

    # Eğer FallbackDB aktifse en üst sıraya otomatik KRİTİK RİSK alarmı ekle
    if is_fallback:
        db_detail = f"KRİTİK RİSK: Backend geçici FallbackDB modunda çalışıyor! ({db_module.DB_INIT_ERROR or 'Supabase bağlantısı kurulamadı'})"
        warning_items.insert(
            0,
            {
                "id": "critical-db-fallback",
                "severity": "critical",
                "event_type": "DB_FALLBACK",
                "endpoint": "GET /health",
                "detail": db_detail,
                "message": db_detail,
                "recommendation": _recommendation_for_event("DB_FALLBACK", "critical"),
                "path": "GET /health",
                "user_id": None,
                "ip": None,
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

    runtime_guard.hydrate_suspended_users(db)

    return {
        "system_health": system_health,
        "runtime_guard": runtime_guard.get_status(),
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


@router.post("/actions/toggle-ai-guard", status_code=status.HTTP_200_OK)
async def toggle_ai_guard(
    payload: Optional[ToggleAiGuardPayload] = None,
    _admin: dict = Depends(require_admin),
):
    """AI Güvenli Mod (ai_circuit_open) durumunu açar/kapatır ve telemetriye kaydeder."""
    current_active = runtime_guard.is_ai_circuit_active()
    next_state = (not current_active) if (payload is None or payload.enabled is None) else bool(payload.enabled)
    guard_state = runtime_guard.set_ai_circuit_manual(next_state)

    record_telemetry(
        event_type="admin_toggle_ai_guard",
        severity="warning" if next_state else "info",
        message=(
            "Admin AI Güvenli Mod (maliyet kilidi) devreye alındı."
            if next_state
            else "Admin AI Güvenli Mod (maliyet kilidi) kapatıldı; AI servisleri normale döndü."
        ),
        user_id=_get_field(_admin, "id") or None,
        path="/api/v1/admin/actions/toggle-ai-guard",
    )
    return {
        "ok": True,
        "ai_circuit_open": guard_state["ai_circuit_open"],
        "runtime_guard": guard_state,
        "message": (
            "AI Güvenli Mod AÇILDI — Yapay zekâ üretim uçları koruma altına alındı."
            if next_state
            else "AI Güvenli Mod KAPATILDI — Yapay zekâ servisleri yeniden aktif."
        ),
    }


@router.post("/actions/suspend-user", status_code=status.HTTP_200_OK)
async def suspend_user_or_ip(
    payload: SuspendUserPayload,
    db: Any = Depends(get_db),
    _admin: dict = Depends(require_admin),
):
    """Gönderilen user_id veya IP adresini anında blok listesine alır; users.role = 'suspended' yapar."""
    target_uid = (payload.user_id or "").strip()
    target_ip = (payload.ip or "").strip()
    if not target_uid and not target_ip:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Engellemek için en az bir user_id veya ip adresi belirtilmelidir.",
        )

    admin_uid = _get_field(_admin, "id")
    if target_uid and target_uid == admin_uid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sistem yöneticisi kendi hesabını askıya alamaz.",
        )

    if target_uid:
        # Süper admin e-postasını korumaya al
        try:
            u_res = db.table("users").select("email").eq("id", target_uid).limit(1).execute()
            if u_res.data and str(u_res.data[0].get("email") or "").strip().lower() == ADMIN_EMAIL:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Süper yönetici hesabı askıya alınamaz.",
                )
        except HTTPException:
            raise
        except Exception:
            pass
        runtime_guard.suspend_user(target_uid, db=db)

    if target_ip:
        runtime_guard.block_ip(target_ip, duration_seconds=900)

    reason = (payload.reason or "Admin tek tıkla acil müdahale").strip()
    record_telemetry(
        event_type="admin_suspend",
        severity="warning",
        message=f"Erişim durduruldu (user_id={target_uid or '-'}, ip={target_ip or '-'}): {reason}",
        user_id=target_uid or None,
        path="/api/v1/admin/actions/suspend-user",
        metadata={"ip": target_ip or None, "reason": reason},
    )
    return {
        "ok": True,
        "suspended_user_id": target_uid or None,
        "blocked_ip": target_ip or None,
        "runtime_guard": runtime_guard.get_status(),
        "message": "Erişim anında durduruldu ve blok listesine alındı.",
    }


@router.post("/actions/close-stale-rooms", status_code=status.HTTP_200_OK)
async def close_stale_rooms(
    db: Any = Depends(get_db),
    _admin: dict = Depends(require_admin),
):
    """class_sessions tablosundaki aktif görünen tüm dersleri sonlandırır (status='ended')."""
    closed_count = 0
    try:
        sess_res = db.table("class_sessions").select("id, status").execute()
        all_sessions = sess_res.data or []
        for s in all_sessions:
            st = str(s.get("status") or "").lower().strip()
            sid = s.get("id")
            if sid and st in ("live", "active", "in_progress", "ongoing"):
                try:
                    db.table("class_sessions").update({"status": "ended"}).eq("id", sid).execute()
                    closed_count += 1
                except Exception:
                    pass
    except Exception:
        pass

    # Bellek içi aktif ders kayıtlarını da temizle (varsa)
    try:
        from app.services import classroom_service

        for s in getattr(classroom_service, "IN_MEMORY_CLASS_SESSIONS", []):
            st = str(s.get("status") or "").lower().strip()
            if st in ("live", "active", "in_progress", "ongoing"):
                s["status"] = "ended"
    except Exception:
        pass

    record_telemetry(
        event_type="admin_close_stale_rooms",
        severity="info",
        message=f"Admin tarafından {closed_count} açık ders odası sonlandırıldı (status='ended').",
        user_id=_get_field(_admin, "id") or None,
        path="/api/v1/admin/actions/close-stale-rooms",
    )
    return {
        "ok": True,
        "closed_count": closed_count,
        "message": (
            f"{closed_count} açık ders odası başarıyla kapatıldı."
            if closed_count > 0
            else "Kapatılacak açık ders odası bulunamadı."
        ),
    }


@router.post("/actions/clear-warnings", status_code=status.HTTP_200_OK)
async def clear_warnings(
    db: Any = Depends(get_db),
    _admin: dict = Depends(require_admin),
):
    """system_telemetry tablosundaki warning ve critical uyarı kayıtlarını temizler."""
    cleared_count = clear_warning_telemetry(db)
    return {
        "ok": True,
        "cleared_count": cleared_count,
        "risk_score": "LOW",
        "message": (
            f"{cleared_count} uyarı kaydı temizlendi."
            if cleared_count > 0
            else "Temizlenecek aktif uyarı kaydı bulunamadı."
        ),
    }
