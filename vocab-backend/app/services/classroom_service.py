import re
import json
import uuid
import random
import string
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
import asyncio
from app.services.ai_service import async_extract_reading_analysis, call_gemini_with_fallback
from app.api.v1.endpoints.ai import COMMON_VOCAB

# Bellek içi yedek havuz (Veritabanı erişilemezse bile çalışmayı garanti eder)
IN_MEMORY_TEACHER_STORIES: List[Dict[str, Any]] = [
    {
        "id": "demo-teacher-story-1",
        "title": "The Whispering Forest",
        "level": "Intermediate",
        "topic": "Doğa & Macera",
        "content": "Deep in the misty valley lay the Whispering Forest. The tall ancient pines murmured secrets to the wind. Clara, a young botanist, walked quietly across the mossy ground. She was searching for a rare luminescent flower that only bloomed under the full moon. Her notebook was filled with meticulous sketches of flora and fauna. As dusk settled, a faint azure glow appeared behind the silver birch trees, rewarding her patience.",
        "target_vocabulary": [
            {"word": "misty", "phonetic": "/ˈmɪs.ti/", "meaning": "sisli, puslu", "example": "Deep in the misty valley lay the forest."},
            {"word": "murmured", "phonetic": "/ˈmɜː.məd/", "meaning": "fısıldadı, mırıldandı", "example": "The tall ancient pines murmured secrets."},
            {"word": "botanist", "phonetic": "/ˈbɒt.ən.ɪst/", "meaning": "botanikçi, bitki bilimci", "example": "Clara, a young botanist, walked quietly."},
            {"word": "luminescent", "phonetic": "/ˌluː.mɪˈnes.ənt/", "meaning": "ışık saçan, parıldayan", "example": "She was searching for a rare luminescent flower."},
            {"word": "meticulous", "phonetic": "/məˈtɪk.jə.ləs/", "meaning": "titiz, özenli", "example": "Her notebook was filled with meticulous sketches."}
        ],
        "comprehension_questions": [
            {
                "question": "What was Clara primarily searching for in the Whispering Forest?",
                "options": [
                    "A lost ancient artifact",
                    "A rare luminescent flower blooming under full moon",
                    "Her runaway pet dog",
                    "A hidden mountain cave"
                ],
                "correct_answer_index": 1,
                "explanation": "Metinde Clara'nın sadece dolunayda açan nadir ışık saçan bir çiçeği aradığı belirtilmektedir."
            },
            {
                "question": "What profession does Clara have?",
                "options": [
                    "A young botanist",
                    "A high school teacher",
                    "An archaeologist",
                    "A wildlife photographer"
                ],
                "correct_answer_index": 0,
                "explanation": "Metinde 'Clara, a young botanist' ifadesi açıkça yer almaktadır."
            },
            {
                "question": "When did the faint azure glow appear?",
                "options": [
                    "At early dawn",
                    "At noon in broad daylight",
                    "As dusk settled",
                    "During a heavy thunderstorm"
                ],
                "correct_answer_index": 2,
                "explanation": "Metne göre 'As dusk settled, a faint azure glow appeared behind the silver birch trees'."
            }
        ],
        "status": "approved",
        "visibility": "class_only",
        "share_code": "QW-T821",
        "created_at": "2026-10-22T10:00:00Z"
    }
]

# Sınıf Yönetimi & Öğretmen Portalı Bellek İçi Havuzları
IN_MEMORY_CLASSES: List[Dict[str, Any]] = [
    {
        "id": "cls-1",
        "name": "C1 Advanced Business & Engineering English",
        "grade_level": "C1 Advanced",
        "code": "VRG-2535",
        "student_count": 18,
        "created_at": "2026-10-20T10:00:00Z"
    },
    {
        "id": "cls-2",
        "name": "FIDIC & EPC Project Control Lab",
        "grade_level": "C1-C2 Executive",
        "code": "VRG-8492",
        "student_count": 12,
        "created_at": "2026-10-22T14:30:00Z"
    }
]

IN_MEMORY_ASSIGNMENTS: List[Dict[str, Any]] = [
    {
        "id": "assign-1",
        "classroom_id": "cls-1",
        "class_code": "VRG-2535",
        "title": "The Architecture of Deep Focus",
        "story_content": "Deep focus is the ability to concentrate without distraction on a demanding task. Cultivating resilience against superficial distractions is essential for complex problem solving.",
        "target_words": [
            {"word": "resilience", "meaning": "Direnç, toparlanma gücü", "phonetic": "/rɪˈzɪl.jənt/", "example": "Building cognitive resilience."},
            {"word": "cognitive", "meaning": "Bilişsel, zihinsel", "phonetic": "/ˈkɒɡ.nə.tɪv/", "example": "Demanding cognitive work."},
            {"word": "superficial", "meaning": "Yüzeysel", "phonetic": "/ˌsuː.pəˈfɪʃ.əl/", "example": "Superficial interruptions."},
            {"word": "mitigate", "meaning": "Azaltmak, hafifletmek", "phonetic": "/ˈmɪt.ɪ.ɡeɪt/", "example": "Mitigate daily distractions."},
            {"word": "substantiate", "meaning": "Doğrulamak, kanıtlamak", "phonetic": "/səbˈstæn.ʃi.eɪt/", "example": "Substantiate findings with data."}
        ],
        "questions": [
            {
                "question": "What is the primary definition of deep focus according to the text?",
                "options": [
                    "Concentrating without distraction on a demanding task",
                    "Multitasking several light tasks simultaneously",
                    "Ignoring team communications indefinitely",
                    "Working only during late evening hours"
                ],
                "correct_index": 0,
                "correct_answer_index": 0,
                "explanation": "Metnin ilk cümlesinde açıkça tanımlanmıştır."
            },
            {
                "question": "Why is cultivating resilience against distractions important?",
                "options": [
                    "To protect cognitive energy from superficial interruptions",
                    "To reduce internet bandwidth usage",
                    "To eliminate all meetings",
                    "To stop reading technical documentation"
                ],
                "correct_index": 0,
                "correct_answer_index": 0,
                "explanation": "Zihinsel enerjiyi korumak için gereklidir."
            },
            {
                "question": "What kind of tasks require deep focus?",
                "options": [
                    "Cognitively demanding tasks",
                    "Routine administrative check-ins",
                    "Automated email sorting",
                    "Casual social browsing"
                ],
                "correct_index": 0,
                "correct_answer_index": 0,
                "explanation": "Zihinsel efor gerektiren işlerde derin odaklanma şarttır."
            }
        ],
        "due_date": "Bu Cuma, 18:00",
        "completed_percent": 88,
        "created_at": "2026-10-23T11:00:00Z"
    },
    {
        "id": "assign-2",
        "classroom_id": "cls-1",
        "class_code": "VRG-2535",
        "title": "FIDIC Sözleşmeleri & Delay Claims",
        "story_content": "Under FIDIC Clause 20.1, the Contractor must give notice of any claim within 28 days of becoming aware of the event.",
        "target_words": [
            {"word": "mitigate", "meaning": "Etkisini azaltmak, hafifletmek", "phonetic": "/ˈmɪt.ɪ.ɡeɪt/", "example": "Mitigate project delays."},
            {"word": "contingency", "meaning": "Yedek akçe, beklenmedik durum payı", "phonetic": "/kənˈtɪn.dʒən.si/", "example": "Allocate budget contingency."},
            {"word": "substantiate", "meaning": "Somut delillerle ispatlamak", "phonetic": "/səbˈstæn.ʃi.eɪt/", "example": "Substantiate claim narrative."},
            {"word": "clause", "meaning": "Sözleşme maddesi", "phonetic": "/klɔːz/", "example": "Clause 20.1 notification."},
            {"word": "dispute", "meaning": "Uyuşmazlık, anlaşmazlık", "phonetic": "/dɪˈspjuːt/", "example": "Dispute Adjudication Board."}
        ],
        "questions": [
            {
                "question": "Within how many days must notice of claim be provided?",
                "options": ["28 days", "14 days", "60 days", "90 days"],
                "correct_index": 0,
                "correct_answer_index": 0,
                "explanation": "Clause 20.1 uyarınca 28 günlük bildirim süresi şarttır."
            }
        ],
        "due_date": "Pazar, 23:59",
        "completed_percent": 100,
        "created_at": "2026-10-24T09:00:00Z"
    }
]

def generate_classroom_code() -> str:
    """VRG- ile başlayan 6-8 haneli benzersiz sınıf kodu üretir (örn: VRG-2535)."""
    digits = "".join(random.choices(string.digits, k=4))
    return f"VRG-{digits}"

def generate_share_code() -> str:
    """QW- ile başlayan 6 karakterli benzersiz paylaşım kodu üretir."""
    digits = "".join(random.choices(string.digits, k=4))
    return f"QW-{digits}"

def normalize_class_code(code: str) -> str:
    """Sınıf kodunu VRG-XXXX formatına standartlaştırır."""
    cleaned = code.strip().upper()
    if "-" in cleaned:
        return cleaned
    if cleaned.startswith("VRG") and len(cleaned) == 7:
        return f"VRG-{cleaned[3:]}"
    if cleaned.isdigit() and len(cleaned) == 4:
        return f"VRG-{cleaned}"
    return cleaned

def create_classroom(name: str, grade_level: str = "Intermediate", db=None) -> Dict[str, Any]:
    """Yeni bir sınıf açar ve benzersiz VRG-XXXX kodu üretir."""
    cls_id = str(uuid.uuid4())
    code = generate_classroom_code()
    now_iso = datetime.now(timezone.utc).isoformat()

    new_cls = {
        "id": cls_id,
        "name": name.strip(),
        "grade_level": grade_level.strip(),
        "code": code,
        "student_count": 0,
        "created_at": now_iso
    }

    IN_MEMORY_CLASSES.insert(0, new_cls)

    if db:
        try:
            db.table("classrooms").insert(new_cls).execute()
        except Exception as e:
            print(f"[DB Classroom Insert]: {e}")

    return new_cls

def list_classrooms(db=None) -> List[Dict[str, Any]]:
    """Eğitmenin tüm sınıflarını listeler."""
    if db:
        try:
            res = db.table("classrooms").select("*").order("created_at", desc=True).execute()
            if res.data:
                return res.data
        except Exception as e:
            print(f"[DB Classroom Select]: {e}")

    return IN_MEMORY_CLASSES

def create_assignment(data: dict, db=None) -> Dict[str, Any]:
    """Sınıfa yeni bir ödev bağlar."""
    assign_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    classroom_id = data.get("classroom_id", "")

    # Sınıf kodunu bul
    matching_cls = next(
        (c for c in IN_MEMORY_CLASSES if c["id"] == classroom_id or c["code"] == classroom_id),
        None
    )
    class_code = matching_cls["code"] if matching_cls else (classroom_id if "VRG" in classroom_id else "VRG-2535")

    target_words = data.get("target_words") or data.get("target_vocabulary") or []
    raw_questions = data.get("questions") or data.get("comprehension_questions") or []
    
    formatted_questions = []
    for q in raw_questions:
        c_idx = q.get("correct_index", q.get("correct_answer_index", 0))
        formatted_questions.append({
            "question": q.get("question", ""),
            "options": q.get("options", []),
            "correct_index": c_idx,
            "correct_answer_index": c_idx,
            "explanation": q.get("explanation", "")
        })

    new_assign = {
        "id": assign_id,
        "classroom_id": classroom_id,
        "class_code": class_code,
        "title": data.get("title", "Yeni Sınıf Ödevi"),
        "story_content": data.get("story_content") or data.get("content"),
        "target_words": target_words,
        "questions": formatted_questions,
        "due_date": data.get("due_date", "Bu Cuma, 18:00"),
        "completed_percent": 0,
        "created_at": now_iso
    }

    IN_MEMORY_ASSIGNMENTS.insert(0, new_assign)

    if db:
        try:
            db_payload = {
                **new_assign,
                "target_words": json.dumps(target_words, ensure_ascii=False) if isinstance(target_words, list) else target_words,
                "questions": json.dumps(formatted_questions, ensure_ascii=False) if isinstance(formatted_questions, list) else formatted_questions,
            }
            db.table("classroom_assignments").insert(db_payload).execute()
        except Exception as e:
            print(f"[DB Assignment Insert]: {e}")

    return new_assign

def get_assignments_by_code(code: str, db=None) -> List[Dict[str, Any]]:
    """Öğrencinin girdiği 6 haneli sınıf koduna ait ödevleri listeler."""
    norm_code = normalize_class_code(code)

    if db:
        try:
            res = db.table("classroom_assignments").select("*").eq("class_code", norm_code).execute()
            if res.data:
                parsed_list = []
                for row in res.data:
                    tw = row.get("target_words")
                    if isinstance(tw, str):
                        try:
                            tw = json.loads(tw)
                        except Exception:
                            pass
                    qs = row.get("questions")
                    if isinstance(qs, str):
                        try:
                            qs = json.loads(qs)
                        except Exception:
                            pass
                    parsed_list.append({**row, "target_words": tw or [], "questions": qs or []})
                return parsed_list
        except Exception as e:
            print(f"[DB Assignment Select By Code]: {e}")

    # Fallback to memory
    clean_search = norm_code.replace("-", "").upper()
    return [
        a for a in IN_MEMORY_ASSIGNMENTS
        if a.get("class_code", "").replace("-", "").upper() == clean_search
    ]

async def extract_questions_and_vocab_from_text(text: str, level: str = "Intermediate") -> Dict[str, Any]:
    """
    Öğretmenin yapıştırdığı metni Gemini API ile asenkron analiz ederek:
    1. Başlık ve konu
    2. 4-5 hedef kelime (anlam, fonetik ve örnek cümle)
    3. 3 adet 4 şıklı okuma anlama sorusu
    hızlı ve kompakt JSON şemasıyla otomatik çıkartır.
    """
    clean_text = text.strip()
    if not clean_text:
        return {
            "title": "Yeni Okuma Parçası",
            "topic": "Genel",
            "target_vocabulary": [],
            "comprehension_questions": []
        }

    try:
        gemini_res = await async_extract_reading_analysis(clean_text, level=level)
        if isinstance(gemini_res, dict):
            vocab = gemini_res.get("target_vocabulary") or gemini_res.get("target_words") or []
            raw_qs = gemini_res.get("comprehension_questions") or gemini_res.get("questions") or []
            if vocab or raw_qs:
                mapped_qs = []
                for q in raw_qs:
                    c_idx = q.get("correct_index", q.get("correct_answer_index", 0))
                    mapped_qs.append({
                        "question": q.get("question", ""),
                        "options": q.get("options", []),
                        "correct_index": c_idx,
                        "correct_answer_index": c_idx,
                        "explanation": q.get("explanation", "")
                    })
                return {
                    "title": gemini_res.get("title", clean_text[:40].strip().title() or "Yeni Okuma Parçası"),
                    "topic": gemini_res.get("topic", "Genel"),
                    "target_words": vocab,
                    "questions": mapped_qs,
                    "target_vocabulary": vocab,
                    "comprehension_questions": mapped_qs
                }
    except Exception as e:
        print(f"[Classroom Gemini Extract Hatası]: {e}")

    # Fallback (Çevrimdışı veya Kota durumunda akıllı yerel çıkarıcı)
    words = re.findall(r"\b[A-Za-z]{5,}\b", clean_text)
    unique_words = list(dict.fromkeys([w.lower() for w in words]))[:5]
    vocab_items = []
    for w in unique_words:
        cached = COMMON_VOCAB.get(w, {})
        vocab_items.append({
            "word": w,
            "phonetic": cached.get("phonetic", f"/{w}/"),
            "meaning": cached.get("translations", {}).get("tr", "önemli kelime"),
            "example": cached.get("example_en", f"The word '{w}' is used in the text.")
        })

    # Cümlelerden soru türet
    sentences = [s.strip() for s in re.split(r"[.!?]", clean_text) if len(s.strip()) > 15][:3]
    questions = []
    for idx, s in enumerate(sentences):
        opts = [
            s[:70].strip(),
            "The passage does not support this claim",
            "It contradicts the main theme of the context",
            "It occurred only in the distant past"
        ]
        correct_val = opts[0]
        random.shuffle(opts)
        c_idx = opts.index(correct_val)
        questions.append({
            "question": f"According to the text, what is stated about: '{s[:40]}...'?",
            "options": opts,
            "correct_index": c_idx,
            "correct_answer_index": c_idx,
            "explanation": "Metindeki ifadeye doğrudan dayanmaktadır."
        })

    if len(questions) < 3:
        theme_opts = ["Daily life and exploration", "Scientific research and discovery", "Historical event and evolution", "Fictional adventure"]
        correct_theme = theme_opts[0]
        random.shuffle(theme_opts)
        c_idx = theme_opts.index(correct_theme)
        questions.append({
            "question": "What is the primary theme of the reading passage?",
            "options": theme_opts,
            "correct_index": c_idx,
            "correct_answer_index": c_idx,
            "explanation": "Metnin genel bağlamına uygundur."
        })

    final_title = clean_text[:40].strip().title() if clean_text else "Yeni Okuma Parçası"
    return {
        "title": final_title,
        "topic": "Genel Okuma",
        "target_words": vocab_items,
        "questions": questions[:3],
        "target_vocabulary": vocab_items,
        "comprehension_questions": questions[:3]
    }

def extract_questions_and_vocab_from_text_sync(text: str, level: str = "Intermediate") -> Dict[str, Any]:
    """Senkron ortamlardan çağırmak için sarmalayıcı fonksiyon."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                return executor.submit(lambda: asyncio.run(extract_questions_and_vocab_from_text(text, level))).result()
        return loop.run_until_complete(extract_questions_and_vocab_from_text(text, level))
    except Exception:
        return asyncio.run(extract_questions_and_vocab_from_text(text, level))


def create_teacher_story(story_data: dict, db=None) -> dict:
    """Yeni bir öğretmen hikayesini veritabanına ve belleğe kaydeder."""
    story_id = str(uuid.uuid4())
    share_code = generate_share_code()
    now_iso = datetime.now(timezone.utc).isoformat()

    status = story_data.get("status") or ("approved" if story_data.get("visibility") == "class_only" else "pending")

    new_story = {
        "id": story_id,
        "title": story_data["title"],
        "level": story_data.get("level", "Intermediate"),
        "topic": story_data.get("topic", "Genel"),
        "content": story_data["content"],
        "target_vocabulary": story_data.get("target_vocabulary") or [],
        "comprehension_questions": story_data.get("comprehension_questions") or [],
        "status": status,
        "visibility": story_data.get("visibility", "class_only"),
        "share_code": share_code,
        "created_at": now_iso
    }

    # Belleğe ekle
    IN_MEMORY_TEACHER_STORIES.insert(0, new_story)

    # Veritabanına kaydet
    if db:
        try:
            db.table("teacher_stories").insert(new_story).execute()
        except Exception as e:
            print(f"[DB Teacher Story Insert]: {e}")

    return new_story

def list_teacher_stories(status: Optional[str] = None, db=None) -> List[dict]:
    """Öğretmen hikayelerini veritabanından veya bellekten listeler."""
    if db:
        try:
            query = db.table("teacher_stories").select("*").order("created_at", desc=True)
            if status:
                query = query.eq("status", status)
            res = query.execute()
            if res.data:
                return res.data
        except Exception as e:
            print(f"[DB Teacher Story Select]: {e}")

    # Fallback to memory
    if status:
        return [s for s in IN_MEMORY_TEACHER_STORIES if s.get("status") == status]
    return IN_MEMORY_TEACHER_STORIES

def approve_teacher_story(story_id: str, db=None) -> Optional[dict]:
    """Hikayeyi onaylar (status='approved')."""
    # Bellekte güncelle
    target = None
    for s in IN_MEMORY_TEACHER_STORIES:
        if s.get("id") == story_id:
            s["status"] = "approved"
            target = s
            break

    # DB'de güncelle
    if db:
        try:
            res = db.table("teacher_stories").update({"status": "approved"}).eq("id", story_id).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            print(f"[DB Teacher Story Approve]: {e}")

    return target
