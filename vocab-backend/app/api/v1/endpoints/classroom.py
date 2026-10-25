from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, status
from supabase import Client
from app.core.database import get_db
from app.schemas.classroom import (
    ExtractRequest,
    ExtractResponse,
    TeacherStoryCreateRequest,
    TeacherStoryResponse
)
from app.services import classroom_service

router = APIRouter()

@router.post("/extract", response_model=ExtractResponse)
async def extract_from_text(payload: ExtractRequest):
    """
    Öğretmenin yapıştırdığı metinden otomatik 4-5 hedef kelime ve
    3 adet çoktan seçmeli anlama sorusu çıkartır (Asenkron).
    """
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Lütfen analiz edilecek bir metin girin.")

    result = await classroom_service.extract_questions_and_vocab_from_text(
        text=payload.text,
        level=payload.level or "Intermediate"
    )
    return result

@router.post("/stories", response_model=TeacherStoryResponse, status_code=status.HTTP_201_CREATED)
def create_story(payload: TeacherStoryCreateRequest, db: Client = Depends(get_db)):
    """
    Öğretmenin hazırladığı hikaye ve soruları kaydeder.
    """
    if not payload.title.strip() or not payload.content.strip():
        raise HTTPException(status_code=400, detail="Başlık ve metin alanları zorunludur.")

    story = classroom_service.create_teacher_story(payload.model_dump(), db=db)
    return story

@router.get("/stories", response_model=List[TeacherStoryResponse])
def get_stories(status: Optional[str] = None, db: Client = Depends(get_db)):
    """
    Öğretmenin hikayelerini listeler (status filtresi: pending, approved).
    """
    stories = classroom_service.list_teacher_stories(status=status, db=db)
    return stories

@router.patch("/stories/{story_id}/approve", response_model=TeacherStoryResponse)
def approve_story(story_id: str, db: Client = Depends(get_db)):
    """
    Hikayeyi onaylar (pending -> approved).
    """
    story = classroom_service.approve_teacher_story(story_id, db=db)
    if not story:
        raise HTTPException(status_code=404, detail="Hikaye bulunamadı.")
    return story
