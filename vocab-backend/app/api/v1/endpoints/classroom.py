from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends, Request, status
from supabase import Client
from app.core.database import get_db
from app.services.quota_service import require_pro_for_classroom, check_and_consume_quota
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
    TeacherStoryResponse,
    GameRewardClaimRequest,
    GameRewardClaimResponse,
    StoryWeaveRequest,
    StoryWeaveResponse
)
from app.services import classroom_service

router = APIRouter()

# =========================================================================
# 1. SINIF YÖNETİMİ ENDPOINT'LERİ (FAZ 6)
# =========================================================================

@router.post("/classes", response_model=ClassroomResponse, status_code=status.HTTP_201_CREATED)
def create_class(
    payload: ClassroomCreateRequest,
    request: Request,
    db: Client = Depends(get_db),
):
    """
    Yeni sınıf açar ve benzersiz 6 haneli kod (VRG-XXXX) üretir.
    Yalnızca is_pro == True veya role == 'admin' kullanıcılar sınıf açabilir.
    """
    require_pro_for_classroom(request)
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
async def extract_from_text(payload: AssignmentExtractRequest, request: Request):
    """
    Yapıştırılan metinden Gemini API ile anında 5 hedef kelime ve
    3 çoktan seçmeli anlama sorusu türetir.
    """
    check_and_consume_quota(request, "text")
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
def get_assignments_by_code(code: str, student_id: Optional[str] = None, db: Client = Depends(get_db)):
    """
    Öğrencinin girdiği 6 haneli kodun içeriğini (ödev/deste/okuma) veri izolasyonuyla döndürür.
    """
    assignments = classroom_service.get_assignments_by_code(code, student_id=student_id, db=db)
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

@router.get("/student/assignments")
def get_student_assignments_endpoint(
    student_id: Optional[str] = None,
    class_code: Optional[str] = None,
    db: Client = Depends(get_db)
):
    """
    Öğrencinin yalnızca kayıtlı olduğu sınıflara ait aktif ödevleri izole ederek döndürür.
    Yetkisiz sınıfların ödevleri listelenmez.
    """
    actual_id = student_id or "00000000-0000-0000-0000-000000000001"
    assignments = classroom_service.get_student_assignments(user_id=actual_id, class_code=class_code, db=db)
    return {
        "student_id": actual_id,
        "class_code": class_code,
        "assignments": assignments,
        "count": len(assignments)
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

# =========================================================================
# 5. CANLI YARIŞMA PODYUM VE ADİL ÖDÜL DAĞITIM MOTORU
# =========================================================================

@router.post("/award-rewards", response_model=GameRewardClaimResponse, status_code=status.HTTP_200_OK)
def award_game_rewards(payload: GameRewardClaimRequest, db: Client = Depends(get_db)):
    """
    Canlı çok oyunculu yarışma sonlandığında derece bazlı adil ödülleri (XP, Altın, Sandık Anahtarı)
    sunucu tarafında doğrular, mükerrer istekleri engeller ve güvenle kullanıcı cüzdanına ekler.
    """
    if payload.rank < 1:
        raise HTTPException(status_code=400, detail="Geçersiz sıralama değeri.")

    result = classroom_service.claim_game_rewards(
        session_id=payload.session_id,
        rank=payload.rank,
        user_id=payload.user_id,
        game_mode=payload.game_mode or "live_arena",
        db=db
    )
    return result

# =========================================================================
# 6. CANLI DERS GERÇEK ZAMANLI DURUM YÖNETİMİ (REALTIME STATUS)
# =========================================================================

ACTIVE_LIVE_SESSIONS: Dict[str, Dict[str, Any]] = {}

class LiveSessionStatusPayload(BaseModel):
    class_code: str
    class_id: Optional[str] = "cls-1"
    class_name: Optional[str] = "10-A Sınıfı"
    title: Optional[str] = "Canlı Proje Vaka Analizi"
    is_live: bool
    session_id: Optional[str] = None
    teacher_name: Optional[str] = "Eğitmen Stüdyosu"

@router.get("/live-status")
def get_live_status(class_code: Optional[str] = None):
    """
    Belirli bir sınıfın veya genel aktif canlı ders durumunu döner.
    """
    clean_code = (class_code or "VRG-2535").replace("-", "").upper()
    session = ACTIVE_LIVE_SESSIONS.get(clean_code)
    if not session or not (session.get("isLive") or session.get("is_live")):
        return {"is_live": False, "session": None}
    return {"is_live": True, "session": session}

@router.post("/live-status")
def set_live_status(payload: LiveSessionStatusPayload):
    """
    Öğretmen yayın başlattığında veya bitirdiğinde canlı ders durumunu günceller.
    """
    clean_code = payload.class_code.replace("-", "").upper()
    data = {
        "id": payload.session_id or f"live-{int(datetime.now(timezone.utc).timestamp())}",
        "classId": payload.class_id,
        "className": payload.class_name,
        "classCode": payload.class_code,
        "title": payload.title,
        "isLive": payload.is_live,
        "is_live": payload.is_live,
        "teacherName": payload.teacher_name,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    ACTIVE_LIVE_SESSIONS[clean_code] = data
    return {"success": True, "is_live": payload.is_live, "session": data}

# =========================================================================
# 6. SINIFÇA KOLEKTİF İNTERAKTİF HİKAYE DOKUMA (FAZ 6)
# =========================================================================

@router.post("/story-weave", response_model=StoryWeaveResponse)
async def story_weave(payload: StoryWeaveRequest):
    """
    Hedef kelimeleri sınıfın interaktif seçimleriyle kolektif bir hikayeye dönüştürür.
    """
    result = await classroom_service.weave_collective_story(
        target_words=payload.target_words,
        story_history=payload.story_history,
        selected_choice=payload.selected_choice,
        grade_level=payload.grade_level or "B1-B2"
    )
    return result



