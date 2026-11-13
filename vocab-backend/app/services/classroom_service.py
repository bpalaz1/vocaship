import re
import json
import uuid
import random
import string
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
import asyncio
from app.services.ai_service import async_extract_reading_analysis, call_gemini_with_fallback, async_call_gemini_with_fallback
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
    },
    {
        "id": "assign-3-isolated",
        "classroom_id": "cls-2",
        "class_code": "VRG-8492",
        "title": "FIDIC Dispute Adjudication Board Strategy (Yetkisiz Sınıf Ödevi)",
        "story_content": "Alternative Dispute Resolution (ADR) under multilateral development banks guidelines.",
        "target_words": [
            {"word": "arbitration", "meaning": "Tahkim, hakemlik", "phonetic": "/ˌɑː.bɪˈtreɪ.ʃən/", "example": "International arbitration tribunal."}
        ],
        "questions": [],
        "due_date": "Haftaya Salı, 17:00",
        "completed_percent": 40,
        "created_at": "2026-10-25T14:00:00Z"
    }
]

IN_MEMORY_CLASS_MEMBERS: List[Dict[str, Any]] = [
    {
        "id": "mem-1",
        "class_id": "cls-1",
        "class_code": "VRG-2535",
        "user_id": "00000000-0000-0000-0000-000000000001",
        "student_id": "00000000-0000-0000-0000-000000000001",
        "joined_at": "2026-10-22T10:00:00Z"
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

def get_assignments_by_code(code: str, student_id: Optional[str] = None, db=None) -> List[Dict[str, Any]]:
    """Öğrencinin girdiği 6 haneli sınıf koduna ait ödevleri listeler (Öğrenci izolasyonu destekli)."""
    norm_code = normalize_class_code(code)

    if student_id:
        return get_student_assignments(user_id=student_id, class_code=norm_code, db=db)

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

def get_student_assignments(user_id: str, class_code: Optional[str] = None, db=None) -> List[Dict[str, Any]]:
    """
    ÖĞRENCİ ÖDEV VERİ İZOLASYONU MOTORU:
    1. Sadece kullanıcının üye olduğu class_id listesini sorgular:
       SELECT class_id FROM class_members WHERE student_id = current_user_id
    2. Ödevleri sadece bu sınıflarla sınırlandırır:
       WHERE class_id IN (kullanıcının_sınıfları) AND (target_student_id IS NULL OR target_student_id = current_user_id)
    Yetkisiz sınıfların ödevleri asla döndürülmez.
    """
    enrolled_classes = set()
    enrolled_codes = set()

    # 1. DB sorgusu: Sadece kullanıcının üye olduğu class_members kayıtları
    if db:
        try:
            res = db.table("class_members").select("*").eq("user_id", user_id).execute()
            if res and res.data:
                for row in res.data:
                    if row.get("class_id"):
                        enrolled_classes.add(str(row["class_id"]))
                    if row.get("class_code"):
                        enrolled_codes.add(str(row["class_code"]).replace("-", "").upper())
        except Exception as e:
            print(f"[DB class_members lookup]: {e}")

    # Bellek içi class_members kontrolü
    for m in IN_MEMORY_CLASS_MEMBERS:
        if m.get("user_id") == user_id or m.get("student_id") == user_id:
            if m.get("class_id"):
                enrolled_classes.add(str(m["class_id"]))
            if m.get("class_code"):
                enrolled_codes.add(str(m["class_code"]).replace("-", "").upper())

    # Eğer class_code belirtilmişse ve öğrenci bu sınıfa kayıtlı değilse bile, geçerli bir kodla PIN katılımı yapıyorsa üyeliği aç
    if class_code:
        norm_code = class_code.replace("-", "").upper()
        matching_cls = next(
            (c for c in IN_MEMORY_CLASSES if c["code"].replace("-", "").upper() == norm_code or c["id"] == norm_code),
            None
        )
        if matching_cls:
            enrolled_classes.add(str(matching_cls["id"]))
            enrolled_codes.add(str(matching_cls["code"]).replace("-", "").upper())
            # Üyeliği kaydet
            join_member = {
                "id": str(uuid.uuid4()),
                "class_id": matching_cls["id"],
                "class_code": matching_cls["code"],
                "user_id": user_id,
                "joined_at": datetime.now(timezone.utc).isoformat()
            }
            IN_MEMORY_CLASS_MEMBERS.append(join_member)
            if db:
                try:
                    db.table("class_members").insert(join_member).execute()
                except Exception:
                    pass

    # Öğrencinin kayıtlı olduğu bir sınıf yoksa veri izolasyonu gereği boş liste dön
    if not enrolled_classes and not enrolled_codes:
        return []

    results = []

    # DB üzerinden çek
    if db:
        try:
            res = db.table("classroom_assignments").select("*").execute()
            if res and res.data:
                for row in res.data:
                    cid = str(row.get("classroom_id") or "")
                    ccode = str(row.get("class_code") or "").replace("-", "").upper()
                    target_std = row.get("target_student_id")

                    if (cid in enrolled_classes or ccode in enrolled_codes) and (not target_std or target_std == user_id):
                        tw = row.get("target_words")
                        if isinstance(tw, str):
                            try: tw = json.loads(tw)
                            except Exception: pass
                        qs = row.get("questions")
                        if isinstance(qs, str):
                            try: qs = json.loads(qs)
                            except Exception: pass
                        results.append({**row, "target_words": tw or [], "questions": qs or []})
        except Exception as e:
            print(f"[DB filtered assignments]: {e}")

    # Bellek içi filtreleme (DB'de olmayan demo/bellek içi ödevleri de dahil et)
    seen_ids = {r.get("id") for r in results}
    for a in IN_MEMORY_ASSIGNMENTS:
        aid = a.get("id")
        if aid in seen_ids:
            continue
        cid = str(a.get("classroom_id") or "")
        ccode = str(a.get("class_code") or "").replace("-", "").upper()
        target_std = a.get("target_student_id")

        if (cid in enrolled_classes or ccode in enrolled_codes) and (not target_std or target_std == user_id):
            results.append(a)

    return results

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

# =========================================================================
# 5. CANLI YARIŞMA PODYUM VE ADİL ÖDÜL MOTORU
# =========================================================================

# Anti-cheat: Oturum başına talep edilen ödülleri tutan bellek içi hızlı önbellek
CLAIMED_SESSION_REWARDS: Dict[str, Dict[str, Any]] = {}

REWARD_RULES: Dict[int, Dict[str, Any]] = {
    1: {"xp": 100, "coins": 50, "key": "chest_key_epic", "key_name": "Epik Sandık Anahtarı 🔑"},
    2: {"xp": 70, "coins": 35, "key": "chest_key_rare", "key_name": "Nadir Sandık Anahtarı 🔑"},
    3: {"xp": 50, "coins": 25, "key": "chest_key_common", "key_name": "Standart Sandık Anahtarı 🔑"},
}
DEFAULT_PARTICIPATION_REWARD = {"xp": 20, "coins": 10, "key": None, "key_name": None}

def claim_game_rewards(
    session_id: str,
    rank: int,
    user_id: Optional[str] = None,
    game_mode: str = "live_arena",
    db=None
) -> Dict[str, Any]:
    from app.services.gamification_service import get_or_create_user, calculate_level_info

    actual_user_id = user_id or "default_user_001"
    claim_key = f"{session_id}:{actual_user_id}"

    # Anti-cheat: Mükerrer talep kontrolü (Memory Cache)
    if claim_key in CLAIMED_SESSION_REWARDS:
        prev = CLAIMED_SESSION_REWARDS[claim_key]
        return {
            "success": True,
            "session_id": session_id,
            "user_id": actual_user_id,
            "rank": rank,
            "awarded_xp": prev["xp"],
            "awarded_gold": prev["coins"],
            "awarded_key": prev.get("key"),
            "key_name": prev.get("key_name"),
            "new_total_xp": prev.get("new_total_xp", 0),
            "new_coins": prev.get("new_coins", 0),
            "message": "Bu yarışmanın ödülleri daha önce güvenle cüzdanınıza aktarılmıştır.",
            "already_claimed": True
        }

    # Anti-cheat: DB Session Rewards Check
    if db:
        try:
            res = db.table("session_rewards").select("*").eq("session_id", session_id).eq("user_id", actual_user_id).execute()
            if res and res.data and len(res.data) > 0:
                row = res.data[0]
                CLAIMED_SESSION_REWARDS[claim_key] = {
                    "xp": row["xp"],
                    "coins": row["coins"],
                    "key": row.get("key_reward"),
                    "key_name": "Sandık Anahtarı" if row.get("key_reward") else None,
                    "new_total_xp": 0,
                    "new_coins": 0,
                }
                return {
                    "success": True,
                    "session_id": session_id,
                    "user_id": actual_user_id,
                    "rank": rank,
                    "awarded_xp": row["xp"],
                    "awarded_gold": row["coins"],
                    "awarded_key": row.get("key_reward"),
                    "key_name": "Sandık Anahtarı" if row.get("key_reward") else None,
                    "new_total_xp": 0,
                    "new_coins": 0,
                    "message": "Bu yarışmanın ödülleri daha önce güvenle cüzdanınıza aktarılmıştır.",
                    "already_claimed": True
                }
        except Exception as e:
            print(f"[DB Session Check]: {e}")

    # Dereceye Göre Dağıtım Hesabı
    rule = REWARD_RULES.get(rank, DEFAULT_PARTICIPATION_REWARD)
    xp_to_add = rule["xp"]
    coins_to_add = rule["coins"]
    key_reward = rule["key"]
    key_name = rule["key_name"]

    # Kullanıcı bakiyesini güvenle arttır (increment)
    user = get_or_create_user(db, actual_user_id)
    curr_xp = int(user.get("total_xp") or 0)
    curr_coins = int(user.get("coins") if user.get("coins") is not None else 300)

    new_total_xp = curr_xp + xp_to_add
    new_coins = curr_coins + coins_to_add

    # Inventory Keys
    inv_keys_raw = user.get("inventory_keys")
    inv_keys = {}
    if isinstance(inv_keys_raw, str):
        try:
            inv_keys = json.loads(inv_keys_raw)
        except Exception:
            inv_keys = {}
    elif isinstance(inv_keys_raw, dict):
        inv_keys = dict(inv_keys_raw)

    if key_reward:
        inv_keys[key_reward] = inv_keys.get(key_reward, 0) + 1

    lvl_info = calculate_level_info(new_total_xp)

    update_payload = {
        "total_xp": new_total_xp,
        "coins": new_coins,
        "level": lvl_info["level"],
        "inventory_keys": json.dumps(inv_keys)
    }

    if db:
        try:
            db.table("users").update(update_payload).eq("id", user["id"]).execute()
            db.table("session_rewards").insert({
                "id": str(uuid.uuid4()),
                "session_id": session_id,
                "user_id": actual_user_id,
                "rank": rank,
                "xp": xp_to_add,
                "coins": coins_to_add,
                "key_reward": key_reward,
                "claimed_at": datetime.now(timezone.utc).isoformat()
            }).execute()
        except Exception as e:
            print(f"[DB Reward Update Error]: {e}")

    # Önbelleğe kaydet (Anti-cheat)
    CLAIMED_SESSION_REWARDS[claim_key] = {
        "xp": xp_to_add,
        "coins": coins_to_add,
        "key": key_reward,
        "key_name": key_name,
        "new_total_xp": new_total_xp,
        "new_coins": new_coins,
        "claimed_at": datetime.now(timezone.utc).isoformat()
    }

    key_msg = f", 1x {key_name}" if key_name else ""
    return {
        "success": True,
        "session_id": session_id,
        "user_id": actual_user_id,
        "rank": rank,
        "awarded_xp": xp_to_add,
        "awarded_gold": coins_to_add,
        "awarded_key": key_reward,
        "key_name": key_name,
        "new_total_xp": new_total_xp,
        "new_coins": new_coins,
        "message": f"Tebrikler! {rank}. sıra ödülleri (+{xp_to_add} XP, +{coins_to_add} 🪙{key_msg}) başarıyla cüzdanınıza aktarıldı!",
        "already_claimed": False
    }


# =========================================================================
# 6. KOLEKTİF İNTERAKTİF HİKAYE DOKUMA MOTORU (FAZ 6)
# =========================================================================

async def weave_collective_story(
    target_words: List[str],
    story_history: List[str],
    selected_choice: Optional[str] = None,
    grade_level: str = "B1-B2"
) -> Dict[str, Any]:
    """
    Verilen hedef kelimeleri, sınıfın geçmiş paragraf akışına ve seçtiği son karara göre
    Gemini 2.5/Flash AI ile interaktif bir macera örgüsüne dönüştürür.
    """
    cleaned_words = [w.strip() for w in target_words if w and w.strip()]
    if not cleaned_words:
        cleaned_words = ["mitochondria", "photosynthesis", "osmosis", "homeostasis"]

    history_text = "\n\n".join(story_history) if story_history else "(Beginning of the story)"
    choice_text = selected_choice or "Begin the adventure with an intriguing discovery"

    prompt = f"""
You are an interactive, creative storytelling AI designed for high-engagement smart-board classroom lessons.
Target CEFR English Level: {grade_level}.

TARGET VOCABULARY TO WEAVE:
{', '.join(cleaned_words)}

STORY HISTORY SO FAR:
{history_text}

LATEST CLASS VOTE / PROMPT:
{choice_text}

STRICT INSTRUCTIONS:
1. Write the NEXT SEGMENT (2 to 4 evocative, grammatically clear sentences).
2. Naturally weave 1 to 3 of the target vocabulary words into this segment in proper academic/narrative context.
3. Every time you use any of the target words, format it strictly with double asterisks, like **word**.
4. Generate 3 engaging, distinct, interactive choices (labeled A, B, C) for the classroom to vote on what should happen next.
5. Return ONLY a valid JSON object with EXACTLY this structure:
{{
  "next_segment": "...",
  "used_words": ["..."],
  "choices": [
    "A) ...",
    "B) ...",
    "C) ..."
  ]
}}
"""

    try:
        data = await async_call_gemini_with_fallback(prompt, temperature=0.7)
        if isinstance(data, dict) and "next_segment" in data and "choices" in data:
            segment = str(data["next_segment"])
            used_words = list(data.get("used_words", []))

            # Saptanan hedef kelimeleri tespit et ve formatla
            for tw in cleaned_words:
                if re.search(rf"\b{re.escape(tw)}\b", segment, re.IGNORECASE):
                    if not any(u.lower() == tw.lower() for u in used_words):
                        used_words.append(tw)
                    if f"**{tw}**" not in segment:
                        segment = re.sub(rf"\b({re.escape(tw)})\b", r"**\1**", segment, flags=re.IGNORECASE)

            choices = data.get("choices", [])
            if len(choices) < 3:
                choices = [
                    "A) Investigate the anomalies with the portable sensor kit.",
                    "B) Signal the rest of the research academy before taking another step.",
                    "C) Formulate a preliminary hypothesis and document the specimen."
                ]

            return {
                "next_segment": segment,
                "used_words": used_words,
                "choices": choices[:3]
            }
    except Exception as e:
        print(f"[Story Weave Gemini Error, using fallback generator]: {e}")

    # Fallback Procedural Story Generator
    turn_idx = len(story_history)
    selected_word_candidates = [
        w for w in cleaned_words if not any(w.lower() in p.lower() for p in story_history)
    ]
    if not selected_word_candidates:
        selected_word_candidates = cleaned_words

    picked_word = selected_word_candidates[0] if selected_word_candidates else "discovery"
    second_word = selected_word_candidates[1] if len(selected_word_candidates) > 1 else None

    cleaned_choice_title = (
        choice_text.lower()
        .replace("a) ", "")
        .replace("b) ", "")
        .replace("c) ", "")
    )

    if turn_idx == 0:
        segment = f"The expedition team arrived at the deep underground research sanctum, their biosensors glowing in the dim chamber. Dr. Elena immediately observed that the anomalous specimens were generating energy akin to a living **{picked_word}**."
        if second_word:
            segment += f" Ambient light filtered through the crystalline ceiling, sparking a spontaneous reaction reminiscent of **{second_word}**."
        choices = [
            "A) Approach the central altar to extract an active energy sample.",
            "B) Scan the perimeter walls for ancient hieroglyphs and warnings.",
            "C) Deploy autonomous surveillance drones down the eastern corridor."
        ]
        used = [picked_word] + ([second_word] if second_word else [])
    elif turn_idx == 1:
        segment = f"Following the class's decision to {cleaned_choice_title}, a hidden hydraulic valve clicked open. The liquid inside the glass tube shifted rapidly, demonstrating intense **{picked_word}** across the semi-permeable boundary."
        choices = [
            "A) Stabilize the thermal core before the pressure threshold is exceeded.",
            "B) Record audio frequencies of the strange rhythmic hum echoing inside.",
            "C) Follow the luminescent conduits leading toward the subterranean lake."
        ]
        used = [picked_word]
    else:
        segment = f"Guided by the latest collective decision, the team cautiously advanced as the environmental monitors stabilized into steady **{picked_word}**. The discoveries in this forgotten laboratory proved that collaborative science could unlock secrets buried for millennia."
        choices = [
            "A) Seal the vault and transmit the findings to the Global Science Council.",
            "B) Vent the containment chamber to prevent critical overload.",
            "C) Initiate the final synthesis protocol to complete the experiment."
        ]
        used = [picked_word]

    return {
        "next_segment": segment,
        "used_words": used,
        "choices": choices
    }


# =========================================================================
# 7. AKILLI TAHTA DERS SONU YAPAY ZEKÂ ANALİZİ & SM-2 ÖDEV MOTORU
# =========================================================================

def _extract_real_context_terms_and_summary(
    class_id: str,
    transcript: str,
    pdf_text_context: Optional[str] = None,
    highlighted_words: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Herhangi bir mock veya sabit biyoloji kalıbı içermeyen,
    doğrudan tahtadaki PDF metni ve transkriptten kilit kavramları çıkaran dinamik analizci.
    """
    pdf_text = (pdf_text_context or "").strip()
    clean_transcript = (transcript or "").strip()
    combined_text = f"{pdf_text} {clean_transcript}".strip()

    # 1. Başlık Belirleme (Doğrudan konuya odaklanır, soyut eğitim metodolojisi başlıkları atmaz)
    derived_title = "Ders Konusu & Temel Kavramlar"
    if highlighted_words and len(highlighted_words) > 0 and highlighted_words[0].strip():
        derived_title = f"{highlighted_words[0].strip().title()} ve Temel Kavramlar"
    elif pdf_text:
        first_clean_line = ""
        for line in pdf_text.split("\n"):
            line_str = line.strip()
            # Başlık satırlarını ve konu adını bul
            if line_str.startswith("[Sayfa"):
                line_str = re.sub(r"^\[Sayfa \d+\]:\s*", "", line_str).strip()
            if len(line_str) >= 4 and not line_str.startswith("%") and not line_str.startswith("/"):
                first_clean_line = line_str[:60]
                break
        if first_clean_line:
            # Genel kalıp kelimeleri başlıktan ayıkla
            clean_title = re.sub(r"^(konu|ünite|bölüm|ders|öğrenme|metin)\s*[:\-]\s*", "", first_clean_line, flags=re.I)
            derived_title = clean_title.strip().capitalize()
    elif clean_transcript:
        first_words = " ".join(clean_transcript.split()[:5])
        derived_title = f"{first_words.capitalize()}..."

    # 2. Metindeki Gerçek Kelimeleri ve Frekansları Çıkar
    words = re.findall(r"[a-zA-ZçğıöşüÇĞİÖŞÜ]{3,}", combined_text)
    stop_words = {
        "bir", "bu", "ve", "ile", "için", "olan", "daha", "çok", "kadar", "gibi",
        "veya", "ama", "fakat", "ancak", "çünkü", "nasıl", "neden", "diye", "olarak",
        "tarafından", "üzerine", "sonra", "önce", "kendi", "tüm", "her", "bazı",
        "the", "and", "that", "this", "with", "from", "for", "are", "was", "were", "been",
        "have", "has", "had", "will", "would", "can", "could", "should", "their", "there",
        "ders", "öğretmen", "öğrenci", "tahta", "sayfa", "konu", "olan", "göre", "bunu",
        "eğitim", "metodoloji", "değerlendirme", "çalışma", "kağıdı", "ünite", "kazanım", "etkinlik"
    }

    freq: Dict[str, int] = {}
    for w in words:
        wl = w.lower()
        if wl not in stop_words and len(wl) >= 3:
            cap = w.capitalize()
            freq[cap] = freq.get(cap, 0) + 1

    sorted_candidates = sorted(freq.keys(), key=lambda k: freq[k], reverse=True)

    key_terms: List[Dict[str, str]] = []
    used_words = set()

    # Vurgulanan kelimeleri öncelikli al
    for hw in (highlighted_words or []):
        clean_hw = hw.strip().capitalize()
        if clean_hw and clean_hw.lower() not in used_words:
            used_words.add(clean_hw.lower())
            key_terms.append({
                "word": clean_hw,
                "turkish": f"{clean_hw} (Derste vurgulanan anahtar kavram)",
                "phonetic": "",
                "example": f"Öğretmen ders anlatımında {clean_hw} kavramı üzerinde durdu."
            })
        if len(key_terms) >= 5:
            break

    # Metinden çıkan en sık kavramlarla tamamla
    for cand in sorted_candidates:
        if len(key_terms) >= 5:
            break
        if cand.lower() not in used_words:
            used_words.add(cand.lower())
            key_terms.append({
                "word": cand,
                "turkish": f"{cand} (Ders materyalinde geçen temel kavram)",
                "phonetic": "",
                "example": f"Ders içeriğinde {cand} konusu detaylıca açıklandı."
            })

    # Eğer metin tamamen boşsa ders branşına uygun dinamik genel kavramlar
    fallback_academic = ["Kavram Analizi", "Temel İlke", "Uygulama Metodu", "Problem Çözümü", "Kritik Çıkarım"]
    for fb in fallback_academic:
        if len(key_terms) >= 5:
            break
        if fb.lower() not in used_words:
            key_terms.append({
                "word": fb,
                "turkish": f"{fb} (Ders kazanımlarının ana bileşeni)",
                "phonetic": "",
                "example": f"Bu derste {fb} üzerinde durularak pekiştirme yapıldı."
            })

    first_term = key_terms[0]["word"] if key_terms else "Temel Konu"
    second_term = key_terms[1]["word"] if len(key_terms) > 1 else "Anahtar Kavram"

    summary_points = [
        f"'{derived_title}' konusunda metinde yer alan temel bilgiler, ilkeler ve örnekler incelendi.",
        f"Öğrencilerle interaktif işlenerek '{first_term}' ve '{second_term}' kavramlarının ders bağlamındaki yeri pekiştirildi.",
        f"Dersin kilit noktaları tamamlanarak '{derived_title}' kazanımları somutlaştırıldı."
    ]

    quiz_questions = [
        {
            "question": f"Bugünkü derste işlenen '{first_term}' kavramının temel önemi nedir?",
            "options": [
                f"{key_terms[0]['turkish']} olarak dersin merkezinde yer alması",
                "Yalnızca ikincil bir detay olması",
                "Ders konusuyla herhangi bir ilgisinin bulunmaması",
                "Sadece eski metinlerde geçmesi"
            ],
            "correct_index": 0,
            "explanation": f"'{first_term}' dersin anahtar kavramlarından biridir."
        },
        {
            "question": f"Derste geçen '{second_term}' hangi amaca yönelik pekiştirilmiştir?",
            "options": [
                "Konunun pratik ve mantıksal kavranmasını sağlamak için",
                "Sadece ezber amaçlı",
                "Dersi uzatmak için",
                "Herhangi bir amaca hizmet etmemektedir"
            ],
            "correct_index": 0,
            "explanation": "Kavramların doğru bağlamda kullanımı kalıcı öğrenmeyi hedefler."
        },
        {
            "question": "Bu derste öğrenilen kavramların kalıcılığı için en etkili çalışma yöntemi nedir?",
            "options": [
                "SM-2 aralıklı tekrar sistemiyle terimleri periyodik pekiştirmek",
                "Ders notlarına bir daha hiç bakmamak",
                "Yalnızca sınav sabahı hızlıca göz gezdirmek",
                "Tüm konuları tek seferde ezberlemeye çalışmak"
            ],
            "correct_index": 0,
            "explanation": "SM-2 algoritması unutma eğrisini kırarak bilgiyi uzun süreli belleğe taşır."
        }
    ]

    return {
        "class_id": class_id,
        "title": derived_title,
        "summary_points": summary_points,
        "key_terms": key_terms[:5],
        "quiz_questions": quiz_questions[:3],
        "created_at": datetime.now(timezone.utc).isoformat()
    }


async def generate_board_summary(
    class_id: str,
    transcript: str,
    pdf_text_context: Optional[str] = None,
    highlighted_words: Optional[List[str]] = None,
    db=None
) -> Dict[str, Any]:
    """
    Öğretmenin yerel transkriptini, PDF metin bağlamını ve vurgulanan terimleri
    Gemini 2.5 Flash ile analiz ederek o dersin gerçek branşına (Din Kültürü, Matematik,
    Tarih, İngilizce vb.) tam uyumlu 3-4 maddelik hap özet, 5 kilit kavram ve 3 anlama sorusu üretir.
    """
    highlighted_words = [w.strip() for w in (highlighted_words or []) if w and w.strip()]
    cleaned_transcript = (transcript or "").strip()
    pdf_context = (pdf_text_context or "").strip()

    prompt = f"""
Sen akıllı tahtada işlenen canlı bir dersi analiz eden uzman bir pedagojik yapay zekâ asistanısın.
GÖREV: Sana verilen PDF metninin ve ders transkriptinin DOĞRUDAN KONUSUNU (Örn: Melekler, Varlıklar Âlemi, Fonksiyonlar, Kurtuluş Savaşı, Kimyasal Bağlar, DNA vb.) analiz et.
Asla "eğitim metodolojisi", "çalışma kağıdı değerlendirmesi", "interaktif ders çalışması" gibi genel ve soyut başlıklar atma!
Metinde anlatılan dini, fen, matematik, tarih veya edebiyat konusunun özünü 3 maddede özetle ve o konudan 5 anahtar terim çıkar.

DERS BAĞLAMI:
Sınıf / Ders: {class_id}
Öğretmen Konuşma Transkripti:
{cleaned_transcript if cleaned_transcript else "(Sesli transkript kaydedilmedi - PDF materyal metnine odaklan)"}

Açık PDF / Ders Materyali Metni (Tam İçerik):
{pdf_context if pdf_context else "(PDF metni girilmedi - transkript ve sınıf bilgisine odaklan)"}

Vurgulanan Anahtar Kelimeler:
{", ".join(highlighted_words) if highlighted_words else "(Özel vurgulama yapılmadı)"}

KRİTİK TALİMATLAR:
1. Kesinlikle varsayılan kalıp veya alakasız branş (örn. fen/biyoloji) uydurma! Açık olan metin hangi ders ve konuysa (örn. Din Kültürü ise Melekler, Cebrail, Mikail, Ahiret, Varlıklar Âlemi vb., Matematik ise Fonksiyonlar/Üslü Sayılar vb., Tarih ise Kurtuluş Savaşı vb.) DOĞRUDAN o konunun özünü analiz et.
2. "title": Belgenin veya dersin anlattığı asıl konuyu belirten net başlık (Örn: "Melekler ve Varlıklar Âlemi", "Fonksiyon Grafikleri", "Kurtuluş Savaşı Cepheleri").
3. "summary_points": Metinde anlatılan konunun özünü ve temel bilgilerini doğrudan aktaran 3 maddelik konu özeti (Türkçe).
4. "key_terms": O konudan çıkarılan en kritik 5 anahtar terim veya kavram.
   Her terim için:
   - "word": Terimin adı (İngilizce dersi ise İngilizce kelime, Türkçe/Tarih/Din/Matematik ise Türkçe terim)
   - "turkish": Terimin bu ders konusundaki net tanımı ve anlamı
   - "phonetic": Varsa okunuşu veya alanı (örn. Din Kültürü, Matematik)
   - "example": Bu kavramın kullanıldığı doğal bir örnek cümle
5. "quiz_questions": Bu dersin konusunu ölçen TAM 3 ADET çoktan seçmeli soru.
   Her soru için:
   - "question": Net soru kökü
   - "options": 4 mantıklı seçenek [A, B, C, D]
   - "correct_index": Doğru seçeneğin indeksi (0-3)
   - "explanation": Doğru cevabın pedagojik açıklaması

JSON FORMATI (YALNIZCA GEÇERLİ JSON):
{{
  "title": "...",
  "summary_points": ["...", "...", "..."],
  "key_terms": [
    {{"word": "...", "turkish": "...", "phonetic": "...", "example": "..."}},
    {{"word": "...", "turkish": "...", "phonetic": "...", "example": "..."}},
    {{"word": "...", "turkish": "...", "phonetic": "...", "example": "..."}},
    {{"word": "...", "turkish": "...", "phonetic": "...", "example": "..."}},
    {{"word": "...", "turkish": "...", "phonetic": "...", "example": "..."}}
  ],
  "quiz_questions": [
    {{"question": "...", "options": ["...", "...", "...", "..."], "correct_index": 0, "explanation": "..."}},
    {{"question": "...", "options": ["...", "...", "...", "..."], "correct_index": 1, "explanation": "..."}},
    {{"question": "...", "options": ["...", "...", "...", "..."], "correct_index": 2, "explanation": "..."}}
  ]
}}
"""

    try:
        data = await asyncio.wait_for(async_call_gemini_with_fallback(prompt, temperature=0.3), timeout=8.0)
        if isinstance(data, dict) and "summary_points" in data and "key_terms" in data:
            title = str(data.get("title") or "Akıllı Tahta İnteraktif Ders Özeti")
            summary_points = list(data.get("summary_points", []))
            if len(summary_points) < 3:
                summary_points.append("Ders boyunca kilit kavramlar ve pratik örnekler pekiştirildi.")

            raw_terms = list(data.get("key_terms", []))
            key_terms = []
            for t in raw_terms[:5]:
                key_terms.append({
                    "word": str(t.get("word", "")),
                    "turkish": str(t.get("turkish", "")),
                    "phonetic": str(t.get("phonetic", "")),
                    "example": str(t.get("example", ""))
                })

            raw_questions = list(data.get("quiz_questions", []))
            quiz_questions = []
            for q in raw_questions[:3]:
                opts = list(q.get("options", []))
                if len(opts) < 4:
                    opts = ["Seçenek A", "Seçenek B", "Seçenek C", "Seçenek D"]
                c_idx = int(q.get("correct_index", 0))
                if c_idx < 0 or c_idx >= len(opts):
                    c_idx = 0
                quiz_questions.append({
                    "question": str(q.get("question", "")),
                    "options": opts[:4],
                    "correct_index": c_idx,
                    "explanation": str(q.get("explanation", ""))
                })

            # Eğer 5 kelime veya 3 soru eksikse dinamik içerikten tamamla
            if len(key_terms) < 5 or len(quiz_questions) < 3:
                dyn = _extract_real_context_terms_and_summary(class_id, cleaned_transcript, pdf_context, highlighted_words)
                for dt in dyn["key_terms"]:
                    if len(key_terms) >= 5:
                        break
                    if not any(k["word"].lower() == dt["word"].lower() for k in key_terms):
                        key_terms.append(dt)
                for dq in dyn["quiz_questions"]:
                    if len(quiz_questions) >= 3:
                        break
                    quiz_questions.append(dq)

            return {
                "class_id": class_id,
                "title": title,
                "summary_points": summary_points[:4],
                "key_terms": key_terms[:5],
                "quiz_questions": quiz_questions[:3],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
    except Exception as e:
        print(f"[Board Summary AI Gemini Error, using dynamic real-context fallback]: {e}")

    # Yapay zekâ yanıt vermezse dinamik gerçek metin çıkarıcısını kullan
    return _extract_real_context_terms_and_summary(
        class_id=class_id,
        transcript=cleaned_transcript,
        pdf_text_context=pdf_context,
        highlighted_words=highlighted_words
    )


def assign_board_lesson_to_class(
    class_id: str,
    title: str,
    summary_points: List[str],
    key_terms: List[Dict[str, Any]],
    quiz_questions: List[Dict[str, Any]],
    db=None
) -> Dict[str, Any]:
    """
    Ders özetini, 5 kritik kelimeyi ve 3 soruyu sınıfa ödev olarak fırlatır;
    kelimeleri öğrencilerin SM-2 tekrar kuyruğuna (needs_review=True, interval=1) ekler.
    """
    from app.services.study_service import process_card_review_result

    # 1. Ödev kaydı oluştur
    assign_payload = {
        "classroom_id": class_id,
        "title": f"⚡ Tahta Dersi Ödevi: {title}",
        "story_content": "\n".join(summary_points),
        "target_words": [
            {
                "word": t.get("word", ""),
                "meaning": t.get("turkish", ""),
                "phonetic": t.get("phonetic", ""),
                "example": t.get("example", "")
            }
            for t in key_terms
        ],
        "questions": [
            {
                "question": q.get("question", ""),
                "options": q.get("options", []),
                "correct_index": q.get("correct_index", 0),
                "explanation": q.get("explanation", "")
            }
            for q in quiz_questions
        ],
        "due_date": "Bu Hafta Sonu, 23:59"
    }

    assignment = create_assignment(assign_payload, db=db)

    # 2. SM-2 Tekrar Kuyruğuna Ekle (Zayıf Nokta / Öncelikli Tekrar)
    sm2_enqueued_words = []
    for t in key_terms:
        word = t.get("word")
        if word:
            try:
                # needs_review=True ve tekrar başlatmak için rating=2 ile sisteme kaydet
                process_card_review_result(card_id=word, is_correct=False, rating=2)
                sm2_enqueued_words.append(word)
            except Exception as e:
                print(f"[SM-2 enqueue warning for {word}]: {e}")

    return {
        "success": True,
        "assignment": assignment,
        "enqueued_terms_count": len(sm2_enqueued_words),
        "enqueued_terms": sm2_enqueued_words,
        "message": f"Ders özeti sınıfa ödev olarak fırlatıldı ve {len(sm2_enqueued_words)} kelime SM-2 kuyruğuna alındı! 🚀"
    }


# =========================================================================
# FAZ 2: TEKİL KULLANICI SINIF, BİLET, UTC TAKVİM, IBAN & MANUEL GÖNDERİM
# =========================================================================

IN_MEMORY_CLASSES_V2: List[Dict[str, Any]] = []
IN_MEMORY_CLASS_SESSIONS: List[Dict[str, Any]] = []
IN_MEMORY_SESSION_ATTENDEES: List[Dict[str, Any]] = []
IN_MEMORY_MATERIAL_DELIVERIES: List[Dict[str, Any]] = []


def generate_invite_slug(db=None) -> str:
    """Benzersiz 6 haneli kısa davet kodu üretir (Örn: 7A2-5K9)."""
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    for _ in range(50):
        part1 = "".join(random.choices(chars, k=3))
        part2 = "".join(random.choices(chars, k=3))
        slug = f"{part1}-{part2}"

        # DB ve bellek kontrolü
        exists = False
        if db:
            try:
                res = db.table("classes").select("id").eq("invite_slug", slug).execute()
                if res.data and len(res.data) > 0:
                    exists = True
            except Exception:
                pass
        if not exists:
            if not any(c.get("invite_slug") == slug for c in IN_MEMORY_CLASSES_V2):
                return slug

    return f"{uuid.uuid4().hex[:3].upper()}-{uuid.uuid4().hex[3:6].upper()}"


def create_faz2_class(
    teacher_id: str,
    name: str,
    price: float = 0.0,
    currency: str = "TRY",
    billing_type: str = "one_time",
    schedule_mode: str = "fixed",
    scheduled_dates_utc: Optional[List[str]] = None,
    duration_minutes: int = 60,
    monthly_credits: int = 0,
    db=None
) -> Dict[str, Any]:
    """
    Yeni tekil sınıf açar.
    Eğer price > 0 ise payout_profiles tablosunda IBAN doğrulaması yapar.
    Oturumları class_sessions tablosuna status='scheduled' olarak ekler.
    """
    from app.api.v1.endpoints.payments import has_payout_profile

    # Ücretli ders ise IBAN zorunluluğu kontrolü
    if price > 0:
        if not has_payout_profile(teacher_id, db=db):
            return {
                "error": "IBAN_REQUIRED",
                "message": "Ücretli ders açmak için önce IBAN bilgilerinizi tanımlamalısınız."
            }

    class_id = str(uuid.uuid4())
    invite_slug = generate_invite_slug(db=db)
    now_iso = datetime.now(timezone.utc).isoformat()

    class_record = {
        "id": class_id,
        "teacher_id": teacher_id,
        "name": name.strip(),
        "price": float(price),
        "currency": currency.upper(),
        "billing_type": billing_type,
        "schedule_mode": schedule_mode,
        "duration_minutes": int(duration_minutes),
        "monthly_credits": int(monthly_credits),
        "invite_slug": invite_slug,
        "code": invite_slug,
        "student_count": 0,
        "created_at": now_iso
    }

    if db:
        try:
            db.table("classes").insert(class_record).execute()
        except Exception as e:
            print(f"[DB classes Insert Error]: {e}")

    IN_MEMORY_CLASSES_V2.insert(0, class_record)

    # Oturumları oluştur (class_sessions)
    created_sessions = []
    dates = scheduled_dates_utc or []
    for date_str in dates:
        session_id = str(uuid.uuid4())
        session_record = {
            "id": session_id,
            "class_id": class_id,
            "session_date_utc": date_str,
            "duration_minutes": duration_minutes,
            "status": "scheduled",
            "started_at": None,
            "ended_at": None,
            "created_at": now_iso
        }
        if db:
            try:
                db.table("class_sessions").insert(session_record).execute()
            except Exception as e:
                print(f"[DB class_sessions Insert Error]: {e}")

        IN_MEMORY_CLASS_SESSIONS.append(session_record)
        created_sessions.append(session_record)

    return {
        "id": class_id,
        "teacher_id": teacher_id,
        "name": class_record["name"],
        "price": class_record["price"],
        "currency": class_record["currency"],
        "billing_type": class_record["billing_type"],
        "schedule_mode": class_record["schedule_mode"],
        "duration_minutes": class_record["duration_minutes"],
        "monthly_credits": class_record["monthly_credits"],
        "invite_slug": invite_slug,
        "code": invite_slug,
        "sessions": created_sessions,
        "created_at": now_iso
    }


def get_class_by_invite_slug(slug: str, db=None) -> Optional[Dict[str, Any]]:
    """
    Davet linki (slug) ile sınıfı ve yaklaşan (scheduled) oturumlarını getirir.
    """
    clean_slug = slug.strip().upper()
    class_record = None

    if db:
        try:
            res = db.table("classes").select("*").eq("invite_slug", clean_slug).execute()
            if res.data and len(res.data) > 0:
                class_record = res.data[0]
        except Exception as e:
            print(f"[DB Get Class by Slug Error]: {e}")

    if not class_record:
        class_record = next(
            (c for c in IN_MEMORY_CLASSES_V2 if c.get("invite_slug", "").upper() == clean_slug or c.get("code", "").upper() == clean_slug),
            None
        )

    if not class_record:
        return None

    class_id = class_record["id"]

    # Yaklaşan oturumları çek (status='scheduled')
    upcoming_sessions = []
    if db:
        try:
            s_res = db.table("class_sessions").select("*").eq("class_id", class_id).eq("status", "scheduled").order("session_date_utc").execute()
            if s_res.data:
                upcoming_sessions = s_res.data
        except Exception as e:
            print(f"[DB Get Sessions Error]: {e}")

    if not upcoming_sessions:
        upcoming_sessions = [
            s for s in IN_MEMORY_CLASS_SESSIONS
            if s.get("class_id") == class_id and s.get("status") == "scheduled"
        ]
        upcoming_sessions.sort(key=lambda x: x.get("session_date_utc", ""))

    # Öğretmen bilgisi
    teacher_name = "Eğitmen"
    teacher_id = class_record.get("teacher_id")
    if teacher_id and db:
        try:
            u_res = db.table("users").select("full_name, username").eq("id", teacher_id).execute()
            if u_res.data and len(u_res.data) > 0:
                teacher_name = u_res.data[0].get("full_name") or u_res.data[0].get("username") or "Eğitmen"
        except Exception:
            pass

    return {
        "class": class_record,
        "upcoming_sessions": upcoming_sessions,
        "teacher": {
            "id": teacher_id,
            "name": teacher_name
        }
    }


def join_class_by_slug(slug: str, user_id: str, selected_session_id: Optional[str] = None, db=None) -> Dict[str, Any]:
    """
    Sınıfa katılma işlemi:
    - price == 0: session_attendees tablosuna payment_status='free' olarak kaydet, erişim ver.
    - price > 0: session_attendees tablosunda 'paid' veya 'subscription_active' kontrolü yap.
    """
    class_info = get_class_by_invite_slug(slug, db=db)
    if not class_info:
        return {"error": "NOT_FOUND", "message": "Sınıf bulunamadı."}

    class_record = class_info["class"]
    class_id = class_record["id"]
    price = float(class_record.get("price", 0.0))
    now_iso = datetime.now(timezone.utc).isoformat()

    if price == 0:
        # Ücretsiz sınıf: Katılımcı kaydını oluştur
        existing_attendee = None
        if db:
            try:
                a_res = db.table("session_attendees").select("*").eq("class_id", class_id).eq("user_id", user_id).execute()
                if a_res.data and len(a_res.data) > 0:
                    existing_attendee = a_res.data[0]
            except Exception as e:
                print(f"[DB Check Attendee Error]: {e}")

        if not existing_attendee:
            existing_attendee = next(
                (a for a in IN_MEMORY_SESSION_ATTENDEES if a.get("class_id") == class_id and a.get("user_id") == user_id),
                None
            )

        if not existing_attendee:
            attendee_id = str(uuid.uuid4())
            new_attendee = {
                "id": attendee_id,
                "class_id": class_id,
                "session_id": selected_session_id,
                "user_id": user_id,
                "payment_status": "free",
                "joined_at": now_iso,
                "created_at": now_iso
            }
            if db:
                try:
                    db.table("session_attendees").insert(new_attendee).execute()
                except Exception as e:
                    print(f"[DB Attendee Insert Error]: {e}")
            IN_MEMORY_SESSION_ATTENDEES.append(new_attendee)

            # Katılımcı sayısını güncelle
            class_record["student_count"] = class_record.get("student_count", 0) + 1
            if db:
                try:
                    db.table("classes").update({"student_count": class_record["student_count"]}).eq("id", class_id).execute()
                except Exception:
                    pass

        return {
            "access_granted": True,
            "requires_payment": False,
            "class_id": class_id,
            "session_id": selected_session_id,
            "payment_status": "free"
        }

    else:
        # Ücretli sınıf: Ödeme veya abonelik durumunu kontrol et
        paid_attendee = None
        if db:
            try:
                a_res = db.table("session_attendees").select("*").eq("class_id", class_id).eq("user_id", user_id).execute()
                for row in (a_res.data or []):
                    if row.get("payment_status") in ("paid", "subscription_active"):
                        paid_attendee = row
                        break
            except Exception as e:
                print(f"[DB Check Paid Attendee Error]: {e}")

        if not paid_attendee:
            paid_attendee = next(
                (a for a in IN_MEMORY_SESSION_ATTENDEES if a.get("class_id") == class_id and a.get("user_id") == user_id and a.get("payment_status") in ("paid", "subscription_active")),
                None
            )

        if paid_attendee:
            return {
                "access_granted": True,
                "requires_payment": False,
                "class_id": class_id,
                "session_id": selected_session_id,
                "payment_status": paid_attendee.get("payment_status", "paid")
            }
        else:
            return {
                "access_granted": False,
                "requires_payment": True,
                "price": price,
                "currency": class_record.get("currency", "TRY"),
                "class_id": class_id,
                "billing_type": class_record.get("billing_type", "one_time")
            }


def get_user_timeline(user_id: str, db=None) -> Dict[str, Any]:
    """
    Kullanıcının öğretmen ve katılımcı olarak zaman tünelini döner.
    Otomatik AI özeti veya SM-2 ödevi üretilmez.
    """
    # 1. teaching_sessions: teacher_id == user_id
    teaching_classes = []
    if db:
        try:
            c_res = db.table("classes").select("*").eq("teacher_id", user_id).execute()
            if c_res.data:
                teaching_classes = c_res.data
        except Exception as e:
            print(f"[DB Get Teaching Classes Error]: {e}")

    if not teaching_classes:
        teaching_classes = [c for c in IN_MEMORY_CLASSES_V2 if c.get("teacher_id") == user_id]

    teaching_sessions = []
    for c_data in teaching_classes:
        cid = c_data["id"]

        # Oturumları çek
        c_sessions = []
        if db:
            try:
                s_res = db.table("class_sessions").select("*").eq("class_id", cid).execute()
                if s_res.data:
                    c_sessions = s_res.data
            except Exception:
                pass
        if not c_sessions:
            c_sessions = [s for s in IN_MEMORY_CLASS_SESSIONS if s.get("class_id") == cid]

        # Katılımcıları çek
        attendees = []
        if db:
            try:
                att_res = db.table("session_attendees").select("*").eq("class_id", cid).execute()
                if att_res.data:
                    attendees = att_res.data
            except Exception:
                pass
        if not attendees:
            attendees = [a for a in IN_MEMORY_SESSION_ATTENDEES if a.get("class_id") == cid]

        # Katılımcı isimlerini çöz
        attendee_user_ids = list({a["user_id"] for a in attendees if a.get("user_id")})
        user_names_map = {}
        if attendee_user_ids and db:
            try:
                for uid in attendee_user_ids:
                    u_row = db.table("users").select("full_name, username").eq("id", uid).execute()
                    if u_row.data and len(u_row.data) > 0:
                        name = u_row.data[0].get("full_name") or u_row.data[0].get("username") or "Öğrenci"
                        user_names_map[uid] = name
            except Exception:
                pass

        attendee_names = [user_names_map.get(uid, f"Öğrenci-{uid[:4]}") for uid in attendee_user_ids]

        for s in c_sessions:
            teaching_sessions.append({
                "session_id": s["id"],
                "class_id": cid,
                "class_name": c_data.get("name", "Sınıf"),
                "session_date_utc": s.get("session_date_utc"),
                "duration_minutes": s.get("duration_minutes", 60),
                "status": s.get("status", "scheduled"),
                "price": c_data.get("price", 0.0),
                "currency": c_data.get("currency", "TRY"),
                "attendee_names": attendee_names,
                "attendees_count": len(attendee_names),
                "invite_slug": c_data.get("invite_slug")
            })

    teaching_sessions.sort(key=lambda x: x.get("session_date_utc") or "", reverse=True)

    # 2. attending_sessions: session_attendees üzerinden
    attended_records = []
    if db:
        try:
            att_res = db.table("session_attendees").select("*").eq("user_id", user_id).execute()
            if att_res.data:
                attended_records = att_res.data
        except Exception as e:
            print(f"[DB Attended Records Error]: {e}")

    if not attended_records:
        attended_records = [a for a in IN_MEMORY_SESSION_ATTENDEES if a.get("user_id") == user_id]

    attending_sessions = []
    seen_session_keys = set()

    for a in attended_records:
        cid = a.get("class_id")
        c_record = None
        if db:
            try:
                c_res = db.table("classes").select("*").eq("id", cid).execute()
                if c_res.data and len(c_res.data) > 0:
                    c_record = c_res.data[0]
            except Exception:
                pass
        if not c_record:
            c_record = next((c for c in IN_MEMORY_CLASSES_V2 if c.get("id") == cid), None)

        class_name = c_record.get("name", "Sınıf") if c_record else "Ders"
        teacher_id = c_record.get("teacher_id") if c_record else None

        teacher_name = "Eğitmen"
        if teacher_id and db:
            try:
                u_row = db.table("users").select("full_name, username").eq("id", teacher_id).execute()
                if u_row.data and len(u_row.data) > 0:
                    teacher_name = u_row.data[0].get("full_name") or u_row.data[0].get("username") or "Eğitmen"
            except Exception:
                pass

        sid = a.get("session_id")
        sessions_to_add = []
        if sid:
            s_row = None
            if db:
                try:
                    s_res = db.table("class_sessions").select("*").eq("id", sid).execute()
                    if s_res.data and len(s_res.data) > 0:
                        s_row = s_res.data[0]
                except Exception:
                    pass
            if not s_row:
                s_row = next((s for s in IN_MEMORY_CLASS_SESSIONS if s.get("id") == sid), None)
            if s_row:
                sessions_to_add.append(s_row)
        else:
            all_c_sessions = []
            if db:
                try:
                    s_res = db.table("class_sessions").select("*").eq("class_id", cid).execute()
                    if s_res.data:
                        all_c_sessions = s_res.data
                except Exception:
                    pass
            if not all_c_sessions:
                all_c_sessions = [s for s in IN_MEMORY_CLASS_SESSIONS if s.get("class_id") == cid]
            sessions_to_add.extend(all_c_sessions)

        for s in sessions_to_add:
            key = f"{cid}_{s['id']}"
            if key not in seen_session_keys:
                seen_session_keys.add(key)
                attending_sessions.append({
                    "session_id": s["id"],
                    "class_id": cid,
                    "class_name": class_name,
                    "teacher_name": teacher_name,
                    "session_date_utc": s.get("session_date_utc"),
                    "duration_minutes": s.get("duration_minutes", 60),
                    "status": s.get("status", "scheduled"),
                    "payment_status": a.get("payment_status", "free")
                })

    attending_sessions.sort(key=lambda x: x.get("session_date_utc") or "", reverse=True)

    return {
        "teaching_sessions": teaching_sessions,
        "attending_sessions": attending_sessions
    }


def complete_session(session_id: str, db=None) -> Optional[Dict[str, Any]]:
    """
    Eğitmen dersi bitirdiğinde status='completed' ve ended_at=NOW() yapar.
    Otomatik AI özeti veya SM-2 kartı üretilmez.
    """
    session_record = None
    if db:
        try:
            res = db.table("class_sessions").select("*").eq("id", session_id).execute()
            if res.data and len(res.data) > 0:
                session_record = res.data[0]
        except Exception as e:
            print(f"[DB Complete Session Select Error]: {e}")

    if not session_record:
        session_record = next((s for s in IN_MEMORY_CLASS_SESSIONS if s.get("id") == session_id), None)

    if not session_record:
        return None

    now_iso = datetime.now(timezone.utc).isoformat()
    session_record["status"] = "completed"
    session_record["ended_at"] = now_iso

    if db:
        try:
            db.table("class_sessions").update({
                "status": "completed",
                "ended_at": now_iso
            }).eq("id", session_id).execute()
        except Exception as e:
            print(f"[DB Complete Session Update Error]: {e}")

    return {
        "success": True,
        "session_id": session_id,
        "status": "completed",
        "ended_at": now_iso
    }


def send_material_to_class(
    teacher_id: str,
    class_id: str,
    subject: str,
    message_body: str,
    attachment_url: Optional[str] = None,
    db=None
) -> Dict[str, Any]:
    """
    Sadece öğretmenin manuel isteğiyle çalışır; ilgili sınıftaki katılımcıların listesini çeker,
    gönderim kaydını döner.
    """
    attendees = []
    if db:
        try:
            res = db.table("session_attendees").select("user_id").eq("class_id", class_id).execute()
            if res.data:
                attendees = res.data
        except Exception as e:
            print(f"[DB Send Material Attendees Error]: {e}")

    if not attendees:
        attendees = [a for a in IN_MEMORY_SESSION_ATTENDEES if a.get("class_id") == class_id]

    if not attendees and db:
        try:
            m_res = db.table("class_members").select("user_id").eq("class_id", class_id).execute()
            if m_res.data:
                attendees = m_res.data
        except Exception:
            pass

    unique_students = list({a["user_id"] for a in attendees if a.get("user_id")})
    sent_count = len(unique_students)
    delivery_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()

    delivery_record = {
        "id": delivery_id,
        "teacher_id": teacher_id,
        "class_id": class_id,
        "subject": subject.strip(),
        "message_body": message_body.strip(),
        "attachment_url": attachment_url,
        "sent_count": sent_count,
        "status": "delivered",
        "created_at": now_iso
    }

    if db:
        try:
            db.table("material_deliveries").insert(delivery_record).execute()
        except Exception as e:
            print(f"[DB Material Deliveries Insert Error]: {e}")

    IN_MEMORY_MATERIAL_DELIVERIES.append(delivery_record)

    return {
        "sent_count": sent_count,
        "status": "delivered",
        "subject": subject.strip(),
        "delivered_at": now_iso
    }




