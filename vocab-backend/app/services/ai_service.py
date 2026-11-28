import os
import json
import re
import asyncio
import time
from typing import Optional, List, Dict, Any
from google import genai
from google.genai import types
from dotenv import load_dotenv
from app.core.config import settings
from app.core.runtime_guard import MODEL_CHAIN, runtime_guard

# .env dosyasından ortam değişkenlerini yükle
load_dotenv()

# Google 1 Aralık 2026 uyumlu otomatik güncellenen Flash model zinciri
FALLBACK_MODELS = list(MODEL_CHAIN)

LANG_MAP = {
    "en": "English",
    "tr": "Turkish",
    "de": "German",
    "es": "Spanish",
    "fr": "French",
    "it": "Italian",
    "ru": "Russian",
}


def _build_json_config(model_name: str, temperature: float) -> types.GenerateContentConfig:
    cfg_kwargs: Dict[str, Any] = {
        "temperature": temperature,
        "response_mime_type": "application/json",
    }
    if "2.5" in model_name and hasattr(types, "ThinkingConfig"):
        try:
            cfg_kwargs["thinking_config"] = types.ThinkingConfig(thinking_budget=0)
        except Exception:
            pass
    return types.GenerateContentConfig(**cfg_kwargs)

def get_client() -> genai.Client:
    """Ortam değişkeninden API anahtarını çeker ve Google GenAI istemcisini başlatır."""
    raw_key = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "") or ""
    clean_key = str(raw_key).strip().strip('"\'')
    if not clean_key:
        raise ValueError("GEMINI_API_KEY bulunamadı veya boş! Lütfen .env dosyasını kontrol edin.")
    return genai.Client(api_key=clean_key)

def clean_json_response(raw_text: str) -> dict:
    """Modelden dönen metindeki markdown formatlarını temizleyip JSON sözlüğüne dönüştürür."""
    text = (raw_text or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    try:
        return json.loads(text.strip())
    except Exception:
        match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        raise

async def async_call_gemini_with_fallback(
    prompt: str, temperature: float = 0.2, timeout_per_model: float = 7.5
) -> dict:
    """
    Modelleri asenkron olarak sırayla dener.
    429 (Kota) veya 503 (Yoğunluk) durumunda asyncio.sleep(0.25) ile kısa bir bekleme yapar ve sıradaki modele geçer.
    Senkron iş parçacığını asla bloklamaz.
    """
    client = get_client()
    last_error = None

    for model_name in FALLBACK_MODELS:
        try:
            response = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=_build_json_config(model_name, temperature),
                ),
                timeout=timeout_per_model,
            )
            model_version = getattr(response, "model_version", None)
            runtime_guard.record_ai_result(
                success=True,
                actor="ai_service",
                model_used=model_name,
                model_version=model_version,
            )
            return clean_json_response(response.text)
        except Exception as e:
            last_error = e
            err_str = str(e)
            print(f"[Async Model Fallback] {model_name} başarısız: {err_str[:120]}... Sıradaki deneniyor.")
            runtime_guard.record_ai_result(
                success=False,
                actor="ai_service",
                detail=err_str,
                model_used=model_name,
            )
            if "429" in err_str or "503" in err_str:
                await asyncio.sleep(0.25)
            continue

    raise last_error

def call_gemini_with_fallback(prompt: str, temperature: float = 0.2) -> dict:
    """
    Senkron fallback fonksiyonu. Modelleri dener ve sonucu döndürür.
    """
    client = get_client()
    last_error = None

    for model_name in FALLBACK_MODELS:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=_build_json_config(model_name, temperature),
            )
            model_version = getattr(response, "model_version", None)
            runtime_guard.record_ai_result(
                success=True,
                actor="ai_service",
                model_used=model_name,
                model_version=model_version,
            )
            return clean_json_response(response.text)
        except Exception as e:
            last_error = e
            err_str = str(e)
            print(f"[Model Fallback] {model_name} başarısız: {err_str[:120]}... Sıradaki deneniyor.")
            runtime_guard.record_ai_result(
                success=False,
                actor="ai_service",
                detail=err_str,
                model_used=model_name,
            )
            continue

    raise last_error

def _build_single_card_prompt(
    clean_word: str,
    target_lang: str,
    native_lang: str,
    context_hint: Optional[str] = None,
) -> str:
    target_name = LANG_MAP.get(target_lang.lower(), "English")
    native_name = LANG_MAP.get(native_lang.lower(), "Turkish")
    hint_line = ""
    if context_hint and context_hint.strip():
        hint_line = f"\nContext / Domain hint from user: {context_hint.strip()}"

    if target_lang.lower() == native_lang.lower():
        task_line = (
            f"Define the {target_name} word/phrase '{clean_word}' clearly and concisely in {native_name}."
            f"\nProvide ONE natural example sentence in {target_name} using '{clean_word}', "
            f"and a clear paraphrase/explanation of that exact sentence in {native_name}."
        )
    else:
        task_line = (
            f"Translate the {target_name} word/phrase '{clean_word}' into {native_name} (code: {native_lang})."
            f"\nCRITICAL RULES:"
            f"\n1. 'translation' MUST be written strictly in {native_name} (concise dictionary equivalents, e.g. 1-3 words separated by comma)."
            f"\n2. Provide ONE natural example sentence in {target_name} in 'example_sentences[0].target' containing '{clean_word}'."
            f"\n3. 'example_sentences[0].native' MUST be the EXACT, faithful translation of THAT SAME 'target' sentence into {native_name}. Never translate a different sentence."
            f"\n4. 'phonetic' must be the IPA pronunciation of '{clean_word}' in {target_name}."
        )

    return f"""{task_line}{hint_line}

Return ONLY valid compact JSON with this exact schema:
{{
  "is_valid": true,
  "word": "{clean_word}",
  "phonetic": "/IPA/",
  "grammar_notes": "noun/verb/adj/adv",
  "meanings": [
    {{
      "part_of_speech": "noun/verb/adj/adv",
      "translation": "concise {native_name} translation",
      "definition": "short definition in {native_name}"
    }}
  ],
  "example_sentences": [
    {{
      "target": "natural sentence in {target_name}",
      "native": "exact translation of the target sentence in {native_name}"
    }}
  ]
}}"""

async def async_generate_single_card(
    word: str,
    target_lang: str = "en",
    native_lang: str = "tr",
    level: str = "B2",
    context_hint: Optional[str] = None,
) -> dict:
    """Tekil kelime için çok dilli çeviri anlamı, IPA telaffuz ve eşleşen örnek cümle üretir (Asenkron)."""
    clean_word = word.strip()
    prompt = _build_single_card_prompt(clean_word, target_lang, native_lang, context_hint=context_hint)
    return await async_call_gemini_with_fallback(prompt, temperature=0.1)

def generate_single_card(
    word: str,
    target_lang: str = "en",
    native_lang: str = "tr",
    level: str = "B2",
    context_hint: Optional[str] = None,
) -> dict:
    """Senkron tekil kart üretici."""
    clean_word = word.strip()
    prompt = _build_single_card_prompt(clean_word, target_lang, native_lang, context_hint=context_hint)
    return call_gemini_with_fallback(prompt, temperature=0.1)

async def batch_enrich_words(words: List[str], target_lang: str = "en", native_lang: str = "tr") -> List[dict]:
    """
    Tüm kelime analizlerini asyncio.gather(*[...]) ile aynı anda paralel olarak çalıştırır.
    Sıralı for döngüsü yerine tüm kelimeler eşzamanlı olarak birkaç saniye içinde tamamlanır.
    """
    clean_words = [w.strip() for w in words if w.strip()]
    if not clean_words:
        return []

    # Her kelime için asenkron görev oluştur
    tasks = [
        async_generate_single_card(w, target_lang=target_lang, native_lang=native_lang)
        for w in clean_words
    ]

    # asyncio.gather ile paralel çağrı
    results = await asyncio.gather(*tasks, return_exceptions=True)

    enriched_cards = []
    for idx, res in enumerate(results):
        w = clean_words[idx]
        if isinstance(res, Exception):
            print(f"[Batch Enrich Exception] '{w}' çözümlenemedi: {res}")
            enriched_cards.append({
                "is_valid": True,
                "word": w,
                "phonetic": f"/{w}/",
                "grammar_notes": "word",
                "meanings": [{
                    "part_of_speech": "general",
                    "translation": w,
                    "definition": w
                }],
                "example_sentences": [{
                    "target": f"The word '{w}' is used in context.",
                    "native": f"'{w}' kelimesi bağlam içinde kullanılır."
                }]
            })
        elif isinstance(res, dict):
            enriched_cards.append(res)
        else:
            enriched_cards.append({
                "is_valid": True,
                "word": w,
                "phonetic": f"/{w}/",
                "grammar_notes": "word",
                "meanings": [{"part_of_speech": "general", "translation": w, "definition": w}],
                "example_sentences": []
            })

    return enriched_cards

def batch_enrich_words_sync(words: List[str], target_lang: str = "en", native_lang: str = "tr") -> List[dict]:
    """Senkron ortamlarda çağrıldığında asenkron batch_enrich_words'ü çalıştırır."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                return executor.submit(lambda: asyncio.run(batch_enrich_words(words, target_lang, native_lang))).result()
        return loop.run_until_complete(batch_enrich_words(words, target_lang, native_lang))
    except Exception:
        return asyncio.run(batch_enrich_words(words, target_lang, native_lang))

async def async_extract_reading_analysis(text: str, level: str = "Intermediate") -> dict:
    """
    Serbest makale analizini tek bir kompakt JSON şemasıyla doğrudan döndürür.
    Gereksiz açıklamalar ve markdown blokları olmadan doğrudan JSON döner.
    """
    clean_text = text.strip()
    if not clean_text:
        return {
            "title": "Yeni Okuma Parçası",
            "topic": "Genel",
            "target_vocabulary": [],
            "comprehension_questions": []
        }

    prompt = f"""
    You are an expert English language educator.
    Analyze this English reading passage tailored for '{level}' level:
    ---
    {clean_text}
    ---
    Task:
    1. Short 'title' (max 6 words) and Turkish 'topic' (e.g. "Bilim & Teknoloji").
    2. Extract 4-5 target vocabulary words: 'word', 'phonetic', 'meaning' (in Turkish), 'example'.
    3. Exactly 3 multiple-choice comprehension questions:
       - 'question': English question prompt
       - 'options': exactly 4 options in English (randomized order, do NOT write hints like '(True statement)')
       - 'correct_answer_index': integer (0 to 3) indicating the correct option
       - 'explanation': concise Turkish explanation

    Return ONLY a compact valid JSON:
    {{
      "title": "string",
      "topic": "string",
      "target_vocabulary": [
        {{
          "word": "string",
          "phonetic": "string",
          "meaning": "string",
          "example": "string"
        }}
      ],
      "comprehension_questions": [
        {{
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correct_answer_index": 0,
          "explanation": "string"
        }}
      ]
    }}
    """
    return await async_call_gemini_with_fallback(prompt, temperature=0.2)

async def async_generate_reading_story(
    level: str = "Intermediate",
    topic: Optional[str] = "Mystery",
    target_words: Optional[List[str]] = None,
    length_words: int = 250
) -> dict:
    """Seviyeye, konuya ve seçilen kelimelere göre asenkron interaktif okuma hikayesi üretir."""
    vocab_instruction = ""
    if target_words and len(target_words) > 0:
        words_str = ", ".join([f'"{w.strip()}"' for w in target_words if w.strip()])
        vocab_instruction = f"MUST USE WORDS: [{words_str}] in natural context."

    prompt = f"""
    Expert English storytelling instructor.
    Level: {level}
    Topic: {topic or 'General Interest'}
    Length: ~{length_words} words.
    {vocab_instruction}

    Task:
    1. Write an engaging English story.
    2. Extract 4-6 target vocabulary words with Turkish meaning.
    3. Exactly 3 multiple-choice comprehension questions with randomized options (0 to 3).

    Return ONLY a valid compact JSON:
    {{
      "title": "Story Title",
      "level": "{level}",
      "topic": "{topic}",
      "content": "English paragraphs...",
      "target_vocabulary": [
        {{
          "word": "word",
          "phonetic": "/phonetic/",
          "turkish_meaning": "Türkçe anlam",
          "context_sentence": "sentence from story"
        }}
      ],
      "comprehension_questions": [
        {{
          "question": "Question?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer_index": 0
        }}
      ]
    }}
    """
    return await async_call_gemini_with_fallback(prompt, temperature=0.3)


async def async_analyze_reading_text(
    title: str = "Custom Reading Passage",
    content: str = "",
) -> dict:
    """Kullanıcının yapıştırdığı metni analiz eder; 4-6 hedef kelime ve 3 adet İngilizce anlama sorusu üretir."""
    clipped_content = (content or "").strip()[:4000]
    prompt = f"""
    You are an expert English reading comprehension instructor.
    Title: {title or 'Custom Reading Passage'}
    Passage:
    \"\"\"
    {clipped_content}
    \"\"\"

    Task:
    1. Analyze the passage above. Keep the original passage text as "content".
    2. Extract 4-6 key vocabulary words from the passage with phonetic transcription, Turkish meaning, and the exact context sentence from the passage.
    3. Write EXACTLY 3 multiple-choice reading comprehension questions based strictly on the passage.
       CRITICAL LANGUAGE RULE: All 3 questions and ALL 4 answer options for each question MUST be written in natural English, regardless of the user's UI language.
       Randomize the correct_answer_index (0 to 3).

    Return ONLY a valid compact JSON:
    {{
      "title": "{title or 'Custom Reading Passage'}",
      "level": "Intermediate",
      "topic": "Custom Analysis",
      "content": "",
      "target_vocabulary": [
        {{
          "word": "word",
          "phonetic": "/phonetic/",
          "turkish_meaning": "Türkçe anlam",
          "context_sentence": "sentence from passage"
        }}
      ],
      "comprehension_questions": [
        {{
          "question": "English comprehension question?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer_index": 0
        }}
      ]
    }}
    """
    result = await async_call_gemini_with_fallback(prompt, temperature=0.2)
    if isinstance(result, dict):
        result["content"] = content.strip()
        if not result.get("title"):
            result["title"] = title or "Custom Reading Passage"
    return result

def generate_reading_story(
    level: str = "Intermediate",
    topic: Optional[str] = "Mystery",
    target_words: Optional[List[str]] = None,
    length_words: int = 250
) -> dict:
    """Senkron okuma hikayesi üretici."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                return executor.submit(lambda: asyncio.run(
                    async_generate_reading_story(level, topic, target_words, length_words)
                )).result()
        return loop.run_until_complete(async_generate_reading_story(level, topic, target_words, length_words))
    except Exception:
        return asyncio.run(async_generate_reading_story(level, topic, target_words, length_words))
