from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1 import router as api_v1_router
from app.api.v1.endpoints.reading import router as reading_router
from app.api.v1.endpoints.speaking import router as speaking_router
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.services.quota_service import QuotaExceededException, ProRequiredException

app = FastAPI(title="Vocaship Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(QuotaExceededException)
async def quota_exceeded_handler(request: Request, exc: QuotaExceededException):
    return JSONResponse(status_code=403, content=exc.payload)


@app.exception_handler(ProRequiredException)
async def pro_required_handler(request: Request, exc: ProRequiredException):
    return JSONResponse(status_code=403, content=exc.payload)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=getattr(exc, "headers", None),
        )
    return JSONResponse(
        status_code=500,
        content={"detail": f"Sunucu hatası: {str(exc)}"},
    )


app.include_router(api_v1_router, prefix="/api/v1")
app.include_router(api_v1_router)
app.include_router(reading_router, prefix="/api/v1")
app.include_router(reading_router)
app.include_router(speaking_router, prefix="/api/v1/speaking", tags=["AI Speaking Lounge"])
app.include_router(speaking_router, prefix="/speaking", tags=["AI Speaking Lounge"])


@app.get("/")
async def root():
    return {"message": "Vocaship Backend Calisiyor"}
