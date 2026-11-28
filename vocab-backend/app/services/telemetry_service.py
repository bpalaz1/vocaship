import logging
from collections import deque
from datetime import datetime, timedelta, timezone
from typing import Any, Deque, Dict, List, Optional
from app.core import database as db_module

logger = logging.getLogger("vocaship.telemetry")

# Supabase system_telemetry tablosu henüz yoksa veya geçici hata verirse bellek içi yedek tampon
_RECENT_TELEMETRY: Deque[Dict[str, Any]] = deque(maxlen=500)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _normalize_country(country_code: Optional[str]) -> Optional[str]:
    if not country_code:
        return None
    clean = str(country_code).strip().upper()
    if not clean or clean in ("UNKNOWN", "XX", "NULL", "NONE"):
        return None
    return clean[:8]


def record_telemetry(
    event_type: str,
    severity: str = "info",
    message: str = "",
    country_code: Optional[str] = None,
    city: Optional[str] = None,
    user_id: Optional[str] = None,
    path: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Hafif, bloklamayan telemetri ve risk olayı kaydedici.
    Ana akışı asla yavaşlatmaz veya hata fırlatmaz.
    """
    try:
        now_iso = _now_iso()
        cc = _normalize_country(country_code)
        clean_uid = str(user_id).strip() if user_id and str(user_id).strip() else None
        clean_city = str(city).strip()[:80] if city else ""
        clean_path = str(path).strip()[:200] if path else ""
        clean_msg = str(message or "").strip()[:500]
        clean_sev = str(severity or "info").strip().lower()
        clean_evt = str(event_type or "event").strip()[:80]

        mem_entry: Dict[str, Any] = {
            "id": f"mem-{int(datetime.now(timezone.utc).timestamp() * 1000)}-{len(_RECENT_TELEMETRY)}",
            "event_type": clean_evt,
            "severity": clean_sev,
            "message": clean_msg,
            "country_code": cc,
            "city": clean_city or None,
            "user_id": clean_uid,
            "path": clean_path or None,
            "metadata": metadata or {},
            "created_at": now_iso,
        }
        _RECENT_TELEMETRY.appendleft(mem_entry)

        # Kritik olaylarda opsiyonel webhook bildirimini arka planda tetikle
        if clean_sev == "critical":
            try:
                from app.core.runtime_guard import dispatch_critical_webhook

                dispatch_critical_webhook(clean_evt, clean_msg, path=clean_path or None)
            except Exception:
                pass

        db = db_module.get_db()
        if type(db).__name__ in ("FallbackDB", "FallbackDatabaseClient"):
            return

        full_row: Dict[str, Any] = {
            "event_type": clean_evt,
            "severity": clean_sev,
            "message": clean_msg,
            "country_code": cc,
            "city": clean_city or None,
            "user_id": clean_uid,
            "path": clean_path or None,
            "metadata": metadata or {},
        }
        minimal_row: Dict[str, Any] = {
            "event_type": clean_evt,
            "severity": clean_sev,
            "message": clean_msg,
            "country_code": cc,
            "user_id": clean_uid,
        }
        bare_row: Dict[str, Any] = {
            "event_type": clean_evt,
            "severity": clean_sev,
            "country_code": cc,
        }

        for candidate in (full_row, minimal_row, bare_row):
            try:
                db.table("system_telemetry").insert(candidate).execute()
                return
            except Exception:
                continue
    except Exception as exc:
        logger.debug(f"[Telemetry] Kayıt atlandı: {exc}")


def _parse_iso_dt(raw: Any) -> Optional[datetime]:
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


def fetch_recent_telemetry(db: Any, hours: int = 168) -> List[Dict[str, Any]]:
    """
    Son `hours` saatteki telemetri kayıtlarını Supabase system_telemetry tablosundan ve
    bellek tamponundan birleştirerek döner.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    cutoff_iso = cutoff.isoformat()
    rows: List[Dict[str, Any]] = []

    if type(db).__name__ not in ("FallbackDB", "FallbackDatabaseClient"):
        try:
            res = (
                db.table("system_telemetry")
                .select("*")
                .gte("created_at", cutoff_iso)
                .order("created_at", desc=True)
                .limit(1000)
                .execute()
            )
            if res.data:
                rows.extend(res.data)
        except Exception as exc:
            logger.debug(f"[Telemetry] DB okuma uyarısı: {exc}")

    # Bellek içi yedek kayıtları (DB tablosu yoksa veya henüz senkron değilse) birleştir
    if not rows:
        for item in list(_RECENT_TELEMETRY):
            dt = _parse_iso_dt(item.get("created_at"))
            if dt and dt >= cutoff:
                rows.append(item)

    return rows


def fetch_all_user_country_telemetry(db: Any) -> List[Dict[str, Any]]:
    """
    Tüm zamanlardaki user_id != NULL olan ülke bazlı gerçek kullanıcı kayıtlarını döner
    (Toplam ve Son 30 Gün tekil kullanıcı hesabı için).
    """
    rows: List[Dict[str, Any]] = []
    if type(db).__name__ not in ("FallbackDB", "FallbackDatabaseClient"):
        try:
            res = (
                db.table("system_telemetry")
                .select("user_id, country_code, event_type, created_at")
                .order("created_at", desc=True)
                .limit(10000)
                .execute()
            )
            if res.data:
                rows.extend(res.data)
        except Exception as exc:
            logger.debug(f"[Telemetry] Tüm zamanlar ülke sorgusu uyarısı: {exc}")

    if not rows:
        for item in list(_RECENT_TELEMETRY):
            rows.append(item)

    return rows


def clear_warning_telemetry(db: Any) -> int:
    """
    system_telemetry tablosundaki ve bellek tamponundaki severity='warning' veya 'critical'
    uyarı kayıtlarını temizler.
    """
    cleared_count = 0

    # 1. Bellek içi tamponu temizle
    try:
        kept = [
            item
            for item in list(_RECENT_TELEMETRY)
            if str(item.get("severity") or "").lower().strip() not in ("warning", "critical")
        ]
        removed_mem = len(_RECENT_TELEMETRY) - len(kept)
        _RECENT_TELEMETRY.clear()
        for item in kept:
            _RECENT_TELEMETRY.append(item)
        cleared_count += max(0, removed_mem)
    except Exception as exc:
        logger.debug(f"[Telemetry] Bellek temizleme uyarısı: {exc}")

    # 2. Supabase system_telemetry tablosundaki warning/critical kayıtlarını sil
    if type(db).__name__ not in ("FallbackDB", "FallbackDatabaseClient"):
        for sev in ("warning", "critical"):
            try:
                res = db.table("system_telemetry").delete().eq("severity", sev).execute()
                if res.data:
                    cleared_count += len(res.data)
            except Exception as exc:
                logger.debug(f"[Telemetry] DB '{sev}' silme uyarısı: {exc}")

    return cleared_count
