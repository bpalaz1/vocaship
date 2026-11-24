from fastapi import APIRouter, HTTPException, Request, status
from typing import List
import re
from app.schemas.reading import StoryGenerateRequest, StoryResponse, TextAnalyzeRequest
from app.services.ai_service import async_generate_reading_story, async_analyze_reading_text
from app.services.story_library import STORY_ARCHIVE, get_preset_story
from app.services.quota_service import check_and_consume_quota

router = APIRouter(prefix="/reading", tags=["Reading & Stories"])

@router.get("/library", response_model=List[StoryResponse])
async def get_library_stories():
    """Tüm ücretsiz hazır hikaye arşivini listeler."""
    return STORY_ARCHIVE

@router.post("/generate", response_model=StoryResponse)
async def create_story(payload: StoryGenerateRequest, request: Request):
    """
    1. Kullanıcı özel bir konu veya hedef kelime istemediyse: Hazır havuzdan anında döner ($0, sıfır kota).
    2. Özel bir konu/kelime yazdıysa veya hazır havuz yetersizse: Gemini asenkron çağrı mimarisi devreye girer.
    """
    has_custom_request = bool(payload.target_words or (payload.topic and payload.topic not in ["Daily Life", "Mystery", "Science & Philosophy", "General Interest"]))

    # Hazır havuz kontrolü (Özel kelime veya konu belirtilmemişse anında getir)
    if not has_custom_request:
        preset = get_preset_story(payload.level)
        if preset:
            return preset

    check_and_consume_quota(request, "text")

    # Özel istekler için Gemini'ye asenkron git
    try:
        story_data = await async_generate_reading_story(
            level=payload.level,
            topic=payload.topic,
            target_words=payload.target_words,
            length_words=payload.length_words or 250
        )
        if not story_data or not isinstance(story_data, dict) or not story_data.get("content"):
            raise ValueError("Yapay zekâ boş hikaye yanıtı döndürdü.")
        return story_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Gemini Hikaye Hatası]: {e}")
        if payload.target_words:
            raise HTTPException(
                status_code=503,
                detail="Yapay zekâ hikaye servisi şu anda yanıt veremiyor veya kota doldu. Lütfen biraz sonra tekrar deneyin."
            )
        return get_preset_story(payload.level)


def _build_english_text_fallback(title: str, content: str) -> dict:
    """AI servisi yanıt veremediğinde metnin kendi cümle ve kelimelerinden İngilizce anlama soruları üretir."""
    clean_content = (content or "").strip()
    clean_title = (title or "").strip() or "Custom Reading Passage"
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", clean_content) if len(s.strip()) > 15]
    first_sentence = sentences[0] if sentences else clean_content[:140]
    detail_sentence = sentences[1] if len(sentences) > 1 else first_sentence

    raw_words = re.findall(r"\b[a-zA-Z]{6,}\b", clean_content)
    seen = set()
    keywords: List[str] = []
    for w in raw_words:
        lw = w.lower()
        if lw not in seen:
            seen.add(lw)
            keywords.append(lw)
        if len(keywords) >= 5:
            break

    key_word = keywords[0] if keywords else "context"
    snippet_first = (first_sentence[:110] + "...") if len(first_sentence) > 110 else first_sentence
    snippet_detail = (detail_sentence[:110] + "...") if len(detail_sentence) > 110 else detail_sentence

    questions = [
        {
            "question": "What is the main focus of this passage?",
            "options": [
                f"It explores the key idea introduced in: \"{snippet_first}\"",
                "It provides a fictional dialogue unrelated to the title.",
                "It lists only mathematical equations without explanation.",
                "It argues against reading comprehension exercises.",
            ],
            "correct_answer_index": 0,
        },
        {
            "question": "Which statement is directly supported by the passage?",
            "options": [
                "The passage avoids mentioning any specific details.",
                f"The text states: \"{snippet_detail}\"",
                "The author concludes that the topic has no relevance.",
                "None of the ideas in the text are connected.",
            ],
            "correct_answer_index": 1,
        },
        {
            "question": "Which of the following key terms appears in the passage?",
            "options": [
                "photosynthesis" if key_word != "photosynthesis" else "astronomy",
                "microprocessor" if key_word != "microprocessor" else "typography",
                key_word,
                "archaeology" if key_word != "archaeology" else "meteorology",
            ],
            "correct_answer_index": 2,
        },
    ]

    return {
        "title": clean_title,
        "level": "Intermediate",
        "topic": "Custom Analysis",
        "content": clean_content,
        "target_vocabulary": [
            {
                "word": w,
                "phonetic": "",
                "turkish_meaning": "Detay görmek için tıklayın",
                "context_sentence": first_sentence,
            }
            for w in keywords[:4]
        ],
        "comprehension_questions": questions,
    }


@router.post("/analyze", response_model=StoryResponse)
async def analyze_custom_text(payload: TextAnalyzeRequest, request: Request):
    """Yapıştırılan özel metni analiz eder; 3 adet İngilizce anlama sorusu ve hedef kelimeler döner."""
    try:
        result = await async_analyze_reading_text(
            title=payload.title or "Custom Reading Passage",
            content=payload.content,
        )
        if result and isinstance(result, dict) and result.get("comprehension_questions"):
            return result
    except Exception as e:
        print(f"[Reading Analyze Fallback]: {e}")

    return _build_english_text_fallback(payload.title or "Custom Reading Passage", payload.content)