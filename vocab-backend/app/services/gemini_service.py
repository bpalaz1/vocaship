"""
Gemini AI Servisi (ai_service.py ile entegre, geriye dönük uyumlu)
Hızlı ve düşük gecikmeli model önceliği ve paralel asenkron çağrı mimarisi.
"""
from app.services.ai_service import (
    FALLBACK_MODELS,
    LANG_MAP,
    get_client,
    clean_json_response,
    call_gemini_with_fallback,
    async_call_gemini_with_fallback,
    generate_single_card,
    async_generate_single_card,
    batch_enrich_words,
    batch_enrich_words_sync,
    generate_reading_story,
    async_generate_reading_story,
    async_extract_reading_analysis,
)

__all__ = [
    "FALLBACK_MODELS",
    "LANG_MAP",
    "get_client",
    "clean_json_response",
    "call_gemini_with_fallback",
    "async_call_gemini_with_fallback",
    "generate_single_card",
    "async_generate_single_card",
    "batch_enrich_words",
    "batch_enrich_words_sync",
    "generate_reading_story",
    "async_generate_reading_story",
    "async_extract_reading_analysis",
]