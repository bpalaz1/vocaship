from fastapi import APIRouter
from app.api.v1.endpoints.decks import router as decks_router
from app.api.v1.endpoints.folders import router as folders_router
from app.api.v1.endpoints.study import router as study_router
from app.api.v1.endpoints.ai import router as ai_router
from app.api.v1.endpoints.importer import router as importer_router
from app.api.v1.endpoints.reading import router as reading_router
from app.api.v1.endpoints.share import router as share_router

router = APIRouter()

router.include_router(decks_router, prefix="/decks", tags=["Desteler"])
router.include_router(folders_router, prefix="/folders", tags=["Klasörler"])
router.include_router(study_router, prefix="/study", tags=["Çalışma & Tekrar"])
router.include_router(ai_router, prefix="/ai", tags=["Yapay Zeka"])
router.include_router(importer_router, prefix="/import", tags=["İçe Aktarma"])
router.include_router(reading_router)
router.include_router(share_router)