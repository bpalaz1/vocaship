import os
import json
import logging
import asyncio
from typing import List, Dict, Optional, Any
from fastapi import APIRouter, HTTPException
from google.genai import types
from app.schemas.speaking import (
    SpeakingRespondRequest,
    SpeakingRespondResponse,
    ScenarioMetadata,
)
from app.services.ai_service import get_client, clean_json_response

logger = logging.getLogger(__name__)

router = APIRouter()

PRIMARY_SPEAKING_MODEL = "gemini-2.5-flash"
FAST_FALLBACK_MODELS = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-flash-lite-latest"]

async def async_call_speaking_gemini(prompt: str) -> dict:
    """
    Direct asynchronous, non-blocking call configured specifically for lowest latency:
    - Target: gemini-2.5-flash
    - Configuration: temperature 0.3, response_mime_type 'application/json'
    - Zero synchronous sleep or thread blocking
    - Fast model fallback if 2.5-flash is temporarily unavailable
    """
    client = get_client()
    models_to_attempt = [PRIMARY_SPEAKING_MODEL] + FAST_FALLBACK_MODELS

    last_err = None
    for model_name in models_to_attempt:
        try:
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3,
                    response_mime_type="application/json",
                ),
            )
            return clean_json_response(response.text)
        except Exception as err:
            last_err = err
            logger.warning(f"Speaking model {model_name} attempt failed: {err}. Trying next fast model.")
            continue

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
    story_context: Optional[str] = None,
    conversation_mode: str = "interview",
) -> Dict[str, Any]:
    """Generates an intelligent simulated response when offline or on LLM error."""
    scenario = SCENARIOS.get(scenario_id, SCENARIOS["project_control"])
    target_vocab = list(scenario.target_vocabulary)

    sample_highlights = [v for v in target_vocab if v.lower() in user_text.lower()]
    if not sample_highlights:
        sample_highlights = target_vocab[:2]

    mode = (conversation_mode or "interview").lower()

    if mode == "casual":
        reply = "That sounds really interesting! I love finding time for that too. What do you enjoy most about it?"
        alt = "I've been really into that lately because it helps me unwind after a hectic day."
        grammar = "Cümleniz akıcı ve samimi. (Sohbet Modu)"
    elif mode == "problem_solving":
        reply = "That's a solid immediate step to contain the issue. However, what if our primary subcontractor refuses to expedite? How do we mitigate that bottleneck?"
        alt = "To mitigate operational downtime immediately, our primary protocol is rerouting critical shipments via alternative expedited lanes."
        grammar = "Cümleniz net ve aksiyon odaklı. (Kriz Çözme Modu)"
    elif mode == "story_debate" or story_context:
        reply = "That is a thought-provoking perspective on the narrative. Do you believe the protagonist's actions were an inevitable outcome or a flaw in judgment?"
        alt = "From a thematic perspective, the protagonist's dilemma underscores how external systemic pressure often compromises personal integrity."
        grammar = "Argümanınız iyi yapılandırılmış. (Münazara Modu)"
    elif "claim" in scenario_id or "fidic" in scenario_id:
        reply = "That is a sound contractual argument. Under Clause 8.4, what contemporaneous records will we present to repudiate concurrent delay arguments by the contractor?"
        alt = "To shield the employer from consequential liabilities, our defense invokes the notice requirement stipulations in tandem with the liquidated damages schedule."
        grammar = "Your sentence is clear and grammatically cohesive. (Offline Mode Analysis)"
    elif "finance" in scenario_id:
        reply = "The balance sheet liquidity ratio requires rigorous oversight. How will this capital reallocation impact our debt covenant thresholds and EBITDA margin?"
        alt = "Our cash flow forecasting indicates that capital expenditures can be amortized without compromising our quick liquidity ratio or loan covenants."
        grammar = "Your sentence is clear and grammatically cohesive. (Offline Mode Analysis)"
    elif "ielts" in scenario_id or "academic" in scenario_id:
        reply = "That's an insightful perspective. On the flip side, some researchers argue that digital friction is necessary for retention. How do you evaluate that viewpoint?"
        alt = "While technological automation inevitably streamlines routine acquisition, deliberate friction remains indispensable for nuanced epistemic retention."
        grammar = "Your sentence is clear and grammatically cohesive. (Offline Mode Analysis)"
    else:
        # project_control
        reply = "Understood. Reallocating subcontractor teams could compress the critical path by several weeks. However, will this expedite our delivery without incurring substantial acceleration claims?"
        alt = "To mitigate the current schedule variance, our strategy focuses on fast-tracking procurement milestones while holding subcontractors accountable under baseline SLA provisions."
        grammar = "Your sentence is clear and grammatically cohesive. (Offline Mode Analysis)"

    return {
        "assistant_reply": reply,
        "grammar_feedback": grammar,
        "better_alternative": alt,
        "vocabulary_highlight": sample_highlights,
        "jargon_score": 88 if mode != "casual" else 92,
        "fluency_score": 85 if mode != "casual" else 90,
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
async def respond_to_speech(payload: SpeakingRespondRequest):
    """
    Evaluates user speech transcript in the chosen scenario and returns:
    1. In-character assistant continuation + follow-up question
    2. Grammar feedback
    3. Better alternative tailored to conversation mode ('casual' | 'problem_solving' | 'interview' | 'story_debate')
    4. Vocabulary highlights
    5. Jargon score (0-100)
    6. Fluency score (0-100)
    """
    scenario = SCENARIOS.get(payload.scenario_id, SCENARIOS["project_control"])
    user_text = payload.user_transcript.strip()
    mode = (payload.conversation_mode or "interview").lower()

    if not user_text:
        raise HTTPException(status_code=400, detail="User transcript cannot be empty.")

    # Format history turns for context (last 4 turns for low prompt latency)
    history_lines = []
    for turn in payload.history[-4:]:
        role = turn.get("role", "user")
        msg = turn.get("message", "")
        prefix = "User" if role == "user" else f"{scenario.role_name}"
        history_lines.append(f"{prefix}: {msg}")
    formatted_history = "\n".join(history_lines) if history_lines else "(Beginning of roleplay dialogue)"

    target_vocab_str = ", ".join(scenario.target_vocabulary)

    story_instruction = ""
    if payload.story_context:
        story_instruction = f"Story Context:\n{payload.story_context[:400]}\nAnchor discussion around this text.\n"

    # Mod bazlı dinamik talimatlar
    if mode == "casual":
        mode_instruction = """CONVERSATION MODE: CASUAL (Friendly Everyday English)
- Personality: Warm, friendly, supportive peer & language partner.
- Tone: DO NOT act like a corporate interviewer or examiner. Be casual, relaxed, and encouraging.
- Reply: 2 short friendly sentences with a natural, conversational question about daily life, feelings, or preferences.
- better_alternative: 1 natural everyday native colloquial/idiomatic way to express the user's idea."""
    elif mode == "problem_solving":
        mode_instruction = """CONVERSATION MODE: PROBLEM SOLVING (Crisis & Scenario Management)
- Personality: Active crisis partner or project collaborator.
- Tone: Urgent, constructive, analytical.
- Reply: Acknowledge the user's proposed action, then challenge them with a realistic constraint, delay, or complication (max 2-3 sentences).
- better_alternative: 1 decisive, action-oriented executive phrasing for problem resolution."""
    elif mode == "story_debate":
        mode_instruction = """CONVERSATION MODE: STORY DEBATE (Literary & Intellectual Discussion)
- Personality: Inquisitive debate partner and critical thinker.
- Tone: Thought-provoking, reflective, analytical.
- Reply: Offer a counter-argument or probe deeper into the moral dilemmas, character motives, or narrative lessons (max 2-3 sentences).
- better_alternative: 1 sophisticated, intellectually polished phrasing for debate."""
    else:  # interview
        mode_instruction = f"""CONVERSATION MODE: FORMAL INTERVIEW (C1 Executive / IELTS Assessment)
- Role: {scenario.role_name} ({scenario.title}).
- Style: Formal, professional, high-standard C1 evaluation.
- Reply: 1 concise executive reaction and 1 probing follow-up technical question (max 2-3 sentences total).
- better_alternative: 1 native, concise C1 corporate/executive phrasing."""

    active_cat = payload.active_category or scenario.title
    allowed_scope = payload.allowed_scope or scenario.context_desc

    guardrail_instruction = f"""STRICT TOPIC GUARDRAILS:
Active Category: {active_cat}
Allowed Scope: {allowed_scope}
CRITICAL TOPIC BOUNDARY RULE:
The dialogue MUST strictly stay within the domain of '{active_cat}'.
- If the category is 'Daily Life & Basics' or General Culture: ABSOLUTELY NEVER introduce corporate contracts, FIDIC, Time Extension, EVM, Schedule Variance, or complex business jargon. Confine the conversation strictly to everyday routines, weather, breakfast, hobbies, and casual life.
- If the category is 'Project Controls': Confine conversation strictly to AACE/PMI, delay analysis, critical path, SPI/CPI, and mitigation.
- If the category is 'Contract Claims': Confine conversation strictly to FIDIC Clause 8.4, claims, and dispute resolution.
- If the category is 'Medical': Confine conversation strictly to clinical diagnosis, triage, and patient care.
- If the category is 'Corporate Finance': Confine conversation strictly to EBITDA, debt covenants, liquidity, and financial planning.
Even if the user tries to derail the subject, maintain your role and steer the conversation strictly within the boundaries of '{active_cat}'."""

    # Ultra-concise, low-latency prompt for Gemini
    prompt = f"""{mode_instruction}
{guardrail_instruction}
Context: {scenario.context_desc}
Target Vocabulary: {target_vocab_str}
{story_instruction}Target CEFR Level: {payload.target_level or 'C1'}
Recent Dialogue:
{formatted_history}

User just spoke:
"{user_text}"

TASK:
Analyze user speech and reply strictly in valid JSON.
Keep assistant_reply concise and natural (max 2-3 short sentences total).

JSON SCHEMA:
{{
  "assistant_reply": "In-character reply and 1 follow-up question (max 2-3 short sentences).",
  "grammar_feedback": "If grammar/preposition error exists, explain concisely in Turkish. If flawless, return null.",
  "better_alternative": "1 concise alternative phrasing tailored to the active mode.",
  "vocabulary_highlight": ["List", "of", "target_words_used"],
  "jargon_score": 88,
  "fluency_score": 85
}}"""

    try:
        # 6 saniyelik timeout koruması - yanıt gecikirse takılmadan yedek C1 döner
        response_dict = await asyncio.wait_for(
            async_call_speaking_gemini(prompt),
            timeout=6.0,
        )

        assistant_reply = (
            response_dict.get("assistant_reply")
            or "Thank you for that assessment. How should we proceed with executive alignment?"
        )
        grammar_feedback = response_dict.get("grammar_feedback")
        if grammar_feedback and str(grammar_feedback).lower() in ["null", "none", ""]:
            grammar_feedback = None

        better_alternative = (
            response_dict.get("better_alternative")
            or f"To optimize our performance, our priority focuses on rigorous execution and alignment with {scenario.target_vocabulary[0]}."
        )

        vocab_highlight = response_dict.get("vocabulary_highlight")
        if not isinstance(vocab_highlight, list):
            vocab_highlight = []

        raw_jargon = response_dict.get("jargon_score", 85)
        try:
            jargon_score = max(0, min(100, int(raw_jargon)))
        except (ValueError, TypeError):
            jargon_score = 85

        raw_fluency = response_dict.get("fluency_score", 80)
        try:
            fluency_score = max(0, min(100, int(raw_fluency)))
        except (ValueError, TypeError):
            fluency_score = 80

        return SpeakingRespondResponse(
            assistant_reply=assistant_reply,
            grammar_feedback=grammar_feedback,
            better_alternative=better_alternative,
            vocabulary_highlight=vocab_highlight,
            jargon_score=jargon_score,
            fluency_score=fluency_score,
        )

    except asyncio.TimeoutError:
        logger.warning("Gemini speaking call exceeded 6.0s timeout. Returning instant fallback response.")
        fallback_data = generate_fallback_response(
            payload.scenario_id,
            user_text,
            payload.story_context,
            conversation_mode=payload.conversation_mode,
        )
        return SpeakingRespondResponse(**fallback_data)
    except Exception as e:
        logger.warning(f"Speaking endpoint fallback triggered: {e}")
        fallback_data = generate_fallback_response(
            payload.scenario_id,
            user_text,
            payload.story_context,
            conversation_mode=payload.conversation_mode,
        )
        return SpeakingRespondResponse(**fallback_data)
