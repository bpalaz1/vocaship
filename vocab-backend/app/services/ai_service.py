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

# .env dosyasından ortam değişkenlerini yükle
load_dotenv()

# Hızlı ve düşük gecikmeli (low latency) model önceliği
# 1. gemini-2.5-flash
# 2. gemini-1.5-flash
# Fallback modeller: gemini-flash-lite-latest, gemini-flash-latest, gemini-3.8-flash, gemini-2.5-pro
FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
    "gemini-3.8-flash",
    "gemini-2.5-pro",
]

LANG_MAP = {
    "en": "İngilizce",
    "tr": "Türkçe",
    "de": "Almanca",
    "es": "İspanyolca",
    "fr": "Fransızca",
    "it": "İtalyanca",
    "ru": "Rusça",
}

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

async def async_call_gemini_with_fallback(prompt: str, temperature: float = 0.2) -> dict:
    """
    Modelleri asenkron olarak sırayla dener.
    429 (Kota) veya 503 (Yoğunluk) durumunda asyncio.sleep(0.3) ile kısa bir bekleme yapar ve sıradaki modele geçer.
    Senkron iş parçacığını asla bloklamaz.
    """
    client = get_client()
    last_error = None

    for model_name in FALLBACK_MODELS:
        try:
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=temperature,
                    response_mime_type="application/json"
                )
            )
            return clean_json_response(response.text)
        except Exception as e:
            last_error = e
            err_str = str(e)
            print(f"[Async Model Fallback] {model_name} başarısız: {err_str[:120]}... Sıradaki deneniyor.")
            # Kota veya yoğunluk durumunda kısa bekleme (0.3s)
            if "429" in err_str or "503" in err_str:
                await asyncio.sleep(0.3)
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
                config=types.GenerateContentConfig(
                    temperature=temperature,
                    response_mime_type="application/json"
                )
            )
            return clean_json_response(response.text)
        except Exception as e:
            last_error = e
            err_str = str(e)
            print(f"[Model Fallback] {model_name} başarısız: {err_str[:120]}... Sıradaki deneniyor.")
            if "429" in err_str or "503" in err_str:
                time.sleep(0.3)
            continue

    raise last_error

async def async_generate_single_card(word: str, target_lang: str = "en", native_lang: str = "tr", level: str = "B2") -> dict:
    """Tekil kelime için çok dilli çeviri anlamı, IPA telaffuz ve örnek cümle üretir (Asenkron)."""
    clean_word = word.strip()
    target_name = LANG_MAP.get(target_lang, "İngilizce")
    native_name = LANG_MAP.get(native_lang, "Türkçe")

    prompt = f"""
    Translate '{clean_word}' from {target_name} to {native_name}.
    Provide one natural example sentence in {target_name} and its exact matching translation in {native_name}.
    Return ONLY a compact JSON:
    {{
      "is_valid": true,
      "word": "{clean_word}",
      "phonetic": "/fonetik/",
      "grammar_notes": "noun/verb/adj",
      "meanings": [
        {{
          "part_of_speech": "pos",
          "translation": "{native_name} translation",
          "definition": "{native_name} definition"
        }}
      ],
      "example_sentences": [
        {{
          "target": "sentence in {target_name}",
          "native": "translation in {native_name}"
        }}
      ]
    }}
    """
    return await async_call_gemini_with_fallback(prompt, temperature=0.1)

def generate_single_card(word: str, target_lang: str = "en", native_lang: str = "tr", level: str = "B2") -> dict:
    """Senkron tekil kart üretici."""
    clean_word = word.strip()
    target_name = LANG_MAP.get(target_lang, "İngilizce")
    native_name = LANG_MAP.get(native_lang, "Türkçe")

    prompt = f"""
    Translate '{clean_word}' from {target_name} to {native_name}.
    Provide one natural example sentence in {target_name} and its exact matching translation in {native_name}.
    Return ONLY a compact JSON:
    {{
      "is_valid": true,
      "word": "{clean_word}",
      "phonetic": "/fonetik/",
      "grammar_notes": "noun/verb/adj",
      "meanings": [
        {{
          "part_of_speech": "pos",
          "translation": "{native_name} translation",
          "definition": "{native_name} definition"
        }}
      ],
      "example_sentences": [
        {{
          "target": "sentence in {target_name}",
          "native": "translation in {native_name}"
        }}
      ]
    }}
    """
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
