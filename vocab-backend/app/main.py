"""
VocaShip Backend - ASGI Application Entrypoint
Exposes `app` for `uvicorn app.main:app` and `uvicorn main:app`.
"""

import os
import jwt
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1 import router as api_v1_router
from app.api.v1.endpoints.reading import router as reading_router
from app.api.v1.endpoints.speaking import router as speaking_router
from app.api.v1.endpoints import tts
from app.core import database as db_module
from app.core.runtime_guard import runtime_guard, AI_MAINTENANCE_MESSAGE
from app.services.telemetry_service import record_telemetry
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.services.quota_service import QuotaExceededException, ProRequiredException

_GUARD_JWT_SECRET = os.getenv("JWT_SECRET_KEY", "vorego-super-secret-jwt-key-2026")
_ADMIN_EMAIL = "bpalaz1@gmail.com"

app = FastAPI(title="VocaShip API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


def _extract_client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for") or ""
    if xff:
        first = xff.split(",")[0].strip()
        if first:
            return first
    xri = (request.headers.get("x-real-ip") or "").strip()
    if xri:
        return xri
    if request.client and request.client.host:
        return str(request.client.host)
    return ""


def _extract_jwt_claims(request: Request) -> dict:
    auth_header = request.headers.get("Authorization") or ""
    if not auth_header.startswith("Bearer "):
        return {}
    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        return {}
    try:
        return jwt.decode(token, _GUARD_JWT_SECRET, algorithms=["HS256"]) or {}
    except Exception:
        return {}


@app.middleware("http")
async def runtime_guard_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)

    path = request.url.path or "/"
    low_path = path.lower()

    # Sağlık ve admin kontrol uçlarını hiçbir zaman kilitleme
    if low_path in ("/", "/health", "/api/v1/health") or low_path.startswith("/admin") or low_path.startswith("/api/v1/admin"):
        return await call_next(request)

    # Supabase'deki askıya alınmış kullanıcıları ilk istekte bir kez belleğe yükle
    try:
        runtime_guard.hydrate_suspended_users(db_module.get_db())
    except Exception:
        pass

    claims = _extract_jwt_claims(request)
    req_email = str(claims.get("email") or "").strip().lower()
    req_role = str(claims.get("role") or "").strip().lower()
    req_uid = str(claims.get("sub") or "").strip()
    is_admin_req = (req_email == _ADMIN_EMAIL) or (req_role == "admin")

    # 1. Askıya alınmış kullanıcı kontrolü (403)
    if not is_admin_req and req_uid and runtime_guard.is_user_suspended(req_uid):
        return JSONResponse(
            status_code=403,
            content={"detail": "Hesabınızın erişimi sistem yöneticisi tarafından geçici olarak durduruldu."},
            headers=_cors_error_headers(request),
        )

    # 2. IP blok & agresif istek koruması (429)
    if not is_admin_req:
        client_ip = _extract_client_ip(request)
        is_blocked, block_msg = runtime_guard.check_and_track_ip(client_ip, path)
        if is_blocked:
            return JSONResponse(
                status_code=429,
                content={"detail": block_msg or "Çok fazla istek algılandı. Lütfen daha sonra tekrar deneyin."},
                headers=_cors_error_headers(request),
            )

    # 3. AI Güvenli Mod / Circuit Breaker (yalnızca AI üretim endpoint'lerinde 503)
    if runtime_guard.is_ai_circuit_active() and runtime_guard.is_ai_protected_path(path):
        return JSONResponse(
            status_code=503,
            content={"detail": AI_MAINTENANCE_MESSAGE},
            headers=_cors_error_headers(request),
        )

    return await call_next(request)


def _cors_error_headers(request: Request) -> dict:
    origin = request.headers.get("origin") or "*"
    headers = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    }
    if origin != "*":
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Vary"] = "Origin"
    return headers


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    headers = _cors_error_headers(request)
    extra = getattr(exc, "headers", None)
    if isinstance(extra, dict):
        headers.update(extra)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers,
    )


@app.exception_handler(QuotaExceededException)
async def quota_exceeded_handler(request: Request, exc: QuotaExceededException):
    return JSONResponse(
        status_code=403,
        content=exc.payload,
        headers=_cors_error_headers(request),
    )


@app.exception_handler(ProRequiredException)
async def pro_required_handler(request: Request, exc: ProRequiredException):
    return JSONResponse(
        status_code=403,
        content=exc.payload,
        headers=_cors_error_headers(request),
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    headers = _cors_error_headers(request)
    if isinstance(exc, StarletteHTTPException):
        extra = getattr(exc, "headers", None)
        if isinstance(extra, dict):
            headers.update(extra)
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=headers,
        )
    record_telemetry(
        event_type="SERVER_500",
        severity="critical",
        message=f"{type(exc).__name__}: {str(exc)}",
        path=str(request.url.path),
        country_code=request.headers.get("x-vercel-ip-country"),
    )
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers=headers,
    )


app.include_router(api_v1_router, prefix="/api/v1")
app.include_router(api_v1_router)
app.include_router(reading_router, prefix="/api/v1")
app.include_router(reading_router)
app.include_router(speaking_router, prefix="/api/v1/speaking", tags=["Speaking Lounge"])
app.include_router(speaking_router, prefix="/speaking", tags=["Speaking Lounge"])
app.include_router(tts.router, prefix="/api/v1/speaking/tts", tags=["TTS"])
app.include_router(tts.router, prefix="/speaking/tts", tags=["TTS"])
app.include_router(tts.router, prefix="/api/v1/tts", tags=["TTS"])
app.include_router(tts.router, prefix="/tts", tags=["TTS"])


@app.get("/")
async def root():
    return {"message": "VocaShip API Calisiyor"}


@app.get("/health")
async def root_health_check():
    db = db_module.get_db()
    return {
        "status": "ok",
        "db_type": type(db).__name__,
        "db_error": db_module.DB_INIT_ERROR,
    }


app.openapi()
for _route_obj in list(app.routes):
    if not hasattr(_route_obj, "path"):
        _ctx = getattr(_route_obj, "include_context", None)
        _prefix = getattr(_ctx, "prefix", "") if _ctx else ""
        try:
            setattr(_route_obj, "path", _prefix or "")
        except Exception:
            pass
        for _cand in getattr(_route_obj, "_effective_candidates", []) or []:
            if hasattr(_cand, "path") and _cand not in app.routes:
                app.routes.append(_cand)
