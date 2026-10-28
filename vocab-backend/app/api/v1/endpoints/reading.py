from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.reading import StoryGenerateRequest, StoryResponse
from app.services.ai_service import async_generate_reading_story
from app.services.story_library import STORY_ARCHIVE, get_preset_story

router = APIRouter(prefix="/reading", tags=["Reading & Stories"])

@router.get("/library", response_model=List[StoryResponse])
async def get_library_stories():
    """Tüm ücretsiz hazır hikaye arşivini listeler."""
    return STORY_ARCHIVE

@router.post("/generate", response_model=StoryResponse)
async def create_story(payload: StoryGenerateRequest):
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

    # Özel istekler için Gemini'ye asenkron git
    try:
        story_data = await async_generate_reading_story(
            level=payload.level,
            topic=payload.topic,
            target_words=payload.target_words,
            length_words=payload.length_words or 250
        )
        return story_data
    except Exception as e:
        # Gemini kotası dolsa dahi sistem çökmez, o seviyenin hazır hikayesini döndürür
        print(f"[Gemini Kota Hatası]: {e}. Hazır arşiv hikayesi yükleniyor...")
        return get_preset_story(payload.level)