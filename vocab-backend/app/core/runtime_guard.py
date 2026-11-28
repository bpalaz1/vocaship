import os
import json
import time
import asyncio
import logging
import threading
import urllib.request
from collections import deque
from typing import Any, Deque, Dict, Optional, Set, Tuple

logger = logging.getLogger("vocaship.runtime_guard")

MODEL_CHAIN = [
    "gemini-flash-latest",
    "gemini-3.8-flash",
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash",
]

AI_PROTECTED_KEYWORDS = (
    "stories",
    "speaking",
    "writing",
    "analyze",
    "/ai/enrich",
    "/ai/generate",
    "/reading/generate",
)

RATE_GUARD_SKIP_PREFIXES = (
    "/health",
    "/api/v1/health",
    "/admin",
    "/api/v1/admin",
    "/auth/me",
    "/api/v1/auth/me",
)

AI_MAINTENANCE_MESSAGE = (
    "Yapay zekâ servisi yoğunluk nedeniyle kısa süreli bakımda, "
    "kelime ve canlı ders modüllerini kullanabilirsiniz."
)


def _post_webhook_sync(url: str, text: str) -> None:
    try:
        clean_url = url.strip()
        if not clean_url:
            return
        if "api.telegram.org" in clean_url:
            # Telegram sendMessage endpoint (chat_id query param veya ADMIN_ALERT_CHAT_ID)
            chat_id = os.getenv("ADMIN_ALERT_CHAT_ID", "").strip()
            body: Dict[str, Any] = {"text": text}
            if chat_id:
                body["chat_id"] = chat_id
        elif "discord.com/api/webhooks" in clean_url or "discordapp.com/api/webhooks" in clean_url:
            body = {"content": text}
        else:
            body = {"text": text, "content": text}

        data = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(
            clean_url,
            data=data,
            headers={"Content-Type": "application/json", "User-Agent": "VocaShip-Guard/1.0"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5):
            pass
    except Exception as exc:
        logger.debug(f"[Webhook] Bildirim gönderilemedi: {exc}")


async def _post_webhook_async(url: str, text: str) -> None:
    await asyncio.to_thread(_post_webhook_sync, url, text)


def dispatch_critical_webhook(event_type: str, message: str, path: Optional[str] = None) -> None:
    """
    ADMIN_ALERT_WEBHOOK_URL tanımlıysa severity=='critical' olaylarda arka planda
    (asyncio.create_task veya daemon thread ile) anlık bildirim gönderir.
    """
    webhook_url = (os.getenv("ADMIN_ALERT_WEBHOOK_URL") or "").strip()
    if not webhook_url:
        return

    text = f"🚨 [VocaShip KRİTİK UYARI] {event_type}\n{message}"
    if path:
        text += f"\nEndpoint: {path}"

    try:
        loop = asyncio.get_running_loop()
        loop.create_task(_post_webhook_async(webhook_url, text))
    except RuntimeError:
        t = threading.Thread(target=_post_webhook_sync, args=(webhook_url, text), daemon=True)
        t.start()
    except Exception as exc:
        logger.debug(f"[Webhook] Task başlatılamadı: {exc}")


class RuntimeGuard:
    """
    Bellek içi + Supabase destekli Self-Healing & Rate-Guard çalışma zamanı yöneticisi.
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self.ai_circuit_open: bool = False
        self.ai_circuit_auto_until: float = 0.0
        self.blocked_ips: Dict[str, float] = {}
        self.suspended_user_ids: Set[str] = set()
        self.last_used_model: str = "gemini-flash-latest"
        self.last_model_version: str = ""
        self._gemini_error_timestamps: Deque[float] = deque(maxlen=30)
        self._ai_recent_calls: Deque[Tuple[float, bool]] = deque(maxlen=200)
        self._ip_request_windows: Dict[str, Deque[float]] = {}
        self._suspended_hydrated: bool = False

    def _prune_locked(self, now: float) -> None:
        expired_ips = [ip for ip, until in self.blocked_ips.items() if until <= now]
        for ip in expired_ips:
            self.blocked_ips.pop(ip, None)

        if self.ai_circuit_auto_until and self.ai_circuit_auto_until <= now:
            self.ai_circuit_auto_until = 0.0

        while self._gemini_error_timestamps and now - self._gemini_error_timestamps[0] > 60.0:
            self._gemini_error_timestamps.popleft()

        while self._ai_recent_calls and now - self._ai_recent_calls[0][0] > 60.0:
            self._ai_recent_calls.popleft()

    def is_ai_circuit_active(self) -> bool:
        now = time.time()
        with self._lock:
            self._prune_locked(now)
            return self.ai_circuit_open or (self.ai_circuit_auto_until > now)

    def is_ai_protected_path(self, path: str) -> bool:
        p = (path or "").lower()
        return any(kw in p for kw in AI_PROTECTED_KEYWORDS)

    def set_ai_circuit_manual(self, enabled: bool) -> Dict[str, Any]:
        with self._lock:
            self.ai_circuit_open = bool(enabled)
            if not enabled:
                self.ai_circuit_auto_until = 0.0
                self._gemini_error_timestamps.clear()
        return self.get_status()

    def record_gemini_success(self) -> None:
        with self._lock:
            self._gemini_error_timestamps.clear()

    def record_ai_result(
        self,
        success: bool,
        actor: Optional[str] = None,
        detail: str = "",
        model_used: Optional[str] = None,
        model_version: Optional[str] = None,
    ) -> bool:
        """
        Her Gemini çağrısının sonucunu, kullanılan modeli ve Google'dan dönen gerçek
        model_version bilgisini kaydeder; son 1 dakikalık hata oranını günceller.
        """
        now = time.time()
        with self._lock:
            self._prune_locked(now)
            self._ai_recent_calls.append((now, bool(success)))
            if success:
                self._gemini_error_timestamps.clear()
                if model_used and str(model_used).strip():
                    self.last_used_model = str(model_used).strip()
                if model_version and str(model_version).strip():
                    self.last_model_version = str(model_version).strip()
                return False

        err_str = str(detail or "")
        if any(code in err_str for code in ("429", "503", "RESOURCE_EXHAUSTED", "UNAVAILABLE")):
            return self.record_gemini_error(err_str)
        return False

    def get_ai_error_rate_1m(self) -> float:
        now = time.time()
        with self._lock:
            self._prune_locked(now)
            total = len(self._ai_recent_calls)
            if total == 0:
                return 0.0
            failures = sum(1 for _, ok in self._ai_recent_calls if not ok)
            return round((failures / total) * 100.0, 1)

    def record_gemini_error(self, detail: str = "") -> bool:
        """
        1 dakikada 5+ ardışık Gemini 429/503 hatası olursa AI devre kesicisini
        3 dakikalığına (180 sn) otomatik açar ve telemetriye critical kayıt düşer.
        """
        now = time.time()
        auto_tripped = False
        with self._lock:
            self._prune_locked(now)
            self._gemini_error_timestamps.append(now)
            if len(self._gemini_error_timestamps) >= 5 and self.ai_circuit_auto_until <= now:
                self.ai_circuit_auto_until = now + 180.0
                auto_tripped = True

        if auto_tripped:
            try:
                from app.services.telemetry_service import record_telemetry

                record_telemetry(
                    event_type="auto_mitigation",
                    severity="critical",
                    message=(
                        "1 dakikada 5+ ardışık Gemini 429/503 hatası algılandı; "
                        "AI Güvenli Mod (circuit breaker) 3 dakikalığına otomatik devreye alındı. "
                        f"Son hata: {detail[:180]}"
                    ),
                    path="/ai/circuit-breaker",
                )
            except Exception:
                pass
        return auto_tripped

    def block_ip(self, ip: str, duration_seconds: int = 900) -> None:
        clean_ip = (ip or "").strip()
        if not clean_ip:
            return
        until = time.time() + max(60, int(duration_seconds))
        with self._lock:
            self.blocked_ips[clean_ip] = until

    def check_and_track_ip(self, ip: str, path: str) -> Tuple[bool, Optional[str]]:
        """
        IP blokluysa (True, mesaj) döner.
        Ayrıca 1 dakikada 30+ agresif API/AI isteği atan IP'yi 15 dakika otomatik bloklar
        ve system_telemetry tablosuna severity='critical', event_type='auto_mitigation' kaydeder.
        """
        clean_ip = (ip or "").strip()
        if not clean_ip or clean_ip in ("127.0.0.1", "::1", "localhost"):
            return False, None

        now = time.time()
        p = (path or "").lower()
        is_rate_checked = not any(p.startswith(pref) for pref in RATE_GUARD_SKIP_PREFIXES)
        newly_blocked = False

        with self._lock:
            self._prune_locked(now)
            if clean_ip in self.blocked_ips and self.blocked_ips[clean_ip] > now:
                remaining_min = max(1, int((self.blocked_ips[clean_ip] - now) / 60))
                return True, f"Aşırı istek nedeniyle IP erişiminiz geçici olarak kısıtlandı ({remaining_min} dk kaldı)."

            if is_rate_checked:
                win = self._ip_request_windows.get(clean_ip)
                if win is None:
                    win = deque(maxlen=60)
                    self._ip_request_windows[clean_ip] = win
                while win and now - win[0] > 60.0:
                    win.popleft()
                win.append(now)

                # 1 dakikada 30+ agresif AI/API isteği -> 15 dk otomatik blok
                if len(win) >= 30:
                    self.blocked_ips[clean_ip] = now + 900.0
                    win.clear()
                    newly_blocked = True

        if newly_blocked:
            try:
                from app.services.telemetry_service import record_telemetry

                record_telemetry(
                    event_type="auto_mitigation",
                    severity="critical",
                    message=(
                        f"Agresif trafik tespit edildi: {clean_ip} adresi 1 dakikada 30+ istek attığı için "
                        "15 dakika boyunca otomatik bloklandı."
                    ),
                    path=path,
                    metadata={"ip": clean_ip, "block_minutes": 15},
                )
            except Exception:
                pass
            return True, "Çok fazla agresif istek algılandı. IP adresiniz 15 dakika boyunca otomatik kısıtlandı."

        return False, None

    def hydrate_suspended_users(self, db: Any) -> None:
        if self._suspended_hydrated:
            return
        if type(db).__name__ in ("FallbackDB", "FallbackDatabaseClient"):
            return
        try:
            res = db.table("users").select("id").eq("role", "suspended").execute()
            ids = {str(r["id"]).strip() for r in (res.data or []) if r.get("id")}
            with self._lock:
                self.suspended_user_ids.update(ids)
                self._suspended_hydrated = True
        except Exception as exc:
            logger.debug(f"[RuntimeGuard] Suspended kullanıcılar yüklenemedi: {exc}")

    def suspend_user(self, user_id: str, db: Any = None) -> bool:
        uid = (user_id or "").strip()
        if not uid:
            return False
        with self._lock:
            self.suspended_user_ids.add(uid)

        db_updated = False
        if db is not None and type(db).__name__ not in ("FallbackDB", "FallbackDatabaseClient"):
            try:
                db.table("users").update({"role": "suspended"}).eq("id", uid).execute()
                db_updated = True
            except Exception as exc:
                logger.warning(f"[RuntimeGuard] users.role='suspended' güncellenemedi: {exc}")
        return db_updated

    def is_user_suspended(self, user_id: Optional[str]) -> bool:
        uid = (user_id or "").strip()
        if not uid:
            return False
        with self._lock:
            return uid in self.suspended_user_ids

    def get_status(self) -> Dict[str, Any]:
        now = time.time()
        with self._lock:
            self._prune_locked(now)
            auto_rem = max(0, int(self.ai_circuit_auto_until - now)) if self.ai_circuit_auto_until > now else 0
            return {
                "ai_circuit_open": self.ai_circuit_open or (auto_rem > 0),
                "ai_circuit_manual": self.ai_circuit_open,
                "ai_circuit_auto_remaining_sec": auto_rem,
                "blocked_ips_count": len(self.blocked_ips),
                "blocked_ips": [
                    {
                        "ip": ip,
                        "remaining_sec": max(0, int(until - now)),
                    }
                    for ip, until in self.blocked_ips.items()
                ],
                "suspended_users_count": len(self.suspended_user_ids),
                "model_chain": list(MODEL_CHAIN),
                "last_used_model": self.last_used_model,
                "last_model_version": self.last_model_version or self.last_used_model,
                "ai_error_rate_1m": round(
                    (
                        sum(1 for _, ok in self._ai_recent_calls if not ok)
                        / len(self._ai_recent_calls)
                        * 100.0
                    )
                    if self._ai_recent_calls
                    else 0.0,
                    1,
                ),
            }


runtime_guard = RuntimeGuard()
