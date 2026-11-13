import os
import io
import base64
import json
import logging
import asyncio
import math
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any, Union
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Depends, status
from google.genai import types
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
    "gemini-flash-latest",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.8-flash",
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


async def _call_single_model(
    client: Any,
    model_name: str,
    contents_payload: Any,
    sys_inst: str,
) -> dict:
    response = await client.aio.models.generate_content(
        model=model_name,
        contents=contents_payload,
        config=types.GenerateContentConfig(
            temperature=0.65,
            system_instruction=sys_inst,
            response_mime_type="application/json",
        ),
    )
    return clean_json_response(response.text)


async def async_call_speaking_gemini(
    contents_payload: Any, system_instruction: Optional[str] = None
) -> dict:
    """
    Direct asynchronous, non-blocking multi-turn call configured specifically for lowest latency:
    Races the fastest live Gemini Flash models concurrently so whichever responds first wins immediately.
    """
    client = get_client()
    sys_inst = system_instruction or INFINITE_ADAPTIVE_SYSTEM_INSTRUCTION

    # Race top responsive Gemini models concurrently for lowest latency
    race_models = ["gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-3.5-flash"]
    tasks = [
        asyncio.create_task(_call_single_model(client, m, contents_payload, sys_inst))
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
                logger.warning(f"Concurrent speaking model attempt failed: {err}")

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
# Fallback Response Generator
# ---------------------------------------------------------------------------

def generate_fallback_response(
    scenario_id: str,
    user_text: str,
    story_context: Optional[Union[Dict[str, Any], str]] = None,
    conversation_mode: str = "casual",
    turn_count: int = 0,
    level: str = "A1",
    persona: str = "sparky",
) -> Dict[str, Any]:
    """Generates an intelligent, adaptive, open-ended response when offline or on LLM error."""
    scenario = SCENARIOS.get(scenario_id, SCENARIOS.get("project_control"))
    target_vocab = list(scenario.target_vocabulary) if scenario else ["practice", "learn", "fun"]

    sample_highlights = [v for v in target_vocab if v.lower() in user_text.lower()]
    if not sample_highlights:
        sample_highlights = target_vocab[:2]

    persona_key = (persona or "sparky").lower().strip()
    is_sparky = "alex" not in persona_key

    mode = (conversation_mode or "casual").lower()
    lower_text = user_text.lower()

    # Topic-aware offline fallback (never uses generic weekend cliches)
    if any(k in lower_text for k in ["future", "good or bad", "ai", "technology", "robot", "world", "years"]):
        reply = (
            "Personally, I feel optimistic that the future will bring incredible breakthroughs in medicine, clean energy, and education, as long as we guide technology responsibly. "
            "What part of the future excites you the most, or is there a specific change that worries you?"
        )
        alt = "And what are your thoughts on the future—do you think it will turn out for the better or for the worse?"
        grammar = "And what do you think about the future—will it be good or bad?"
    elif any(k in lower_text for k in ["weather", "rain", "sunny", "cold", "hot"]):
        reply = (
            "The weather really sets the tone for the entire day—I always find a crisp, clear morning gives me extra energy, whereas rainy days make me want to slow down with a warm cup of coffee. "
            "How is the weather affecting your plans and energy today?"
        )
        alt = "How is the weather holding up on your end today, and has it impacted your daily routine?"
        grammar = None
    elif mode == "casual":
        reply = (
            f"I really appreciate you sharing that perspective! Thinking about what you just mentioned, I believe staying curious and adaptable makes everyday experiences much more rewarding. "
            f"What made you start thinking about this topic today, and how do you see it evolving?"
        )
        alt = "I've been reflecting on this recently, and I'm curious to hear your perspective on how it might unfold."
        grammar = None
    elif mode == "problem_solving":
        problem_options = [
            "That's a solid immediate step to contain the issue. However, what if our primary subcontractor still struggles with delivery—what backup plan can we activate?",
            "Good call—acting fast will definitely buy us some breathing room. How should we communicate this update to the client so they feel confident in our mitigation plan?",
            "I like how practical that approach is. Looking one step ahead, how can we prevent this same bottleneck from hitting our next milestone?",
        ]
        reply = problem_options[turn_count % len(problem_options)]
        alt = "To mitigate operational downtime immediately, our primary protocol is rerouting critical shipments via alternative expedited lanes."
        grammar = "Cümleniz net ve çözüm odaklı. (Kriz Çözme & Doğal Diyalog)"
    elif mode == "story_debate" or story_context:
        story_options = [
            "That is a thought-provoking perspective on the story. Do you think the protagonist had any other realistic choice under that kind of pressure?",
            "I really like how you looked at the human side of that dilemma. If you were in their shoes on that exact day, what would you have done differently?",
            "That raises an interesting question about trust and leadership. How do you think the rest of the team would react if the truth came out later?",
        ]
        reply = story_options[turn_count % len(story_options)]
        alt = "From a thematic perspective, the protagonist's dilemma underscores how external pressure often tests personal integrity."
        grammar = "Argümanınız oldukça doğal ve etkileyici."
    elif "claim" in scenario_id or "fidic" in scenario_id:
        claim_options = [
            "That makes a lot of sense from a practical standpoint. Under Clause 8.4, what contemporaneous site records do you think will help us most if the contractor pushes back?",
            "Good point—keeping communication open with the contractor is half the battle. How do you think we can resolve the concurrent delay discussion without escalating into a formal dispute?",
            "I agree with your assessment. If the weather or site access caused part of that delay, how should we factor that fairly into our Extension of Time review?",
        ]
        reply = claim_options[turn_count % len(claim_options)]
        alt = "To protect the project timeline while staying fair, we should review the contemporaneous site diaries alongside the Clause 8.4 notice requirements."
        grammar = "Cümleniz net ve profesyonel. Sohbeti istediğiniz yönde sürdürebilirsiniz."
    elif "finance" in scenario_id:
        finance_options = [
            "That's a very balanced way to look at our numbers. How do you think this adjustment will play out for our cash flow comfort over the next quarter?",
            "Makes total sense—protecting liquidity early saves a lot of headaches later. Which operational area do you think has the most flexibility right now?",
            "I appreciate that perspective. If market conditions shift next month, what would be your go-to lever to keep our EBITDA margin healthy?",
        ]
        reply = finance_options[turn_count % len(finance_options)]
        alt = "Our cash flow forecasting shows that pacing capital expenditures carefully will keep our liquidity ratio comfortable."
        grammar = "Cümleniz akıcı ve anlaşılır."
    elif "ielts" in scenario_id or "academic" in scenario_id:
        ielts_options = [
            "That's a really insightful point! Building on your own experience, how do you see this changing in everyday life over the next few years?",
            "I love that example—it makes the idea very relatable. On the flip side, why do you think some people still prefer the traditional way of doing things?",
            "You expressed that very naturally! If you had to sum up the biggest benefit for younger generations, what would you say it is?",
        ]
        reply = ielts_options[turn_count % len(ielts_options)]
        alt = "While technological tools certainly speed up daily tasks, human connection remains essential for deeper learning."
        grammar = "Cümleniz doğal ve akıcı."
    else:
        # project_control & general professional
        pc_options = [
            "I see where you're coming from—reallocating the crew could really help us catch up on the critical path. How is the site team feeling about shifting priorities this week?",
            "That sounds like a very practical mitigation plan. By the way, did any external factors on-site—like weather or material deliveries—affect the crew's progress today?",
            "Spot on! Keeping a close eye on schedule variance early makes a huge difference. What is the next milestone you're personally keeping an eye on?",
        ]
        reply = pc_options[turn_count % len(pc_options)]
        alt = "To recover our schedule variance smoothly, we're coordinating closely with the site teams and fast-tracking key deliveries."
        grammar = "Cümleniz net ve doğal. Sohbete dilediğiniz açıdan devam edebilirsiniz."

    fluency_val = 87 if mode != "casual" else 92
    jargon_val = 88 if mode != "casual" else 92
    grammar_corr = None if grammar and "doğal" in grammar.lower() else grammar

    # Takip sorusunu reply içindeki son sorudan çıkar
    extracted_q = reply
    if "?" in reply:
        parts = [p.strip() for p in reply.split("?") if p.strip()]
        if parts:
            extracted_q = parts[-1] + "?"

    fluency_hint_default = (
        "Actually, I had so much fun learning new things today!"
        if is_sparky
        else "I believe taking a calm and steady approach works best in this situation."
    )

    return {
        "assistant_reply": reply,
        "recast_note": None,
        "fluency_hint": fluency_hint_default,
        "session_vocabulary_used": sample_highlights,
        "target_words_spotted": sample_highlights,
        "polished_alternative": alt,
        "level_label": f"{level.upper()} Seviye",
        "suggested_new_words": [
            {"word": "unwind", "meaning": "Günün yorgunluğunu atmak, rahatlamak"},
            {"word": "routine", "meaning": "Alışılagelmiş düzen, günlük rutin"},
        ],
        "reply_message": reply,
        "follow_up_question": extracted_q,
        "metrics": {
            "fluency": fluency_val,
            "vocabulary": jargon_val,
            "grammar": 95 if not grammar_corr else 80,
        },
        "feedback": {
            "grammar_correction": grammar_corr,
            "better_alternative": alt,
            "used_vocabulary": sample_highlights,
            "fluency_score": fluency_val,
        },
        "grammar_feedback": grammar_corr,
        "better_alternative": alt,
        "vocabulary_highlight": sample_highlights,
        "jargon_score": jargon_val,
        "fluency_score": fluency_val,
    }


# ---------------------------------------------------------------------------
# Router Endpoints
# ---------------------------------------------------------------------------

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
        else payload.history
    )

    if len(raw_history) == 0:
        check_and_consume_quota(request, "speaking", increment=True)

    scenario = SCENARIOS.get(payload.scenario_id, SCENARIOS.get("project_control"))
    user_text = payload.user_transcript.strip()

    if not user_text:
        raise HTTPException(status_code=400, detail="User transcript cannot be empty.")

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
            "- Kullanıcıyı asla aceleye getirme veya tedirgin etme. Kahve sohbeti rahatlığında ('I see what you mean...', 'That is a very thoughtful point...', 'Take your time, you are doing great.') konuş.\n"
            "- Samimi, yapıcı ve güven verici bir tonda kal."
        )

    # Dinamik CEFR Seviye Yönetimi (N+1 Kuralı)
    raw_level = (payload.target_level or payload.level or "A1").upper().strip()
    if "A1" in raw_level:
        clean_level = "A1"
        next_level = "A2"
        level_rules = (
            "CEFR A1 (Başlangıç / Beginner): Basit zamanlar (present simple, simple past), en temel kelimeler, kısa ve kristal netliğinde cümleler kur. "
            "ASLA akademik C1 deyimleri, ağır iş jargonu ve karmaşık yan cümleler kullanma. Sadece tek bir yeni kelimeyle zenginleştir (N+1 kuralı)."
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
        level_rules = "CEFR A1: Basit zamanlar, temel kelimeler, kısa ve net cümleler."

    default_level_label = f"{clean_level} Seviye"

    # Hikaye Bağlamı (Story Context)
    story_instruction = ""
    if payload.story_context:
        if isinstance(payload.story_context, dict):
            st_title = payload.story_context.get("title", "")
            st_level = payload.story_context.get("level", "")
            st_words = payload.story_context.get("target_words", [])
            words_str = ", ".join(st_words) if isinstance(st_words, list) else str(st_words)
            story_instruction = (
                f"\nAKTİF HİKAYE BAĞLAMI:\n"
                f"- Başlık: '{st_title}' (Seviye: {st_level})\n"
                f"- Hikayedeki Hedef Kelimeler: {words_str}\n"
                f"- Diyalogda bu hikayenin temalarını ve kelimelerini doğal bir şekilde pekiştir.\n"
            )
        else:
            story_instruction = f"\nAKTİF HİKAYE / REFERANS BAĞLAMI:\n{str(payload.story_context)[:400]}\n"

    # Konuşma geçmişindeki son 6 mesajı hem okunabilir metin hem de Gemini 'contents' akışı olarak hazırla
    recent_turns = raw_history[-6:]
    history_lines = []
    gemini_contents: List[types.Content] = []

    for turn in recent_turns:
        role_raw = str(turn.get("role", "user")).lower()
        msg_raw = str(turn.get("content") or turn.get("message") or "").strip()
        if not msg_raw:
            continue
        clean_msg = msg_raw.replace("AI Mentor:", "").replace(f"{persona_name}:", "").replace("User:", "").strip()
        prefix = "User" if role_raw == "user" else persona_name
        history_lines.append(f"{prefix}: {clean_msg}")

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

    dynamic_sys_instruction = f"""{persona_tone_rules}

HEDEF CEFR SEVİYESİ: {clean_level} (N+1 Seviyesi: {next_level})
SEVİYE KURALLARI:
{level_rules}
{story_instruction}
PEDAGOJİK KURAL (SANDVİÇ VE RECASTING / ÖRTÜK DÜZELTME PRENSİBİ):
1. ASLA ROBOTİK VEYA DİDAKTİK DÜZELTME YAPMA:
   - "Gramerin yanlış", "Hata yaptın", "Böyle demeliydin" gibi direkt uyarı ve yargılayıcı kalıplar KESİNLİKLE YASAKTIR.
2. ÖRTÜK DÜZELTME (RECASTING):
   - Kullanıcının hatalarını sohbetin akışı içinde DOĞRU HALİYLE YANKILA (Recasting).
   - Örn: Kullanıcı "Yesterday I go park" derse -> "Oh, you WENT to the park yesterday? How fun! Who did you go with?"
   - Örn: Kullanıcı "She don't like movies" derse -> "Ah, she DOESN'T like movies? What does she enjoy doing instead?"
3. RECASTING NOTU (`recast_note`):
   - Kullanıcının hatasını sohbette nasıl doğal yankıladığını Türkçe olarak 1 kısa cümleyle açıkla (Örn: "Geçmiş zaman kuralı sohbet içinde nazikçe 'went' olarak yankılandı.").
   - Eğer kullanıcının cümlesinde hiçbir gramer hatası yoksa `recast_note` değerini null yap.
4. KONUŞMA FISILTISI (`fluency_hint`):
   - Kullanıcı soruna cevap verirken takılırsa veya duraksarsa hemen söyleyebileceği, {clean_level} seviyesinde 1 cümlelik hazır konuşma kalıbı yaz (Örn: "Actually, I went there with my cousin to play tennis.").
5. SÜREKLİLİK VE UZUNLUK (2-3 CÜMLE SINIRI):
   - `assistant_reply` KESİNLİKLE 2-3 cümleyi GEÇMEMELİDİR. Asla monolog üretme.
   - İlk 1-2 cümle kullanıcının söylediğine samimi, insani bir tepki verir (ve hatayı recasting ile yankılar).
   - Yanıtın sonunda diyaloğu canlı tutacak, merak uyandıran TEK bir açık uçlu soru sor.
6. HEDEF KELİMELER:
   - Oturumda kullanılan hedef kelimeleri `session_vocabulary_used` ve `target_words_spotted` listelerine ekle.
   - `polished_alternative` içine kullanıcının cümlesinin bir tık üst ({next_level} seviyesi) doğal halini yaz.

Çıktıyı KESİNLİKLE bu JSON şemasında ver:
{{
  "assistant_reply": "İngilizce seslendirilecek doğal yanıt (kısa, canlı, 2-3 cümle ve açık uçlu soruyla biten, {clean_level} seviyesinde)",
  "recast_note": "Kullanıcının gramer hatasının sohbette doğal yankılanma şekli veya hata yoksa null",
  "fluency_hint": "Kullanıcı takılırsa söyleyebileceği 1 cümlelik konuşma fısıltısı ({clean_level} seviyesinde)",
  "session_vocabulary_used": ["kelime1", "kelime2"],
  "target_words_spotted": ["kelime1"],
  "polished_alternative": "Cümlenin kullanıcının seviyesinin bir tık üstü ({next_level} seviyesi) doğal alternatifi",
  "level_label": "{default_level_label}",
  "suggested_new_words": [{{"word": "terim", "meaning": "anlamı"}}]
}}"""

    user_turn_prompt = f"""Son Konuşma Akışı (Son {len(history_lines)} mesaj):
{formatted_history}

Kullanıcının Son Cümlesi:
"{user_text}"

GÖREV:
1. {persona_name} kimliğini koruyarak {clean_level} seviyesine KESİNLİKLE sadık kal ({level_rules}).
2. Eğer kullanıcının cümlesinde gramer/zaman/edat hatası varsa, sohbetin akışında DOĞRU HALİYLE YANKILA (Recasting).
3. `recast_note` alanına bu düzeltmeyi Türkçe 1 kısa cümleyle açıkla, hata yoksa null ver.
4. `fluency_hint` alanına kullanıcının soruna takılmadan verebileceği {clean_level} seviyesinde 1 cümlelik bir fısıltı yaz.
5. `assistant_reply` kesinlikle 2-3 cümle olmalı ve samimi tek bir açık uçlu soruyla bitmelidir.
6. `polished_alternative` alanına cümlenin {next_level} seviyesindeki doğal alternatifini ekle.

Return ONLY valid JSON matching the schema."""

    gemini_contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=user_turn_prompt)],
        )
    )

    try:
        response_dict = await asyncio.wait_for(
            async_call_speaking_gemini(
                gemini_contents,
                system_instruction=dynamic_sys_instruction,
            ),
            timeout=10.0,
        )

        reply_message = (
            response_dict.get("assistant_reply")
            or response_dict.get("reply_message")
            or ("Oh, that sounds so much fun! What did you enjoy the most about it?" if is_sparky else "That's a very thoughtful perspective. How are you planning to take the next step?")
        )
        assistant_reply = reply_message

        # Recasting Notu
        recast_raw = response_dict.get("recast_note")
        if recast_raw and str(recast_raw).strip().lower() in ["null", "none", "", "none.", "yok", "hata yok"]:
            recast_note = None
        else:
            recast_note = str(recast_raw).strip() if recast_raw else None

        # Konuşma Fısıltısı (Fluency Hint)
        fluency_hint = (
            response_dict.get("fluency_hint")
            or ("Actually, I had so much fun learning new things today!" if is_sparky else "I believe taking a calm, steady approach works best in this situation.")
        )

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

        polished_alternative = (
            response_dict.get("polished_alternative")
            or response_dict.get("better_alternative")
            or f"Looking at this from a broader angle, I believe steady progress brings the best outcome."
        )

        level_label = response_dict.get("level_label") or default_level_label

        suggested_new_words = response_dict.get("suggested_new_words") or []
        if not isinstance(suggested_new_words, list):
            suggested_new_words = []

        # Dinamik takip sorusu
        follow_up_question = response_dict.get("follow_up_question")
        if not follow_up_question:
            if "?" in assistant_reply:
                parts = [p.strip() for p in assistant_reply.split("?") if p.strip()]
                if parts:
                    follow_up_question = parts[-1] + "?"
            else:
                follow_up_question = "What are your thoughts on that?"

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
            recast_note=recast_note,
            fluency_hint=fluency_hint,
            session_vocabulary_used=session_vocabulary_used,
            level_label=level_label,
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

    except asyncio.TimeoutError:
        logger.warning("Gemini speaking call exceeded timeout. Returning adaptive fallback response.")
        fallback_data = generate_fallback_response(
            scenario_id=payload.scenario_id or "casual_chat",
            user_text=user_text,
            story_context=payload.story_context,
            conversation_mode=payload.conversation_mode or "casual",
            turn_count=len(payload.history),
            level=clean_level,
            persona=persona_key,
        )
        return SpeakingRespondResponse(**fallback_data)
    except Exception as e:
        logger.warning(f"Speaking endpoint fallback triggered: {e}")
        fallback_data = generate_fallback_response(
            scenario_id=payload.scenario_id or "casual_chat",
            user_text=user_text,
            story_context=payload.story_context,
            conversation_mode=payload.conversation_mode or "casual",
            turn_count=len(payload.history),
            level=clean_level,
            persona=persona_key,
        )
        return SpeakingRespondResponse(**fallback_data)


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
            question=f"If you were placed in the protagonist's shoes during this conflict, what would you have done differently?",
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


@router.post("/init-story-debate", response_model=InitStoryDebateResponse)
async def init_story_debate(payload: InitStoryDebateRequest):
    """
    Okuma odasından gelen hikayeye özel, ana olay örgüsünü veya kilit karakter kararını
    hedef alan seviyeye uygun ({level}) dinamik ilk açılış sorusunu üretir.
    """
    story_title = (payload.story_title or "Story Discussion").strip()
    story_snippet = (payload.story_snippet or "").strip()
    raw_level = (payload.level or "B1").upper().strip()

    if "A1" in raw_level:
        clean_level = "A1"
        level_rules = "Basit zamanlar (present simple, past simple), temel kelimeler, kısa ve net cümleler kur. Ağır deyim ve idiom kullanma."
    elif "A2" in raw_level or raw_level == "A":
        clean_level = "A2"
        level_rules = "Günlük temel zamanlar, basit bağlaçlar (and, but, because), anlaşılır ve doğrudan ifadeler. Ağır deyimlerden kaçın."
    elif "B1" in raw_level or raw_level == "B":
        clean_level = "B1"
        level_rules = "Günlük akıcı dil, yaygın bağlaçlar, rahat ve merak uyandıran bir üslup."
    elif "B2" in raw_level:
        clean_level = "B2"
        level_rules = "Zengin kelime dağarcığı, deyimsel kullanımlar, akıcı ve doğal konuşma dili."
    elif "C1" in raw_level or raw_level == "C":
        clean_level = "C1"
        level_rules = "Akademik, sofistike, derinlikli ve nüanslı ifadeler."
    elif "C2" in raw_level:
        clean_level = "C2"
        level_rules = "Üst düzey edebi ve felsefi derinlik, zengin nüanslar."
    else:
        clean_level = raw_level or "B1"
        level_rules = "Günlük akıcı dil ve merak uyandıran sorular."

    system_instruction = f"""Sen bu hikayeyi kullanıcıyla yeni bitirmiş enerjik, samimi bir kitap kulübü mentorüsün.
Kullanıcının hedef CEFR seviyesi: {clean_level} ({level_rules}).

KRİTİK TALİMATLAR:
1. Genel 'kitap okumayı sever misin', 'hikaye nasıldı' gibi klişe sorular KESİNLİKLE SORMA!
2. Doğrudan hikayenin can alıcı noktası, bir karakterin kararı, ahlaki bir ikilem veya olay örgüsünün sürprizi hakkında seviyeye ({clean_level}) uygun, merak uyandırıcı TEK bir açılış sorusu sor.
3. Cümleye canlı bir karakter/mentor nidasıyla başla: 'Oh, wow!', 'That ending was wild!...', 'I really did not see that coming!...', 'What an intense dilemma!...', 'Whoa, that was unexpected!...' vb.
4. Yanıtın kısa, canlı, konuşma dilinde (maksimum 1-2 cümle) olsun ve mutlaka doğrudan soru işareti (?) ile bitsin.
5. Sadece ve sadece İngilizce konuş.

Çıktıyı kesinlikle bu JSON şemasında ver:
{{
  "initial_question": "Canlı nida ile başlayan, hikayenin kilit olayını/kararını hedef alan İngilizce soru"
}}"""

    context_text = f"Story Title: {story_title}\n"
    if story_snippet:
        context_text += f"Story Context / Snippet:\n{story_snippet[:1500]}\n"
    context_text += f"Target Level: {clean_level}\n\nTask: Bu hikayenin kilit dönüm noktasına veya karakterin zorlu kararına odaklanan, canlı nida ile başlayan tek bir açılış sorusu sor."

    fallback_question = f"Oh, wow! That ending in '{story_title}' really caught me off guard! Looking at that critical moment, do you think the protagonist made the right decision, or what would you have done?"

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
            ),
            timeout=8.0,
        )

        initial_q = (
            response_dict.get("initial_question")
            or response_dict.get("question")
            or response_dict.get("opening_question")
            or response_dict.get("assistant_reply")
        )

        if not initial_q or not str(initial_q).strip():
            initial_q = fallback_question
        else:
            initial_q = str(initial_q).strip()

        return InitStoryDebateResponse(
            story_title=story_title,
            level=clean_level,
            initial_question=initial_q,
        )
    except Exception as e:
        logger.warning(f"Error in init-story-debate: {e}. Returning contextual fallback question.")
        return InitStoryDebateResponse(
            story_title=story_title,
            level=clean_level,
            initial_question=fallback_question,
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
