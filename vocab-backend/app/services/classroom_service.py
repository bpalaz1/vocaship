import re
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

def generate_share_code() -> str:
    """QW- ile başlayan 6 karakterli benzersiz paylaşım kodu üretir."""
    digits = "".join(random.choices(string.digits, k=4))
    return f"QW-{digits}"

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
        if isinstance(gemini_res, dict) and "target_vocabulary" in gemini_res and "comprehension_questions" in gemini_res:
            return gemini_res
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
        questions.append({
            "question": f"According to the text, what is stated about: '{s[:40]}...'?",
            "options": opts,
            "correct_answer_index": opts.index(correct_val),
            "explanation": "Metindeki ifadeye doğrudan dayanmaktadır."
        })

    if len(questions) < 3:
        theme_opts = ["Daily life and exploration", "Scientific research and discovery", "Historical event and evolution", "Fictional adventure"]
        correct_theme = theme_opts[0]
        random.shuffle(theme_opts)
        questions.append({
            "question": "What is the primary theme of the reading passage?",
            "options": theme_opts,
            "correct_answer_index": theme_opts.index(correct_theme),
            "explanation": "Metnin genel bağlamına uygundur."
        })

    return {
        "title": clean_text[:40].strip().title() if clean_text else "Yeni Okuma Parçası",
        "topic": "Genel Okuma",
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
