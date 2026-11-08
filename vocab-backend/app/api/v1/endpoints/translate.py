import asyncio
import urllib.parse
import httpx
import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from app.services.ai_service import get_client, FALLBACK_MODELS

logger = logging.getLogger("vocaship.translate")
router = APIRouter(tags=["Canlı Çeviri (Live Translator)"])

class TranslateRequest(BaseModel):
    text: str
    source_lang: Optional[str] = "en"
    target_lang: Optional[str] = "tr"

class TranslateResponse(BaseModel):
    translated_text: str
    source_lang: str
    target_lang: str
    detected_source_lang: Optional[str] = None

class ExtractedWord(BaseModel):
    word: str
    turkish_meaning: str
    level: Optional[str] = "B2"

class StreamTextRequest(BaseModel):
    text: str
    source_lang: Optional[str] = "en"
    target_lang: Optional[str] = "tr"
    extract_keywords: Optional[bool] = True

class StreamTextResponse(BaseModel):
    original_text: str
    translated_text: str
    source_lang: str
    target_lang: str
    keywords: List[ExtractedWord] = []

LANGUAGE_NAMES = {
    "auto": "Otomatik Algıla",
    "en": "İngilizce",
    "tr": "Türkçe",
    "de": "Almanca",
    "es": "İspanyolca",
    "fr": "Fransızca",
    "it": "İtalyanca",
    "ru": "Rusça",
}

async def translate_via_free_google_endpoint(text: str, source_lang: str, target_lang: str) -> Optional[str]:
    """
    Ücretsiz ve ultra hızlı Google gtx çeviri servisi yedeği (failover).
    """
    try:
        sl = "auto" if source_lang == "auto" else source_lang
        tl = target_lang
        encoded = urllib.parse.quote(text)
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl={sl}&tl={tl}&dt=t&q={encoded}"

        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if data and isinstance(data, list) and len(data) > 0 and data[0]:
                    translated_parts = [segment[0] for segment in data[0] if segment and segment[0]]
                    return "".join(translated_parts).strip()
    except Exception as e:
        logger.warning(f"Google gtx translate fallback error: {e}")
    return None

async def translate_via_mymemory_endpoint(text: str, source_lang: str, target_lang: str) -> Optional[str]:
    """
    İkincil kamuya açık MyMemory çeviri servisi.
    """
    try:
        sl = "en" if source_lang == "auto" else source_lang
        tl = target_lang
        encoded = urllib.parse.quote(text)
        url = f"https://api.mymemory.translated.net/get?q={encoded}&langpair={sl}|{tl}"

        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                translated = data.get("responseData", {}).get("translatedText")
                if translated and not translated.startswith("MYMEMORY WARNING:"):
                    return translated.strip()
    except Exception as e:
        logger.warning(f"MyMemory translate fallback error: {e}")
    return None

@router.post("", response_model=TranslateResponse)
@router.post("/", response_model=TranslateResponse)
async def translate_text(payload: TranslateRequest):
    """
    Canlı metin çevirisi (Debounced Real-time Translation).
    Gemini AI modeli ile başlar, gecikme veya kota durumunda anında yedek çeviri motorlarına geçer.
    """
    text = payload.text.strip()
    source_lang = (payload.source_lang or "auto").lower()
    target_lang = (payload.target_lang or "tr").lower()

    if not text:
        return TranslateResponse(
            translated_text="",
            source_lang=source_lang,
            target_lang=target_lang,
        )

    # Aynı dil seçildiyse doğrudan metni döndür
    if source_lang == target_lang and source_lang != "auto":
        return TranslateResponse(
            translated_text=text,
            source_lang=source_lang,
            target_lang=target_lang,
        )

    src_name = LANGUAGE_NAMES.get(source_lang, source_lang)
    tgt_name = LANGUAGE_NAMES.get(target_lang, target_lang)

    # 1. Öncelik: Ultra hızlı ve düşük gecikmeli Google gtx çeviri servisi (~80-150ms)
    gtx_result = await translate_via_free_google_endpoint(text, source_lang, target_lang)
    if gtx_result:
        return TranslateResponse(
            translated_text=gtx_result,
            source_lang=source_lang,
            target_lang=target_lang,
        )

    # 2. Öncelik: Google Gemini AI modeli (Maksimum 2.5 sn zaman aşımı ile)
    try:
        client = get_client()
        prompt = (
            f"You are a professional, fluent real-time language translator.\n"
            f"Translate the following text accurately from {src_name} to {tgt_name}.\n"
            f"Rules:\n"
            f"- Return ONLY the direct translation.\n"
            f"- Do NOT provide explanations, translator notes, quotes, or prefaces.\n"
            f"- Maintain line breaks and capitalization.\n\n"
            f"Text:\n{text}"
        )

        for model_name in FALLBACK_MODELS[:2]:
            try:
                response = await asyncio.wait_for(
                    client.aio.models.generate_content(
                        model=model_name,
                        contents=prompt,
                    ),
                    timeout=2.5
                )
                if response and response.text:
                    cleaned = response.text.strip()
                    if cleaned:
                        return TranslateResponse(
                            translated_text=cleaned,
                            source_lang=source_lang,
                            target_lang=target_lang,
                        )
            except Exception as model_err:
                logger.info(f"Gemini translation with {model_name} skipped: {model_err}")
                continue
    except Exception as gemini_err:
        logger.warning(f"Gemini client setup error: {gemini_err}")

    # 3. Öncelik: MyMemory servisi
    mymemory_result = await translate_via_mymemory_endpoint(text, source_lang, target_lang)
    if mymemory_result:
        return TranslateResponse(
            translated_text=mymemory_result,
            source_lang=source_lang,
            target_lang=target_lang,
        )

    # Eğer hepsi başarısız olursa orijinal metni döndür
    return TranslateResponse(
        translated_text=text,
        source_lang=source_lang,
        target_lang=target_lang,
    )


@router.post("/stream-text", response_model=StreamTextResponse)
async def stream_translate_and_extract(payload: StreamTextRequest):
    """
    Toplantı ve canlı video dinleme akışından gelen metinleri anlık çevirir
    ve cümledeki B1/B2/C1 seviye önemli terimleri otomatik ayıklar.
    """
    raw_text = payload.text.strip()
    source_lang = (payload.source_lang or "en").lower()
    target_lang = (payload.target_lang or "tr").lower()

    if not raw_text:
        return StreamTextResponse(
            original_text="",
            translated_text="",
            source_lang=source_lang,
            target_lang=target_lang,
            keywords=[]
        )

    # 1. Hızlı çeviri al
    trans_resp = await translate_text(TranslateRequest(
        text=raw_text,
        source_lang=source_lang,
        target_lang=target_lang
    ))
    translated_text = trans_resp.translated_text

    keywords: List[ExtractedWord] = []

    # 2. Anahtar kelimeleri ayıkla (Gemini varsa zengin JSON, yoksa akıllı ayrıştırma)
    if payload.extract_keywords and len(raw_text.split()) >= 3:
        try:
            client = get_client()
            prompt = (
                f"Extract 1 to 3 important or advanced English vocabulary words/phrases from this sentence: \"{raw_text}\"\n"
                f"For each word, provide its accurate Turkish meaning and estimated CEFR level (B1, B2, or C1).\n"
                f"Respond ONLY with a valid JSON array of objects with keys: word, turkish_meaning, level.\n"
                f"Example: [{{\"word\": \"mitigate\", \"turkish_meaning\": \"hafifletmek, azaltmak\", \"level\": \"B2\"}}]"
            )
            for model_name in FALLBACK_MODELS[:2]:
                try:
                    res = await client.aio.models.generate_content(
                        model=model_name,
                        contents=prompt,
                    )
                    if res and res.text:
                        import json, re
                        match = re.search(r"(\[.*\])", res.text, re.DOTALL)
                        if match:
                            items = json.loads(match.group(1))
                            for it in items:
                                if isinstance(it, dict) and "word" in it and "turkish_meaning" in it:
                                    keywords.append(ExtractedWord(
                                        word=str(it["word"]).strip(),
                                        turkish_meaning=str(it["turkish_meaning"]).strip(),
                                        level=str(it.get("level", "B2")).strip().upper()
                                    ))
                        if keywords:
                            break
                except Exception:
                    continue
        except Exception as e:
            logger.info(f"Keyword extraction with Gemini skipped: {e}")

    # Fallback kelime ayıklama (Basit stopwords elemesi ve 6+ harfli terimler)
    if not keywords and len(raw_text.split()) >= 4:
        stopwords = {"the", "and", "that", "this", "with", "from", "they", "have", "been", "were", "what", "when", "where", "which", "would", "could", "should", "their", "there", "about"}
        words = [w.strip(".,!?:;\"'()[]") for w in raw_text.split() if len(w) >= 6 and w.lower() not in stopwords]
        for w in words[:2]:
            trans_w = await translate_via_free_google_endpoint(w, "en", "tr")
            if trans_w and trans_w.lower() != w.lower():
                keywords.append(ExtractedWord(
                    word=w,
                    turkish_meaning=trans_w,
                    level="B2"
                ))

    return StreamTextResponse(
        original_text=raw_text,
        translated_text=translated_text,
        source_lang=source_lang,
        target_lang=target_lang,
        keywords=keywords
    )

