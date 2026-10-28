from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status
from supabase import Client
from app.core.database import get_db
from app.schemas.classroom import (
    ClassroomCreateRequest,
    ClassroomResponse,
    AssignmentExtractRequest,
    AssignmentExtractResponse,
    AssignmentCreateRequest,
    AssignmentResponse,
    ExtractRequest,
    ExtractResponse,
    TeacherStoryCreateRequest,
    TeacherStoryResponse
)
from app.services import classroom_service

router = APIRouter()

# =========================================================================
# 1. SINIF YÖNETİMİ ENDPOINT'LERİ (FAZ 6)
# =========================================================================

@router.post("/classes", response_model=ClassroomResponse, status_code=status.HTTP_201_CREATED)
def create_class(payload: ClassroomCreateRequest, db: Client = Depends(get_db)):
    """
    Yeni sınıf açar ve benzersiz 6 haneli kod (VRG-XXXX) üretir.
    """
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Sınıf adı zorunludur.")
    new_class = classroom_service.create_classroom(
        name=payload.name,
        grade_level=payload.grade_level or "Intermediate",
        db=db
    )
    return new_class

@router.get("/classes", response_model=List[ClassroomResponse])
def get_classes(db: Client = Depends(get_db)):
    """
    Eğitmenin sınıflarını ve katılım kodlarını listeler.
    """
    return classroom_service.list_classrooms(db=db)

# =========================================================================
# 2. AI İLE OTOMATİK METİN ANALİZİ VE ÖDEV ÇIKARTMA
# =========================================================================

@router.post("/extract", response_model=AssignmentExtractResponse)
async def extract_from_text(payload: AssignmentExtractRequest):
    """
    Yapıştırılan metinden Gemini API ile anında 5 hedef kelime ve
    3 çoktan seçmeli anlama sorusu türetir.
    """
    content = payload.content or payload.text or ""
    if not content.strip():
        raise HTTPException(status_code=400, detail="Lütfen analiz edilecek bir metin girin.")

    result = await classroom_service.extract_questions_and_vocab_from_text(
        text=content,
        level=payload.level or "Intermediate"
    )
    return result

# =========================================================================
# 3. ÖDEV BAĞLAMA VE ÖĞRENCİ ERİŞİMİ
# =========================================================================

@router.post("/assignments", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment(payload: AssignmentCreateRequest, db: Client = Depends(get_db)):
    """
    Sınıfa ödev bağlar.
    """
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Ödev başlığı zorunludur.")
    assign = classroom_service.create_assignment(payload.model_dump(), db=db)
    return assign

@router.get("/assignments/{code}")
def get_assignments_by_code(code: str, db: Client = Depends(get_db)):
    """
    Öğrencinin girdiği 6 haneli kodun içeriğini (ödev/deste/okuma) döndürür.
    """
    assignments = classroom_service.get_assignments_by_code(code, db=db)
    clean_search = code.replace("-", "").upper()
    matching_cls = next(
        (c for c in classroom_service.IN_MEMORY_CLASSES if c["code"].replace("-", "").upper() == clean_search),
        None
    )
    return {
        "code": code.upper(),
        "class_name": matching_cls["name"] if matching_cls else "Vocaship Sınıfı",
        "grade_level": matching_cls.get("grade_level", "Genel"),
        "student_count": matching_cls["student_count"] if matching_cls else 0,
        "assignments": assignments
    }

# =========================================================================
# 4. GERİYE DÖNÜK UYUMLU ÖĞRETMEN HİKAYE YÖNETİMİ
# =========================================================================

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
    Öğretmenin hikayelerini listeler.
    """
    return classroom_service.list_teacher_stories(status=status, db=db)

@router.patch("/stories/{story_id}/approve", response_model=TeacherStoryResponse)
def approve_story(story_id: str, db: Client = Depends(get_db)):
    """
    Hikayeyi onaylar.
    """
    story = classroom_service.approve_teacher_story(story_id, db=db)
    if not story:
        raise HTTPException(status_code=404, detail="Hikaye bulunamadı.")
    return story
