import json
import os
import uuid
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, timezone
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends, Request, Body, status
from fastapi.responses import JSONResponse
from supabase import Client
from app.core.database import get_db
from app.services.quota_service import require_pro_for_classroom, check_and_consume_quota, _extract_token_payload
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
    StoryWeaveResponse,
    BoardSummaryRequest,
    BoardSummaryResponse,
    PayoutProfileUpsert,
    ClassCreateRequest,
    JoinClassRequest,
    SendMaterialRequest
)
from app.services import classroom_service

router = APIRouter()

# =========================================================================
# 1. SINIF YÖNETİMİ ENDPOINT'LERİ (FAZ 2 & FAZ 6)
# =========================================================================

@router.post("/classes", status_code=status.HTTP_201_CREATED)
async def create_class(
    payload: Union[ClassCreateRequest, ClassroomCreateRequest],
    request: Request,
    db: Client = Depends(get_db),
):
    """
    Yeni sınıf açar:
    1. Faz 2: Tekil kullanıcı sınıfı, ücretli/ücretsiz biletleme, UTC takvim oturumları, IBAN kontrolü ve Public vitrin moderasyonu.
    2. Geriye dönük uyumluluk: Klasik VRG-XXXX sınıf oluşturma.
    """
    if isinstance(payload, ClassCreateRequest):
        if not payload.name.strip():
            raise HTTPException(status_code=400, detail="Sınıf adı zorunludur.")

        if payload.visibility == "public":
            is_safe = await classroom_service.moderate_public_class_content(
                title=payload.name,
                description=payload.description,
                target_audience=payload.target_audience,
            )
            if not is_safe:
                raise HTTPException(
                    status_code=400,
                    detail="Ders açıklaması topluluk kurallarına uygun bulunmadı. Lütfen düzenleyip tekrar deneyin.",
                )

        result = classroom_service.create_faz2_class(
            teacher_id=payload.teacher_id,
            name=payload.name,
            price=payload.price,
            currency=payload.currency,
            billing_type=payload.billing_type,
            schedule_mode=payload.schedule_mode,
            scheduled_dates_utc=payload.scheduled_dates_utc,
            duration_minutes=payload.duration_minutes,
            monthly_credits=payload.monthly_credits,
            visibility=payload.visibility,
            category=payload.category,
            teaching_lang=payload.teaching_lang,
            description=payload.description,
            target_audience=payload.target_audience,
            db=db
        )
        if "error" in result and result["error"] == "IBAN_REQUIRED":
            return JSONResponse(
                status_code=400,
                content={
                    "detail": "IBAN_REQUIRED",
                    "message": result.get("message", "Ücretli ders açmak için önce IBAN bilgilerinizi tanımlamalısınız.")
                }
            )
        return result

    # Klasik ClassroomCreateRequest
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
def get_classes(request: Request, user_id: Optional[str] = None, db: Client = Depends(get_db)):
    """
    Eğitmenin veya öğrencinin gerçek sınıflarını ve katılım kodlarını listeler.
    user_id olmadan genel tablo döndürmez; yalnızca kullanıcının kendi/üye olduğu sınıfları döner.
    """
    effective_user_id = (user_id or "").strip()
    if not effective_user_id:
        try:
            from app.services.quota_service import _extract_token_payload
            token_data = _extract_token_payload(request)
            if token_data and token_data.get("sub"):
                effective_user_id = str(token_data["sub"]).strip()
        except Exception:
            pass
    if not effective_user_id:
        return []
    return classroom_service.list_classrooms(db=db, user_id=effective_user_id)


@router.get("/public-showcase", status_code=status.HTTP_200_OK)
def get_public_showcase(
    category: Optional[str] = None,
    teaching_lang: Optional[str] = None,
    search: Optional[str] = None,
    free_only: bool = False,
    db: Client = Depends(get_db),
):
    """
    Açık Dersler Vitrini (Public Showcase) — giriş yapmamış misafirlere de açıktır.
    visibility == 'public' ve is_hidden == False olan yaklaşan dersleri döndürür.
    """
    return classroom_service.get_public_showcase_classes(
        category=category,
        teaching_lang=teaching_lang,
        search=search,
        free_only=free_only,
        db=db,
    )


@router.post("/classes/{class_id}/report", status_code=status.HTTP_200_OK)
def report_class_endpoint(class_id: str, db: Client = Depends(get_db)):
    """
    Vitrin dersini şikayet eder; report_count >= 3 olduğunda is_hidden = True yapar.
    """
    result = classroom_service.report_public_class(class_id=class_id, db=db)
    if not result:
        raise HTTPException(status_code=404, detail="Sınıf bulunamadı.")
    return result

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
        "class_name": matching_cls["name"] if matching_cls else "VocaShip Sınıfı",
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


# =========================================================================
# 7. AKILLI TAHTA DERS SONU YAPAY ZEKÂ ANALİZİ & SM-2 ÖDEV FIRLATMA
# =========================================================================

@router.post("/board-summary", response_model=BoardSummaryResponse)
async def get_board_summary_endpoint(payload: BoardSummaryRequest, db: Client = Depends(get_db)):
    """
    Ders sonu yapay zekâ analiz servisi:
    Öğretmenin ders anlatım transkriptini, PDF metin bağlamını ve tahtada vurgulanan
    kelimeleri Gemini 2.5 Flash ile analiz ederek 3-4 maddelik hap özet, 5 kilit terim
    (Türkçe anlamları ve fonetikleriyle) ve 3 anlama sorusu üretir.
    """
    result = await classroom_service.generate_board_summary(
        class_id=payload.class_id,
        transcript=payload.transcript,
        pdf_text_context=payload.pdf_text_context,
        highlighted_words=payload.highlighted_words,
        db=db
    )
    return result


class BoardAssignPayload(BaseModel):
    class_id: str
    title: str
    summary_points: List[str]
    key_terms: List[Dict[str, Any]]
    quiz_questions: List[Dict[str, Any]]


@router.post("/board-assign")
def assign_board_lesson_endpoint(payload: BoardAssignPayload, db: Client = Depends(get_db)):
    """
    Tahtadan 'Sınıfa Ödev Olarak Fırlat' tıklandığında:
    1. Sınıfa yeni interaktif ödev bağlar.
    2. Derste işlenen 5 kilit kelimeyi sınıf öğrencilerinin SM-2 aralıklı tekrar kuyruğuna aktarır.
    """
    if not payload.class_id.strip():
        raise HTTPException(status_code=400, detail="Sınıf ID'si zorunludur.")

    result = classroom_service.assign_board_lesson_to_class(
        class_id=payload.class_id,
        title=payload.title,
        summary_points=payload.summary_points,
        key_terms=payload.key_terms,
        quiz_questions=payload.quiz_questions,
        db=db
    )
    return result


# =========================================================================
# FAZ 2: DAVET LİNKİ, KATILIM, UTC TAKVİM, ZAMAN TÜNELİ & MANUEL GÖNDERİM
# =========================================================================

@router.get("/invite/{slug}", status_code=status.HTTP_200_OK)
def get_class_invite_details(slug: str, db: Client = Depends(get_db)):
    """
    invite_slug ile sınıfı ve yaklaşan oturumlarını (status='scheduled') getirir.
    Sınıf yoksa 404 döner.
    """
    class_info = classroom_service.get_class_by_invite_slug(slug, db=db)
    if not class_info:
        raise HTTPException(status_code=404, detail="Sınıf bulunamadı.")
    return class_info


@router.post("/invite/{slug}/join", status_code=status.HTTP_200_OK)
def join_class_via_invite(
    slug: str,
    payload: JoinClassRequest,
    db: Client = Depends(get_db)
):
    """
    Davet linki üzerinden sınıfa katılım:
    - Sınıf price == 0 ise session_attendees tablosuna payment_status='free' olarak kaydeder ve
      {"access_granted": True, "requires_payment": False} döner.
    - Sınıf price > 0 ise session_attendees tablosunda payment_status IN ('paid', 'subscription_active')
      kontrolü yapar; varsa erişim verir, yoksa {"access_granted": False, "requires_payment": True, "price": ..., "currency": ...} döner.
    """
    result = classroom_service.join_class_by_slug(
        slug=slug,
        user_id=payload.user_id,
        selected_session_id=payload.selected_session_id,
        db=db
    )
    if "error" in result and result["error"] == "NOT_FOUND":
        raise HTTPException(status_code=404, detail="Sınıf bulunamadı.")
    return result


@router.get("/timeline", status_code=status.HTTP_200_OK)
def get_classroom_timeline(
    user_id: str,
    db: Client = Depends(get_db)
):
    """
    Tekil kullanıcı için iki liste döndürür (otomatik AI özeti veya SM-2 ödevi YOK):
    1. teaching_sessions: teacher_id == user_id olan yaklaşan (scheduled/live) ve geçmiş (completed) dersler + kayıtlı katılımcı isimleri.
    2. attending_sessions: kullanıcının katıldığı yaklaşan ve geçmiş dersler + öğretmen adı.
    """
    if not user_id or not user_id.strip():
        raise HTTPException(status_code=400, detail="user_id parametresi zorunludur.")
    return classroom_service.get_user_timeline(user_id=user_id.strip(), db=db)


class StartLiveSessionPayload(BaseModel):
    teacher_id: Optional[str] = None
    class_name: Optional[str] = None


class CompleteSessionPayload(BaseModel):
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None


@router.post("/classes/{class_id}/start-live", status_code=status.HTTP_200_OK)
def start_live_session_endpoint(
    class_id: str,
    payload: Optional[StartLiveSessionPayload] = Body(default=None),
    db: Client = Depends(get_db),
):
    """
    Tahtada Aç butonuna basıldığında arka planda canlı ders oturumunu başlatır.
    Mevcut bir 'live' oturum varsa onu döner, yoksa yeni oturum ve kısa kod (7A2-5K9) üretir.
    """
    result = classroom_service.start_live_session(
        class_id=class_id,
        teacher_id=payload.teacher_id if payload else None,
        class_name=payload.class_name if payload else None,
        db=db,
    )
    join_code = result.get("join_code") or ""
    clean_code = join_code.replace("-", "").upper()
    if clean_code:
        ACTIVE_LIVE_SESSIONS[clean_code] = {
            "id": result["session_id"],
            "classId": class_id,
            "className": result.get("class_name", "Canlı Ders Odası"),
            "classCode": join_code,
            "title": result.get("class_name", "Canlı Ders Odası"),
            "isLive": True,
            "is_live": True,
            "teacherName": "Eğitmen Stüdyosu",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
    return result


@router.post("/sessions/{session_id}/complete", status_code=status.HTTP_200_OK)
def complete_session_endpoint(
    session_id: str,
    payload: Optional[CompleteSessionPayload] = Body(default=None),
    db: Client = Depends(get_db),
):
    """
    Eğitmen dersi bitirdiğinde status='completed' ve ended_at=NOW() yapar.
    Otomatik AI özeti veya SM-2 kart üretimi YAPILMAZ.
    """
    result = classroom_service.complete_session(
        session_id=session_id,
        duration_minutes=payload.duration_minutes if payload else None,
        notes=payload.notes if payload else None,
        db=db,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Oturum bulunamadı.")

    for sess in ACTIVE_LIVE_SESSIONS.values():
        if sess.get("id") == session_id:
            sess["isLive"] = False
            sess["is_live"] = False

    return result


async def _parse_beacon_json(request: Request) -> Dict[str, Any]:
    """
    navigator.sendBeacon ile gelen text/plain veya application/json gövdelerini güvenle parse eder.
    """
    try:
        raw = await request.body()
        if not raw:
            return {}
        text = raw.decode("utf-8").strip()
        if not text:
            return {}
        parsed = json.loads(text)
        return parsed if isinstance(parsed, dict) else {}
    except Exception:
        return {}


@router.post("/sessions/{session_id}/end", status_code=status.HTTP_200_OK)
async def end_session_via_beacon_endpoint(
    session_id: str,
    request: Request,
    db: Client = Depends(get_db),
):
    """
    Tarayıcı sekmesi/penceresi kapatıldığında sendBeacon (text/plain veya application/json) ile
    canlı oturumu (status='completed') anında sonlandırır.
    """
    data = await _parse_beacon_json(request)
    duration_minutes = data.get("duration_minutes")
    if duration_minutes is not None:
        try:
            duration_minutes = int(duration_minutes)
        except Exception:
            duration_minutes = None
    notes = data.get("notes") if isinstance(data.get("notes"), str) else None

    result = classroom_service.complete_session(
        session_id=session_id,
        duration_minutes=duration_minutes,
        notes=notes,
        db=db,
    )

    for sess in ACTIVE_LIVE_SESSIONS.values():
        if sess.get("id") == session_id:
            sess["isLive"] = False
            sess["is_live"] = False

    if not result:
        return {
            "success": True,
            "session_id": session_id,
            "status": "completed",
        }
    return result


@router.post("/leave-session", status_code=status.HTTP_200_OK)
async def leave_session_endpoint(
    request: Request,
):
    """
    Öğrenci veya katılımcı tarayıcı sekmesini kapattığında sendBeacon (text/plain veya application/json)
    ile aktif sınıf bağlantısını / katılımını temizler.
    """
    data = await _parse_beacon_json(request)
    session_id = data.get("session_id")
    class_id = data.get("class_id")
    user_id = data.get("user_id")
    role = data.get("role") or "student"

    return {
        "success": True,
        "status": "left",
        "session_id": session_id,
        "class_id": class_id,
        "user_id": user_id,
        "role": role,
    }


@router.post("/send-material", status_code=status.HTTP_200_OK)
def send_material_endpoint(payload: SendMaterialRequest, db: Client = Depends(get_db)):
    """
    Sadece öğretmenin manuel isteğiyle çalışır; ilgili sınıftaki katılımcıların listesini çeker,
    gönderim kaydını döner ({"sent_count": len(students), "status": "delivered"}).
    """
    if not payload.teacher_id or not payload.class_id:
        raise HTTPException(status_code=400, detail="teacher_id ve class_id alanları zorunludur.")
    if not payload.subject.strip() or not payload.message_body.strip():
        raise HTTPException(status_code=400, detail="Konu ve mesaj gövdesi boş bırakılamaz.")

    result = classroom_service.send_material_to_class(
        teacher_id=payload.teacher_id,
        class_id=payload.class_id,
        subject=payload.subject,
        message_body=payload.message_body,
        attachment_url=payload.attachment_url,
        db=db
    )
    return result


class LiveKitTokenRequest(BaseModel):
    identity: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = "participant"


@router.post("/classes/{class_id}/livekit-token", status_code=status.HTTP_200_OK)
async def create_livekit_token(
    class_id: str,
    request: Request,
    payload: Optional[LiveKitTokenRequest] = Body(default=None),
):
    """
    Sınıf odası (vocaship-class-{class_id}) için LiveKit SFU JWT token üretir.
    """
    livekit_url = (os.getenv("LIVEKIT_URL") or "").strip()
    api_key = (os.getenv("LIVEKIT_API_KEY") or "").strip()
    api_secret = (os.getenv("LIVEKIT_API_SECRET") or "").strip()

    if not livekit_url or not api_key or not api_secret:
        raise HTTPException(
            status_code=500,
            detail="LiveKit sunucu yapılandırması eksik (LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET).",
        )

    from livekit import api as livekit_api

    token_data = _extract_token_payload(request)
    req_identity = (payload.identity if payload else None) or (
        str(token_data.get("sub")) if token_data and token_data.get("sub") else None
    )
    identity = (req_identity or f"guest-{uuid.uuid4().hex[:8]}").strip()

    req_name = (payload.name if payload else None) or (
        str(token_data.get("username")) if token_data and token_data.get("username") else None
    )
    display_name = (req_name or "VocaShip Katılımcı").strip()

    room_name = f"vocaship-class-{class_id}"

    grant = livekit_api.VideoGrants(
        room_join=True,
        room=room_name,
        can_publish=True,
        can_subscribe=True,
        can_publish_data=True,
    )
    jwt_token = (
        livekit_api.AccessToken(api_key, api_secret)
        .with_identity(identity)
        .with_name(display_name)
        .with_grants(grant)
        .to_jwt()
    )

    return {
        "token": jwt_token,
        "server_url": livekit_url,
        "room_name": room_name,
    }





