from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1 import router as api_v1_router
from app.api.v1.endpoints.reading import router as reading_router
from app.api.v1.endpoints.speaking import router as speaking_router

app = FastAPI(title="Vocaship Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
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