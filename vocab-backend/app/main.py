"""
VocaShip Backend - ASGI Application Entrypoint
Exposes `app` for `uvicorn app.main:app` and `uvicorn main:app`.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1 import router as api_v1_router
from app.api.v1.endpoints.reading import router as reading_router
from app.api.v1.endpoints.speaking import router as speaking_router
from app.api.v1.endpoints import tts
from app.core import database as db_module
from app.services.telemetry_service import record_telemetry
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.services.quota_service import QuotaExceededException, ProRequiredException

app = FastAPI(title="VocaShip API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


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
