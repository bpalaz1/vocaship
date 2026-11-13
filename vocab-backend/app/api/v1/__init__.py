"""
API v1 Router endpoints.
"""
from fastapi import APIRouter
from app.core.config import settings
from app.core.database import get_db
from app.schemas import HealthCheck
from app.api.v1.endpoints.ai import router as ai_router
from app.api.v1.endpoints.importer import router as importer_router
from app.api.v1.endpoints.study import router as study_router
from app.api.v1.endpoints.decks import router as decks_router
from app.api.v1.endpoints.folders import router as folders_router
from app.api.v1.endpoints.share import router as share_router
from app.api.v1.endpoints.gamification import router as gamification_router
from app.api.v1.endpoints.classroom import router as classroom_router
from app.api.v1.endpoints.cards import router as cards_router
from app.api.v1.endpoints.speaking import router as speaking_router
from app.api.v1.endpoints.career_hubs import router as career_hubs_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.avatar import router as avatar_router
from app.api.v1.endpoints.translate import router as translate_router
from app.api.v1.endpoints.tts import router as tts_router
from app.api.v1.endpoints.payments import router as payments_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
router.include_router(payments_router, prefix="/payments", tags=["Payments & Payouts"])

router.include_router(ai_router, prefix="/ai", tags=["AI Flashcards"])
router.include_router(ai_router, prefix="/dictionary", tags=["Dictionary & Instant Lookup"])
router.include_router(importer_router, prefix="/import", tags=["Importer"])
router.include_router(study_router, prefix="/study", tags=["Study & SM-2"])
router.include_router(cards_router, prefix="/cards", tags=["Cards & Weak-Spot Hunter"])
router.include_router(decks_router, prefix="/decks", tags=["Decks"])
router.include_router(folders_router, prefix="/folders", tags=["Folders"])
router.include_router(share_router, tags=["Share & Classroom Code"])
router.include_router(gamification_router, prefix="/gamification", tags=["Gamification & XP"])
router.include_router(classroom_router, prefix="/classroom", tags=["Classroom & Teacher"])
router.include_router(speaking_router, prefix="/speaking", tags=["AI Speaking Lounge"])
router.include_router(avatar_router, prefix="/avatar", tags=["Avatar Studio"])
router.include_router(translate_router, prefix="/translate", tags=["Live Translator"])
router.include_router(tts_router, prefix="/tts", tags=["Neural TTS & Emotion Voice"])
router.include_router(career_hubs_router, tags=["Specialized Career Hubs"])


@router.get("/health", response_model=HealthCheck, tags=["Health"])
def health_check():
    db_connected = False
    try:
        db = get_db()
        db.table("users").select("*", count="exact").execute()
        db_connected = True
    except Exception:
        db_connected = False

    return HealthCheck(
        status="healthy",
        project_name=settings.PROJECT_NAME,
        api_version="v1",
        database_connected=db_connected,
    )