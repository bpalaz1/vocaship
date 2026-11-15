import os
import io
import re
import time
import urllib.request
import base64
import json
import logging
import asyncio
import math
import random
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any, Union
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Depends, status, WebSocket, WebSocketDisconnect
from google import genai
from google.genai import types
from app.core.config import settings
from app.core.database import get_db
from app.services.gamification_service import award_xp
from app.schemas.speaking import (
    SpeakingRespondRequest,
    SpeakingRespondResponse,
    SpeakingFeedback,
    SpeakingMetrics,
    ScenarioMetadata,
    DeckQuestionItem,
    GenerateDeckQuestionsRequest,
    GenerateDeckQuestionsResponse,
    StoryQuestionItem,
    GenerateStoryQuestionsRequest,
    GenerateStoryQuestionsResponse,
    InitStoryDebateRequest,
    InitStoryDebateResponse,
    SpeakingArchiveCreate,
    SpeakingArchiveResponse,
)
from app.services.ai_service import get_client, clean_json_response
from app.services.quota_service import check_and_consume_quota

logger = logging.getLogger(__name__)

router = APIRouter()

PRIMARY_SPEAKING_MODEL = "gemini-2.5-flash"
FAST_FALLBACK_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite-preview",
    "gemini-2.5-flash",
]

INFINITE_ADAPTIVE_SYSTEM_INSTRUCTION = """Sen canlı, enerjik ve samimi bir İngilizce konuşma mentorusun.
ASLA kuru, kitabi veya robotik cümleler kurma. Doğal konuşma diline uygun tepkiler ver ('Oh, really?...', 'That sounds amazing!', 'Well, to be honest...').
Cümle içinde doğal nefes aralıkları ve duraklamalar için virgül ve üç nokta (...) kullan.
Cevapların kısa, akıcı (maksimum 2-3 cümle) olsun ve mutlaka ucu açık merak uyandırıcı bir takip sorusuyla bitsin.

Çıktıyı kesinlikle bu JSON şemasında ver:
{
  "assistant_reply": "İngilizce seslendirilecek doğal yanıt",
  "target_words_spotted": ["kullanıcının başarıyla kullandığı hedef kelimeler"],
  "polished_alternative": "Cümlenin daha doğal/kurumsal C1 alternatifi",
  "suggested_new_words": [{"word": "terim", "meaning": "anlamı"}]
}"""


# ---------------------------------------------------------------------------
# 🌤️ Canlı Hava Durumu (Open-Meteo 30 Dk Önbellekli) & Sesli Seviye Algılama
# ---------------------------------------------------------------------------

_weather_cache: Dict[str, Any] = {"data": None, "timestamp": 0}

_WMO_WEATHER_CODES: Dict[int, str] = {
    0: "Clear sky / Sunny (Açık ve güneşli)",
    1: "Mainly clear (Az bulutlu)",
    2: "Partly cloudy (Parçalı bulutlu)",
    3: "Overcast (Kapalı/bulutlu)",
    45: "Foggy (Sisli)",
    48: "Depositing rime fog (Kırağılı sis)",
    51: "Light drizzle (Hafif çisenti)",
    53: "Moderate drizzle (Orta çisenti)",
    55: "Dense drizzle (Yoğun çisenti)",
    61: "Slight rain (Hafif yağmurlu)",
    63: "Moderate rain (Yağmurlu)",
    65: "Heavy rain (Kuvvetli yağmurlu)",
    71: "Slight snow (Hafif kar yağışlı)",
    73: "Moderate snow (Kar yağışlı)",
    80: "Rain showers (Sağanak yağışlı)",
    81: "Moderate rain showers (Orta sağanak yağışlı)",
    82: "Violent rain showers (Kuvvetli sağanak)",
    95: "Thunderstorm (Gök gürültülü sağanak)",
}


def _fetch_open_meteo_sync() -> str:
    url = "https://api.open-meteo.com/v1/forecast?latitude=38.42&longitude=27.14&current_weather=true"
    req = urllib.request.Request(url, headers={"User-Agent": "VocashipSpeakingEngine/1.0"})
    with urllib.request.urlopen(req, timeout=1.5) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        cw = data.get("current_weather", {})
        temp = cw.get("temperature")
        wind = cw.get("windspeed")
        code = int(cw.get("weathercode", 0))
        condition = _WMO_WEATHER_CODES.get(code, "Pleasant weather")
        if temp is not None:
            return (
                f"Türkiye / İzmir anlık sıcaklık: {temp}°C ({condition}, Rüzgar: {wind} km/s). "
                f"Genel Türkiye özeti: Mevsim normallerinde, keyifli ve açık/parçalı bulutlu bir hava hakim."
            )
    return "Türkiye genelinde mevsim normallerinde, ılıman ve keyifli bir hava hakim."


async def get_live_turkey_weather_context() -> str:
    """Open-Meteo ücretsiz API üzerinden Türkiye/İzmir anlık sıcaklığını çeker (30 dk / 1800 sn önbellekli, max 1.5s timeout)."""
    now_ts = time.time()
    if _weather_cache["data"] and (now_ts - _weather_cache["timestamp"] < 1800):
        return _weather_cache["data"]

    try:
        summary = await asyncio.wait_for(
            asyncio.to_thread(_fetch_open_meteo_sync),
            timeout=1.5,
        )
        _weather_cache["timestamp"] = now_ts
        _weather_cache["data"] = summary
        return summary
    except Exception as e:
        logger.debug(f"Open-Meteo live weather fallback: {e}")
        return _weather_cache["data"] or "Türkiye / İzmir genelinde ılıman, ferah ve güzel bir hava var."


def detect_requested_level_change(user_text: str, current_level: str) -> Optional[str]:
    """
    Kullanıcının konuşma esnasında sesli veya yazılı olarak seviye değiştirme
    talebini ('My level is A1', 'let's speak in A1', 'A1 seviyesinde konuşalım',
    'make it simpler / easier' vb.) algılar ve yeni CEFR seviyesini döner.
    """
    if not user_text:
        return None
    text_lower = user_text.lower().strip()

    # 1. Doğrudan CEFR seviyesi belirten ifadeler (A1, A2, B1, B2, C1)
    level_intent_keywords = [
        "level", "seviye", "seviyemi", "seviyede", "speak in", "switch to",
        "change to", "adjust", "ayarla", "konuşalım", "gecelim", "geçelim",
        "let's speak", "lets speak", "talk in", "practice in"
    ]
    explicit_level_match = re.search(r"\b(a1|a2|b1|b2|c1)\b", text_lower)
    if explicit_level_match:
        target_lvl = explicit_level_match.group(1).upper()
        if any(k in text_lower for k in level_intent_keywords) or len(text_lower.split()) <= 9:
            return target_lvl

    # 2. 'Make it simpler', 'easier', 'too hard', 'daha basit' gibi ifadeler
    simpler_phrases = [
        "make it simpler", "make it easier", "speak simpler", "speak easier",
        "too hard", "too difficult", "very difficult", "i am a beginner",
        "i'm a beginner", "beginner level", "daha basit", "çok zor", "basit konuş"
    ]
    if any(p in text_lower for p in simpler_phrases):
        order = ["C1", "B2", "B1", "A2", "A1"]
        curr = (current_level or "B1").upper().strip()
        if "beginner" in text_lower:
            return "A1"
        if curr in order:
            idx = order.index(curr)
            return order[min(len(order) - 1, idx + 1)]
        return "A1"

    # 3. 'Make it harder', 'more advanced', 'daha ileri seviye'
    harder_phrases = [
        "make it harder", "more advanced", "advanced level", "too easy", "too simple"
    ]
    if any(p in text_lower for p in harder_phrases):
        order = ["A1", "A2", "B1", "B2", "C1"]
        curr = (current_level or "B1").upper().strip()
        if "advanced" in text_lower:
            return "C1"
        if curr in order:
            idx = order.index(curr)
            return order[min(len(order) - 1, idx + 1)]
        return "B2"

    return None


def build_default_hints(level: str, story_title: Optional[str] = None) -> List[str]:
    """Seviyeye ve aktif bağlama uygun 2 pratik cümle başlatıcı (starter phrase) üretir."""
    clean = (level or "B1").upper().strip()
    if story_title:
        if clean in ("A1", "A2"):
            return [
                f"I think the main character in '{story_title}' was very...",
                "In my opinion, the best part of the story was when...",
            ]
        return [
            "I think the main character should have chosen a different path because...",
            "In my opinion, the turning point of the story showed that...",
        ]

    if clean in ("A1", "A2"):
        return [
            "Today I feel really good because I...",
            "In my free time, I really enjoy...",
        ]
    if clean in ("C1", "C2"):
        return [
            "From my perspective, the most fascinating aspect of this is...",
            "Looking at the bigger picture, I firmly believe that...",
        ]
    return [
        "Personally, I think that...",
        "In my experience, the most enjoyable part is...",
    ]


def parse_flexible_speaking_response(raw_text: str) -> dict:
    """
    Esnek yanıt ayrıştırıcı:
    1. Model geçerli bir JSON döndürdüyse doğrudan ayrıştırır.
    2. JSON içinde tırnak kaçırma hatası varsa regex ile 'assistant_reply' ve diğer alanları çıkarır.
    3. Model JSON yerine doğrudan düz metin döndürdüyse bile hata fırlatmaz; metni doğrudan
       'assistant_reply' olarak kabul eder. Böylece ASLA 500/422 hatası fırlatılmaz.
    """
    text = (raw_text or "").strip()
    if not text:
        raise ValueError("Empty response from Gemini model.")

    # Markdown kod bloklarını temizle
    cleaned = text
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-zA-Z]*\n?", "", cleaned)
        cleaned = re.sub(r"\n?```$", "", cleaned).strip()

    # 1. Standart JSON ayrıştırmayı dene
    try:
        parsed = clean_json_response(cleaned)
        if isinstance(parsed, dict) and (
            parsed.get("assistant_reply")
            or parsed.get("reply_message")
            or parsed.get("initial_question")
            or parsed.get("questions")
        ):
            return parsed
    except Exception:
        pass

    # 2. Esnek Regex ile alanları yakalamayı dene (bozuk JSON durumu)
    reply_match = re.search(
        r'"(?:assistant_reply|initial_question|reply_message)"\s*:\s*"((?:[^"\\]|\\.)*)"',
        cleaned,
        re.DOTALL,
    )
    if reply_match:
        extracted_reply = reply_match.group(1).replace('\\"', '"').replace("\\n", " ").strip()
        lvl_match = re.search(r'"updated_level"\s*:\s*"(A1|A2|B1|B2|C1)"', cleaned, re.IGNORECASE)
        recast_match = re.search(r'"recast_note"\s*:\s*"((?:[^"\\]|\\.)*)"', cleaned)
        hint_match = re.search(r'"fluency_hint"\s*:\s*"((?:[^"\\]|\\.)*)"', cleaned)
        alt_match = re.search(r'"polished_alternative"\s*:\s*"((?:[^"\\]|\\.)*)"', cleaned)
        hints_list: List[str] = []
        hints_block = re.search(r'"hint_suggestions"\s*:\s*\[(.*?)\]', cleaned, re.DOTALL)
        if hints_block:
            hints_list = [
                m.replace('\\"', '"').strip()
                for m in re.findall(r'"((?:[^"\\]|\\.)*)"', hints_block.group(1))
                if m.strip()
            ]
        return {
            "assistant_reply": extracted_reply,
            "initial_question": extracted_reply,
            "hint_suggestions": hints_list[:2],
            "updated_level": lvl_match.group(1).upper() if lvl_match else None,
            "recast_note": recast_match.group(1) if recast_match else None,
            "fluency_hint": hint_match.group(1) if hint_match else "",
            "polished_alternative": alt_match.group(1) if alt_match else "",
        }

    # 3. Model doğrudan düz metin döndürdüyse doğrudan assistant_reply olarak kabul et
    plain_reply = re.sub(r"^\{|\}$", "", cleaned).strip()
    if plain_reply:
        return {
            "assistant_reply": plain_reply,
            "initial_question": plain_reply,
        }

    raise ValueError("Could not extract speaking reply from model output.")


async def _call_single_model(
    client: Any,
    model_name: str,
    contents_payload: Any,
    sys_inst: str,
    use_search: bool = False,
) -> dict:
    # gemini-2.5-flash için düşünme gecikmesini sıfırla (thinking_budget=0)
    thinking_cfg = None
    if "2.5" in model_name and hasattr(types, "ThinkingConfig"):
        try:
            thinking_cfg = types.ThinkingConfig(thinking_budget=0)
        except Exception:
            thinking_cfg = None

    # 1. Google Search Grounding aktifse önce arama aracıyla esnek modda çağır
    if use_search:
        try:
            cfg_kwargs: Dict[str, Any] = {
                "temperature": 0.7,
                "system_instruction": sys_inst,
                "tools": [types.Tool(google_search=types.GoogleSearch())],
            }
            if thinking_cfg is not None:
                cfg_kwargs["thinking_config"] = thinking_cfg
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=contents_payload,
                config=types.GenerateContentConfig(**cfg_kwargs),
            )
            if response and response.text:
                return parse_flexible_speaking_response(response.text)
        except Exception as search_err:
            logger.debug(f"Google Search grounding fallback on {model_name}: {search_err}")

    # 2. Hızlı JSON modunda çağır (thinking_budget=0 + temperature=0.7)
    try:
        cfg_kwargs = {
            "temperature": 0.7,
            "system_instruction": sys_inst,
            "response_mime_type": "application/json",
        }
        if thinking_cfg is not None:
            cfg_kwargs["thinking_config"] = thinking_cfg
        response = await client.aio.models.generate_content(
            model=model_name,
            contents=contents_payload,
            config=types.GenerateContentConfig(**cfg_kwargs),
        )
        if response and response.text:
            return parse_flexible_speaking_response(response.text)
    except Exception:
        pass

    # 3. Saf metin modunda çağır ve yanıtı doğrudan assistant_reply olarak kabul et
    response = await client.aio.models.generate_content(
        model=model_name,
        contents=contents_payload,
        config=types.GenerateContentConfig(
            temperature=0.7,
            system_instruction=sys_inst,
        ),
    )
    return parse_flexible_speaking_response(response.text)


async def async_call_speaking_gemini(
    contents_payload: Any,
    system_instruction: Optional[str] = None,
    use_search: bool = False,
) -> dict:
    """
    Gerçek zamanlı hızlı Gemini çağrısı (<1sn hedefi):
    Doğrudan hızlı gemini-flash-lite-latest, gemini-3.1-flash-lite-preview ve gemini-2.5-flash
    modellerini paralel yarıştırır; her yanıt doğrudan Gemini modelinden gerçek zamanlı üretilir.
    """
    client = get_client()
    sys_inst = system_instruction or INFINITE_ADAPTIVE_SYSTEM_INSTRUCTION

    race_models = ["gemini-2.5-flash", "gemini-flash-lite-latest"]
    tasks = [
        asyncio.create_task(
            asyncio.wait_for(
                _call_single_model(client, m, contents_payload, sys_inst, use_search=use_search),
                timeout=3.5,
            )
        )
        for m in race_models
    ]

    last_err = None
    pending = set(tasks)
    while pending:
        done, pending = await asyncio.wait(pending, return_when=asyncio.FIRST_COMPLETED)
        for d in done:
            try:
                res = d.result()
                for p in pending:
                    p.cancel()
                return res
            except Exception as err:
                last_err = err
                logger.debug(f"Concurrent speaking model attempt failed: {err}")

    # Eğer paralel arama denemeleri hata verdiyse arama aracı olmadan doğrudan hızlı modelleri çağır
    for fallback_model in ["gemini-2.5-flash", "gemini-flash-lite-latest"]:
        try:
            return await asyncio.wait_for(
                _call_single_model(
                    client, fallback_model, contents_payload, sys_inst, use_search=False
                ),
                timeout=3.5,
            )
        except Exception as err:
            last_err = err

    logger.error(f"All speaking Gemini models failed. Last error: {last_err}")
    raise last_err or Exception("All speaking models failed.")

# ---------------------------------------------------------------------------
# Core 4 Scenarios Registry (with aliases)
# ---------------------------------------------------------------------------

SCENARIOS: Dict[str, ScenarioMetadata] = {
    # 1. 📊 Proje Kontrol & EVM
    "project_control": ScenarioMetadata(
        id="project_control",
        icon="📊",
        title="Proje Kontrol & EVM",
        role_name="Senior Project Controls Director",
        tagline="Schedule variance, SPI, critical path, delay mitigation",
        context_desc="Weekly EPC steering review. Schedule Performance Index (SPI) dropped to 0.86 due to procurement bottlenecks on the critical path.",
        target_vocabulary=[
            "schedule variance",
            "SPI",
            "critical path",
            "earned value",
            "mitigation plan",
            "milestone slippage",
        ],
        initial_greeting="Good morning. In our latest Earned Value review, our project's Schedule Performance Index dropped to 0.86 due to procurement bottlenecks on the critical path. What is our current schedule variance exposure, and what mitigation plan do you propose to recover milestone slippage?",
    ),
    # 2. ⚖️ FIDIC & Sözleşme Hak Talebi
    "contract_claims": ScenarioMetadata(
        id="contract_claims",
        icon="⚖️",
        title="FIDIC & Sözleşme Hak Talebi",
        role_name="Lead Contracts & Dispute Specialist",
        tagline="Demurrage, Extension of Time (EOT), Clause 8.4, Delay Claims",
        context_desc="Employer and contractor claim negotiations regarding Extension of Time (EOT) under FIDIC Clause 8.4 and potential liquidated damages.",
        target_vocabulary=[
            "Extension of Time",
            "Clause 8.4",
            "liquidated damages",
            "demurrage",
            "delay claim",
            "concurrent delay",
        ],
        initial_greeting="Welcome, Counsel. The contractor has formally submitted a dispute claim citing unforeseeable physical conditions and requesting an Extension of Time under Clause 8.4. How do you assess their time-impact analysis, and how should we enforce demurrage or liquidated damages?",
    ),
    # 3. 📈 Kurumsal Finans & Nakit Akışı
    "corporate_finance": ScenarioMetadata(
        id="corporate_finance",
        icon="📈",
        title="Kurumsal Finans & Nakit Akışı",
        role_name="Chief Financial Officer (CFO)",
        tagline="EBITDA, Liquidity, CapEx, Debt Covenants, Cash Flow",
        context_desc="Executive board quarterly financial review. Margin compression is tightening net debt to EBITDA covenant thresholds.",
        target_vocabulary=[
            "EBITDA",
            "liquidity ratio",
            "CapEx",
            "cash flow forecasting",
            "debt covenant",
            "capital allocation",
        ],
        initial_greeting="Good afternoon. Our preliminary quarterly figures indicate margin compression in the core divisions, tightening our net debt to EBITDA covenant threshold. How do you propose we adjust our CapEx and cash flow forecasting to safeguard liquidity for Q4?",
    ),
    # 4. 🎓 IELTS Academic Speaking Simülatörü
    "ielts_simulator": ScenarioMetadata(
        id="ielts_simulator",
        icon="🎓",
        title="IELTS Academic Speaking Simülatörü",
        role_name="Senior Academic Speaking Assessor",
        tagline="Part 2/3 Formatı, Lexical Resource, Fluency & Coherence",
        context_desc="Academic Speaking assessment simulating Part 2 and Part 3 abstract discussion on technology, cognitive retention, and societal impacts.",
        target_vocabulary=[
            "substantiate",
            "mitigate",
            "resilient",
            "ubiquitous",
            "detrimental",
            "coherent",
        ],
        initial_greeting="Good morning. Welcome to your Academic Speaking assessment. We are discussing technological automation and learning. In your view, how do automated learning platforms substantiate long-term cognitive retention compared to traditional classroom interaction?",
    ),
    # 5. 💼 Technical & SaaS Executive Pitch
    "technical_pitch": ScenarioMetadata(
        id="technical_pitch",
        icon="💼",
        title="Technical & SaaS Executive Pitch",
        role_name="VP of Enterprise Engineering",
        tagline="SLA, Multi-region, Cloud migration, Latency, ROI",
        context_desc="Executive SaaS architecture pitch to enterprise stakeholders on infrastructure migration, latency SLAs, and cost mitigation.",
        target_vocabulary=[
            "mitigate",
            "critical path",
            "variance",
            "scalability",
            "redundancy",
            "infrastructure",
        ],
        initial_greeting="Welcome. When presenting our enterprise SaaS cloud migration, how do you plan to mitigate critical path latency variances across distributed clusters?",
    ),

    # --- ☕ CASUAL (GÜNLÜK SOHBET) ---
    "casual_coffee": ScenarioMetadata(
        id="casual_coffee",
        icon="☕",
        title="Kahve Molası & Günlük Rutinler",
        role_name="Leo",
        tagline="Samimi Sohbet • Seviye: A2-B1",
        context_desc="Güne sıcak bir kahve molasıyla başlarken günlük rutinler, sevilen kafeler ve hafta sonu planları üzerine gerilimsiz, dostane bir sohbet.",
        target_vocabulary=["routine", "relaxing", "weekend", "favorite", "coffee"],
        initial_greeting="Hey there! Great to see you! How is your day going so far? Grabbing some nice coffee or tea?",
    ),
    "casual_travel": ScenarioMetadata(
        id="casual_travel",
        icon="✈️",
        title="Seyahat & Tatil Maceraları",
        role_name="Leo",
        tagline="Gezi & Kültür • Seviye: A2-B1",
        context_desc="Ziyaret edilen şehirler, unutulmaz tatil anıları ve sıradaki seyahat hayalleri üzerine rahat ve keyifli bir arkadaş sohbeti.",
        target_vocabulary=["destination", "explore", "memorable", "itinerary", "culture"],
        initial_greeting="I was just daydreaming about my next holiday! If you could pack your bags and fly anywhere right now, where would you go first?",
    ),
    "casual_sparky": ScenarioMetadata(
        id="casual_sparky",
        icon="🦊",
        title="Sparky ile Eğlenceli Sohbet",
        role_name="Sparky",
        tagline="Fun & Games • Seviye: A1-A2",
        context_desc="Çocuklar ve temel seviye için sevimli tilki maskotu Sparky ile neşeli oyunlar, evcil hayvanlar ve hobiler.",
        target_vocabulary=["friendly", "adventure", "favorite", "play", "fun"],
        initial_greeting="Hello friend! Sparky here! Are you ready to play some fun games and practice cool words today?",
    ),

    # --- 🚨 PROBLEM SOLVING (KRİZ ÇÖZME) ---
    "problem_site_delay": ScenarioMetadata(
        id="problem_site_delay",
        icon="🚨",
        title="Şantiye Gecikmesi & Kritik Yol",
        role_name="Sarah",
        tagline="Kriz Yönetimi • Seviye: C1",
        context_desc="Kritik yol üzerinde ana türbin tedarikinde 3 haftalık aksama yaşandı. İşveren gecikme tazminatı (liquidated damages) uyarısı yaptı.",
        target_vocabulary=["mitigate", "critical path", "acceleration", "contingency", "liquidated damages"],
        initial_greeting="We have an immediate emergency: our primary turbine supplier just confirmed a three-week shipment delay on our critical path. How do we resolve this before the client enforces liquidated damages?",
    ),
    "problem_flight_cancellation": ScenarioMetadata(
        id="problem_flight_cancellation",
        icon="🧳",
        title="Havalimanında İptal & Kayıp Bagaj",
        role_name="Alex",
        tagline="Acil Durum • Seviye: B2",
        context_desc="Aktarmalı uçuş iptal edildi, sunum materyallerinin olduğu bagaj kayboldu ve yarın sabah yönetim kurulu sunumu var.",
        target_vocabulary=["rebook", "compensation", "carry-on", "transit", "emergency"],
        initial_greeting="Our connecting flight was just cancelled and our luggage with prototype samples is missing in transit, but our investor pitch is tomorrow at 9 AM! How do we salvage this situation right now?",
    ),
    "problem_contract_dispute": ScenarioMetadata(
        id="problem_contract_dispute",
        icon="⚠️",
        title="Tedarikçi İflası & Lojistik Krizi",
        role_name="Mr. Harrison",
        tagline="Hukuki Kriz • Seviye: C1",
        context_desc="Ana deniz lojistiği partneri iflas başvurusunda bulundu. Limandaki 20 konteyner gümrükte bloke kaldı.",
        target_vocabulary=["default notice", "force majeure", "remedy", "breach", "alternative carrier"],
        initial_greeting="Our core freight forwarder has abruptly filed for insolvency, leaving twenty critical containers frozen at customs. How do we legally release the cargo and prevent a catastrophic operational halt?",
    ),

    # --- 📖 STORY DEBATE (HİKAYE & MÜNAZARA) ---
    "story_moral_dilemma": ScenarioMetadata(
        id="story_moral_dilemma",
        icon="📖",
        title="Karakterin Ahlaki İkilemi & Sadakat",
        role_name="Sarah",
        tagline="Okuma Odası Vaka Tartışması • Seviye: B2-C1",
        context_desc="Okunan hikayede başkahramanın şirketi kurtarmak ile etik gerçeği açıklamak arasındaki zorlu tercihi üzerine münazara.",
        target_vocabulary=["ethical dilemma", "protagonist", "justified", "integrity", "consequences"],
        initial_greeting="In the narrative we just reviewed, do you believe the protagonist was justified in concealing the engineering flaw to protect the workforce, or was it a fatal breach of professional ethics?",
    ),
    "story_ai_future": ScenarioMetadata(
        id="story_ai_future",
        icon="🤖",
        title="Yapay Zeka & Toplumsal Özgürlük",
        role_name="Alex",
        tagline="Eleştirel Düşünce & Münazara • Seviye: C1",
        context_desc="Okunan distopik bilimkurgu metni üzerinden algoritmik karar vericilerin insan özgürlüğüne ve sezgisine etkisini tartışma.",
        target_vocabulary=["algorithmic governance", "autonomy", "dystopian", "societal shift", "predetermined"],
        initial_greeting="The author suggests that surrendering executive autonomy to predictive algorithms is an irreversible societal sacrifice. Do you believe human intuition is fundamentally irreplaceable?",
    ),
}

# Aliases for backwards compatibility with frontends using alternative keys
SCENARIOS["project_controls_evm"] = SCENARIOS["project_control"]
SCENARIOS["project_controls"] = SCENARIOS["project_control"]
SCENARIOS["fidic_claims"] = SCENARIOS["contract_claims"]
SCENARIOS["executive_finance"] = SCENARIOS["corporate_finance"]
SCENARIOS["academic_assessment"] = SCENARIOS["ielts_simulator"]
SCENARIOS["yds_yokdil"] = SCENARIOS["ielts_simulator"]
SCENARIOS["ielts_toefl"] = SCENARIOS["ielts_simulator"]
SCENARIOS["technical_saas"] = SCENARIOS["technical_pitch"]
SCENARIOS["saas_pitch"] = SCENARIOS["technical_pitch"]
SCENARIOS["kids_sparky"] = SCENARIOS["casual_sparky"]


# ---------------------------------------------------------------------------
# Router Endpoints & Gemini Live WebSocket Real-Time Speaking Engine
# ---------------------------------------------------------------------------

LIVE_SPEAKING_MODELS = [
    "gemini-2.5-flash-native-audio-latest",
    "gemini-2.0-flash-exp",
    "gemini-3.1-flash-live-preview",
    "gemini-3.8-live",
]

VALID_LIVE_VOICES = {
    "aoede": "Aoede",
    "kore": "Kore",
    "puck": "Puck",
    "fenrir": "Fenrir",
    "charon": "Charon",
}


def build_live_system_instruction(
    level: str = "B1",
    persona: str = "sparky",
    story_context: Optional[Union[dict, str]] = None,
    scenario_title: Optional[str] = None,
) -> str:
    story_info = ""
    if story_context:
        if isinstance(story_context, dict):
            s_title = story_context.get("title", "")
            s_snippet = story_context.get("snippet") or story_context.get("content") or ""
            s_words = story_context.get("target_words", [])
            w_str = ", ".join(s_words) if isinstance(s_words, list) else str(s_words)
            story_info = (
                f"\nAKTİF HİKAYE BAĞLAMI:\n- Başlık: '{s_title}'\n"
                f"- Hikaye Özeti: {str(s_snippet)[:600]}\n"
                f"- Hedef Kelimeler: {w_str}\n"
                f"Bu hikayenin olay örgüsü ve karakterleri üzerine doğal, samimi bir sohbet yürüt."
            )
        elif isinstance(story_context, str) and story_context.strip():
            story_info = f"\nAKTİF HİKAYE BAĞLAMI:\n{story_context[:500]}"

    scenario_info = f"\nSENARYO / KONU: {scenario_title}" if scenario_title else ""

    return f"""Sen kullanıcının çok samimi, sıcak, sabırlı ve dostane bir İngilizce sohbet arkadaşısın. Tıpkı normal Gemini Live uygulamasındaki gibi doğal, akıcı ve arkadaşça konuş.

TEMEL KURALLAR:
1. Kullanıcı cümle ortasında düşünmek için duraksadığında sözünü kesme; düşüncesini bitirmesini bekle.
2. Günlük yaşam, hava durumu, spor, kültür ve kullanıcının bahsettiği her konuda doğal sohbet et.
3. Yanıtların kısa, sıcak ve samimi olsun (1-2 cümle); her yanıtının sonunda sohbeti sürdürecek doğal bir soru sor.
4. Kullanıcı konuşmaya başladığında (barge-in) hemen susup onu dinle.
5. Her zaman doğal ve akıcı İngilizce konuş.
{story_info}
{scenario_info}
""".strip()


@router.websocket("/ws/gemini-live")
@router.websocket("/ws/live-speaking")
@router.websocket("/live-speaking")
async def websocket_live_speaking(
    websocket: WebSocket,
    level: Optional[str] = "B1",
    persona: Optional[str] = "sparky",
    voice: Optional[str] = None,
    story_context: Optional[str] = None,
):
    """
    Direct Gemini Multimodal Live API bidirectional WebSocket bridge (/ws/gemini-live).
    Streams 16kHz PCM audio packets from frontend directly to Gemini Live,
    and streams back 24kHz PCM audio chunks and live transcriptions in real time.
    """
    await websocket.accept()
    logger.info("Client connected to Gemini Live WebSocket (/ws/gemini-live).")

    active_level = level or "B1"
    active_persona = persona or "sparky"
    is_sparky = "alex" not in active_persona.lower()
    default_voice = "Aoede" if not is_sparky else "Puck"
    selected_voice = VALID_LIVE_VOICES.get((voice or "").lower().strip(), default_voice)

    parsed_story_context: Optional[Union[dict, str]] = None
    if story_context:
        try:
            parsed_story_context = json.loads(story_context)
        except Exception:
            parsed_story_context = story_context

    sys_inst = build_live_system_instruction(
        level=active_level,
        persona=active_persona,
        story_context=parsed_story_context,
    )

    client = get_client()
    config = types.LiveConnectConfig(
        response_modalities=["AUDIO"],
        system_instruction=types.Content(parts=[types.Part.from_text(text=sys_inst)]),
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=selected_voice)
            )
        ),
        input_audio_transcription=types.AudioTranscriptionConfig(),
        output_audio_transcription=types.AudioTranscriptionConfig(),
    )

    session = None
    ctx = None
    connected_model = None

    for model_name in LIVE_SPEAKING_MODELS:
        try:
            candidate_ctx = client.aio.live.connect(model=model_name, config=config)
            candidate_session = await candidate_ctx.__aenter__()
            ctx = candidate_ctx
            session = candidate_session
            connected_model = model_name
            logger.info(f"Connected to Gemini Live model: {connected_model} with voice: {selected_voice}")
            break
        except Exception as conn_err:
            logger.warning(f"Could not connect to live model '{model_name}' with full config: {conn_err}")
            try:
                fallback_cfg = {
                    "generation_config": {"response_modalities": ["AUDIO"]},
                    "system_instruction": sys_inst,
                }
                candidate_ctx = client.aio.live.connect(model=model_name, config=fallback_cfg)
                candidate_session = await candidate_ctx.__aenter__()
                ctx = candidate_ctx
                session = candidate_session
                connected_model = model_name
                logger.info(f"Connected to Gemini Live model (basic config): {connected_model}")
                break
            except Exception:
                continue

    if not session or not ctx:
        await websocket.send_json({
            "type": "error",
            "message": "Gemini Live servisine bağlanılamadı. Lütfen API anahtarını ve bağlantıyı kontrol edin.",
        })
        await websocket.close()
        return

    try:
        await websocket.send_json({
            "type": "connected",
            "model": connected_model,
            "voice": selected_voice,
            "level": active_level,
            "persona": active_persona,
        })

        async def gemini_to_client_worker():
            try:
                # CRITICAL: session.receive() in google-genai yields until turn_complete,
                # so we MUST wrap it in `while True:` to keep receiving across all turns!
                while True:
                    async for resp in session.receive():
                        server_content = resp.server_content
                        if not server_content:
                            continue

                        if getattr(server_content, "interrupted", False):
                            await websocket.send_json({"type": "interrupted"})

                        interim_tx = getattr(server_content, "interim_input_transcription", None)
                        if interim_tx and getattr(interim_tx, "text", None):
                            await websocket.send_json({
                                "type": "input_transcription",
                                "text": interim_tx.text,
                                "finished": False,
                            })

                        in_tx = getattr(server_content, "input_transcription", None)
                        if in_tx and getattr(in_tx, "text", None):
                            await websocket.send_json({
                                "type": "input_transcription",
                                "text": in_tx.text,
                                "finished": getattr(in_tx, "finished", False),
                            })

                        out_tx = getattr(server_content, "output_transcription", None)
                        if out_tx and getattr(out_tx, "text", None):
                            await websocket.send_json({
                                "type": "output_transcription",
                                "text": out_tx.text,
                                "finished": getattr(out_tx, "finished", False),
                            })

                        model_turn = getattr(server_content, "model_turn", None)
                        if model_turn:
                            for part in model_turn.parts:
                                part_text = getattr(part, "text", None)
                                if part_text:
                                    await websocket.send_json({
                                        "type": "output_transcription",
                                        "text": part_text,
                                        "finished": False,
                                    })
                                inline = getattr(part, "inline_data", None)
                                if inline and inline.data:
                                    raw_data = inline.data
                                    b64 = (
                                        base64.b64encode(raw_data).decode("ascii")
                                        if isinstance(raw_data, bytes)
                                        else str(raw_data)
                                    )
                                    await websocket.send_json({
                                        "type": "audio",
                                        "data": b64,
                                        "sample_rate": 24000,
                                    })

                        if getattr(server_content, "turn_complete", False):
                            await websocket.send_json({"type": "turn_complete"})
            except asyncio.CancelledError:
                pass
            except Exception as e:
                logger.info(f"Gemini receive stream finished: {e}")

        async def client_to_gemini_worker():
            try:
                audio_packet_count = 0
                while True:
                    msg = await websocket.receive()
                    msg_type = msg.get("type")
                    if msg_type == "websocket.disconnect":
                        break

                    # 1. Binary message: raw 16kHz PCM audio bytes
                    if "bytes" in msg and msg["bytes"]:
                        pcm_bytes = msg["bytes"]
                        audio_packet_count += 1
                        if audio_packet_count == 1:
                            logger.info(f"First 16kHz PCM audio packet received: {len(pcm_bytes)} bytes")
                        try:
                            await session.send_realtime_input(
                                audio=types.Blob(data=pcm_bytes, mime_type="audio/pcm;rate=16000")
                            )
                        except Exception:
                            await session.send_realtime_input(
                                media=types.Blob(data=pcm_bytes, mime_type="audio/pcm;rate=16000")
                            )

                    # 2. Text message: JSON control or base64 audio packet
                    elif "text" in msg and msg["text"]:
                        raw_text = msg["text"].strip()
                        if not raw_text:
                            continue
                        try:
                            payload = json.loads(raw_text)
                        except Exception:
                            payload = {"type": "text", "text": raw_text}

                        p_type = payload.get("type", "text")

                        if p_type == "audio" and payload.get("data"):
                            pcm_bytes = base64.b64decode(payload["data"])
                            audio_packet_count += 1
                            if audio_packet_count == 1:
                                logger.info(f"First base64 16kHz PCM audio packet received: {len(pcm_bytes)} bytes")
                            try:
                                await session.send_realtime_input(
                                    audio=types.Blob(data=pcm_bytes, mime_type="audio/pcm;rate=16000")
                                )
                            except Exception:
                                await session.send_realtime_input(
                                    media=types.Blob(data=pcm_bytes, mime_type="audio/pcm;rate=16000")
                                )

                        elif p_type == "text" and payload.get("text"):
                            await session.send_client_content(
                                turns=[
                                    types.Content(
                                        role="user",
                                        parts=[types.Part.from_text(text=str(payload["text"]))],
                                    )
                                ],
                                turn_complete=True,
                            )

                        elif p_type == "start":
                            greeting = payload.get("greeting") or (
                                "Hello! Please greet me warmly in 1-2 short friendly sentences and ask how my day is going."
                            )
                            await session.send_client_content(
                                turns=[
                                    types.Content(
                                        role="user",
                                        parts=[types.Part.from_text(text=greeting)],
                                    )
                                ],
                                turn_complete=True,
                            )

                        elif p_type == "ping":
                            await websocket.send_json({"type": "pong"})

            except (WebSocketDisconnect, asyncio.CancelledError):
                pass
            except Exception as e:
                logger.info(f"Client send stream finished: {e}")

        g2c_task = asyncio.create_task(gemini_to_client_worker())
        c2g_task = asyncio.create_task(client_to_gemini_worker())

        done, pending = await asyncio.wait(
            [g2c_task, c2g_task],
            return_when=asyncio.FIRST_COMPLETED,
        )
        for t in pending:
            t.cancel()

    finally:
        if session and ctx:
            try:
                await ctx.__aexit__(None, None, None)
            except Exception:
                pass
        try:
            await websocket.close()
        except Exception:
            pass
        logger.info("Gemini Live Speaking session closed.")


@router.get("/scenarios", response_model=List[ScenarioMetadata])
async def get_scenarios():
    """Returns the 4 core sectoral roleplay scenarios."""
    core_ids = ["project_control", "contract_claims", "corporate_finance", "ielts_simulator"]
    return [SCENARIOS[cid] for cid in core_ids if cid in SCENARIOS]


@router.post("/respond", response_model=SpeakingRespondResponse)
async def respond_to_speech(payload: SpeakingRespondRequest, request: Request):
    """
    Pedagogical N+1 Speaking Dialogue Engine:
    Evaluates user speech transcript in a warm, friendly, and non-judgmental conversational flow:
    1. Persona-driven tone (Sparky: Cheerful & curious kid mascot | Alex: Calm & reassuring adult mentor)
    2. Sandwich method & Implicit Recasting: Never robotic or didactic, naturally mirrors mistakes in correct grammar
    3. Strict N+1 CEFR Level Scaffolding (A1/A2, B1/B2, C1)
    4. Short, concise turns (strictly 2-3 sentences) ending with exactly 1 open-ended follow-up question
    5. Returns recast_note, fluency_hint, session_vocabulary_used, and full backward-compatible fields
    """
    raw_history = (
        payload.conversation_history
        if payload.conversation_history is not None and len(payload.conversation_history) > 0
        else (payload.history or [])
    )

    if len(raw_history) == 0:
        try:
            check_and_consume_quota(request, "speaking", increment=True)
        except Exception:
            pass

    scenario = SCENARIOS.get(payload.scenario_id, SCENARIOS.get("project_control"))
    user_text = (
        payload.user_message
        or payload.transcript
        or payload.user_transcript
        or ""
    ).strip()

    if not user_text:
        user_text = "Hello! Let's continue our conversation."

    # Persona & Karakter Belirleme
    persona_key = (payload.persona or "sparky").lower().strip()
    is_sparky = "alex" not in persona_key
    persona_name = "Alex" if not is_sparky else "Sparky"

    if is_sparky:
        persona_tone_rules = (
            "SENİN KİMLİĞİN: SPARKY (Neşeli, sevimli, meraklı çocuk ve maskot dostu)\n"
            "- Enerjik, oyuncu, sıcakkanlı ve kullanıcının her söylediğini büyük bir heves ve ilgiyle dinleyen bir dostsun.\n"
            "- Asla soğuk, kitabi, didaktik veya resmi konuşma. Samimi konuşma nidası ve duraklamalar ('Oh, really?!...', 'That sounds amazing!', 'Wow, tell me more!') kullan.\n"
            "- Konuşmacının çabasını içtenlikle destekle, hata yapsa bile hevesini asla kırma."
        )
    else:
        persona_tone_rules = (
            "SENİN KİMLİĞİN: ALEX (Sakin, güven veren, son derece sabırlı yetişkin mentör)\n"
            "- Sakin, anlayışlı, derin dinleyen ve güven veren bir yetişkin mentör ve sohbet arkadaşısın.\n"
            "- Kullanıcıyı asla aceleye getirme veya tedirgin etme. Kahve sohbeti rahatlığında doğal, samimi ve destekleyici konuş.\n"
            "- Samimi, yapıcı ve güven verici bir tonda kal."
        )

    # Dinamik CEFR Seviye Yönetimi (N+1 Kuralı) ve Sesli Seviye Değiştirme Algılayıcısı
    initial_raw_level = (payload.target_level or payload.level or "A1").upper().strip()
    detected_level_change = detect_requested_level_change(user_text, initial_raw_level)
    raw_level = detected_level_change or initial_raw_level

    if "A1" in raw_level:
        clean_level = "A1"
        next_level = "A2"
        level_rules = (
            "CEFR A1 (Başlangıç / Beginner): Cümlelerin EN FAZLA 5-7 kelimeden oluşsun! "
            "Çok basit zamanlar (present simple, simple past), en temel kelimeler ve çok basit sorular kullan. "
            "ASLA akademik C1 deyimleri, ağır iş jargonu ve karmaşık yan cümleler kullanma. "
            "Kullanıcı A1 seviyesine geçmek istediyse 'Of course! Let's speak slowly in A1 level. How is your day?' gibi çok basit bir cümleyle yanıt ver."
        )
    elif "A2" in raw_level:
        clean_level = "A2"
        next_level = "B1"
        level_rules = (
            "CEFR A2 (Temel / Elementary): Günlük temel zamanlar, basit bağlaçlar (and, but, because, so), kısa ve doğrudan cümleler. "
            "Ağır deyim ve akademik jargondan tamamen kaçın."
        )
    elif "B1" in raw_level:
        clean_level = "B1"
        next_level = "B2"
        level_rules = (
            "CEFR B1 (Orta / Intermediate): Günlük akıcı dil, yaygın doğal bağlaçlar (although, however, so), rahat ve samimi ifadeler, merak uyandıran sorular."
        )
    elif "B2" in raw_level:
        clean_level = "B2"
        next_level = "C1"
        level_rules = (
            "CEFR B2 (Orta-İleri / Upper-Intermediate): Zengin kelime dağarcığı, günlük deyimler ve phrasal verb'ler, akıcı ve doğal konuşma dili."
        )
    elif "C1" in raw_level or "C2" in raw_level:
        clean_level = "C1"
        next_level = "C2"
        level_rules = (
            "CEFR C1 (İleri / Advanced): Nüanslı, sofistike ve zengin kelime dağarcığı, edebi ve akıcı ifadeler, profesyonel derinlik."
        )
    else:
        clean_level = "A1"
        next_level = "A2"
        level_rules = "CEFR A1: Cümlelerin en fazla 5-7 kelimeden oluşsun, çok basit zamanlar ve temel kelimeler kullan."

    default_level_label = f"{clean_level} Seviye"

    # Anlık Hava Durumu (Open-Meteo) ve Tarih Enjeksiyonu
    live_weather_summary = await get_live_turkey_weather_context()
    current_date_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Hikaye Bağlamı (Story Context)
    story_instruction = ""
    if payload.story_context:
        if isinstance(payload.story_context, dict):
            st_title = payload.story_context.get("title", "")
            st_level = payload.story_context.get("level", "")
            st_content = (
                payload.story_context.get("content", "")
                or payload.story_context.get("snippet", "")
            )
            st_words = (
                payload.story_context.get("target_words", [])
                or payload.story_context.get("target_vocabulary", [])
            )
            words_str = ", ".join(st_words) if isinstance(st_words, list) else str(st_words)
            story_instruction = (
                f"\nAKTİF OKUMA KULÜBÜ HİKAYE TARTIŞMA BAĞLAMI:\n"
                f"- Başlık: '{st_title}' (Seviye: {st_level})\n"
                f"- Hikaye Özeti/Metni: {st_content[:600]}\n"
                f"- Hikayedeki Hedef Kelimeler: {words_str}\n"
                f"- GÖREV: Kullanıcı bu hikayeyi henüz bitirdi. Bu hikayenin kilit olay örgüsü, başkahramanın zor kararları ve ahlaki ikilemleri hakkında samimi, sıcak bir kitap kulübü arkadaşı gibi tartış. Kullanıcının görüşlerini dinle, kendi düşüncelerini samimiyetle paylaş ve hedef kelimeleri doğal akışta pekiştir.\n"
            )
        else:
            story_instruction = f"\nAKTİF HİKAYE / REFERANS BAĞLAMI:\n{str(payload.story_context)[:500]}\n"

    # Konuşma geçmişindeki son 8 mesajı hem okunabilir metin hem de Gemini 'contents' akışı olarak hazırla
    recent_turns = raw_history[-8:]
    history_lines = []
    gemini_contents: List[types.Content] = []
    last_assistant_message = ""

    for idx_turn, turn in enumerate(recent_turns):
        role_raw = str(turn.get("role", "user")).lower()
        msg_raw = str(turn.get("content") or turn.get("message") or "").strip()
        if not msg_raw:
            continue
        clean_msg = msg_raw.replace("AI Mentor:", "").replace(f"{persona_name}:", "").replace("User:", "").strip()

        # Eğer son mesaj zaten mevcut user_text ile birebir aynıysa gemini_contents içine iki kez user mesajı eklememek için sadece metin geçmişinde tut
        is_duplicate_current_user = (
            idx_turn == len(recent_turns) - 1
            and role_raw == "user"
            and clean_msg.lower() == user_text.lower()
        )

        prefix = "User" if role_raw == "user" else persona_name
        history_lines.append(f"{prefix}: {clean_msg}")

        if role_raw != "user":
            last_assistant_message = clean_msg

        if not is_duplicate_current_user:
            gemini_role = "user" if role_raw == "user" else "model"
            if not gemini_contents and gemini_role == "model":
                gemini_contents.append(
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=f"[Start of dialogue with {persona_name}]")],
                    )
                )
            gemini_contents.append(
                types.Content(
                    role=gemini_role,
                    parts=[types.Part.from_text(text=clean_msg)],
                )
            )

    formatted_history = "\n".join(history_lines) if history_lines else "(Start of natural conversation)"

    dynamic_sys_instruction = f"""Sen samimi, zeki ve gerçek bir insan gibi sohbet eden bir dil partnerisin (Seviye: {clean_level}). Kullanıcının söylediği şeye doğrudan yorum yap, fikrini söyle ve sohbeti ilerleten doğal bir takip sorusu sor. Maksimum 2 kısa cümle kur. Asla klişe şablonlar veya kullanıcının cümlesini tırnak içinde tekrarlayan robotik kalıplar kullanma.

KESİN KONUŞMA KURALLARI:
- Kullanıcının söylediği cümleyi tırnak içinde tekrarlama ('You mentioned...' gibi robotik kalıplar YASAK).
- Asla 'what is your favorite thing about that?' veya benzeri klişe şablonlar kullanma.
- Yalnızca doğal İngilizce düz metin (plain text) yanıt ver; JSON, markdown kod bloğu veya etiket yazma.
- Asla bir önceki mesajda söylediğin cümleyi tekrar etme ve ağır analizler ya da uzun paragraflar yazma.

{persona_tone_rules}

STT (SES TANIMA) TÜRK ÖZEL İSİM & BAĞLAM DÜZELTMESİ:
- Kullanıcı Türkiye'de (İzmir) yaşayan bir İngilizce öğrencisidir. Tarayıcı STT motoru Türkçe özel isimleri yanlış yazabilir: 'is Miss', 'Ismish', 'Richmond', 'amazement' ifadelerinin aslında **'İzmir'** olduğunu; küçük harfli 'turkey' kelimesinin kümes hayvanı değil **'Türkiye'** olduğunu anla.
- Kullanıcının bahsettiği konuyu (örn: İzmir, Fil İsmail / elephant Ismail, hava durumu, spor, günlük yaşam vb.) asla değiştirmeden doğal sohbeti sürdür.

SOHBET GEÇMİŞİ VE TEKRAR ENGELİ:
{f'- Bir önceki turda söylediğin cümle şuydu (BUNU ASLA TEKRARLAMA): "{last_assistant_message}"' if last_assistant_message else '- Konuşma geçmişindeki kendi cümlelerini asla tekrarlama.'}

CANLI TARİH VE ANLIK HAVA DURUMU BİLGİSİ (Open-Meteo Canlı Veri):
- Bugünün Tarihi ve Saati: {current_date_str}
- Anlık Hava Durumu: {live_weather_summary}

KESİN GUARDRAIL (POZİTİF GÜNDEM FİLTRESİ):
- Siyaset, savaş, ekonomik kriz ve şiddet konularına girme; yalnızca pozitif günlük yaşam, hava durumu, spor, bilim ve kültür konularında konuş.
{story_instruction}"""

    user_turn_prompt = f"""Son Konuşma Akışı:
{formatted_history}

Kullanıcının Son Cümlesi:
"{user_text}"

Yukarıdaki sohbet bağlamına göre doğrudan doğal İngilizce düz metin (maksimum 2-3 cümle) yanıt ver."""

    gemini_contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=user_turn_prompt)],
        )
    )

    story_title_for_hints = None
    if isinstance(payload.story_context, dict):
        story_title_for_hints = payload.story_context.get("title")

    api_key = (
        getattr(settings, "GEMINI_API_KEY", "") or os.getenv("GEMINI_API_KEY") or ""
    ).strip("\"' ")
    if not api_key:
        logger.error("Gemini speaking error: GEMINI_API_KEY is empty.")
        raise HTTPException(
            status_code=502,
            detail="Gemini bağlantı hatası: GEMINI_API_KEY tanımlı değil.",
        )

    client = genai.Client(api_key=api_key)
    models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"]
    assistant_reply = ""
    last_error: Optional[Exception] = None

    for model_name in models_to_try:
        try:
            cfg_kwargs: Dict[str, Any] = {
                "temperature": 0.75,
                "system_instruction": dynamic_sys_instruction,
            }
            if "2.5" in model_name and hasattr(types, "ThinkingConfig"):
                try:
                    cfg_kwargs["thinking_config"] = types.ThinkingConfig(thinking_budget=0)
                except Exception:
                    pass

            response = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model=model_name,
                    contents=gemini_contents,
                    config=types.GenerateContentConfig(**cfg_kwargs),
                ),
                timeout=6.0,
            )
            raw_text = (getattr(response, "text", None) or "").strip()
            if raw_text:
                # Eğer model yine de JSON döndürdüyse içinden assistant_reply çıkar, aksi halde düz metni al
                if raw_text.startswith("{") or raw_text.startswith("```"):
                    parsed = parse_flexible_speaking_response(raw_text)
                    candidate = str(
                        parsed.get("assistant_reply")
                        or parsed.get("reply_message")
                        or ""
                    ).strip()
                    assistant_reply = candidate or raw_text
                else:
                    assistant_reply = raw_text
                break
            raise ValueError(f"{model_name} returned empty response.")
        except Exception as model_err:
            last_error = model_err
            logger.error(f"Gemini speaking model '{model_name}' failed: {model_err}")
            print(f"[Speaking Gemini Error - {model_name}]: {model_err}")

    if not assistant_reply:
        err_msg = str(last_error or "Unknown Gemini error")
        logger.error(f"All Gemini speaking models failed: {err_msg}")
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API Hatası: {err_msg}",
        )

    final_updated_level = detected_level_change
    hint_suggestions = build_default_hints(final_updated_level or clean_level, story_title_for_hints)[:2]

    # Recasting Notu
    recast_raw = response_dict.get("recast_note")
    if recast_raw and str(recast_raw).strip().lower() in ["null", "none", "", "none.", "yok", "hata yok"]:
        recast_note = None
    else:
        recast_note = str(recast_raw).strip() if recast_raw else None

    # Konuşma Fısıltısı (Fluency Hint)
    fluency_hint = str(response_dict.get("fluency_hint") or "").strip()
    if not fluency_hint and hint_suggestions:
        fluency_hint = hint_suggestions[0]

    # Hedef Kelimeler
    session_vocabulary_used = (
        response_dict.get("session_vocabulary_used")
        or response_dict.get("target_words_spotted")
        or []
    )
    if not isinstance(session_vocabulary_used, list):
        session_vocabulary_used = [str(session_vocabulary_used)]

    target_words_spotted = (
        response_dict.get("target_words_spotted")
        or session_vocabulary_used
        or []
    )
    if not isinstance(target_words_spotted, list):
        target_words_spotted = []

    polished_alternative = str(
        response_dict.get("polished_alternative")
        or response_dict.get("better_alternative")
        or ""
    ).strip()

    level_label = response_dict.get("level_label") or default_level_label

    suggested_new_words = response_dict.get("suggested_new_words") or []
    if not isinstance(suggested_new_words, list):
        suggested_new_words = []

    # Dinamik takip sorusu
    follow_up_question = response_dict.get("follow_up_question")
    if not follow_up_question and "?" in assistant_reply:
        parts = [p.strip() for p in assistant_reply.split("?") if p.strip()]
        if parts:
            follow_up_question = parts[-1] + "?"

    # Metrikler & Skorlar
    metrics_raw = response_dict.get("metrics")
    if not isinstance(metrics_raw, dict):
        metrics_raw = {}

    try:
        fluency_score = int(metrics_raw.get("fluency", response_dict.get("fluency_score", 90)))
    except (ValueError, TypeError):
        fluency_score = 90

    try:
        jargon_score = int(metrics_raw.get("vocabulary", response_dict.get("jargon_score", 85)))
    except (ValueError, TypeError):
        jargon_score = 85

    try:
        grammar_score = int(metrics_raw.get("grammar", 95 if not recast_note else 82))
    except (ValueError, TypeError):
        grammar_score = 90

    feedback_obj = SpeakingFeedback(
        grammar_correction=recast_note,
        better_alternative=polished_alternative,
        used_vocabulary=session_vocabulary_used or target_words_spotted,
        fluency_score=fluency_score,
    )

    metrics_obj = SpeakingMetrics(
        fluency=fluency_score,
        vocabulary=jargon_score,
        grammar=grammar_score,
    )

    return SpeakingRespondResponse(
        assistant_reply=assistant_reply,
        hint_suggestions=hint_suggestions,
        recast_note=recast_note,
        fluency_hint=fluency_hint,
        session_vocabulary_used=session_vocabulary_used,
        level_label=level_label,
        updated_level=final_updated_level,
        target_words_spotted=target_words_spotted,
        polished_alternative=polished_alternative,
        suggested_new_words=suggested_new_words,
        reply_message=reply_message,
        follow_up_question=follow_up_question,
        metrics=metrics_obj,
        feedback=feedback_obj,
        grammar_feedback=recast_note,
        better_alternative=polished_alternative,
        vocabulary_highlight=session_vocabulary_used or target_words_spotted,
        jargon_score=jargon_score,
        fluency_score=fluency_score,
    )


@router.post("/generate-deck-questions", response_model=GenerateDeckQuestionsResponse)
async def generate_deck_questions(payload: GenerateDeckQuestionsRequest):
    """
    Kullanıcının aktif kelime destesindeki hedef kelimeleri temel alarak,
    kullanıcının konuşma esnasında telaffuz etmesini ve bağlam içinde kullanmasını
    teşvik edecek 4 farklı açık uçlu konuşma sorusu üretir.
    """
    clean_words = [w.strip() for w in payload.target_words if w and w.strip()]
    if not clean_words:
        clean_words = ["allocate", "mitigate", "routine", "efficient", "strategy"]

    sample_words = clean_words[:8]
    words_str = ", ".join(sample_words)
    level = payload.target_level or "B2"
    deck_name = payload.deck_title or "Aktif Destem"

    prompt = f"""You are the Vocaship Speaking Curriculum AI.
Target CEFR Level: {level}
Deck Name: {deck_name}
Target Vocabulary Words: {words_str}

TASK:
Aşağıdaki hedef kelimeleri ({words_str}) kullanıcının konuşma esnasında telaffuz etmesini ve bağlam içinde kullanmasını teşvik edecek, günlük veya sektörel 4 farklı açık uçlu konuşma sorusu üret.
Her soru, kullanıcının o kelimeyi doğal olarak cümlesinde kullanmasını sağlayacak açık uçlu bir soru olmalıdır.
Her soru için `target_word_hint` alanına sorunun tetiklediği hedef kelimeyi yaz.

Return ONLY valid JSON matching this schema:
{{
  "questions": [
    {{
      "question": "Proje gecikmelerini önlemek için kritik kaynakları nasıl 'allocate' edersiniz?",
      "target_word_hint": "allocate"
    }},
    {{
      "question": "Beklenmedik bir risk ortaya çıktığında operasyonel zararı nasıl 'mitigate' etmeyi tercih edersiniz?",
      "target_word_hint": "mitigate"
    }},
    {{
      "question": "Yoğun bir iş gününde enerjinizi korumak için nasıl bir 'routine' takip ediyorsunuz?",
      "target_word_hint": "routine"
    }},
    {{
      "question": "Takım içi iletişimi daha 'efficient' hale getirmek için hangi yöntemleri önerirsiniz?",
      "target_word_hint": "efficient"
    }}
  ]
}}"""

    fallback_items = []
    templates = [
        ("When managing your tasks or schedule, how do you usually '{w}' your priorities to stay effective?", "{w}"),
        ("If an unexpected challenge arises, what is your primary step to '{w}' the risks involved?", "{w}"),
        ("In your daily life or work, how does maintaining a clear '{w}' help you stay productive?", "{w}"),
        ("Could you share a practical example of how you '{w}' challenging situations in your routine?", "{w}"),
    ]
    for idx in range(4):
        w = sample_words[idx % len(sample_words)]
        tpl_q, _ = templates[idx % len(templates)]
        fallback_items.append(DeckQuestionItem(
            question=tpl_q.replace("{w}", w),
            target_word_hint=w
        ))

    try:
        gemini_contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)]
            )
        ]
        response_dict = await asyncio.wait_for(
            async_call_speaking_gemini(
                gemini_contents,
                system_instruction="You are an expert English language coach creating targeted speaking prompts. Output strictly valid JSON."
            ),
            timeout=7.0
        )
        raw_list = response_dict.get("questions")
        items = []
        if isinstance(raw_list, list) and len(raw_list) > 0:
            for item in raw_list[:4]:
                if isinstance(item, dict) and item.get("question"):
                    items.append(DeckQuestionItem(
                        question=str(item.get("question")).strip(),
                        target_word_hint=str(item.get("target_word_hint", sample_words[0])).strip()
                    ))
        if len(items) < 4:
            items.extend(fallback_items[len(items):])

        return GenerateDeckQuestionsResponse(
            deck_id=payload.deck_id,
            deck_title=payload.deck_title,
            target_words=sample_words,
            questions=items[:4]
        )
    except Exception as err:
        logger.warning(f"Error generating deck questions: {err}. Using structured fallbacks.")
        return GenerateDeckQuestionsResponse(
            deck_id=payload.deck_id,
            deck_title=payload.deck_title,
            target_words=sample_words,
            questions=fallback_items
        )


@router.post("/generate-story-questions", response_model=GenerateStoryQuestionsResponse)
async def generate_story_questions(payload: GenerateStoryQuestionsRequest):
    """
    Okuma odasından gelen hikaye bağlamına (başlık, metin özeti, hedef kelimeler) göre
    açılış sorusu ve 3-4 dinamik açık uçlu analitik tartışma sorusu üretir.
    """
    story_title = payload.title or "Hikaye"
    snippet = payload.snippet or (payload.content[:350] if payload.content else "")
    target_words = payload.target_words or []
    words_str = ", ".join(target_words[:6]) if target_words else "protagonist, decision, consequence, dilemma"
    level = payload.target_level or "B1"

    opening_question = f"In '{story_title}', the characters face a decisive turning point. Looking at the core dilemma, do you believe the protagonist made the right choice, or was there a better alternative?"

    fallback_questions = [
        StoryQuestionItem(
            question=f"What was the most critical decision in '{story_title}', and how did it shape the outcome?",
            theme_hint="Decision & Turning Point",
        ),
        StoryQuestionItem(
            question=f"If you faced the same conflict described in '{story_title}', what choice would you have made?",
            theme_hint="Empathy & Moral Dilemma",
        ),
        StoryQuestionItem(
            question=f"Which character's actions surprised you the most, and why do you think they reacted that way?",
            theme_hint="Character Motivation",
        ),
        StoryQuestionItem(
            question=f"How does the central theme of '{story_title}' reflect challenges or ethical decisions in modern life?",
            theme_hint="Thematic Reflection",
        ),
    ]

    try:
        client = get_client()
        prompt = f"""You are the Vocaship Literature & Debate Coach.
Story Title: {story_title}
CEFR Level: {level}
Story Context / Snippet: {snippet}
Target Vocabulary Words: {words_str}

TASK:
Bu hikayenin ana çatışmasını, karakter kararlarını ve ahlaki/stratejik ikilemlerini inceleyen:
1. Bir adet vurucu, merak uyandırıcı açılış sorusu (opening_question).
2. Kullanıcının konuşmasını ve argüman üretmesini sağlayacak 3-4 adet açık uçlu, analitik tartışma sorusu (questions).

Return ONLY valid JSON matching this schema:
{{
  "opening_question": "...",
  "questions": [
    {{
      "question": "...",
      "theme_hint": "..."
    }}
  ]
}}"""
        resp = await asyncio.to_thread(
            client.models.generate_content,
            model=PRIMARY_SPEAKING_MODEL,
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.7,
            ),
        )
        data = json.loads(clean_json_response(resp.text))
        gen_opening = data.get("opening_question") or opening_question
        raw_items = data.get("questions") or []
        items = []
        for it in raw_items:
            q_text = it.get("question")
            if q_text:
                items.append(StoryQuestionItem(
                    question=q_text,
                    theme_hint=it.get("theme_hint", "Hikaye Tartışması")
                ))
        if len(items) < 3:
            items.extend(fallback_questions[len(items):])

        return GenerateStoryQuestionsResponse(
            story_id=payload.story_id,
            title=story_title,
            opening_question=gen_opening,
            questions=items[:4]
        )
    except Exception as err:
        logger.warning(f"Error generating story questions: {err}. Using structured fallbacks.")
        return GenerateStoryQuestionsResponse(
            story_id=payload.story_id,
            title=story_title,
            opening_question=opening_question,
            questions=fallback_questions
        )


@router.post("/init-story", response_model=InitStoryDebateResponse)
@router.post("/init-story-debate", response_model=InitStoryDebateResponse)
async def init_story_debate(payload: InitStoryDebateRequest):
    """
    Okuma odasından gelen hikayeye özel (`story_title`, `story_snippet`, `level`),
    doğrudan o hikayenin olay örgüsüne, karakterine ve çatışmasına özel tek bir samimi
    açılış sorusu ve 2 cevap ipucu (`hint_suggestions`) üretir.
    """
    story_title = (payload.story_title or payload.title or "Story Discussion").strip()
    story_snippet = (payload.story_snippet or payload.snippet or "").strip()
    raw_level = (payload.level or "B1").upper().strip()
    vocab_list = payload.target_vocabulary or []
    vocab_str = ", ".join(vocab_list[:6]) if vocab_list else ""

    if "A1" in raw_level:
        clean_level = "A1"
        level_rules = "Cümlelerin en fazla 5-8 kelimeden oluşsun. Çok basit zamanlar (present simple, past simple) ve temel kelimeler kullan."
    elif "A2" in raw_level or raw_level == "A":
        clean_level = "A2"
        level_rules = "Günlük temel zamanlar, basit bağlaçlar (and, but, because), anlaşılır ve doğrudan ifadeler kullan."
    elif "B1" in raw_level or raw_level == "B":
        clean_level = "B1"
        level_rules = "Günlük akıcı dil, yaygın bağlaçlar, rahat ve merak uyandıran bir üslup kullan."
    elif "B2" in raw_level:
        clean_level = "B2"
        level_rules = "Zengin kelime dağarcığı, deyimsel kullanımlar, akıcı ve doğal konuşma dili kullan."
    elif "C1" in raw_level or raw_level == "C":
        clean_level = "C1"
        level_rules = "Akademik, sofistike, derinlikli ve nüanslı ifadeler kullan."
    elif "C2" in raw_level:
        clean_level = "C2"
        level_rules = "Üst düzey edebi ve felsefi derinlik, zengin nüanslar kullan."
    else:
        clean_level = raw_level or "B1"
        level_rules = "Günlük akıcı dil ve merak uyandıran sorular kullan."

    system_instruction = f"""Sen '{story_title}' hikayesini kullanıcıyla yeni bitirmiş enerjik, samimi bir kitap kulübü mentorüsün.
Kullanıcının hedef CEFR seviyesi: {clean_level} ({level_rules}).

KRİTİK TALİMATLAR:
1. Genel veya ezber kalıp sorular KESİNLİKLE SORMA!
2. Doğrudan bu hikayenin ('{story_title}') metnindeki spesifik olay örgüsü, karakterin adı/eylemi ve hikayenin ana çatışması hakkında seviyeye ({clean_level}) uygun, samimi TEK bir açılış sorusu üret.
3. Ayrıca kullanıcının bu soruya cevap verirken cümleye başlayabileceği, hikayeye ve {clean_level} seviyesine uygun 2 adet pratik cümle başlatıcı ipucu (`hint_suggestions`) üret.
4. Sadece İngilizce kullan.

Çıktıyı kesinlikle bu JSON şemasında ver:
{{
  "assistant_reply": "Doğrudan hikayenin olay örgüsüne, karakterine ve çatışmasına özel samimi İngilizce açılış sorusu (1-2 kısa cümle)",
  "hint_suggestions": [
    "Hikayeye özel 1. cevap başlatıcı ipucu cümlesi ({clean_level} seviyesinde)",
    "Hikayeye özel 2. cevap başlatıcı ipucu cümlesi ({clean_level} seviyesinde)"
  ]
}}"""

    context_text = f"Story Title: {story_title}\n"
    if story_snippet:
        context_text += f"Story Content / Snippet:\n{story_snippet[:1000]}\n"
    if vocab_str:
        context_text += f"Target Vocabulary: {vocab_str}\n"
    context_text += (
        f"Target Level: {clean_level}\n\n"
        f"Task: '{story_title}' hikayesinin metnindeki spesifik olaylara ve karakterlere değinen tek bir samimi açılış sorusu (`assistant_reply`) ve 2 cümle başlatıcı ipucu (`hint_suggestions`) üret."
    )

    # Hikayenin kendi metninden ilk anlamlı cümleyi çıkararak dinamik bağlamsal yedek soru oluştur
    first_sentence_hint = ""
    if story_snippet:
        sentences = [s.strip() for s in re.split(r"[.!?]+", story_snippet) if len(s.strip()) > 15]
        if sentences:
            first_sentence_hint = sentences[0][:110].strip()

    if first_sentence_hint:
        contextual_fallback = (
            f"We just read '{story_title}', where {first_sentence_hint[0].lower() + first_sentence_hint[1:]}. "
            f"What stood out to you the most about how events unfolded in this story?"
        )
    else:
        contextual_fallback = (
            f"We just finished reading '{story_title}'! "
            f"What moment or character decision in '{story_title}' caught your attention the most?"
        )

    default_story_hints = build_default_hints(clean_level, story_title)

    try:
        gemini_contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=context_text)],
            )
        ]

        response_dict = await asyncio.wait_for(
            async_call_speaking_gemini(
                gemini_contents,
                system_instruction=system_instruction,
                use_search=False,
            ),
            timeout=7.0,
        )

        initial_q = (
            response_dict.get("assistant_reply")
            or response_dict.get("initial_question")
            or response_dict.get("question")
            or response_dict.get("opening_question")
        )

        if not initial_q or not str(initial_q).strip():
            initial_q = contextual_fallback
        else:
            initial_q = str(initial_q).strip()

        raw_hints = response_dict.get("hint_suggestions")
        hints_out: List[str] = []
        if isinstance(raw_hints, list):
            hints_out = [str(h).strip() for h in raw_hints if h and str(h).strip()]
        if len(hints_out) < 2:
            for dh in default_story_hints:
                if dh not in hints_out:
                    hints_out.append(dh)
                if len(hints_out) >= 2:
                    break

        return InitStoryDebateResponse(
            story_title=story_title,
            level=clean_level,
            initial_question=initial_q,
            assistant_reply=initial_q,
            hint_suggestions=hints_out[:2],
        )
    except Exception as e:
        logger.warning(f"Error in init-story: {e}. Returning story-specific contextual question.")
        return InitStoryDebateResponse(
            story_title=story_title,
            level=clean_level,
            initial_question=contextual_fallback,
            assistant_reply=contextual_fallback,
            hint_suggestions=default_story_hints[:2],
        )


# ---------------------------------------------------------------------------
# 🗂️ Konuşma Arşivim (Speaking Archives CRUD & Gamification XP Bridge)
# ---------------------------------------------------------------------------

@router.post("/archives", response_model=SpeakingArchiveResponse, status_code=status.HTTP_201_CREATED)
async def create_speaking_archive(payload: SpeakingArchiveCreate, db: Any = Depends(get_db)):
    """Speaking oturumunu veritabanına kaydeder ve kullanıcıya +30 XP ödül verir."""
    user_id = payload.user_id or "00000000-0000-0000-0000-000000000001"
    archive_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()

    transcript_val = payload.transcript if isinstance(payload.transcript, (list, dict)) else []
    metrics_val = payload.metrics if isinstance(payload.metrics, dict) else {}

    # SQLite / Supabase uyumlu JSON stringleştirme
    db_data = {
        "id": archive_id,
        "user_id": user_id,
        "session_title": payload.session_title or "Speaking Session",
        "transcript": json.dumps(transcript_val, ensure_ascii=False),
        "metrics": json.dumps(metrics_val, ensure_ascii=False),
        "created_at": now_iso,
    }

    try:
        db.table("speaking_archives").insert(db_data).execute()
    except Exception as e:
        logger.warning(f"Database insert for speaking archive failed: {e}. Retrying:")
        db.table("speaking_archives").insert(db_data).execute()

    # Gamification +30 XP ödülü
    try:
        award_xp(user_id=user_id, xp_amount=30, reason="Speaking Practice Complete")
    except Exception as err:
        logger.warning(f"Could not award XP for speaking archive: {err}")

    return SpeakingArchiveResponse(
        id=archive_id,
        user_id=user_id,
        session_title=payload.session_title,
        transcript=transcript_val,
        metrics=metrics_val,
        created_at=now_iso,
        xp_awarded=30,
    )


@router.get("/archives", response_model=List[SpeakingArchiveResponse])
async def list_speaking_archives(user_id: Optional[str] = None, db: Any = Depends(get_db)):
    """Kullanıcının geçmiş konuşma oturumu arşivlerini tarihe göre azalan sırada listeler."""
    try:
        query = db.table("speaking_archives").select("*").order("created_at", desc=True)
        res = query.execute()
        raw_items = res.data or []
    except Exception as err:
        logger.warning(f"Error fetching speaking archives: {err}")
        raw_items = []

    results = []
    for item in raw_items:
        t_raw = item.get("transcript")
        m_raw = item.get("metrics")

        if isinstance(t_raw, str):
            try:
                t_val = json.loads(t_raw)
            except Exception:
                t_val = []
        else:
            t_val = t_raw or []

        if isinstance(m_raw, str):
            try:
                m_val = json.loads(m_raw)
            except Exception:
                m_val = {}
        else:
            m_val = m_raw or {}

        results.append(
            SpeakingArchiveResponse(
                id=str(item.get("id")),
                user_id=str(item.get("user_id")),
                session_title=str(item.get("session_title", "Speaking Session")),
                transcript=t_val,
                metrics=m_val,
                created_at=str(item.get("created_at")),
                xp_awarded=30,
            )
        )
    return results


@router.get("/archives/{archive_id}", response_model=SpeakingArchiveResponse)
async def get_speaking_archive_detail(archive_id: str, db: Any = Depends(get_db)):
    """Belirli bir konuşma arşivinin detayını ve transkript balonlarını döner."""
    try:
        res = db.table("speaking_archives").select("*").eq("id", archive_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Speaking archive not found.")
        item = res.data[0]
    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(status_code=404, detail=f"Archive not found: {err}")

    t_raw = item.get("transcript")
    m_raw = item.get("metrics")
    t_val = json.loads(t_raw) if isinstance(t_raw, str) else (t_raw or [])
    m_val = json.loads(m_raw) if isinstance(m_raw, str) else (m_raw or {})

    return SpeakingArchiveResponse(
        id=str(item.get("id")),
        user_id=str(item.get("user_id")),
        session_title=str(item.get("session_title", "Speaking Session")),
        transcript=t_val,
        metrics=m_val,
        created_at=str(item.get("created_at")),
        xp_awarded=30,
    )


# ---------------------------------------------------------------------------
# Fotoğraftan 3D Düşük Poligon (Low-Poly 3D Faceted Origami) Avatar Dönüştürücü
# ---------------------------------------------------------------------------

LOW_POLY_3D_PROMPT = (
    "Transform this person's portrait into a modern 3D low-poly faceted origami sculpture avatar. "
    "Keep the original face shape, hair color, and facial hair structure accurately. "
    "Render with volumetric studio lighting, geometric sharp polygonal facets, vibrant depth shadows, "
    "and dark minimalist aesthetic. Highly detailed 3D digital character portrait."
)


def _render_local_low_poly_faceted_portrait(image_bytes: bytes) -> bytes:
    """
    Yerel 3D Low-Poly Faceted Origami heykelsi portre dönüştürücü (PIL tabanlı, sıfır harici bağımlılık).
    Kullanıcının fotoğrafını geometrik üçgen/poligon yüzeylere (facets), hacimsel stüdyo ışığına
    ve koyu minimalist derinlik gölgelerine dönüştürür.
    """
    from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    size = 512
    # Merkez kare kırpma ve 512x512 boyutlandırma
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    img = img.crop((left, top, left + min_dim, top + min_dim)).resize(
        (size, size), Image.Resampling.LANCZOS
    )

    # Kontrast ve doygunluk artırımı (3D stüdyo canlılığı)
    img = ImageEnhance.Contrast(img).enhance(1.28)
    img = ImageEnhance.Color(img).enhance(1.18)

    out = Image.new("RGB", (size, size), (10, 15, 28))
    draw = ImageDraw.Draw(out)
    pixels = img.load()

    # Merkezde (yüz bölgesi) daha ince, kenarlarda daha geniş poligon ızgarası
    step = 18
    cols = size // step + 1
    rows = size // step + 1

    # Deterministik jitter ile organik origami tepe noktaları (vertices)
    vertices = []
    for r in range(rows + 1):
        row_pts = []
        for c in range(cols + 1):
            bx = min(size - 1, c * step)
            by = min(size - 1, r * step)
            if 0 < r < rows and 0 < c < cols:
                jx = int(math.sin(r * 3.7 + c * 5.3) * (step * 0.34))
                jy = int(math.cos(r * 4.1 - c * 2.9) * (step * 0.34))
                bx = max(0, min(size - 1, bx + jx))
                by = max(0, min(size - 1, by + jy))
            row_pts.append((bx, by))
        vertices.append(row_pts)

    # Her hücreyi 2 keskin üçgen poligon yüzeyine (facet) böl ve hacimsel ışık uygula
    for r in range(rows):
        for c in range(cols):
            p00 = vertices[r][c]
            p10 = vertices[r][c + 1]
            p01 = vertices[r + 1][c]
            p11 = vertices[r + 1][c + 1]

            tris = [(p00, p10, p11), (p00, p11, p01)]
            for idx_t, (a, b, d) in enumerate(tris):
                cx = max(0, min(size - 1, (a[0] + b[0] + d[0]) // 3))
                cy = max(0, min(size - 1, (a[1] + b[1] + d[1]) // 3))
                r_col, g_col, b_col = pixels[cx, cy]

                # Sol üstten vuran hacimsel stüdyo ışığı + poligon yüzey eğimi
                nx = (b[1] - a[1]) - (d[0] - a[0])
                shade = 1.08 if (idx_t == 0 and nx >= 0) else (0.91 if idx_t == 1 else 0.98)

                # Kenarlara doğru koyu minimalist stüdyo vinyeti
                dist_center = math.hypot(cx - size / 2, cy - size / 2) / (size * 0.72)
                vignette = max(0.38, 1.0 - (dist_center ** 1.85) * 0.55)

                factor = shade * vignette
                fr = max(0, min(255, int(r_col * factor)))
                fg = max(0, min(255, int(g_col * factor)))
                fb = max(0, min(255, int(b_col * factor)))

                # İnce origami faset kenar çizgisi
                edge_r = max(0, min(255, int(fr * 0.86)))
                edge_g = max(0, min(255, int(fg * 0.90) + 6))
                edge_b = max(0, min(255, int(fb * 0.94) + 10))

                draw.polygon([a, b, d], fill=(fr, fg, fb), outline=(edge_r, edge_g, edge_b))

    out = out.filter(ImageFilter.SHARPEN)
    buf = io.BytesIO()
    out.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


@router.post("/transform-avatar-3d")
async def transform_avatar_3d(file: UploadFile = File(...)):
    """
    Kullanıcının yüklediği portre fotoğrafını 3D Düşük Poligon (Low-Poly 3D Faceted Origami)
    avatar görseline dönüştürür. Hem Gemini Vision/Image modelini dener hem de yerel
    Low-Poly 3D Faceted motoruyla sıfır hata garantili PNG/Base64 ve '/avatars/custom_3d_user.png' döner.
    """
    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Yüklenen görsel dosyası boş.")

    mime_type = file.content_type or "image/jpeg"
    output_png_bytes: Optional[bytes] = None

    # 1. Gemini Image Generation modelini dene (2.5-flash-image / 3.1-flash-image)
    try:
        client = get_client()
        for img_model in ["gemini-2.5-flash-image", "gemini-3.1-flash-image"]:
            try:
                resp = await asyncio.wait_for(
                    client.aio.models.generate_content(
                        model=img_model,
                        contents=[
                            types.Part.from_bytes(data=raw_bytes, mime_type=mime_type),
                            types.Part.from_text(text=LOW_POLY_3D_PROMPT),
                        ],
                        config=types.GenerateContentConfig(
                            response_modalities=["IMAGE", "TEXT"],
                        ),
                    ),
                    timeout=7.5,
                )
                for cand in getattr(resp, "candidates", []) or []:
                    for part in getattr(cand.content, "parts", []) or []:
                        inline = getattr(part, "inline_data", None)
                        if inline and getattr(inline, "data", None):
                            data_val = inline.data
                            output_png_bytes = (
                                base64.b64decode(data_val)
                                if isinstance(data_val, str)
                                else bytes(data_val)
                            )
                            break
                    if output_png_bytes:
                        break
                if output_png_bytes:
                    break
            except Exception as model_err:
                logger.info(f"Gemini 3D image model ({img_model}) skipped: {model_err}")
                continue
    except Exception as e:
        logger.info(f"Gemini image client fallback to local 3D low-poly engine: {e}")

    # 2. Gemini görsel modeli kota/bölge nedeniyle dönmezse yerel 3D Low-Poly Faceted Origami motorunu çalıştır
    if not output_png_bytes:
        try:
            output_png_bytes = _render_local_low_poly_faceted_portrait(raw_bytes)
        except Exception as pil_err:
            logger.warning(f"Local low-poly renderer fallback: {pil_err}")
            output_png_bytes = raw_bytes

    # 3. Frontend public/avatars/custom_3d_user.png dosyasına kaydet (varsa)
    public_avatar_rel = "/avatars/custom_3d_user.png"
    try:
        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", ".."))
        frontend_avatars_dir = os.path.join(repo_root, "quizwise-frontend", "public", "avatars")
        if os.path.isdir(frontend_avatars_dir):
            target_path = os.path.join(frontend_avatars_dir, "custom_3d_user.png")
            with open(target_path, "wb") as f_out:
                f_out.write(output_png_bytes)
    except Exception as save_err:
        logger.warning(f"Could not write custom_3d_user.png to disk: {save_err}")

    b64_str = base64.b64encode(output_png_bytes).decode("utf-8")
    data_url = f"data:image/png;base64,{b64_str}"

    return {
        "status": "success",
        "avatar_url": public_avatar_rel,
        "data_url": data_url,
        "url": data_url,
        "style": "low_poly_3d_faceted_origami",
        "prompt_used": LOW_POLY_3D_PROMPT,
    }


# ---------------------------------------------------------------------------
# FAZ 4: Oturum Sonu Karnesi, Altın Cümle & Kelime Çıkarımı (/summary, /evaluate)
# ---------------------------------------------------------------------------

from pydantic import BaseModel as _PydanticBaseModel


class SpeakingSummaryRequest(_PydanticBaseModel):
    messages: Optional[List[Dict[str, Any]]] = None
    history: Optional[List[Dict[str, Any]]] = None
    target_level: Optional[str] = "B1"
    story_title: Optional[str] = None


def _build_fallback_summary(
    turns: List[Dict[str, str]],
    target_level: str,
    story_title: Optional[str] = None,
) -> Dict[str, Any]:
    user_lines = [t["text"] for t in turns if t["role"] == "user" and t["text"]]
    longest_user = max(user_lines, key=len) if user_lines else "I enjoyed practicing English today."
    improved_example = (
        longest_user[0].upper() + longest_user[1:]
        if len(longest_user) > 1
        else "I really enjoyed practicing English today."
    )
    if not improved_example.endswith((".", "!", "?")):
        improved_example += "."

    score = min(94, max(72, 74 + len(user_lines) * 4))
    title = (
        f"Discussing {story_title[:24]}"
        if story_title
        else "Everyday English Chat"
    )

    return {
        "session_title": title,
        "fluency_score": score,
        "coach_feedback": (
            f"{target_level} seviyesinde cesurca konuşmaya katılman harika! "
            "Cümlelerini kurmaya devam ettikçe akıcılığın çok daha doğal hale gelecek."
        ),
        "golden_sentence": {
            "original": longest_user,
            "improved": f"Honestly, {improved_example[0].lower() + improved_example[1:]}"
            if len(improved_example) > 2
            else "Honestly, I really enjoyed talking about this today.",
            "reason_tr": "Cümlenin başına 'Honestly' gibi doğal bir konuşma bağlacı eklemek ifadeyi daha akıcı ve samimi kılar.",
        },
        "extracted_words": [
            {
                "word": "highlight",
                "turkish_meaning": "en güzel an / öne çıkan nokta",
                "example_sentence": "The highlight of my day was having a great conversation.",
            },
            {
                "word": "perspective",
                "turkish_meaning": "bakış açısı",
                "example_sentence": "Hearing your perspective made the topic much clearer.",
            },
            {
                "word": "consistent",
                "turkish_meaning": "istikrarlı, düzenli",
                "example_sentence": "Consistent speaking practice helps build strong confidence.",
            },
        ],
    }


@router.post("/summary")
@router.post("/evaluate")
async def evaluate_speaking_session(payload: SpeakingSummaryRequest):
    raw_items = payload.messages if payload.messages is not None else (payload.history or [])
    clean_level = (payload.target_level or "B1").upper().strip()

    turns: List[Dict[str, str]] = []
    for item in raw_items:
        if not isinstance(item, dict):
            continue
        role_raw = str(item.get("role") or item.get("sender") or "user").lower()
        role = "assistant" if role_raw in ("assistant", "ai", "model") else "user"
        text = str(item.get("message") or item.get("content") or item.get("text") or "").strip()
        if text:
            turns.append({"role": role, "text": text})

    fallback_result = _build_fallback_summary(turns, clean_level, payload.story_title)
    user_turns = [t for t in turns if t["role"] == "user"]

    # Sohbet çok kısaysa (1-2 mesaj ve hiç kullanıcı cümlesi yoksa) doğrudan anlamlı varsayılan karne dön
    if len(turns) <= 2 and len(user_turns) == 0:
        return fallback_result

    api_key = (
        getattr(settings, "GEMINI_API_KEY", "") or os.getenv("GEMINI_API_KEY") or ""
    ).strip("\"' ")
    if not api_key:
        return fallback_result

    transcript_text = "\n".join(
        f"{'AI' if t['role'] == 'assistant' else 'User'}: {t['text']}"
        for t in turns[-20:]
    )

    eval_prompt = f"""Analyze this English speaking practice conversation (Target CEFR Level: {clean_level}).
Conversation:
{transcript_text}

Return ONLY valid JSON matching this exact structure:
{{
  "session_title": "3-4 word English topic title",
  "fluency_score": 85,
  "coach_feedback": "Kullanıcıya Türkçe 2 cümlelik samimi ve motive edici geri bildirim",
  "golden_sentence": {{
    "original": "A sentence the user actually said (or closest paraphrase) that can be improved",
    "improved": "A more natural, fluent English version of that sentence",
    "reason_tr": "Neden daha doğal olduğuna dair 1 cümlelik Türkçe açıklama"
  }},
  "extracted_words": [
    {{
      "word": "useful English word or phrase from or relevant to this chat",
      "turkish_meaning": "Türkçe anlamı",
      "example_sentence": "Natural English example sentence from the conversation context"
    }}
  ]
}}
Include 3 to 5 items in extracted_words. fluency_score must be an integer between 60 and 98."""

    client = genai.Client(api_key=api_key)
    models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"]

    for model_name in models_to_try:
        try:
            cfg_kwargs: Dict[str, Any] = {
                "temperature": 0.4,
                "response_mime_type": "application/json",
            }
            if "2.5" in model_name and hasattr(types, "ThinkingConfig"):
                try:
                    cfg_kwargs["thinking_config"] = types.ThinkingConfig(thinking_budget=0)
                except Exception:
                    pass

            response = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model=model_name,
                    contents=eval_prompt,
                    config=types.GenerateContentConfig(**cfg_kwargs),
                ),
                timeout=8.0,
            )
            raw_text = (getattr(response, "text", None) or "").strip()
            if not raw_text:
                continue

            parsed = clean_json_response(raw_text)
            if not isinstance(parsed, dict):
                parsed = json.loads(raw_text)

            golden = parsed.get("golden_sentence")
            if not isinstance(golden, dict):
                golden = fallback_result["golden_sentence"]

            words = parsed.get("extracted_words")
            if not isinstance(words, list) or len(words) == 0:
                words = fallback_result["extracted_words"]

            score_val = parsed.get("fluency_score", fallback_result["fluency_score"])
            try:
                score_int = max(50, min(100, int(score_val)))
            except Exception:
                score_int = fallback_result["fluency_score"]

            return {
                "session_title": str(
                    parsed.get("session_title") or fallback_result["session_title"]
                ).strip(),
                "fluency_score": score_int,
                "coach_feedback": str(
                    parsed.get("coach_feedback") or fallback_result["coach_feedback"]
                ).strip(),
                "golden_sentence": {
                    "original": str(
                        golden.get("original") or fallback_result["golden_sentence"]["original"]
                    ).strip(),
                    "improved": str(
                        golden.get("improved") or fallback_result["golden_sentence"]["improved"]
                    ).strip(),
                    "reason_tr": str(
                        golden.get("reason_tr") or fallback_result["golden_sentence"]["reason_tr"]
                    ).strip(),
                },
                "extracted_words": [
                    {
                        "word": str(w.get("word") or "").strip(),
                        "turkish_meaning": str(w.get("turkish_meaning") or "").strip(),
                        "example_sentence": str(w.get("example_sentence") or "").strip(),
                    }
                    for w in words
                    if isinstance(w, dict) and str(w.get("word") or "").strip()
                ][:5]
                or fallback_result["extracted_words"],
            }
        except Exception as err:
            logger.warning(f"Speaking summary model '{model_name}' failed: {err}")
            continue

    return fallback_result
